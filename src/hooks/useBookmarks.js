import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
export function useBookmarks() {
  const {
    user
  } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const {
      data
    } = await supabase.from('bookmarks').select('assessment_id').eq('user_id', user.id);
    if (data) {
      setBookmarkedIds(new Set(data.map(b => b.assessment_id)));
    }
    setLoading(false);
  }, [user]);
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);
  const toggleBookmark = async assessmentId => {
    if (!user) return;
    if (bookmarkedIds.has(assessmentId)) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('assessment_id', assessmentId);
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        next.delete(assessmentId);
        return next;
      });
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        assessment_id: assessmentId
      });
      setBookmarkedIds(prev => new Set(prev).add(assessmentId));
    }
  };
  const isBookmarked = assessmentId => bookmarkedIds.has(assessmentId);
  return {
    isBookmarked,
    toggleBookmark,
    loading
  };
}