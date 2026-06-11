import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Menu } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedPostCard } from '../../components/AnimatedPostCard';
import { Screen } from '../../components/Screen';
import { StoryBubble } from '../../components/StoryBubble';
import { posts, stories, type Post } from '../../data/mockData';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function FeedScreen() {
  const navigation = useNavigation<RootNavigation>();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <AnimatedPostCard
      post={item}
      index={index}
      onOpen={() => navigation.navigate('PostDetail', { postId: item.id })}
      onPhotoOpen={() =>
        navigation.navigate('PhotoViewer', { imageUrl: item.imageUrl, alt: item.caption })
      }
    />
  );

  return (
    <Screen padded={false}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable hitSlop={10} style={styles.iconButton}>
          <Menu size={23} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>AnimaVibe</Text>
        <View style={styles.iconButton} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.stories}>
            <FlatList
              horizontal
              data={stories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyList}
              renderItem={({ item }) => (
                <StoryBubble
                  story={item}
                  onPress={() => navigation.navigate('StoryViewer', { storyId: item.id })}
                />
              )}
            />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  stories: {
    paddingVertical: 16,
  },
  storyList: {
    gap: 10,
    paddingRight: 12,
  },
});
