import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  timeLimit?: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assessmentId: string;
  questionId: string;
  userId: string;
  code: string;
  isCorrect: boolean;
  submittedAt: string;
}

interface DataContextType {
  assessments: Assessment[];
  submissions: Submission[];
  addAssessment: (assessment: Omit<Assessment, 'id' | 'createdAt'>) => void;
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt'>) => void;
  getTeacherAssessments: (teacherId: string) => Assessment[];
  getStudentSubmissions: (studentId: string) => Submission[];
  getAssessmentSubmissions: (assessmentId: string) => Submission[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const storedAssessments = localStorage.getItem('codehub_assessments');
    const storedSubmissions = localStorage.getItem('codehub_submissions');
    
    if (storedAssessments) setAssessments(JSON.parse(storedAssessments));
    if (storedSubmissions) setSubmissions(JSON.parse(storedSubmissions));
  }, []);

  const addAssessment = (assessment: Omit<Assessment, 'id' | 'createdAt'>) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...assessments, newAssessment];
    setAssessments(updated);
    localStorage.setItem('codehub_assessments', JSON.stringify(updated));
  };

  const addSubmission = (submission: Omit<Submission, 'id' | 'submittedAt'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    const updated = [...submissions, newSubmission];
    setSubmissions(updated);
    localStorage.setItem('codehub_submissions', JSON.stringify(updated));
  };

  const getTeacherAssessments = (teacherId: string) => 
    assessments.filter(a => a.createdBy === teacherId);

  const getStudentSubmissions = (studentId: string) => 
    submissions.filter(s => s.userId === studentId);

  const getAssessmentSubmissions = (assessmentId: string) => 
    submissions.filter(s => s.assessmentId === assessmentId);

  return (
    <DataContext.Provider value={{
      assessments,
      submissions,
      addAssessment,
      addSubmission,
      getTeacherAssessments,
      getStudentSubmissions,
      getAssessmentSubmissions,
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
