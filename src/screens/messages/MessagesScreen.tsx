import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageCircle } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useMessageStore } from '../../store/useMessageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type { MessageThread } from '../../types/social';

type MessagesNavigation = NativeStackNavigationProp<RootStackParamList>;

function formatThreadTime(value: string): string {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  const elapsedHours = Math.floor(elapsed / 3_600_000);

  if (elapsedHours < 24) {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (elapsedHours < 168) {
    return date.toLocaleDateString('id-ID', { weekday: 'short' });
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export function MessagesScreen() {
  const navigation = useNavigation<MessagesNavigation>();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const threads = useMessageStore((state) => state.threads);
  const loadingThreads = useMessageStore((state) => state.loadingThreads);
  const error = useMessageStore((state) => state.error);

  const renderThread = useCallback(
    ({ item }: { item: MessageThread }) => (
      <Pressable
        onPress={() =>
          navigation.navigate('MessageThread', { threadId: item.id })
        }
        style={({ pressed }) => [
          styles.threadRow,
          {
            borderBottomColor: palette.border,
            backgroundColor:
              item.unreadCount > 0 ? palette.primarySoft : palette.background,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Avatar
          displayName={item.otherUser.displayName}
          username={item.otherUser.username}
          avatarUrl={item.otherUser.avatarUrl}
          size={52}
        />

        <View style={styles.threadCopy}>
          <View style={styles.threadMeta}>
            <Text
              style={[
                styles.threadName,
                {
                  color: palette.text,
                  fontWeight: item.unreadCount > 0 ? '900' : '800',
                },
              ]}
              numberOfLines={1}
            >
              {item.otherUser.displayName}
            </Text>
            <Text style={[styles.threadTime, { color: palette.textMuted }]}>
              {formatThreadTime(item.lastMessageAt)}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text
              style={[
                styles.threadPreview,
                {
                  color:
                    item.unreadCount > 0 ? palette.text : palette.textMuted,
                  fontWeight: item.unreadCount > 0 ? '800' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 ? (
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: palette.primary },
                ]}
              >
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    ),
    [navigation, palette],
  );

  return (
    <Screen padded={false}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Text style={[styles.title, { color: palette.text }]}>Pesan</Text>
      </View>

      {error ? (
        <Text style={[styles.error, { color: palette.accent }]}>{error}</Text>
      ) : null}

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          threads.length === 0 ? styles.emptyList : styles.threadList
        }
        ListEmptyComponent={
          loadingThreads ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={palette.primary} />
              <Text style={[styles.loadingText, { color: palette.textMuted }]}>
                Memuat pesan...
              </Text>
            </View>
          ) : (
            <EmptyState
              icon={<MessageCircle size={24} color={palette.primary} />}
              title="Belum ada pesan"
              message="Balasan story dan percakapan akan muncul di sini."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  error: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  threadList: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  threadRow: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  threadCopy: {
    flex: 1,
    gap: 5,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadName: {
    flex: 1,
    fontSize: 15,
  },
  threadTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadPreview: {
    flex: 1,
    fontSize: 13,
  },
  unreadBadge: {
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
