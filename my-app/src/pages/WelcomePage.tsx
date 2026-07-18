import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/layout/ThemeProvider';

// Custom lightweight hook to create a cyberpunk typing effect
function useTypewriter(text: string, speed: number = 75, startTrigger: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!startTrigger) return;
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, startTrigger]);

  return displayedText;
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [bootComplete, setBootComplete] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const bootLogs = [
    '⚡ NEURAL_LINK: INITIALIZING...',
    '🌌 COGNITIVE PARALLAX CALIBRATING...',
    '🔥 EXOPLANET GLOW SHADOW: ENGAGED',
    '🧠 ALL MEMORY SEGMENTS PARSED',
    '🇫🇮 HELSINKI TRANSCEIVER // ONLINE',
    '🔓 DECRYPTION MODULE DEPLOYED.'
  ];

  // Telemetry stream generator
  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootLogs.length) {
        setTerminalLogs((prev) => [...prev, bootLogs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setBootComplete(true);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Cyberpunk contextual typewriter strings
  const stringInit = useTypewriter("INITIALIZING SYSTEM RUNTIME...", 60, true);
  const stringAwaiting = useTypewriter("SECURE GATEWAY // AWAITING CREDENTIALS_", 50, bootComplete && !authSuccess);
  const stringGranted = useTypewriter("ACCESS GRANTED // WELCOME TO YOUR PORTAL_", 40, authSuccess);

  const handleAccessGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authSuccess) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('sys_session_token', data.token);
        setAuthSuccess(true);

        // Let them enjoy the "ACCESS GRANTED" animation for a brief moment before navigating
        setTimeout(() => {
          navigate('/dashboard');
        }, 2200);
      } else {
        setErrorMsg(data.message || 'SYS_AUTH: INVALID CIPHER PARITY');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('FATAL_ERR: BRIDGE_SERVER_DISCONNECTED (5000)');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme checking constants
  const isCosmic = theme === 'cosmic';
  const labelColor = isCosmic ? 'text-zinc-400' : 'text-slate-500';

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none bg-transparent flex flex-col items-center justify-center px-6 md:px-12 lg:px-24">

      {/* 🌌 HEADLINE ARCHITECTURE WITH PHASED TYPING MECHANICS */}
      <div className="text-center pointer-events-none mb-12 w-full z-20 font-mono">
        <h3 className={`text-[10px] tracking-[6px] font-bold uppercase mb-2 ${isCosmic ? 'text-pink-500/80' : 'text-blue-600'} animate-pulse`}>

        </h3>

        <div className="h-16 flex justify-center items-center">
          {!bootComplete && (
            <h1 className={`text-xl md:text-2xl font-bold tracking-[4px] uppercase ${isCosmic ? 'text-zinc-400' : 'text-slate-600'}`}>
              {stringInit}
              <span className={`inline-block w-2 h-4 ${isCosmic ? 'bg-zinc-400' : 'bg-slate-600'} ml-1 animate-ping`} />
            </h1>
          )}

          {bootComplete && !authSuccess && (
            <h1 className={`text-xl md:text-2xl font-bold tracking-[4px] uppercase ${isCosmic ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]' : 'text-blue-600'}`}>
              {stringAwaiting}
              <span className={`inline-block w-2 h-4 ${isCosmic ? 'bg-cyan-400' : 'bg-blue-600'} ml-1 animate-pulse`} />
            </h1>
          )}

          {authSuccess && (
            <h1 className="text-xl md:text-3xl font-extrabold tracking-[4px] uppercase bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              {stringGranted}
              <span className="inline-block w-2.5 h-5 bg-emerald-500 ml-1 animate-ping" />
            </h1>
          )}
        </div>
      </div>

      {/* 🎛️ INTEGRATED SPLIT GRID: TELEMETRY PARALLEL TO CONTAINER */}
      <div className="w-full max-w-[950px] grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center relative">

        {/* 📡 PARALLEL TELEMETRY: Directly on the left, balanced horizontally */}
        <div className="md:col-span-4 flex flex-col gap-2 font-mono text-[11px] tracking-wider text-dynamic-primary opacity-40 md:opacity-60 self-center border-l border-dynamic pl-5 py-4 h-fit justify-center">
          <div className={`text-[9px] uppercase tracking-[3px] font-black ${isCosmic ? 'text-pink-500/70' : 'text-blue-600/80'} mb-1`}>
            ⚡ TELEMETRY_FEED
          </div>

          {terminalLogs.map((log, index) => (
            <div key={index} className="opacity-90 font-medium transition-all duration-500 animate-fade-in">
              {log}
            </div>
          ))}

          {!bootComplete && (
            <div className={`text-[9px] ${isCosmic ? 'text-pink-400/80' : 'text-blue-500'} tracking-widest uppercase animate-pulse`}>
              &gt;&gt; RESOLVING SECURE PARTITIONS
            </div>
          )}

          {bootComplete && !authSuccess && (
            <div className={`text-[9px] ${isCosmic ? 'text-cyan-400' : 'text-blue-600'} tracking-widest uppercase font-bold animate-pulse`}>
              ● READY FOR CREDENTIAL SHIELD INPUT
            </div>
          )}

          {authSuccess && (
            <div className="text-[9px] text-emerald-500 tracking-widest uppercase font-bold animate-bounce">
              ✓ SYNC SUCCESSFUL // REDIRECTING
            </div>
          )}
        </div>

        {/* 🔒 CYBERPUNK DECRYPTION MODULE */}
        <div className="md:col-span-8 flex justify-center w-full">
          <form
            onSubmit={handleAccessGrant}
            className={`w-full max-w-[430px] border rounded-2xl p-8 md:p-10 backdrop-blur-3xl flex flex-col transition-all duration-500 border-dynamic bg-[var(--bg-glass)] shadow-[var(--shadow-premium)] z-10 ${
              authSuccess
                ? 'border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] scale-[0.99] opacity-70'
                : isHovered
                  ? isCosmic
                    ? 'shadow-[0_0_40px_rgba(244,63,94,0.15)] scale-[1.005] border-pink-500/30'
                    : 'shadow-[0_0_40px_rgba(37,99,235,0.15)] scale-[1.005] border-blue-500/30'
                  : 'opacity-[0.98]'
            }`}
          >
            <div className="text-center mb-8">
              <h2 className="text-lg font-black tracking-[3px] uppercase mb-1 text-dynamic-primary font-mono">
                [ DECRYPT_ACCESS_KEY ]
              </h2>
              <p className="text-xs tracking-wide text-dynamic-secondary opacity-80">
                Identify interface signatures to establish hookup.
              </p>
            </div>

            <div className="flex flex-col gap-5 mb-7">
              <div className="flex flex-col gap-2">
                <label className={`text-[10px] tracking-[2px] font-bold font-mono ${labelColor}`}>// OPERATOR ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usr://handle"
                  disabled={isSubmitting || authSuccess}
                  className="w-full bg-[var(--pill-bg)] border border-dynamic rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-25 disabled:opacity-40 font-mono text-dynamic-primary focus:border-pink-500/40 dark:focus:border-blue-500/40"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={`text-[10px] tracking-[2px] font-bold font-mono ${labelColor}`}>// CIPHER KEY</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting || authSuccess}
                  className="w-full bg-[var(--pill-bg)] border border-dynamic rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-40 font-mono text-dynamic-primary focus:border-cyan-500/40 dark:focus:border-blue-500/40"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-center font-mono text-[10px] text-red-500 tracking-wider bg-red-500/10 border border-red-500/30 rounded-lg py-2.5 px-3 mb-5 animate-pulse">
                💥 {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || authSuccess}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`w-full py-4 rounded-xl font-mono font-bold tracking-[3px] uppercase text-xs transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-wait ${
                authSuccess
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                  : isHovered && !isSubmitting
                    ? isCosmic
                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    : 'bg-[var(--pill-bg)] text-dynamic-primary opacity-80 border border-dynamic'
              }`}
            >
              {authSuccess
                ? 'CONNECTION SECURED'
                : isSubmitting
                  ? 'RUNNING DECRYPTION...'
                  : 'RUN VERIFICATION_'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}