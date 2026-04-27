import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ProblemCard } from '@/components/ProblemCard';
import { useNavigate } from 'react-router-dom';
import { Search, Flame } from 'lucide-react';

export default function ProfessionalChallenges() {
  const { problems } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || p.difficulty.toUpperCase() === filterDifficulty.toUpperCase();
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-title mb-1">Challenges</h1>
        <p className="text-muted-foreground">Test your skills with coding problems</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search challenges..." />
        </div>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="select-field w-full sm:w-40">
          <option value="all">All Levels</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} onClick={() => navigate(`/professional/challenges/${problem.id}`)} />
          ))}
        </div>
      ) : (
        <div className="card-elevated text-center py-12"><Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No challenges match your filters</p></div>
      )}
    </div>
  );
}

