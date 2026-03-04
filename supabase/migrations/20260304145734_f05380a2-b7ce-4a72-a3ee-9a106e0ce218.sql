
-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, assessment_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookmarks" ON public.bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
