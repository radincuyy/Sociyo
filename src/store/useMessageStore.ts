import { create } from 'zustand';

import {
  getMessageThread,
  markThreadRead as markThreadReadService,
  sendTextMessage,
  sendImageMessage as sendImageMessageService,
  subscribeMessages as subscribeMessagesService,
  subscribeMessageThreads,
} from '../services/messageService';
import { useAuthStore } from './useAuthStore';
import type {
  DirectMessage,
  MessageThread,
  SendMessageResult,
} from '../types/social';

type MessageState = {
  threads: MessageThread[];
  messagesByThread: Record<string, DirectMessage[]>;
  totalUnread: number;
  loadingThreads: boolean;
  loadingMessages: boolean;
  sending: boolean;
  error: string | null;
  subscribeThreads: (userId: string) => () => void;
  subscribeMessages: (threadId: string) => () => void;
  loadThread: (threadId: string) => Promise<MessageThread>;
  sendMessage: (
    threadId: string,
    recipientId: string,
    text: string,
  ) => Promise<SendMessageResult>;
  sendImageMessage: (
    threadId: string,
    recipientId: string,
    imageUri: string,
    caption?: string,
  ) => Promise<SendMessageResult>;
  markThreadRead: (threadId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

function getCurrentUserId(): string {
  const userId = useAuthStore.getState().user?.id;

  if (!userId) {
    throw new Error('Sesi login tidak ditemukan.');
  }

  return userId;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  threads: [],
  messagesByThread: {},
  totalUnread: 0,
  loadingThreads: false,
  loadingMessages: false,
  sending: false,
  error: null,

  subscribeThreads: (userId) => {
    set({ threads: [], totalUnread: 0, loadingThreads: true, error: null });

    return subscribeMessageThreads(
      userId,
      (threads) => {
        set({
          threads,
          totalUnread: threads.reduce(
            (total, thread) => total + thread.unreadCount,
            0,
          ),
          loadingThreads: false,
          error: null,
        });
      },
      (error) => {
        set({ loadingThreads: false, error: error.message });
      },
    );
  },

  subscribeMessages: (threadId) => {
    set({ loadingMessages: true, error: null });

    return subscribeMessagesService(
      threadId,
      (messages) => {
        set((state) => ({
          messagesByThread: {
            ...state.messagesByThread,
            [threadId]: messages,
          },
          loadingMessages: false,
          error: null,
        }));
      },
      (error) => {
        set({ loadingMessages: false, error: error.message });
      },
    );
  },

  loadThread: async (threadId) => {
    const existingThread = get().threads.find(
      (thread) => thread.id === threadId,
    );

    if (existingThread) {
      return existingThread;
    }

    const thread = await getMessageThread(threadId, getCurrentUserId());
    set((state) => ({
      threads: [thread, ...state.threads],
    }));
    return thread;
  },

  sendMessage: async (threadId, recipientId, text) => {
    if (get().sending) {
      throw new Error('Pesan sebelumnya masih dikirim.');
    }

    set({ sending: true, error: null });

    try {
      const result = await sendTextMessage({
        senderId: getCurrentUserId(),
        recipientId,
        text,
      });

      if (result.threadId !== threadId) {
        throw new Error(
          `Thread hasil ${result.threadId} tidak cocok dengan ${threadId}.`,
        );
      }

      set({ sending: false });
      return result;
    } catch (error) {
      set({
        sending: false,
        error:
          error instanceof Error ? error.message : 'Gagal mengirim pesan.',
      });
      throw error;
    }
  },

  sendImageMessage: async (threadId, recipientId, imageUri, caption) => {
    if (get().sending) {
      throw new Error('Pesan sebelumnya masih dikirim.');
    }

    set({ sending: true, error: null });

    try {
      const result = await sendImageMessageService({
        senderId: getCurrentUserId(),
        recipientId,
        imageUri,
        caption,
      });

      if (result.threadId !== threadId) {
        throw new Error(
          `Thread hasil ${result.threadId} tidak cocok dengan ${threadId}.`,
        );
      }

      set({ sending: false });
      return result;
    } catch (error) {
      set({
        sending: false,
        error:
          error instanceof Error ? error.message : 'Gagal mengirim gambar.',
      });
      throw error;
    }
  },

  markThreadRead: async (threadId) => {
    const userId = getCurrentUserId();
    const originalThreads = get().threads;
    const targetThread = originalThreads.find(
      (thread) => thread.id === threadId,
    );

    if (!targetThread || targetThread.unreadCount <= 0) {
      return;
    }

    set((state) => {
      const threads = state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
      );

      return {
        threads,
        totalUnread: threads.reduce(
          (total, thread) => total + thread.unreadCount,
          0,
        ),
      };
    });

    try {
      await markThreadReadService(threadId, userId);
    } catch (error) {
      set({
        threads: originalThreads,
        totalUnread: originalThreads.reduce(
          (total, thread) => total + thread.unreadCount,
          0,
        ),
        error:
          error instanceof Error
            ? error.message
            : 'Gagal menandai pesan sebagai dibaca.',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      threads: [],
      messagesByThread: {},
      totalUnread: 0,
      loadingThreads: false,
      loadingMessages: false,
      sending: false,
      error: null,
    }),
}));
