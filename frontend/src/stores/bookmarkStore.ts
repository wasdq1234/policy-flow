import { create } from 'zustand';
import type { BookmarkListItem } from '@policy-flow/contracts';

interface BookmarkState {
  bookmarks: BookmarkListItem[];
  bookmarkedPolicyIds: Set<string>;
  isLoading: boolean;
  error: Error | null;

  setBookmarks: (bookmarks: BookmarkListItem[]) => void;
  addBookmark: (bookmark: BookmarkListItem) => void;
  removeBookmark: (policyId: string) => void;
  isBookmarked: (policyId: string) => boolean;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  bookmarkedPolicyIds: new Set(),
  isLoading: false,
  error: null,

  setBookmarks: (bookmarks) => {
    const ids = new Set(bookmarks.map((b) => b.policyId));
    set({ bookmarks, bookmarkedPolicyIds: ids });
  },

  addBookmark: (bookmark) => {
    set((state) => {
      const newBookmarks = [...state.bookmarks, bookmark];
      const newIds = new Set(state.bookmarkedPolicyIds);
      newIds.add(bookmark.policyId);
      return {
        bookmarks: newBookmarks,
        bookmarkedPolicyIds: newIds,
      };
    });
  },

  removeBookmark: (policyId) => {
    set((state) => {
      const newBookmarks = state.bookmarks.filter((b) => b.policyId !== policyId);
      const newIds = new Set(state.bookmarkedPolicyIds);
      newIds.delete(policyId);
      return {
        bookmarks: newBookmarks,
        bookmarkedPolicyIds: newIds,
      };
    });
  },

  isBookmarked: (policyId) => {
    return get().bookmarkedPolicyIds.has(policyId);
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  clearBookmarks: () => {
    set({
      bookmarks: [],
      bookmarkedPolicyIds: new Set(),
      isLoading: false,
      error: null,
    });
  },
}));
