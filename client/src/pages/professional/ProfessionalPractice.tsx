import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { AssessmentCard } from '@/components/AssessmentCard';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';

export default function ProfessionalPractice() {
  const { assessments } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const published = assessments.filter(a => a.is_published);
  const languages = [...new Set(published.map(a => a.language))];

  const practiceAssessments = published.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || a.language === filterLanguage;
    return matchesSearch && matchesLanguage && a.difficulty === 'easy';
  });

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-title mb-1">Practice Mode</h1>
        <p className="text-muted-foreground">Warm up with easy problems before tackling challenges</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search practice problems..." />
        </div>
        <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} className="select-field w-full sm:w-40">
          <option value="all">All Languages</option>
          {languages.map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
        </select>
      </div>
      {practiceAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiceAssessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} onClick={() => navigate(`/professional/challenges/${assessment.id}`)} />
          ))}
        </div>
      ) : (
        <div className="card-elevated text-center py-12"><BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No practice problems available</p></div>
      )}
    </div>
  );
}
