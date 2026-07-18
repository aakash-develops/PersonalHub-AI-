import React, { useState, useEffect, useMemo } from 'react';

interface GHProfile {
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface GHRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  html_url: string;
  updated_at: string;
  topics?: string[];
  has_issues: boolean;
}

interface GHEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: {
    commits?: Array<{ message: string }>;
    ref?: string;
  };
  created_at: string;
}

interface AuditScore {
  total: number;
  breakdown: {
    documentation: number;
    activity: number;
    maturity: number;
    engagement: number;
  };
  tier: 'Diamond' | 'Gold' | 'Prototype';
  tierColor: string;
}

const LANGUAGE_CONFIG: Record<string, { color: string; icon: string; glow: string }> = {
  'TypeScript': { color: '#3178c6', icon: '🔷', glow: 'rgba(49, 120, 198, 0.15)' },
  'JavaScript': { color: '#f1e05a', icon: '🟨', glow: 'rgba(241, 224, 90, 0.12)' },
  'Python': { color: '#3572A5', icon: '🐍', glow: 'rgba(53, 114, 165, 0.15)' },
  'HTML': { color: '#e34c26', icon: '🔥', glow: 'rgba(227, 76, 38, 0.15)' },
  'CSS': { color: '#563d7c', icon: '🎨', glow: 'rgba(86, 61, 124, 0.15)' },
  'React': { color: '#61dafb', icon: '⚛️', glow: 'rgba(97, 218, 251, 0.15)' },
  'Default': { color: '#9ca3af', icon: '📁', glow: 'rgba(156, 163, 175, 0.08)' }
};

const GITHUB_USERNAME = "aakash-develops";

interface GithubPageProps {
  currentTheme?: 'cosmic' | 'crystal';
}

