import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";

import { getUsersByIds } from "@/services/user";

import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default function TeacherStudents() {
  const { user } = useAuth();
  const { assessments, submissions } = useData();

  const [profileMap, setProfileMap] = useState<Record<string, string>>({});

  // 🔥 FILTER TEACHER ASSESSMENTS
  const myAssessments = assessments.filter(
    (a) => a.created_by === user?.id
  );

  const assessmentIds = myAssessments.map((a) => a.id);

  // 🔥 FILTER SUBMISSIONS
  const studentSubmissions = submissions.filter((s) =>
    assessmentIds.includes(s.assessment_id)
  );

  // 🔥 FETCH STUDENT NAMES FROM BACKEND
  useEffect(() => {
    const studentIds = [
      ...new Set(studentSubmissions.map((s) => s.student_id)),
    ];

    if (studentIds.length === 0) return;

    const fetchUsers = async () => {
      try {
        const res = await getUsersByIds(studentIds);

        const map: Record<string, string> = {};

        res.users.forEach((u: any) => {
          map[u.id] = u.name;
        });

        setProfileMap(map);
      } catch (err) {
        console.error("User fetch error", err);
      }
    };

    fetchUsers();
  }, [studentSubmissions]);

  // 🔥 CALCULATE STATS
  const studentStats = studentSubmissions.reduce((acc, sub) => {
    if (!acc[sub.student_id]) {
      acc[sub.student_id] = {
        total: 0,
        correct: 0,
        wrong: 0,
        lastSubmission: sub.created_at,
      };
    }

    acc[sub.student_id].total++;

    if (sub.status === "ACCEPTED") acc[sub.student_id].correct++;
    else acc[sub.student_id].wrong++;

    if (
      new Date(sub.created_at) >
      new Date(acc[sub.student_id].lastSubmission)
    ) {
      acc[sub.student_id].lastSubmission = sub.created_at;
    }

    return acc;
  }, {} as Record<
    string,
    { total: number; correct: number; wrong: number; lastSubmission: string }
  >);

  const students = Object.entries(studentStats).map(
    ([userId, stats]) => ({
      id: userId,
      name: profileMap[userId] || `Student ${userId.slice(0, 6)}`,
      ...stats,
      accuracy: (stats.correct / stats.total) * 100,
    })
  );

  return (
    <div className="page-container">

      <div className="mb-6">
        <h1 className="section-title mb-1">
          Student Performance
        </h1>
        <p className="text-muted-foreground">
          Monitor how students are performing
        </p>
      </div>

      {students.length > 0 ? (
        <div className="card-elevated overflow-hidden p-0">

          <table className="w-full">

            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center">Correct</th>
                <th className="px-6 py-4 text-center">Wrong</th>
                <th className="px-6 py-4 text-center">Accuracy</th>
                <th className="px-6 py-4 text-center">Last Active</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {student.name}
                    </div>
                  </td>

                  <td className="text-center">{student.total}</td>

                  <td className="text-center text-green-500">
                    <CheckCircle className="inline w-4 h-4" />{" "}
                    {student.correct}
                  </td>

                  <td className="text-center text-red-500">
                    <XCircle className="inline w-4 h-4" />{" "}
                    {student.wrong}
                  </td>

                  <td className="text-center">
                    {student.accuracy.toFixed(0)}%
                  </td>

                  <td className="text-center text-gray-400">
                    <Clock className="inline w-4 h-4" />{" "}
                    {new Date(
                      student.lastSubmission
                    ).toLocaleDateString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      ) : (
        <div className="card-elevated text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No student activity yet</p>
        </div>
      )}
    </div>
  );
}