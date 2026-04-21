import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { getLeaderboard } from "@/services/leaderboard";
import { getLeaderboard as getAssignmentLeaderboard } from "@/services/assessment";
import { useParams } from "react-router-dom";

interface LeaderboardEntry {
  userId: string;
  email: string;
  score?: number;
  totalScore?: number;
}

export default function Leaderboard() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        let res;
        if (id) {
          res = await getAssignmentLeaderboard(id);
        } else {
          res = await getLeaderboard();
        }
        setEntries(res.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [id]);

  const getRankIcon = (index: number) => {
    if (index === 0)
      return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (index === 1)
      return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2)
      return <Award className="w-6 h-6 text-orange-400" />;

    return (
      <span className="w-6 h-6 flex items-center justify-center text-sm text-muted-foreground">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top performers
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length > 0 ? (
        <>

          {/* TOP 3 */}
          {entries.length >= 3 && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">

              {entries.slice(0, 3).map((entry, i) => (
                <div
                  key={entry.userId}
                  className="card-elevated text-center"
                >
                  {getRankIcon(i)}

                  <h3 className="text-foreground mt-2">
                    {entry.email}
                  </h3>

                  <p className="text-2xl text-yellow-400">
                    {entry.score ?? entry.totalScore}
                  </p>

                  <p className="text-muted-foreground text-sm">
                    points
                  </p>
                </div>
              ))}

            </div>
          )}

          {/* TABLE */}
          <div className="card-elevated overflow-hidden p-0">

            <table className="w-full">

              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-center">Score</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.userId} className="border-t">

                    <td className="p-4">{getRankIcon(i)}</td>

                    <td className="p-4 text-foreground">
                      {entry.email}
                    </td>

                    <td className="p-4 text-center text-yellow-400 font-semibold">
                      {entry.score ?? entry.totalScore}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </>
      ) : (
        <div className="card-elevated text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No submissions yet
          </p>
        </div>
      )}

    </div>
  );
}