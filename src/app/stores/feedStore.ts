import { create } from 'zustand';
import { Post, PostComment } from '../api/feedChatApi';

interface FeedState {
  posts: Post[];
  isLoading: boolean;
  selectedSport: string;
  hasMore: boolean;
  currentPage: number;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  addComment: (postId: string, comment: PostComment) => void;
  setLoading: (loading: boolean) => void;
  setSelectedSport: (sport: string) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  toggleLike: (postId: string, userId: string) => void;
  toggleSave: (postId: string, userId: string) => void;
}

export const useFeedStore = create<FeedState>()((set) => ({
  posts: [],
  isLoading: false,
  selectedSport: 'All',
  hasMore: false,
  currentPage: 1,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
    })),
  addComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedSport: (sport) => set({ selectedSport: sport }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleLike: (postId, userId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likes.includes(userId);
        return { ...p, likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] };
      }),
    })),
  toggleSave: (postId, userId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const saved = p.saves.includes(userId);
        return { ...p, saves: saved ? p.saves.filter((id) => id !== userId) : [...p.saves, userId] };
      }),
    })),
}));
