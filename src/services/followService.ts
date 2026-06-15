import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { firestore } from './firebase';

const USERS = 'users';

export async function isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  const ref = doc(firestore, USERS, currentUserId, 'following', targetUserId);
  const snap = await getDoc(ref);
  return snap.exists();
}

// Follow user

export async function followUser(currentUserId: string, targetUserId: string): Promise<void> {
  if (currentUserId === targetUserId) return;

  const alreadyFollowing = await isFollowing(currentUserId, targetUserId);
  if (alreadyFollowing) return;

  const followingRef = doc(firestore, USERS, currentUserId, 'following', targetUserId);
  const followerRef = doc(firestore, USERS, targetUserId, 'followers', currentUserId);

  await setDoc(followingRef, { createdAt: serverTimestamp() });
  await setDoc(followerRef, { createdAt: serverTimestamp() });

  const currentUserRef = doc(firestore, USERS, currentUserId);
  const targetUserRef = doc(firestore, USERS, targetUserId);

  await updateDoc(currentUserRef, { followingCount: increment(1) });
  await updateDoc(targetUserRef, { followersCount: increment(1) });
}

// Unfollow user

export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
  if (currentUserId === targetUserId) return;

  const following = await isFollowing(currentUserId, targetUserId);
  if (!following) return;

  const followingRef = doc(firestore, USERS, currentUserId, 'following', targetUserId);
  const followerRef = doc(firestore, USERS, targetUserId, 'followers', currentUserId);

  await deleteDoc(followingRef);
  await deleteDoc(followerRef);

  const currentUserRef = doc(firestore, USERS, currentUserId);
  const targetUserRef = doc(firestore, USERS, targetUserId);

  await updateDoc(currentUserRef, { followingCount: increment(-1) });
  await updateDoc(targetUserRef, { followersCount: increment(-1) });
}

// Toggle follow/unfollow

export async function toggleFollow(currentUserId: string, targetUserId: string): Promise<boolean> {
  const following = await isFollowing(currentUserId, targetUserId);

  if (following) {
    await unfollowUser(currentUserId, targetUserId);
    return false;
  }

  await followUser(currentUserId, targetUserId);
  return true;
}

type FollowUser = {
  userId: string;
  createdAt: string;
};

function timestampToISO(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

// Get followers

export async function getFollowers(userId: string): Promise<FollowUser[]> {
  const snap = await getDocs(collection(firestore, USERS, userId, 'followers'));
  return snap.docs.map((d) => ({
    userId: d.id,
    createdAt: timestampToISO((d.data() as Record<string, unknown>).createdAt),
  }));
}

// Get following

export async function getFollowing(userId: string): Promise<FollowUser[]> {
  const snap = await getDocs(collection(firestore, USERS, userId, 'following'));
  return snap.docs.map((d) => ({
    userId: d.id,
    createdAt: timestampToISO((d.data() as Record<string, unknown>).createdAt),
  }));
}
