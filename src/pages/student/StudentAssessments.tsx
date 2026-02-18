import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { AssessmentCard } from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

export default function StudentAssessments() {
  const { assessments } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const publishedAssessments = assessments.filter(a => a.is_published);
  const languages = [...new Set(publishedAssessments.map(a => a.language))];

  const filteredAssessments = publishedAssessments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || a.difficulty === filterDifficulty;
    const matchesLanguage = filterLanguage === 'all' || a.language === filterLanguage;
    return matchesSearch && matchesDifficulty && matchesLanguage;
  });

  return (
    <div className="page-container">
      <h1 className="section-title">All Assessments</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search assessments..." />
        </div>
        <div className="flex gap-2">
          <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="select-field">
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} className="select-field">
            <option value="all">All Languages</option>
            {languages.map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Showing {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? 's' : ''}</p>

      {filteredAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} onClick={() => navigate(`/student/assessments/${assessment.id}`)} />
          ))}
        </div>
      ) : (
        <div className="card-elevated text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{search || filterDifficulty !== 'all' || filterLanguage !== 'all' ? 'No assessments match your filters' : 'No assessments available yet'}</p>
        </div>
      )}
    </div>
  );
}
