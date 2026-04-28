import { useEffect, useState } from "react";
import { getLeaderboardList } from "@/services/assessment";
import { useNavigate } from "react-router-dom";

export default function LeaderboardList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getLeaderboardList();
      setAssignments(res.assignments || []);
    };

    fetchData();
  }, []);

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6">
        Leaderboards
      </h1>

      <div className="space-y-4">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="card-elevated p-4 cursor-pointer hover:scale-[1.01]"
            onClick={() =>
              navigate(`/teacher/leaderboard/${a.id}`)
            }
          >
            <h2 className="font-semibold">{a.title}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(a.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}