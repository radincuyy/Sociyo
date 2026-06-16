import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send as SendIcon,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '../../components/Screen';
import { usePostStore } from '../../store/usePostStore';
import { fetchComments, postComment } from '../../store/usePostStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type { Comment } from '../../types/social';

type PostDetailProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function PostDetailScreen({ route, navigation }: PostDetailProps) {
  const { postId } = route.params;
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const post = usePostStore((state) => state.posts.find((p) => p.id === postId));
  const toggleLike = usePostStore((state) => state.toggleLike);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imgAspect, setImgAspect] = useState(1);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loadComments = useCallback(async () => {
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch {
      // silent
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSend = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await postComment(postId, trimmed);
      setCommentText('');
      await loadComments();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (!post) {
    return (
    <Screen padded={false} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Postingan</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centered}>
          <Text style={{ color: palette.textMuted }}>Post tidak ditemukan.</Text>
        </View>
      </Screen>
    );
  }

  const avatarInitial = post.author.trim().slice(0, 1).toUpperCase() || '?';
  const fullDate = new Date(post.createdAt).toLocaleDateString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const renderComment = useCallback(({ item }: { item: Comment }) => {
    const initial = item.author.trim().slice(0, 1).toUpperCase() || '?';
    return (
      <View style={[styles.commentRow, { borderBottomColor: palette.border }]}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.commentAvatarImg} contentFit="cover" />
        ) : (
          <View style={[styles.commentAvatar, { backgroundColor: palette.surfaceMuted }]}>
            <Text style={[styles.commentAvatarLetter, { color: palette.text }]}>{initial}</Text>
          </View>
        )}
        <View style={styles.commentBody}>
          <View style={styles.commentMeta}>
            <Text style={[styles.commentName, { color: palette.text }]}>{item.author}</Text>
            <Text style={[styles.commentHandle, { color: palette.textMuted }]}>
              @{item.username}
            </Text>
            <Text style={[styles.commentTime, { color: palette.textMuted }]}>
              · {timeAgo(item.createdAt)}
            </Text>
          </View>
          <Text style={[styles.commentText, { color: palette.text }]}>{item.text}</Text>
        </View>
      </View>
    );
  }, [palette]);

  const postHeader = useMemo(() => (
    <View>
      {/* Author row */}
      <View style={styles.authorRow}>
        {post.avatarUrl ? (
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: palette.surfaceMuted }]}>
            <Text style={[styles.avatarLetter, { color: palette.text }]}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <Text style={[styles.displayName, { color: palette.text }]}>{post.author}</Text>
          <Text style={[styles.handle, { color: palette.textMuted }]}>@{post.username}</Text>
        </View>
      </View>

      {/* Caption */}
      <Text style={[styles.caption, { color: palette.text }]}>{post.caption}</Text>

      {/* Image */}
      {post.imageUrl ? (
        <Pressable
          onPress={() =>
            navigation.navigate('PhotoViewer', { imageUrl: post.imageUrl!, alt: post.caption })
          }
        >
          <Image
            source={{ uri: post.imageUrl }}
            style={[styles.postImage, { aspectRatio: imgAspect }]}
            contentFit="cover"
            onLoad={(e) => {
              const { width, height } = e.source;
              if (width && height) setImgAspect(width / height);
            }}
          />
        </Pressable>
      ) : null}

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: palette.textMuted }]}>{fullDate}</Text>

      {/* Divider */}
      <View style={[styles.divider, { borderBottomColor: palette.border }]} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={[styles.statNumber, { color: palette.text }]}>{post.likes}</Text>
        <Text style={[styles.statLabel, { color: palette.textMuted }]}>Suka</Text>
        <Text style={[styles.statDot, { color: palette.textMuted }]}>·</Text>
        <Text style={[styles.statNumber, { color: palette.text }]}>{comments.length}</Text>
        <Text style={[styles.statLabel, { color: palette.textMuted }]}>Balasan</Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { borderBottomColor: palette.border }]} />

      {/* Action bar */}
      <View style={styles.actionBar}>
        <Pressable onPress={() => inputRef.current?.focus()} style={styles.actionItem}>
          <MessageCircle size={20} color={palette.textMuted} />
        </Pressable>
        <Pressable onPress={() => void toggleLike(postId)} style={styles.actionItem}>
          <Heart
            size={20}
            color={post.likedByMe ? palette.accent : palette.textMuted}
            fill={post.likedByMe ? palette.accent : 'transparent'}
          />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { borderBottomColor: palette.border }]} />
    </View>
  ), [post, palette, comments.length, postId, toggleLike, avatarInitial, fullDate, navigation]);

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Postingan</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.flex}>
        {loadingComments ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={palette.primary} />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            ListHeaderComponent={postHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View
          style={[
            styles.inputBar,
            {
              borderTopColor: palette.border,
              backgroundColor: palette.background,
              paddingBottom: keyboardHeight > 0 ? 8 : 8,
              marginBottom: keyboardHeight > 0 ? keyboardHeight - 1 : 0,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            placeholder="Balas postingan..."
            placeholderTextColor={palette.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            editable={!sending}
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          />
          <Pressable
            onPress={() => void handleSend()}
            disabled={!commentText.trim() || sending}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: palette.primary,
                opacity: pressed || !commentText.trim() ? 0.4 : 1,
              },
            ]}
          >
            <SendIcon size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    height: 52,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 17,
    fontWeight: '900',
  },
  authorInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '900',
  },
  handle: {
    fontSize: 14,
    marginTop: 1,
  },
  caption: {
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 16,
    lineHeight: 23,
  },
  postImage: {
    marginTop: 14,
    marginHorizontal: 16,
    width: undefined,
  },
  timestamp: {
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 13,
  },
  divider: {
    marginTop: 12,
    borderBottomWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  statDot: {
    fontSize: 14,
    marginHorizontal: 2,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 32,
  },
  actionItem: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  commentAvatarLetter: {
    fontSize: 13,
    fontWeight: '900',
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  commentName: {
    fontSize: 14,
    fontWeight: '800',
  },
  commentHandle: {
    fontSize: 13,
  },
  commentTime: {
    fontSize: 13,
  },
  commentText: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
