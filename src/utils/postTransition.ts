import { SharedTransition } from 'react-native-reanimated';

export const postImageSharedTransition = SharedTransition.duration(450).springify();

export function getPostImageTransitionTag(postId: string): string {
  return `post-image-${postId}`;
}
