import { Code, ArrowRight } from "lucide-react";

interface ProblemCardProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
  };
  onClick?: () => void;
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-500/10 text-green-400 border-green-500/30",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  HARD: "bg-red-500/10 text-red-400 border-red-500/30",
};

export function ProblemCard({ problem, onClick }: ProblemCardProps) {
  const diffClass =
    difficultyColors[problem.difficulty?.toUpperCase()] ||
    difficultyColors.MEDIUM;

  return (
    <div
      onClick={onClick}
      className="card-elevated cursor-pointer hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {problem.title}
          </h3>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${diffClass}`}
        >
          {problem.difficulty}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {problem.description}
      </p>

      <div className="flex items-center justify-end text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Solve <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
}
