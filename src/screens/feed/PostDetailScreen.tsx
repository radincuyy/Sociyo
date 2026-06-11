import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Send } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Screen } from '../../components/Screen';
import { posts } from '../../data/mockData';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type PostDetailProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export function PostDetailScreen({ navigation, route }: PostDetailProps) {
  const post = posts.find((item) => item.id === route.params.postId) ?? posts[0];
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const focus = useSharedValue(1);

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - focus.value) * 10 }, { scale: focus.value }],
  }));

  return (
    <Screen padded={false}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={23} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Post detail</Text>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.content}>
        <Image source={{ uri: post.imageUrl }} style={styles.hero} contentFit="cover" />
        <View style={styles.copy}>
          <Text style={[styles.author, { color: palette.text }]}>{post.author}</Text>
          <Text style={[styles.caption, { color: palette.text }]}>{post.caption}</Text>
          <Text style={[styles.meta, { color: palette.textMuted }]}>
            {post.likes.toLocaleString('id-ID')} suka - {post.comments} komentar
          </Text>
        </View>
      </View>
      <Animated.View
        style={[
          styles.commentBar,
          formStyle,
          { backgroundColor: palette.surface, borderTopColor: palette.border },
        ]}
      >
        <TextInput
          placeholder="Tulis komentar..."
          placeholderTextColor={palette.textMuted}
          onFocus={() => {
            focus.value = withSpring(1.02);
          }}
          onBlur={() => {
            focus.value = withSpring(1);
          }}
          style={[
            styles.input,
            { backgroundColor: palette.surfaceMuted, color: palette.text },
          ]}
        />
        <Pressable style={[styles.sendButton, { backgroundColor: palette.primary }]}>
          <Send size={18} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
  },
  copy: {
    padding: 16,
    gap: 8,
  },
  author: {
    fontSize: 17,
    fontWeight: '900',
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
  },
  commentBar: {
    minHeight: 74,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
