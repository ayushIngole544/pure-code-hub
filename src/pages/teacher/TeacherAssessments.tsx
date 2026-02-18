import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AssessmentCard } from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function TeacherAssessments() {
  const { user } = useAuth();
  const { getTeacherAssessments, getAssessmentSubmissions } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const myAssessments = user ? getTeacherAssessments(user.id) : [];

  const filteredAssessments = myAssessments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || a.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="section-title mb-0">My Assessments</h1>
        <button onClick={() => navigate('/teacher/create')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search assessments..." />
        </div>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="select-field w-full sm:w-40">
          <option value="all">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {filteredAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => {
            const submissions = getAssessmentSubmissions(assessment.id);
            const correct = submissions.filter(s => s.is_correct).length;
            return (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onClick={() => {}}
                showStats
                attempts={submissions.length}
                correctRate={submissions.length > 0 ? (correct / submissions.length) * 100 : 0}
              />
            );
          })}
        </div>
      ) : (
        <div className="card-elevated text-center py-12">
          <p className="text-muted-foreground">
            {search || filterDifficulty !== 'all' ? 'No assessments match your filters' : 'No assessments created yet'}
          </p>
        </div>
      )}
    </div>
  );
}
