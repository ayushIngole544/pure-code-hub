import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TeacherStudents() {
  const { user } = useAuth();
  const { getTeacherAssessments, submissions } = useData();
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});

  const myAssessments = user ? getTeacherAssessments(user.id) : [];
  const assessmentIds = myAssessments.map(a => a.id);

  const studentSubmissions = submissions.filter(s => assessmentIds.includes(s.assessment_id));

  // Fetch student names
  useEffect(() => {
    const studentIds = [...new Set(studentSubmissions.map(s => s.student_id))];
    if (studentIds.length === 0) return;

    supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', studentIds)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          (data as any[]).forEach(p => { map[p.user_id] = p.name; });
          setProfileMap(map);
        }
      });
  }, [studentSubmissions.length]);

  const studentStats = studentSubmissions.reduce((acc, sub) => {
    if (!acc[sub.student_id]) {
      acc[sub.student_id] = { total: 0, correct: 0, wrong: 0, lastSubmission: sub.created_at };
    }
    acc[sub.student_id].total++;
    if (sub.is_correct) acc[sub.student_id].correct++;
    else acc[sub.student_id].wrong++;
    if (new Date(sub.created_at) > new Date(acc[sub.student_id].lastSubmission)) {
      acc[sub.student_id].lastSubmission = sub.created_at;
    }
    return acc;
  }, {} as Record<string, { total: number; correct: number; wrong: number; lastSubmission: string }>);

  const students = Object.entries(studentStats).map(([userId, stats]) => ({
    id: userId,
    name: profileMap[userId] || `Student ${userId.slice(0, 6)}`,
    ...stats,
    accuracy: (stats.correct / stats.total) * 100,
  }));

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-title mb-1">Student Performance</h1>
        <p className="text-muted-foreground">Monitor how students are performing on your assessments</p>
      </div>

      {students.length > 0 ? (
        <div className="card-elevated overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Student</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Total Attempts</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Correct</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Wrong</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Accuracy</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                      <span className="font-medium text-foreground">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-foreground">{student.total}</td>
                  <td className="px-6 py-4 text-center"><span className="inline-flex items-center gap-1 text-easy"><CheckCircle className="w-4 h-4" />{student.correct}</span></td>
                  <td className="px-6 py-4 text-center"><span className="inline-flex items-center gap-1 text-error"><XCircle className="w-4 h-4" />{student.wrong}</span></td>
                  <td className="px-6 py-4 text-center"><span className={`font-medium ${student.accuracy >= 70 ? 'text-easy' : student.accuracy >= 40 ? 'text-warning' : 'text-error'}`}>{student.accuracy.toFixed(0)}%</span></td>
                  <td className="px-6 py-4 text-center text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(student.lastSubmission).toLocaleDateString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-elevated text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No student activity yet</h3>
          <p className="text-muted-foreground">Students will appear here once they start attempting your assessments</p>
        </div>
      )}
    </div>
  );
}
