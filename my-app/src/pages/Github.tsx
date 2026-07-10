// src/pages/Github.tsx
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

// Change this to your exact username to sync your real repositories
const GITHUB_USERNAME = "aakash-develops";

const GithubPage: React.FC = () => {
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
      tierColor = '#00f5ff';
    } else if (total >= 60) {
      tier = 'Gold';
      tierColor = '#f1e05a';
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#4f8cff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>
        🌐 INITIALIZING SECURE GITHUB TELEMETRY DATA STREAM...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.04)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '600px', margin: '40px auto', fontFamily: 'monospace' }}>
        💥 SYSTEM EXCEPTION: {error}
      </div>
    );
  }

  const selectedHealth = selectedRepo ? calculateProjectHealth(selectedRepo) : null;
  const selectedLangConfig = selectedRepo ? (LANGUAGE_CONFIG[selectedRepo.language || ''] || LANGUAGE_CONFIG['Default']) : null;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 24px', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        .gh-dashboard-layout { display: grid; grid-template-columns: 330px 1fr; gap: 32px; align-items: start; }
        .gh-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
        .glass-panel { background: rgba(13, 13, 18, 0.6); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; box-sizing: border-box; }
        .repo-card { cursor: pointer; transition: all 0.3s ease; }
        .repo-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.15) !important; }
        .terminal-log { background: #060609; border: 1px solid #171722; font-family: monospace; padding: 16px; border-radius: 12px; font-size: 13px; color: #38bdf8; overflow-y: auto; max-height: 180px; }
        @media (max-width: 1300px) { .gh-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 992px) { .gh-dashboard-layout { grid-template-columns: 1fr; } }
        @media (max-width: 680px) { .gh-card-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.8px' }}>Ecosystem Telemetry</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Real-time public code indexing engine with algorithmic documentation auditing modules.</p>
        </div>
        {profile && (
          <a href={profile.html_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px 20px', color: '#38bdf8', fontSize: '13px', fontWeight: 600 }}>
            🐙 Source Connection Profile
          </a>
        )}
      </div>

      <div className="gh-dashboard-layout">
        {/* SIDEBAR PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {profile && (
            <div className="glass-panel" style={{ textAlign: 'center', borderTop: '2px solid #38bdf8' }}>
              <img src={profile.avatar_url} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid rgba(56, 189, 248, 0.3)', padding: '5px', marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800 }}>{profile.name || profile.login}</h3>
              <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', marginBottom: '14px' }}>@{profile.login}</div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 24px 0', lineHeight: '1.6' }}>{profile.bio || "No profile bio setup."}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800 }}>{profile.public_repos}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Repositories</div>
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800 }}>{profile.followers}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Followers</div>
                </div>
              </div>
            </div>
          )}

          {/* COMPOSITION CHART */}
          <div className="glass-panel">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Language Matrix</h4>
            {languageDistribution.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>Zero compiled assets found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', width: '100%', height: '8px', borderRadius: '99px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                  {languageDistribution.map(item => (
                    <div key={item.lang} style={{ width: `${item.percentage}%`, background: item.config.color }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {languageDistribution.map(item => (
                    <div key={item.lang} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: item.config.color }} />
                        <span style={{ color: 'rgba(255,255,255,0.85)' }}>{item.lang}</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FEED SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* TERMINAL MONITOR */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              VIRTUAL WEBHOOK STREAM CONSOLE
            </h4>
            <div className="terminal-log">
              {events.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)' }}>&gt; Monitoring baseline telemetry hooks... standing by for push events.</div>
              ) : (
                events.map((e, index) => {
                  const timestamp = new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={e.id} style={{ marginBottom: index === events.length - 1 ? '0' : '10px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>[{timestamp}]</span>{' '}
                      <span style={{ color: '#a7f3d0' }}>&gt; GIT_PUSH</span> to{' '}
                      <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{e.repo.name.split('/')[1]}</span>
                      {e.payload.commits?.map((c, idx) => (
                        <div key={idx} style={{ paddingLeft: '16px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '12px' }}>
                          ↳ message: "{c.message}"
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* REPOSITORY GRID */}
          <div className="gh-card-grid">
            {repos.map(repo => {
              const langConfig = LANGUAGE_CONFIG[repo.language || ''] || LANGUAGE_CONFIG['Default'];
              const healthScore = calculateProjectHealth(repo);

              return (
                <div
                  key={repo.id}
                  onClick={() => handleOpenDrawer(repo)}
                  className="glass-panel repo-card"
                  style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px',
                    background: `linear-gradient(145deg, rgba(13,13,18,0.85) 0%, ${langConfig.glow} 100%)`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', color: healthScore.tierColor, border: `1px solid ${healthScore.tierColor}33`, background: `${healthScore.tierColor}0a`, padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {healthScore.tier} Tier
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: healthScore.tierColor, fontFamily: 'monospace' }}>
                        {healthScore.total}%
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#fff', wordBreak: 'break-word' }}>{repo.name}</h4>
                    <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {repo.description || "No project description payload provided."}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                    </div>
                    {repo.language && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: langConfig.color }}>
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

      {/* INSPECTOR DRAWER */}
      <div style={{ position: 'fixed', top: 0, right: isDrawerOpen ? 0 : '-460px', width: '100%', maxWidth: '440px', height: '100vh', background: 'rgba(8, 8, 12, 0.95)', backdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10000, transition: 'right 0.35s ease', padding: '32px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {selectedRepo && selectedHealth && selectedLangConfig && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>// ANALYSIS CONSOLE</span>
                <button onClick={handleCloseDrawer} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#fff' }}>{selectedRepo.name}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', color: selectedLangConfig.color, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>{selectedRepo.language || 'General Stack'}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Updated {new Date(selectedRepo.updated_at).toLocaleDateString('en-GB')}</span>
              </div>

              <div style={{ background: '#050508', border: '1px solid #14141c', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>📁 root/</div>
                <div style={{ paddingLeft: '14px', color: '#10b981' }}>📁 src/</div>
                <div style={{ paddingLeft: '28px' }}>📄 App.tsx</div>
                <div style={{ paddingLeft: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📄 README.md</span>
                  <span style={{ color: selectedHealth.breakdown.documentation > 0 ? '#10b981' : '#ef4444' }}>{selectedHealth.breakdown.documentation > 0 ? '✓ FOUND' : '✖ MISSING'}</span>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Audit Metrics ({selectedHealth.total}%)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(selectedHealth.breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ fontFamily: 'monospace' }}>{val}</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', background: '#38bdf8', width: `${(val / (key === 'maturity' || key === 'engagement' ? 20 : 30)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <a href={selectedRepo.html_url} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', background: '#38bdf8', color: '#000', textAlign: 'center', padding: '14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              🐙 Launch Codebase
            </a>
          </>
        )}
      </div>

      {isDrawerOpen && <div onClick={handleCloseDrawer} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999 }} />}
    </div>
  );
};

export default GithubPage;