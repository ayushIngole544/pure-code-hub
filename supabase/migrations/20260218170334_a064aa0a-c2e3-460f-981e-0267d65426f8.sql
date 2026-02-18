
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'professional', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (source of truth for RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT NOT NULL DEFAULT 'javascript',
  time_limit INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starter_code TEXT DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  is_correct BOOLEAN NOT NULL DEFAULT false,
  score NUMERIC DEFAULT 0,
  execution_time_ms INTEGER,
  memory_used_kb INTEGER,
  passed_test_cases INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error', 'timeout')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teacher workspace/notes table
CREATE TABLE public.teacher_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_assessments_created_by ON public.assessments(created_by);
CREATE INDEX idx_assessments_published ON public.assessments(is_published);
CREATE INDEX idx_questions_assessment_id ON public.questions(assessment_id);
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_submissions_assessment_id ON public.submissions(assessment_id);
CREATE INDEX idx_submissions_question_id ON public.submissions(question_id);
CREATE INDEX idx_teacher_notes_teacher_id ON public.teacher_notes(teacher_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;

-- Helper function: check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from metadata, default to 'student'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );

  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_teacher_notes_updated_at BEFORE UPDATE ON public.teacher_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Profiles: authenticated users can read all, update own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- User roles: users can read own role, admins can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Assessments: teachers CRUD own, everyone reads published
CREATE POLICY "Anyone can view published assessments" ON public.assessments FOR SELECT TO authenticated USING (is_published = true OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can create assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update own assessments" ON public.assessments FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete own assessments" ON public.assessments FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Questions: linked to assessment visibility
CREATE POLICY "Users can view questions of visible assessments" ON public.questions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.is_published = true OR a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Teachers can create questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update own questions" ON public.questions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Teachers can delete own questions" ON public.questions FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- Submissions: students CRUD own, teachers read for their assessments
CREATE POLICY "Students can view own submissions" ON public.submissions FOR SELECT TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.is_published = true)
);
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE TO authenticated USING (student_id = auth.uid());

-- Teacher notes: private per teacher
CREATE POLICY "Teachers can view own notes" ON public.teacher_notes FOR SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can create notes" ON public.teacher_notes FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can update own notes" ON public.teacher_notes FOR UPDATE TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own notes" ON public.teacher_notes FOR DELETE TO authenticated USING (teacher_id = auth.uid());

-- Enable realtime for submissions (live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
