import { Clock, CheckCircle, XCircle, Bookmark, FileText } from 'lucide-react';
import { Assessment } from '@/contexts/DataContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';

interface AssessmentCardProps {
  assessment: Assessment;
  onClick: () => void;
  showStats?: boolean;
  attempts?: number;
  correctRate?: number;
  onPublish?: (e: React.MouseEvent) => void;
}

export function AssessmentCard({ assessment, onClick, showStats, attempts, correctRate, onPublish }: AssessmentCardProps) {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const bookmarked = isBookmarked(assessment.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) toggleBookmark(assessment.id);
  };

  const isExpired = new Date(assessment.dueDate).getTime() < new Date().getTime();

  return (
    <div className="assessment-card relative" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground flex-1 mr-2">{assessment.title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!assessment.isPublished ? (
            <span className="bg-warning/20 text-warning px-2 py-1 rounded text-xs font-bold">DRAFT</span>
          ) : (
            <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">PUBLISHED</span>
          )}
          {user && (
            <button
              onClick={handleBookmark}
              className={`p-1 rounded transition-colors ${bookmarked ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {assessment.questions?.length} Questions • Total Marks: {assessment.questions?.reduce((acc, q) => acc + q.marks, 0) || 0}
      </p>

      <div className="flex justify-between items-center text-sm text-muted-foreground mt-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className={isExpired ? "text-destructive font-semibold" : ""}>
            {new Date(assessment.dueDate).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>{assessment.notes?.length || 0} Notes</span>
        </div>
      </div>

      {showStats && (
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="text-sm">
              <span className="text-muted-foreground">Attempts: </span>
              <span className="font-medium text-foreground">{attempts || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/leaderboard/${assessment.id}`;
              }}
              className="btn-outline text-xs py-1 px-3"
            >
              Leaderboard
            </button>
            {onPublish && !assessment.isPublished && (
              <button
                onClick={onPublish}
                className="btn-primary text-xs py-1 px-3"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
