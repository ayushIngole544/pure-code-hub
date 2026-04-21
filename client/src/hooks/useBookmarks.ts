import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "@/services/bookmark";

export function useBookmarks() {
  const { user } = useAuth();

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH BOOKMARKS
  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await getBookmarks();

      // ✅ SAFE RESPONSE HANDLING
      const bookmarks = res?.data?.bookmarks || [];

      const ids = bookmarks.map((b: any) => b.assessmentId);

      setBookmarkedIds(new Set(ids));

    } catch (err) {
      // 🔥 DO NOT BREAK UI
      console.warn("⚠️ Bookmarks API not available, using fallback");

      // fallback to empty
      setBookmarkedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // 🔥 TOGGLE BOOKMARK
  const toggleBookmark = async (assessmentId: string) => {
    if (!user) return;

    try {
      if (bookmarkedIds.has(assessmentId)) {
        await removeBookmark(assessmentId);

        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(assessmentId);
          return next;
        });
      } else {
        await addBookmark(assessmentId);

        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.add(assessmentId);
          return next;
        });
      }
    } catch (err) {
      console.warn("⚠️ Bookmark toggle failed (API missing)", err);
    }
  };

  const isBookmarked = (assessmentId: string) =>
    bookmarkedIds.has(assessmentId);

  return {
    isBookmarked,
    toggleBookmark,
    loading,
  };
}