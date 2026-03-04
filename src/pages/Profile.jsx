import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { User, Mail, Shield, Save, CheckCircle, TrendingUp, Code, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export default function Profile() {
  const {
    user
  } = useAuth();
  const {
    getStudentSubmissions,
    assessments
  } = useData();
  const {
    toast
  } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const mySubmissions = user ? getStudentSubmissions(user.id) : [];
  const correctSubmissions = mySubmissions.filter(s => s.is_correct).length;
  const uniqueAssessments = new Set(mySubmissions.map(s => s.assessment_id)).size;
  const accuracy = mySubmissions.length > 0 ? correctSubmissions / mySubmissions.length * 100 : 0;
  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    const {
      error
    } = await supabase.from('profiles').update({
      name: name.trim()
    }).eq('user_id', user.id);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your name has been updated successfully'
      });
    }
    setSaving(false);
  };

  // Language stats
  const languageStats = mySubmissions.reduce((acc, s) => {
    const lang = s.language || 'Unknown';
    if (!acc[lang]) acc[lang] = {
      total: 0,
      correct: 0
    };
    acc[lang].total++;
    if (s.is_correct) acc[lang].correct++;
    return acc;
  }, {});
  return <>
      <Navbar />
      <div className="page-container">
        <h1 className="section-title">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="card-elevated">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium capitalize text-foreground">
                {user?.role}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text flex items-center gap-2"><User className="w-4 h-4" />Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-text flex items-center gap-2"><Mail className="w-4 h-4" />Email</label>
                <input type="email" value={user?.email || ''} className="input-field opacity-60" readOnly />
              </div>
              <div>
                <label className="label-text flex items-center gap-2"><Shield className="w-4 h-4" />Role</label>
                <input type="text" value={user?.role || ''} className="input-field opacity-60 capitalize" readOnly />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card text-center">
                <Code className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{mySubmissions.length}</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
              <div className="stat-card text-center">
                <CheckCircle className="w-6 h-6 text-easy mx-auto mb-2" />
                <p className="text-2xl font-bold text-easy">{correctSubmissions}</p>
                <p className="text-sm text-muted-foreground">Solved</p>
              </div>
              <div className="stat-card text-center">
                <Target className="w-6 h-6 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{accuracy.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="stat-card text-center">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{uniqueAssessments}</p>
                <p className="text-sm text-muted-foreground">Assessments</p>
              </div>
            </div>

            {/* Language breakdown */}
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-foreground mb-4">Language Breakdown</h2>
              {Object.keys(languageStats).length > 0 ? <div className="space-y-3">
                  {Object.entries(languageStats).sort(([, a], [, b]) => b.total - a.total).map(([lang, stats]) => {
                const pct = stats.total > 0 ? stats.correct / stats.total * 100 : 0;
                return <div key={lang}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-foreground">{lang}</span>
                            <span className="text-muted-foreground">{stats.correct}/{stats.total} solved ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{
                      width: `${pct}%`
                    }} />
                          </div>
                        </div>;
              })}
                </div> : <p className="text-muted-foreground text-center py-8">No submissions yet. Start solving problems!</p>}
            </div>

            {/* Recent Activity */}
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h2>
              {mySubmissions.length > 0 ? <div className="space-y-2">
                  {mySubmissions.slice(0, 10).map(sub => {
                const assessment = assessments.find(a => a.id === sub.assessment_id);
                return <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          {sub.is_correct ? <CheckCircle className="w-5 h-5 text-easy" /> : <Target className="w-5 h-5 text-error" />}
                          <div>
                            <p className="font-medium text-foreground text-sm">{assessment?.title || 'Assessment'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${sub.is_correct ? 'bg-success-light text-easy' : 'bg-error-light text-error'}`}>
                          {sub.score || 0}%
                        </span>
                      </div>;
              })}
                </div> : <p className="text-muted-foreground text-center py-8">No activity yet</p>}
            </div>
          </div>
        </div>
      </div>
    </>;
}