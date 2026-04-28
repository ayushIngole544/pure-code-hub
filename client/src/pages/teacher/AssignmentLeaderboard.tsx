import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssignmentLeaderboard } from "@/services/assessment";

export default function AssignmentLeaderboard() {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const res = await getAssignmentLeaderboard(id);
      setData(res.leaderboard || []);
    };

    fetchData();
  }, [id]);

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6">
        Leaderboard
      </h1>

      <div className="card-elevated p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.userId} className="border-b">
                <td>{row.rank}</td>
                <td>{row.name}</td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}