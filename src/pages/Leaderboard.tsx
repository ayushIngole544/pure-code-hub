import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_submissions: number;
  correct_submissions: number;
  accuracy: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      // Fetch all submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select('student_id, is_correct');

      if (!submissions) { setLoading(false); return; }

      // Aggregate by student
      const statsMap: Record<string, { total: number; correct: number }> = {};
      submissions.forEach((s: any) => {
        if (!statsMap[s.student_id]) statsMap[s.student_id] = { total: 0, correct: 0 };
        statsMap[s.student_id].total++;
        if (s.is_correct) statsMap[s.student_id].correct++;
      });

      // Fetch profiles
      const userIds = Object.keys(statsMap);
      if (userIds.length === 0) { setLoading(false); return; }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p.name; });

      const leaderboard = userIds.map(uid => ({
        user_id: uid,
        name: profileMap[uid] || 'Unknown',
        total_submissions: statsMap[uid].total,
        correct_submissions: statsMap[uid].correct,
        accuracy: statsMap[uid].total > 0 ? (statsMap[uid].correct / statsMap[uid].total) * 100 : 0,
      }));

      // Sort by correct submissions desc, then accuracy
      leaderboard.sort((a, b) => b.correct_submissions - a.correct_submissions || b.accuracy - a.accuracy);

      setEntries(leaderboard);
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-warning" />;
    if (index === 1) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (index === 2) return <Award className="w-6 h-6 text-warning" style={{ opacity: 0.7 }} />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-warning-light rounded-xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-warning" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground">Top performers across all assessments</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length > 0 ? (
          <>
            {/* Top 3 cards */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {entries.slice(0, 3).map((entry, i) => (
                  <div key={entry.user_id} className={`card-elevated text-center ${i === 0 ? 'border-warning/50 bg-warning-light/30' : ''}`}>
                    <div className="mb-3">{getRankIcon(i)}</div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{entry.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{entry.name}</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{entry.correct_submissions}</p>
                    <p className="text-sm text-muted-foreground">problems solved</p>
                    <p className="text-sm font-medium text-easy mt-1">{entry.accuracy.toFixed(0)}% accuracy</p>
                  </div>
                ))}
              </div>
            )}

            {/* Full table */}
            <div className="card-elevated overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Rank</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Name</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Solved</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Total</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-foreground">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry, i) => (
                    <tr key={entry.user_id} className={`hover:bg-secondary/30 transition-colors ${i < 3 ? 'bg-warning-light/10' : ''}`}>
                      <td className="px-6 py-4">{getRankIcon(i)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{entry.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-foreground">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-easy">{entry.correct_submissions}</td>
                      <td className="px-6 py-4 text-center text-foreground">{entry.total_submissions}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${entry.accuracy >= 70 ? 'text-easy' : entry.accuracy >= 40 ? 'text-warning' : 'text-error'}`}>
                          {entry.accuracy.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="card-elevated text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">Start solving problems to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </>
  );
}
