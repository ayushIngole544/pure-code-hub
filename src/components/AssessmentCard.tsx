import { Clock, Code, FileText } from 'lucide-react';
import { Assessment } from '@/contexts/DataContext';

interface AssessmentCardProps {
  assessment: Assessment;
  onClick: () => void;
  showStats?: boolean;
  attempts?: number;
  correctRate?: number;
}

export function AssessmentCard({ assessment, onClick, showStats, attempts, correctRate }: AssessmentCardProps) {
  const difficultyClass = {
    easy: 'difficulty-easy',
    medium: 'difficulty-medium',
    hard: 'difficulty-hard',
  }[assessment.difficulty];

  return (
    <div className="assessment-card" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{assessment.title}</h3>
        <span className={difficultyClass}>{assessment.difficulty}</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {assessment.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Code className="w-4 h-4" />
          <span>{assessment.language}</span>
        </div>
        {assessment.time_limit && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{assessment.time_limit} min</span>
          </div>
        )}
      </div>

      {showStats && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Attempts: </span>
            <span className="font-medium text-foreground">{attempts || 0}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Success Rate: </span>
            <span className="font-medium text-easy">{correctRate?.toFixed(0) || 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
