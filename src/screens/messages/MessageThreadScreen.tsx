import { Image } from 'expo-image';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useCallback, type ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useMessageStore } from '../../store/useMessageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors, type AppPalette } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type { DirectMessage, MessageThread } from '../../types/social';

type MessageThreadScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MessageThread'
>;

const EMPTY_MESSAGES: DirectMessage[] = [];

function createDraftThread(
  currentUserId: string,
  recipient: NonNullable<
    RootStackParamList['MessageThread']['recipient']
  >,
): MessageThread {
  return {
    id: [currentUserId, recipient.id].sort().join('__'),
    participantIds: [currentUserId, recipient.id],
    otherUser: recipient,
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    lastSenderId: currentUserId,
    unreadCount: 0,
  };
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSameDay(firstValue: string, secondValue: string): boolean {
  const first = new Date(firstValue);
  const second = new Date(secondValue);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDateSeparator(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(value, today.toISOString())) {
    return 'Hari ini';
  }

  if (isSameDay(value, yesterday.toISOString())) {
    return 'Kemarin';
  }

  return date
    .toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

type BubbleSurfaceProps = {
  isMine: boolean;
  palette: AppPalette;
  children: ReactNode;
};

function BubbleSurface({
  isMine,
  palette,
  children,
}: BubbleSurfaceProps) {
  if (isMine) {
    return (
      <View
        style={[
          styles.outgoingBubble,
          { backgroundColor: palette.primary },
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.incomingBubble,
        {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function MessageThreadScreen({
  navigation,
  route,
}: MessageThreadScreenProps) {
  const { threadId, recipient } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const isFocused = useIsFocused();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const storedThread = useMessageStore((state) =>
    state.threads.find((thread) => thread.id === threadId),
  );
  const storedMessages = useMessageStore(
    (state) => state.messagesByThread[threadId],
  );
  const messages = storedMessages ?? EMPTY_MESSAGES;
  const loadingMessages = useMessageStore((state) => state.loadingMessages);
  const sending = useMessageStore((state) => state.sending);
  const error = useMessageStore((state) => state.error);
  const subscribeMessages = useMessageStore(
    (state) => state.subscribeMessages,
  );
  const loadThread = useMessageStore((state) => state.loadThread);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const markThreadRead = useMessageStore((state) => state.markThreadRead);
  const [thread, setThread] = useState<MessageThread | null>(
    storedThread ?? null,
  );
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<DirectMessage>>(null);

  useEffect(() => {
    let active = true;

    if (storedThread) {
      setThread(storedThread);
    } else if (recipient && currentUserId) {
      setThread(createDraftThread(currentUserId, recipient));
    } else {
      void loadThread(threadId)
        .then((loadedThread) => {
          if (active) {
            setThread(loadedThread);
          }
        })
        .catch((loadError: unknown) => {
          console.warn('[messages] load thread failed', {
            threadId,
            error: loadError,
          });
        });
    }

    return () => {
      active = false;
    };
  }, [currentUserId, loadThread, recipient, storedThread, threadId]);

  useEffect(() => {
    const unsubscribe = subscribeMessages(threadId);

    return () => {
      unsubscribe();
    };
  }, [subscribeMessages, threadId]);

  useFocusEffect(
    useCallback(() => {
      if (!storedThread) {
        return undefined;
      }

      void markThreadRead(threadId).catch((markError: unknown) => {
        console.warn('[messages] mark thread read failed', {
          threadId,
          error: markError,
        });
      });
      return undefined;
    }, [markThreadRead, storedThread, threadId]),
  );

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages.length]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      isFocused
      && storedThread
      && lastMessage
      && lastMessage.senderId !== currentUserId
    ) {
      void markThreadRead(threadId).catch((markError: unknown) => {
        console.warn('[messages] mark incoming message read failed', {
          threadId,
          error: markError,
        });
      });
    }
  }, [
    currentUserId,
    isFocused,
    markThreadRead,
    messages,
    storedThread,
    threadId,
  ]);

  async function handleSend() {
    const cleanText = text.trim();

    if (!thread || !cleanText || sending) {
      return;
    }

    try {
      const result = await sendMessage(
        thread.id,
        thread.otherUser.id,
        cleanText,
      );
      setText('');

      if (result.pushDelivery === 'not_registered') {
        Alert.alert(
          'Pesan terkirim',
          'Penerima belum mengaktifkan notifikasi perangkat.',
        );
      } else if (result.pushDelivery === 'failed') {
        Alert.alert(
          'Pesan terkirim',
          'Push notification gagal dikirim, tetapi pesan sudah tersimpan.',
        );
      }
    } catch {
      return;
    }
  }

  function renderMessage({
    item,
    index,
  }: {
    item: DirectMessage;
    index: number;
  }) {
    const isMine = item.senderId === currentUserId;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage =
      index < messages.length - 1 ? messages[index + 1] : null;
    const showDateSeparator =
      !previousMessage ||
      !isSameDay(previousMessage.createdAt, item.createdAt);
    const showIncomingAvatar =
      !isMine &&
      (!nextMessage ||
        nextMessage.senderId !== item.senderId ||
        !isSameDay(nextMessage.createdAt, item.createdAt));
    const storyCardWidth = Math.min(154, screenWidth * 0.4);

    return (
      <View>
        {showDateSeparator ? (
          <View style={styles.dateSeparator}>
            <Text
              style={[styles.dateSeparatorText, { color: palette.textMuted }]}
            >
              {formatDateSeparator(item.createdAt)}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.messageRow,
            isMine ? styles.mineRow : styles.theirRow,
          ]}
        >
          {!isMine ? (
            <View style={styles.avatarColumn}>
              {showIncomingAvatar && thread ? (
                <Avatar
                  displayName={thread.otherUser.displayName}
                  username={thread.otherUser.username}
                  avatarUrl={thread.otherUser.avatarUrl}
                  size={32}
                />
              ) : (
                <View style={styles.avatarSpacer} />
              )}
            </View>
          ) : null}

          <View
            style={[
              styles.messageContent,
              isMine ? styles.mineContent : styles.theirContent,
            ]}
          >
            {item.kind === 'story_reply' ? (
              <View
                style={[
                  styles.storyReplyBlock,
                  isMine ? styles.mineStoryBlock : styles.theirStoryBlock,
                ]}
              >
                <Text
                  style={[
                    styles.storyReferenceLabel,
                    { color: palette.textMuted },
                  ]}
                >
                  {isMine
                    ? `Anda membalas story ${thread?.otherUser.displayName ?? ''}`
                    : 'Membalas story Anda'}
                </Text>

                <View
                  style={[
                    styles.storyCard,
                    {
                      width: storyCardWidth,
                      height: storyCardWidth * 1.38,
                      backgroundColor: palette.surfaceMuted,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  {item.storyImageUrl ? (
                    <Image
                      source={{ uri: item.storyImageUrl }}
                      style={styles.storyImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.storyUnavailable,
                        { color: palette.textMuted },
                      ]}
                    >
                      Story tidak tersedia
                    </Text>
                  )}
                </View>
              </View>
            ) : null}

            <BubbleSurface isMine={isMine} palette={palette}>
              <Text
                selectable
                style={[
                  styles.messageText,
                  { color: isMine ? '#FFFFFF' : palette.text },
                ]}
              >
                {item.text}
              </Text>
            </BubbleSurface>

            <Text
              style={[
                styles.messageTime,
                {
                  color: palette.textMuted,
                  textAlign: isMine ? 'right' : 'left',
                },
              ]}
            >
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.surface,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={palette.text} />
        </Pressable>

        {thread ? (
          <>
            <Avatar
              displayName={thread.otherUser.displayName}
              username={thread.otherUser.username}
              avatarUrl={thread.otherUser.avatarUrl}
              size={38}
            />
            <View style={styles.headerCopy}>
              <Text
                style={[styles.headerName, { color: palette.text }]}
                numberOfLines={1}
              >
                {thread.otherUser.displayName}
              </Text>
              <Text
                style={[styles.headerUsername, { color: palette.textMuted }]}
                numberOfLines={1}
              >
                @{thread.otherUser.username}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.headerName, { color: palette.text }]}>
            Percakapan
          </Text>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {error ? (
          <Text style={[styles.error, { color: palette.accent }]}>{error}</Text>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.emptyMessages,
          ]}
          ListEmptyComponent={
            loadingMessages ? (
              <ActivityIndicator color={palette.primary} />
            ) : (
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                Mulai percakapan.
              </Text>
            )
          }
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            listRef.current?.scrollToEnd({ animated: false });
          }}
        />

        <View
          style={[
            styles.composer,
            {
              backgroundColor: palette.surface,
              borderTopColor: palette.border,
            },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!sending && Boolean(thread)}
            multiline
            maxLength={1000}
            placeholder="Tulis pesan..."
            placeholderTextColor={palette.textMuted}
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.background,
                borderColor: palette.border,
              },
            ]}
          />
          <Pressable
            onPress={() => {
              void handleSend();
            }}
            disabled={!text.trim() || sending || !thread}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: palette.primary,
                opacity:
                  !text.trim() || sending || !thread
                    ? 0.42
                    : pressed
                      ? 0.75
                      : 1,
              },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '900',
  },
  headerUsername: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  messageList: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 3,
  },
  emptyMessages: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 3,
  },
  mineRow: {
    justifyContent: 'flex-end',
  },
  theirRow: {
    justifyContent: 'flex-start',
  },
  avatarColumn: {
    width: 38,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarSpacer: {
    width: 32,
    height: 32,
  },
  messageContent: {
    maxWidth: '78%',
    gap: 4,
  },
  mineContent: {
    alignItems: 'flex-end',
  },
  theirContent: {
    alignItems: 'flex-start',
  },
  outgoingBubble: {
    minWidth: 58,
    maxWidth: '100%',
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  incomingBubble: {
    minWidth: 58,
    maxWidth: '100%',
    borderWidth: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTime: {
    minWidth: 44,
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dateSeparator: {
    paddingTop: 15,
    paddingBottom: 9,
    alignItems: 'center',
  },
  dateSeparatorText: {
    fontSize: 11,
    fontWeight: '800',
  },
  storyReplyBlock: {
    gap: 7,
    paddingBottom: 2,
  },
  mineStoryBlock: {
    alignItems: 'flex-end',
  },
  theirStoryBlock: {
    alignItems: 'flex-start',
  },
  storyReferenceLabel: {
    maxWidth: 220,
    paddingHorizontal: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  storyCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyUnavailable: {
    paddingHorizontal: 12,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  composer: {
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