export default function GithubPage({ currentTheme }: GithubPageProps) {
  const [profile, setProfile] = useState<GHProfile | null>(null);
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [events, setEvents] = useState<GHEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setLoading(true);
        const [profileRes, reposRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=8`)
        ]);

        if (!profileRes.ok || !reposRes.ok) {
          throw new Error("Failed to synchronize with GitHub servers. Verify your configurations.");
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();
        let eventsData = await eventsRes.json();

        if (Array.isArray(eventsData)) {
          eventsData = eventsData.filter(e => e.type === 'PushEvent' || e.type === 'CreateEvent');
        } else {
          eventsData = [];
        }

        setProfile(profileData);
        setRepos(reposData);
        setEvents(eventsData);
      } catch (err: any) {
        setError(err.message || "An unexpected telemetry streaming fault occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  const calculateProjectHealth = (repo: GHRepo): AuditScore => {
    let documentation = 0;
    let activity = 0;
    let maturity = 0;
    let engagement = 0;

    if (repo.description && repo.description.length > 10) documentation += 15;
    if (repo.name.length > 3) documentation += 15;

    const lastUpdate = new Date(repo.updated_at).getTime();
    const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 30) activity = 30;
    else if (daysSinceUpdate <= 90) activity = 20;
    else if (daysSinceUpdate <= 180) activity = 10;
    else activity = 5;

    if (repo.topics && repo.topics.length > 0) {
      maturity += Math.min(repo.topics.length * 5, 20);
    } else if (repo.language) {
      maturity += 10;
    }

    let statsWeight = repo.stargazers_count * 5 + repo.forks_count * 5 + repo.watchers_count * 2;
    engagement += Math.min(statsWeight, 20);

    const total = documentation + activity + maturity + engagement;

    let tier: 'Diamond' | 'Gold' | 'Prototype' = 'Prototype';
    let tierColor = '#9ca3af';
    if (total >= 85) {
      tier = 'Diamond';
      tierColor = currentTheme === 'crystal' ? '#0284c7' : '#00f5ff';
    } else if (total >= 60) {
      tier = 'Gold';
      tierColor = '#eab308';
    }

    return { total, breakdown: { documentation, activity, maturity, engagement }, tier, tierColor };
  };

  const languageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    repos.forEach(r => {
      if (r.language) {
        counts[r.language] = (counts[r.language] || 0) + 1;
        total++;
      }
    });
    return Object.entries(counts).map(([lang, count]) => ({
      lang,
      percentage: Math.round((count / total) * 100),
      config: LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG['Default']
    })).sort((a, b) => b.percentage - a.percentage);
  }, [repos]);

  const handleOpenDrawer = (repo: GHRepo) => {
    setSelectedRepo(repo);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs font-bold animate-pulse" style={{ color: 'var(--accent-color)' }}>
        🌐 INITIALIZING SECURE GITHUB TELEMETRY DATA STREAM...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-10 p-10 text-center font-mono text-sm border border-red-500/30 rounded-2xl bg-red-500/5 text-red-500">
        💥 SYSTEM EXCEPTION: {error}
      </div>
    );
  }

  const selectedHealth = selectedRepo ? calculateProjectHealth(selectedRepo) : null;
  const selectedLangConfig = selectedRepo ? (LANGUAGE_CONFIG[selectedRepo.language || ''] || LANGUAGE_CONFIG['Default']) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 text-dynamic-primary relative">

      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Ecosystem Telemetry</h1>
          <p className="text-sm text-dynamic-secondary">
            Real-time public code indexing engine with algorithmic documentation auditing modules.
          </p>
        </div>
        {profile && (
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold tracking-wider font-mono uppercase px-5 py-3 rounded-full border border-dynamic bg-[var(--pill-bg)] hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-color)' }}
          >
            🐙 Source Connection Profile
          </a>
        )}
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">

        {/* SIDEBAR MODULES */}
        <div className="flex flex-col gap-6">
          {profile && (
            <div
              className="p-6 rounded-3xl backdrop-blur-xl border flex flex-col items-center text-center shadow-premium bg-[var(--bg-glass)] border-[var(--border-glass)]"
              style={{ borderTop: '2px solid var(--accent-color)' }}
            >
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full p-1 mb-4 border border-dynamic"
              />
              <h3 className="text-xl font-bold mb-0.5">{profile.name || profile.login}</h3>
              <div className="text-xs font-mono font-bold mb-4" style={{ color: 'var(--accent-color)' }}>@{profile.login}</div>
              <p className="text-xs text-dynamic-secondary leading-relaxed mb-6">{profile.bio || "No profile bio setup."}</p>

              <div className="w-full grid grid-cols-2 gap-3 pt-5 border-t border-dynamic">
                <div>
                  <div className="text-xl font-extrabold">{profile.public_repos}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dynamic-secondary opacity-60">Repositories</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold">{profile.followers}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dynamic-secondary opacity-60">Followers</div>
                </div>
              </div>
            </div>
          )}

          {/* COMPOSITION CHART MODULE */}
          <div className="p-6 rounded-3xl backdrop-blur-xl border shadow-premium bg-[var(--bg-glass)] border-[var(--border-glass)]">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-dynamic-secondary opacity-60 mb-4">Language Matrix</h4>
            {languageDistribution.length === 0 ? (
              <div className="text-xs text-dynamic-secondary opacity-40 font-mono">Zero compiled assets found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--pill-bg)] flex">
                  {languageDistribution.map(item => (
                    <div key={item.lang} style={{ width: `${item.percentage}%`, backgroundColor: item.config.color }} />
                  ))}
                </div>
                <div className="flex flex-col gap-2.5">
                  {languageDistribution.map(item => (
                    <div key={item.lang} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.config.color }} />
                        <span className="text-dynamic-primary font-medium">{item.lang}</span>
                      </div>
                      <span className="text-dynamic-secondary font-mono opacity-80">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS FEED MONITOR & REPOSITORIES STREAM */}
        <div className="flex flex-col gap-6">

          {/* TERMINAL MONITOR */}
          <div className="p-5 rounded-3xl backdrop-blur-xl border shadow-premium bg-[var(--bg-glass)] border-[var(--border-glass)]">
            <h4 className="text-[11px] font-mono uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: 'var(--accent-color)' }} />
              VIRTUAL WEBHOOK STREAM CONSOLE
            </h4>
            <div className="bg-black/20 p-4 rounded-xl border border-dynamic font-mono text-xs max-h-44 overflow-y-auto space-y-3" style={{ color: 'var(--secondary-accent)' }}>
              {events.length === 0 ? (
                <div className="opacity-40">&gt; Monitoring baseline telemetry hooks... standing by for push events.</div>
              ) : (
                events.map((e, index) => {
                  const timestamp = new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={e.id}>
                      <span className="opacity-30">[{timestamp}]</span>{' '}
                      <span className="text-emerald-400 font-bold">&gt; GIT_PUSH</span> to{' '}
                      <span className="text-dynamic-primary font-bold">{e.repo.name.split('/')[1]}</span>
                      {e.payload.commits?.map((c, idx) => (
                        <div key={idx} className="pl-4 text-[11px] text-dynamic-secondary italic mt-0.5">
                          ↳ message: "{c.message}"
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* REPOSITORY STREAM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {repos.map(repo => {
              const langConfig = LANGUAGE_CONFIG[repo.language || ''] || LANGUAGE_CONFIG['Default'];
              const healthScore = calculateProjectHealth(repo);

              return (
                <div
                  key={repo.id}
                  onClick={() => handleOpenDrawer(repo)}
                  className="p-6 rounded-3xl backdrop-blur-xl border flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-[var(--bg-glass)] border-[var(--border-glass)] hover:border-dynamic shadow-premium"
                  style={{
                    background: currentTheme !== 'crystal'
                      ? `linear-gradient(145deg, rgba(15,10,25,0.6) 0%, ${langConfig.glow} 100%)`
                      : undefined
                  }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span
                        className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border font-bold"
                        style={{ color: healthScore.tierColor, borderColor: `${healthScore.tierColor}33`, backgroundColor: `${healthScore.tierColor}0a` }}
                      >
                        {healthScore.tier} Tier
                      </span>
                      <span className="text-xs font-mono font-bold" style={{ color: healthScore.tierColor }}>
                        {healthScore.total}%
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-dynamic-primary mb-1 line-clamp-1">{repo.name}</h4>
                    <p className="text-xs text-dynamic-secondary leading-relaxed line-clamp-3 mb-4">
                      {repo.description || "Active production software system layout layout template."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-dynamic">
                    <div className="flex gap-3 text-[11px] font-mono text-dynamic-secondary opacity-70">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                    </div>
                    {repo.language && (
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: langConfig.color }}>
                        {langConfig.icon} {repo.language}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INSPECTOR CONSOLE DRAWER */}
      <div
        className={`fixed top-0 bottom-0 y-0 right-0 h-screen w-full max-w-md backdrop-blur-2xl border-l border-dynamic z-50 p-8 flex flex-col justify-between transition-all duration-500 ease-in-out bg-black/90 ${
          isDrawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        {selectedRepo && selectedHealth && selectedLangConfig && (
          <>
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono tracking-widest text-dynamic-secondary opacity-50">// ANALYSIS CONSOLE</span>
                <button
                  onClick={handleCloseDrawer}
                  className="bg-transparent border-none text-dynamic-secondary hover:text-dynamic-primary text-lg cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1.5">{selectedRepo.name}</h3>
              <div className="flex flex-wrap gap-2.5 items-center mb-6 text-xs">
                <span className="px-2.5 py-0.5 rounded-md font-medium bg-white/5" style={{ color: selectedLangConfig.color }}>
                  {selectedRepo.language || 'General Stack'}
                </span>
                <span className="text-white/40 font-mono">
                  Updated {new Date(selectedRepo.updated_at).toLocaleDateString('en-GB')}
                </span>
              </div>

              {/* MOCK TREE VIEW */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs text-white/70 space-y-1.5 mb-6">
                <div style={{ color: 'var(--accent-color)' }} className="font-bold">📁 root/</div>
                <div className="pl-4 text-emerald-400 font-semibold">📁 src/</div>
                <div className="pl-8 opacity-60">📄 App.tsx</div>
                <div className="pl-4 flex justify-between items-center">
                  <span className="opacity-60">📄 README.md</span>
                  <span className={`text-[10px] font-bold ${selectedHealth.breakdown.documentation > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedHealth.breakdown.documentation > 0 ? '✓ FOUND' : '✖ MISSING'}
                  </span>
                </div>
              </div>

              {/* AUDIT METRICS MATRIX */}
              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-4">
                  Audit Metrics ({selectedHealth.total}%)
                </h4>
                <div className="flex flex-col gap-4">
                  {Object.entries(selectedHealth.breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/60 capitalize">{key}</span>
                        <span className="font-mono text-white font-semibold">{val}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: 'var(--accent-color)',
                            width: `${(val / (key === 'maturity' || key === 'engagement' ? 20 : 30)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={selectedRepo.html_url}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center text-xs font-bold tracking-widest font-mono uppercase p-4 rounded-xl text-white block transition-transform active:scale-95 shadow-lg"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              🐙 Launch Codebase ↗
            </a>
          </>
        )}
      </div>

      {/* DRAWER LAYER BLOCKS */}
      {isDrawerOpen && (
        <div
          onClick={handleCloseDrawer}
          className="fixed inset-0 w-screen h-screen bg-black/30 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}
    </div>
  );
}