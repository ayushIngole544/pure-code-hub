import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Question {
  id: string;
  title: string;
  description: string;
  starter_code: string;
  language: string;
  test_cases: { input: string; expectedOutput: string }[];
  sort_order: number;
  assessment_id: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  time_limit?: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  questions?: Question[];
}

export interface Submission {
  id: string;
  assessment_id: string;
  question_id: string;
  student_id: string;
  code: string;
  language: string;
  is_correct: boolean;
  score: number;
  execution_time_ms?: number;
  memory_used_kb?: number;
  passed_test_cases: number;
  total_test_cases: number;
  output?: string;
  status: string;
  created_at: string;
}

interface DataContextType {
  assessments: Assessment[];
  submissions: Submission[];
  loading: boolean;
  addAssessment: (assessment: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
    time_limit?: number;
    is_published?: boolean;
    questions: Omit<Question, 'id' | 'assessment_id'>[];
  }) => Promise<Assessment | null>;
  addSubmission: (submission: {
    assessment_id: string;
    question_id: string;
    code: string;
    language: string;
    is_correct: boolean;
    score?: number;
    passed_test_cases?: number;
    total_test_cases?: number;
    output?: string;
    status?: string;
  }) => Promise<Submission | null>;
  getTeacherAssessments: (teacherId: string) => Assessment[];
  getStudentSubmissions: (studentId: string) => Submission[];
  getAssessmentSubmissions: (assessmentId: string) => Submission[];
  getAssessmentWithQuestions: (assessmentId: string) => Promise<Assessment | null>;
  refreshAssessments: () => Promise<void>;
  refreshSubmissions: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const refreshAssessments = useCallback(async () => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssessments(data as unknown as Assessment[]);
    }
  }, []);

  const refreshSubmissions = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as unknown as Submission[]);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([refreshAssessments(), refreshSubmissions()]).then(() => setLoading(false));
    } else {
      setAssessments([]);
      setSubmissions([]);
      setLoading(false);
    }
  }, [isAuthenticated, refreshAssessments, refreshSubmissions]);

  // Realtime subscription for submissions
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('submissions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        refreshSubmissions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, refreshSubmissions]);

  const addAssessment = async (input: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: string;
    time_limit?: number;
    is_published?: boolean;
    questions: Omit<Question, 'id' | 'assessment_id'>[];
  }): Promise<Assessment | null> => {
    if (!user) return null;

    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        language: input.language,
        time_limit: input.time_limit || null,
        is_published: input.is_published ?? false,
        created_by: user.id,
      })
      .select()
      .single();

    if (assessmentError || !assessmentData) {
      console.error('Error creating assessment:', assessmentError);
      return null;
    }

    // Insert questions
    if (input.questions.length > 0) {
      const questionsToInsert = input.questions.map((q, i) => ({
        assessment_id: (assessmentData as any).id,
        title: q.title,
        description: q.description || '',
        starter_code: q.starter_code || '',
        language: q.language || input.language,
        test_cases: q.test_cases || [],
        sort_order: i,
      }));

      await supabase.from('questions').insert(questionsToInsert);
    }

    await refreshAssessments();
    return assessmentData as unknown as Assessment;
  };

  const addSubmission = async (input: {
    assessment_id: string;
    question_id: string;
    code: string;
    language: string;
    is_correct: boolean;
    score?: number;
    passed_test_cases?: number;
    total_test_cases?: number;
    output?: string;
    status?: string;
  }): Promise<Submission | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assessment_id: input.assessment_id,
        question_id: input.question_id,
        student_id: user.id,
        code: input.code,
        language: input.language,
        is_correct: input.is_correct,
        score: input.score || 0,
        passed_test_cases: input.passed_test_cases || 0,
        total_test_cases: input.total_test_cases || 0,
        output: input.output || '',
        status: input.status || 'completed',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return null;
    }

    return data as unknown as Submission;
  };

  const getTeacherAssessments = (teacherId: string) =>
    assessments.filter(a => a.created_by === teacherId);

  const getStudentSubmissions = (studentId: string) =>
    submissions.filter(s => s.student_id === studentId);

  const getAssessmentSubmissions = (assessmentId: string) =>
    submissions.filter(s => s.assessment_id === assessmentId);

  const getAssessmentWithQuestions = async (assessmentId: string): Promise<Assessment | null> => {
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (!assessment) return null;

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('sort_order', { ascending: true });

    return {
      ...(assessment as unknown as Assessment),
      questions: (questions || []) as unknown as Question[],
    };
  };

  return (
    <DataContext.Provider value={{
      assessments,
      submissions,
      loading,
      addAssessment,
      addSubmission,
      getTeacherAssessments,
      getStudentSubmissions,
      getAssessmentSubmissions,
      getAssessmentWithQuestions,
      refreshAssessments,
      refreshSubmissions,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
