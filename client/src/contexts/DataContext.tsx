import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getAssessments,
  createAssessment,
  getAssessmentWithQuestions,
} from "@/services/assessment";

import { getSubmissions } from "@/services/submission";
import { getAllProblems } from "@/services/problems";

export interface Question {
  id: string;
  type: "MCQ" | "NAT" | "CODING";
  title: string;
  description: string;
  options?: any;
  correctAnswer?: string;
  problemId?: string;
  marks: number;
  assignmentId: string;
  // Included problem data for CODING types (from Prisma includes)
  problem?: {
    testCases?: { input: string; expectedOutput: string; isHidden: boolean }[];
  }
}

export interface Assessment {
  id: string;
  title: string;
  teacherId: string;
  dueDate: string;
  isPublished: boolean;
  createdAt: string;
  questions?: Question[];
  notes?: any[];
}

export interface Submission {
  id: string;
  userId: string;
  problemId?: string;
  assignmentId?: string;
  questionId?: string;
  code?: string;
  answer?: string;
  language?: string;
  status: string;
  score?: number;
  createdAt: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  createdBy: string;
  createdAt: string;
  marks?: number;
}

interface DataContextType {
  assessments: Assessment[];
  submissions: Submission[];
  problems: Problem[];
  loading: boolean;
  addAssessment: (data: any) => Promise<any>;
  getAssessmentWithQuestions: (id: string) => Promise<Assessment | null>;
  refreshAssessments: () => Promise<void>;
  refreshSubmissions: () => Promise<void>;
  refreshProblems: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH ASSESSMENTS
  const refreshAssessments = useCallback(async () => {
    try {
      const res = await getAssessments();
      setAssessments(res.assignments || []);
      
    } catch (err) {
      console.error("Assessments error", err);
    }
  }, []);

  // 🔥 FETCH SUBMISSIONS
  const refreshSubmissions = useCallback(async () => {
    try {
      const res = await getSubmissions();
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error("Submissions error", err);
    }
  }, []);

  // 🔥 FETCH PROBLEMS
  const refreshProblems = useCallback(async () => {
    try {
      const res = await getAllProblems();
      setProblems(res || []);
    } catch (err) {
      console.error("Problems error", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        refreshAssessments(),
        refreshSubmissions(),
        refreshProblems(),
      ]).then(() => setLoading(false));
    } else {
      setAssessments([]);
      setSubmissions([]);
      setProblems([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 🔥 ADD ASSESSMENT
  const addAssessment = async (data: any) => {
    try {
      const res = await createAssessment(data);
      await refreshAssessments();
      return res;
    } catch (err) {
      console.error("Create assessment error", err);
      return null;
    }
  };

  return (
    <DataContext.Provider
      value={{
        assessments,
        submissions,
        problems,
        loading,
        addAssessment,
        getAssessmentWithQuestions,
        refreshAssessments,
        refreshSubmissions,
        refreshProblems,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }

  return context;
}