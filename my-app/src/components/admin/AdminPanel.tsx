// import React, { useState, useEffect } from 'react';
// import {
//   Trash2, ShieldAlert, Key, ClipboardList, Briefcase,
//   Globe, Search, History, X, Settings, Database, Sliders, Save, Download, Upload, HelpCircle
// } from 'lucide-react';
// import type { AppDatabaseState } from '../../types/schema';

// const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
//   <svg
//     className={className}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
//     <path d="M9 18c-4.51 2-5-2-7-2" />
//   </svg>
// );

// interface DeleteRecord {
//   id: string;
//   category: string;
//   deletedAt: string;
//   identifyingInfo: string;
// }

// interface AdminPanelProps {
//   onClose: () => void;
//   db: AppDatabaseState;
//   setDb: React.Dispatch<React.SetStateAction<AppDatabaseState>>;
// }

// type TabType = 'daily' | 'jobs' | 'finnish' | 'github' | 'config' | 'json' | 'audit';

// export default function AdminPanel({ onClose, db, setDb }: AdminPanelProps) {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [password, setPassword] = useState<string>('');
//   const [activeTab, setActiveTab] = useState<TabType>('config');
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   // Active Tooltip Trackers (holds key names of visible explanations)
//   const [visibleHelp, setVisibleHelp] = useState<Record<string, boolean>>({});

//   const toggleHelp = (key: string) => {
//     setVisibleHelp(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   // Config State values (for fast local edits)
//   const [currentWeek, setCurrentWeek] = useState(db?.system_config?.current_active_week || 1);
//   const [minJobs, setMinJobs] = useState(db?.weekly_output_targets?.career_min_jobs || 0);
//   const [minCommits, setMinCommits] = useState(db?.weekly_output_targets?.github_min_commits || 0);

//   // Raw JSON state
//   const [rawJson, setRawJson] = useState('');

//   const logs = db?.modules_data?.learning_notes || [];
//   const jobs = db?.modules_data?.job_tracker || [];
//   const vocab = db?.modules_data?.finnish_tracker || [];
//   const syncs = db?.modules_data?.github_tracker || [];

//   const [auditLogs, setAuditLogs] = useState<DeleteRecord[]>(() => {
//     const savedLogs = localStorage.getItem('admin_delete_history');
//     return savedLogs ? JSON.parse(savedLogs) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem('admin_delete_history', JSON.stringify(auditLogs));
//   }, [auditLogs]);

//   // Sync state values when DB changes or when opening JSON panel
//   useEffect(() => {
//     if (db) {
//       setCurrentWeek(db.system_config?.current_active_week || 1);
//       setMinJobs(db.weekly_output_targets?.career_min_jobs || 0);
//       setMinCommits(db.weekly_output_targets?.github_min_commits || 0);
//       setRawJson(JSON.stringify(db, null, 2));
//     }
//   }, [db, activeTab]);

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password === "admin123") {
//       setIsAuthenticated(true);
//     } else {
//       alert("Invalid password.");
//     }
//   };

//   // 1. SAVE SYSTEM CONFIG OVERRIDES
//   const handleSaveConfig = () => {
//     setDb((prev) => ({
//       ...prev,
//       system_config: {
//         ...prev.system_config,
//         current_active_week: currentWeek
//       },
//       weekly_output_targets: {
//         ...prev.weekly_output_targets,
//         career_min_jobs: minJobs,
//         github_min_commits: minCommits
//       }
//     }));
//     alert("System configurations hotpatched successfully!");
//   };

//   // 2. BACKUP DATABASE (Export as JSON)
//   const handleExportBackup = () => {
//     const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `db-backup-${new Date().toISOString().split('T')[0]}.json`;
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   // 3. RESTORE DATABASE FROM BACKUP FILE
//   const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const parsed = JSON.parse(event.target?.result as string);
//         if (parsed && parsed.modules_data) {
//           setDb(parsed);
//           alert("Database snapshot restored and merged successfully!");
//         } else {
//           alert("Invalid backup file layout.");
//         }
//       } catch (err) {
//         alert("Failed to parse database file.");
//       }
//     };
//     reader.readAsText(file);
//   };

//   // 4. DIRECT PLAIN JSON WRITE BACK TO DB STATE
//   const handleSaveRawJson = () => {
//     try {
//       const parsed = JSON.parse(rawJson);
//       if (!parsed.modules_data) {
//         alert("Verification failed: Root 'modules_data' block missing.");
//         return;
//       }
//       setDb(parsed);
//       alert("Raw database state overwritten successfully!");
//     } catch (e) {
//       alert("Syntax Error: Invalid JSON configuration.");
//     }
//   };

//   // 5. PURGE RECORDS AND LOG DELETIONS
//   const executeSystemPurge = (category: 'daily' | 'jobs' | 'finnish' | 'github', id: string, identifyingInfo: string) => {
//     if (!window.confirm(`Are you sure you want to permanently delete this ${category} record?`)) return;

//     setDb((prev) => {
//       const updatedModules = { ...prev.modules_data };

//       if (category === 'daily') {
//         updatedModules.learning_notes = (updatedModules.learning_notes || []).filter(item => item.id !== id);
//       } else if (category === 'jobs') {
//         updatedModules.job_tracker = (updatedModules.job_tracker || []).filter(item => item.id !== id);
//       } else if (category === 'finnish') {
//         updatedModules.finnish_tracker = (updatedModules.finnish_tracker || []).filter(item => item.id !== id);
//       } else if (category === 'github') {
//         updatedModules.github_tracker = (updatedModules.github_tracker || []).filter(item => item.id !== id);
//       }

//       return {
//         ...prev,
//         modules_data: updatedModules,
//       };
//     });

//     const newAuditRecord: DeleteRecord = {
//       id: Math.random().toString(36).substr(2, 9),
//       category,
//       deletedAt: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
//       identifyingInfo
//     };
//     setAuditLogs([newAuditRecord, ...auditLogs]);
//   };

//   // Login Screen
//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
//         <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full relative">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
//             title="Exit Admin Panel"
//           >
//             <X className="w-4 h-4" />
//           </button>
//           <div className="flex items-center gap-3 mb-6">
//             <ShieldAlert className="text-rose-500 w-8 h-8" />
//             <h1 className="text-xl font-bold text-white">Security Clearance</h1>
//           </div>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="block text-xs font-medium text-slate-400 mb-2">Access Key</label>
//               <div className="relative">
//                 <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
//                   placeholder="Enter local secret..."
//                 />
//               </div>
//             </div>
//             <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 rounded-xl text-sm transition-all">
//               Unlock Terminal
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   // Active Admin Console
//   return (
//     <div className="min-h-screen w-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden text-white font-sans">

//       {/* Sidebar Nav */}
//       <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <ShieldAlert className="w-4 h-4 text-rose-500" />
//               <span className="font-bold text-xs tracking-wider text-slate-200">CONSOLE ADMIN</span>
//             </div>
//             <button onClick={onClose} className="md:hidden p-1.5 hover:bg-slate-800 rounded text-slate-400">
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//           <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
//             <div className="hidden md:block text-[10px] text-slate-500 uppercase font-bold tracking-wider px-3 mb-1">Direct Variables</div>
//             <button onClick={() => { setActiveTab('config'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'config' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
//               <Settings className="w-4 h-4" /> System Overrides
//             </button>
//             <button onClick={() => { setActiveTab('json'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'json' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
//               <Database className="w-4 h-4" /> Raw JSON Terminal
//             </button>

//             <div className="hidden md:block h-px bg-slate-850 my-2" />
//             <div className="hidden md:block text-[10px] text-slate-500 uppercase font-bold tracking-wider px-3 mb-1">Manage Modules</div>

//             <button onClick={() => { setActiveTab('daily'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'daily' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
//               <ClipboardList className="w-4 h-4" /> Daily Notes
//             </button>
//             <button onClick={() => { setActiveTab('jobs'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'jobs' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
//               <Briefcase className="w-4 h-4" /> Job Directory
//             </button>
//             <button onClick={() => { setActiveTab('finnish'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'finnish' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
//               <Globe className="w-4 h-4" /> Finnish Vocab
//             </button>
//             <button onClick={() => { setActiveTab('github'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'github' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
//               <GithubIcon className="w-4 h-4" /> GitHub History
//             </button>

//             <div className="hidden md:block h-px bg-slate-850 my-2" />

//             <button onClick={() => { setActiveTab('audit'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'audit' ? 'bg-amber-600 text-white' : 'text-amber-500 hover:bg-amber-500/10'}`}>
//               <History className="w-4 h-4" /> Purge History ({auditLogs.length})
//             </button>
//           </nav>
//         </div>

//         <div className="hidden md:block text-[10px] text-slate-600 font-mono">
//           Secure Session Active
//         </div>
//       </aside>

//       {/* Main Content Pane */}
//       <div className="flex-grow flex flex-col min-w-0 bg-slate-950">
//         {/* Top Control Bar */}
//         <header className="flex justify-between items-center px-8 py-5 border-b border-slate-900 bg-slate-900/40">
//           <div>
//             <h1 className="text-xl font-bold capitalize text-white">
//               {activeTab === 'config' ? 'System Overrides' : activeTab === 'json' ? 'Raw JSON Editor' : `${activeTab} Database`}
//             </h1>
//             <p className="text-xs text-slate-400 mt-0.5">
//               {activeTab === 'config' ? 'Directly change current week and application metrics.' : 'Direct local variables access controller.'}
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             {/* Search Input for module lists */}
//             {!['config', 'json', 'audit'].includes(activeTab) && (
//               <div className="relative w-48 hidden sm:block">
//                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
//                 <input
//                   type="text"
//                   placeholder="Search records..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none"
//                 />
//               </div>
//             )}
//             <button
//               onClick={onClose}
//               className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-semibold rounded-lg transition-all"
//             >
//               <span>Close Console</span>
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </header>

//         {/* Dynamic Workspace Container */}
//         <div className="flex-1 overflow-y-auto p-8">
//           <div className="max-w-6xl mx-auto space-y-6">

//             {/* TAB 1: SYSTEM SETTINGS OVERRIDES */}
//             {activeTab === 'config' && (
//               <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-6">
//                 <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
//                   <Sliders className="w-4 h-4 text-rose-500" /> Hotpatch Engine Configurations
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Current Active Week */}
//                   <div className="space-y-2 relative">
//                     <div className="flex items-center justify-between">
//                       <label className="block text-xs text-slate-400 font-medium">Current Active Week Override</label>
//                       <button
//                         onClick={() => toggleHelp('activeWeek')}
//                         className="text-slate-500 hover:text-rose-400 transition-colors"
//                         title="What does this do?"
//                       >
//                         <HelpCircle className="w-4 h-4" />
//                       </button>
//                     </div>
//                     {visibleHelp['activeWeek'] && (
//                       <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 mb-2 leading-relaxed animate-fadeIn">
//                         💡 **What this does:** Changes which roadmap week is marked active. Updating this instantly shifts your dashboard views to highlight notes and tasks belonging to this specific week number!
//                       </div>
//                     )}
//                     <input
//                       type="number"
//                       value={currentWeek}
//                       onChange={(e) => setCurrentWeek(Number(e.target.value))}
//                       className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
//                     />
//                     <p className="text-[10px] text-slate-500">Changes the current dashboard timeline rendering window.</p>
//                   </div>

//                   {/* Target: Min Jobs */}
//                   <div className="space-y-2 relative">
//                     <div className="flex items-center justify-between">
//                       <label className="block text-xs text-slate-400 font-medium">Target: Minimum Job Applications</label>
//                       <button
//                         onClick={() => toggleHelp('minJobs')}
//                         className="text-slate-500 hover:text-rose-400 transition-colors"
//                         title="What does this do?"
//                       >
//                         <HelpCircle className="w-4 h-4" />
//                       </button>
//                     </div>
//                     {visibleHelp['minJobs'] && (
//                       <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 mb-2 leading-relaxed animate-fadeIn">
//                         💡 **What this does:** This sets the milestone counter. If you set this to 5, the Dashboard will count your active job applications this week, check it against 5, and light up your career goal widget in green once met!
//                       </div>
//                     )}
//                     <input
//                       type="number"
//                       value={minJobs}
//                       onChange={(e) => setMinJobs(Number(e.target.value))}
//                       className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
//                     />
//                     <p className="text-[10px] text-slate-500">Weekly target quota for target checks.</p>
//                   </div>

//                   {/* Target: Min Commits */}
//                   <div className="space-y-2 relative">
//                     <div className="flex items-center justify-between">
//                       <label className="block text-xs text-slate-400 font-medium">Target: Minimum Weekly Commits</label>
//                       <button
//                         onClick={() => toggleHelp('minCommits')}
//                         className="text-slate-500 hover:text-rose-400 transition-colors"
//                         title="What does this do?"
//                       >
//                         <HelpCircle className="w-4 h-4" />
//                       </button>
//                     </div>
//                     {visibleHelp['minCommits'] && (
//                       <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 mb-2 leading-relaxed animate-fadeIn">
//                         💡 **What this does:** Changes the required GitHub commit target for the week. The Dashboard reads this value to compute whether you have coded enough this week to complete your Github Target.
//                       </div>
//                     )}
//                     <input
//                       type="number"
//                       value={minCommits}
//                       onChange={(e) => setMinCommits(Number(e.target.value))}
//                       className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
//                     />
//                     <p className="text-[10px] text-slate-500">Sets global green metric output quota threshold.</p>
//                   </div>
//                 </div>

//                 <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
//                   <div className="flex flex-wrap gap-3">
//                     <button
//                       onClick={handleSaveConfig}
//                       className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-lg transition-all"
//                     >
//                       <Save className="w-4 h-4" /> Save System Overrides
//                     </button>

//                     <div className="relative group">
//                       <button
//                         onClick={handleExportBackup}
//                         className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-all"
//                       >
//                         <Download className="w-4 h-4" /> Export Backup (.json)
//                       </button>
//                     </div>

//                     <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 cursor-pointer transition-all">
//                       <Upload className="w-4 h-4" /> Restore Snapshot
//                       <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
//                     </label>

//                     <button
//                       onClick={() => toggleHelp('backupExplanations')}
//                       className="p-2 text-slate-500 hover:text-slate-300 transition-all"
//                     >
//                       <HelpCircle className="w-4 h-4" />
//                     </button>
//                   </div>

//                   {visibleHelp['backupExplanations'] && (
//                     <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-450 space-y-2">
//                       <p>💾 **Export Backup (.json):** Pulls all current tasks, logs, and settings out of your app state and packages them into a file downloaded directly to your local computer. Save these files periodically!</p>
//                       <p>🔄 **Restore Snapshot:** If your database ever gets corrupted, lost, or cleared, choose a previously saved `.json` backup file here. It will immediately re-populate your entire app with your saved historical data!</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* TAB 2: LIVE RAW JSON EDITOR TERMINAL */}
//             {activeTab === 'json' && (
//               <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
//                 <div className="flex items-center justify-between border-b border-slate-800 pb-3">
//                   <div className="flex items-center gap-3">
//                     <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
//                       <Database className="w-4 h-4 text-cyan-500" /> Direct Database Schema Hot-Write
//                     </h3>
//                     <button
//                       onClick={() => toggleHelp('jsonConsole')}
//                       className="text-slate-500 hover:text-cyan-400 transition-colors"
//                     >
//                       <HelpCircle className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <span className="text-[10px] text-slate-500 font-mono">D: DRIVE ROOT PIPELINE</span>
//                 </div>

//                 {visibleHelp['jsonConsole'] && (
//                   <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
//                     ⚙️ **The Ultimate Console:** Below is the absolute exact structure of your database file currently running on your D: drive.
//                     - If you see a typo, a wrong ID, or want to fix a broken field manually, you can edit this text area directly.
//                     - Once you click **"Commit Schema Changes"**, your edits are parsed, integrated, and written directly back onto your computer disk!
//                     - *Warning: Entering invalid JSON will trigger a warning. Use valid syntax only!*
//                   </div>
//                 )}

//                 <textarea
//                   value={rawJson}
//                   onChange={(e) => setRawJson(e.target.value)}
//                   rows={20}
//                   className="w-full bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-850 rounded-xl p-4 focus:outline-none focus:border-rose-500 leading-relaxed resize-y"
//                   placeholder="Loading current database schema..."
//                 />
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={handleSaveRawJson}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg transition-all"
//                   >
//                     <Save className="w-4 h-4" /> Commit Schema Changes
//                   </button>
//                   <button
//                     onClick={() => setRawJson(JSON.stringify(db, null, 2))}
//                     className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-all"
//                   >
//                     Revert to current
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* MODULE DATA MANAGER LISTS */}
//             {!['config', 'json', 'audit'].includes(activeTab) && (
//               <div className="space-y-4">
//                 <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex items-center justify-between text-xs text-slate-400">
//                   <span>
//                     Manage your individual raw database records below. Use the search bar to locate specific entries.
//                   </span>
//                   <button
//                     onClick={() => toggleHelp('moduleList')}
//                     className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors"
//                   >
//                     <HelpCircle className="w-4 h-4" /> Explain Purge
//                   </button>
//                 </div>

//                 {visibleHelp['moduleList'] && (
//                   <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
//                     🗑️ **Direct Records Purge:** Normally, you cannot easily delete individual historical items (like old notes, deleted job applications, or bad practice minutes) from standard pages.
//                     - Here, you can search and locate any single row in the database.
//                     - Click the red **Trash Can** to remove that record forever from your application state and D: drive storage.
//                   </div>
//                 )}

//                 <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden">
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="bg-slate-950 border-b border-slate-850 text-xs font-semibold text-slate-400">
//                         <th className="px-5 py-3.5">Identifier</th>
//                         <th className="px-5 py-3.5">Details</th>
//                         <th className="px-5 py-3.5 text-right">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
//                       {activeTab === 'daily' && logs.filter(l => l.note.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
//                         <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
//                           <td className="px-5 py-3.5 font-mono text-[10px] text-rose-400">{item.date}</td>
//                           <td className="px-5 py-3.5 max-w-md truncate text-slate-300">{item.note}</td>
//                           <td className="px-5 py-3.5 text-right">
//                             <button onClick={() => executeSystemPurge('daily', item.id, `Daily Note: ${item.date}`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
//                           </td>
//                         </tr>
//                       ))}

//                       {activeTab === 'jobs' && jobs.filter(j => j.company.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
//                         <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
//                           <td className="px-5 py-3.5 font-semibold text-white">{item.company}</td>
//                           <td className="px-5 py-3.5 text-slate-400">{item.role} • <span className="text-[10px]">{item.status}</span></td>
//                           <td className="px-5 py-3.5 text-right">
//                             <button onClick={() => executeSystemPurge('jobs', item.id, `Job: ${item.company} (${item.role})`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
//                           </td>
//                         </tr>
//                       ))}

//                       {activeTab === 'finnish' && vocab.filter(v => v.activity.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
//                         <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
//                           <td className="px-5 py-3.5 font-bold text-sky-400">{item.activity}</td>
//                           <td className="px-5 py-3.5 text-slate-300">{item.minutes_spent} minutes <span className="text-[10px] text-slate-500">[{item.date}]</span></td>
//                           <td className="px-5 py-3.5 text-right">
//                             <button onClick={() => executeSystemPurge('finnish', item.id, `Vocab Log: ${item.activity}`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
//                           </td>
//                         </tr>
//                       ))}

//                       {activeTab === 'github' && syncs.filter(g => g.repo_name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
//                         <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
//                           <td className="px-5 py-3.5 font-mono text-[10px]">{item.id}</td>
//                           <td className="px-5 py-3.5 text-slate-300">{item.repo_name} ({item.commits_this_week} commits)</td>
//                           <td className="px-5 py-3.5 text-right">
//                             <button onClick={() => executeSystemPurge('github', item.id, `Github Repo: ${item.repo_name}`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* TAB 3: AUDIT HISTORY */}
//             {activeTab === 'audit' && (
//               <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-[11px] uppercase font-mono text-amber-500 tracking-wider">Deletion History Audit Log</h3>
//                   <button
//                     onClick={() => toggleHelp('auditLog')}
//                     className="text-slate-500 hover:text-amber-400 transition-colors"
//                   >
//                     <HelpCircle className="w-4 h-4" />
//                   </button>
//                 </div>

//                 {visibleHelp['auditLog'] && (
//                   <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
//                     📋 **Traceability:** Every time you delete an item using this Admin Console during your current local session, a trace of what was deleted and when is written here. This prevents mistakes and gives you a trail of system actions.
//                   </div>
//                 )}

//                 {auditLogs.length === 0 ? (
//                   <p className="text-xs text-slate-500 italic py-2">No system files purged during this window lifecycle.</p>
//                 ) : (
//                   <div className="space-y-1.5">
//                     {auditLogs.map((log) => (
//                       <div key={log.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono">
//                         <div className="flex items-center gap-3">
//                           <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase text-[10px]">[{log.category}]</span>
//                           <span className="text-slate-300 font-sans">{log.identifyingInfo}</span>
//                         </div>
//                         <span className="text-slate-500">{log.deletedAt}</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import {
  Trash2, ShieldAlert, Key, ClipboardList, Briefcase, Users,
  Globe, Search, History, X, Settings, Database, Sliders, Save, Download, Upload, HelpCircle
} from 'lucide-react';
import type { AppDatabaseState } from '../../types/schema';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface DeleteRecord {
  id: string;
  category: string;
  deletedAt: string;
  identifyingInfo: string;
}

interface AdminPanelProps {
  onClose: () => void;
  db: AppDatabaseState;
  setDb: React.Dispatch<React.SetStateAction<AppDatabaseState>>;
}

// Added 'users' tab to type system
type TabType = 'daily' | 'jobs' | 'finnish' | 'github' | 'config' | 'json' | 'audit' | 'users';

export default function AdminPanel({ onClose, db, setDb }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('aakash');
  const [password, setPassword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // User list state
  const [usersList, setUsersList] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  // Active Tooltip Trackers
  const [visibleHelp, setVisibleHelp] = useState<Record<string, boolean>>({});

  const toggleHelp = (key: string) => {
    setVisibleHelp(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Config State values (for fast local edits)
  const [currentWeek, setCurrentWeek] = useState(db?.system_config?.current_active_week || 1);
  const [minJobs, setMinJobs] = useState(db?.weekly_output_targets?.career_min_jobs || 0);
  const [minCommits, setMinCommits] = useState(db?.weekly_output_targets?.github_min_commits || 0);

  // Raw JSON state
  const [rawJson, setRawJson] = useState('');

  const logs = db?.modules_data?.learning_notes || [];
  const jobs = db?.modules_data?.job_tracker || [];
  const vocab = db?.modules_data?.finnish_tracker || [];
  const syncs = db?.modules_data?.github_tracker || [];

  const [auditLogs, setAuditLogs] = useState<DeleteRecord[]>(() => {
    const savedLogs = localStorage.getItem('admin_delete_history');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  useEffect(() => {
    localStorage.setItem('admin_delete_history', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sync state values when DB changes or when opening JSON panel
  useEffect(() => {
    if (db) {
      setCurrentWeek(db.system_config?.current_active_week || 1);
      setMinJobs(db.weekly_output_targets?.career_min_jobs || 0);
      setMinCommits(db.weekly_output_targets?.github_min_commits || 0);
      setRawJson(JSON.stringify(db, null, 2));
    }
  }, [db, activeTab]);

  // Load safe list of usernames when entering the users tab or on successful auth
  useEffect(() => {
    if (isAuthenticated) {
      fetch('http://localhost:5000/api/auth/users',{credentials:"include"})
        .then(res => res.json())
        .then(data => setUsersList(data))
        .catch(err => console.error("Error retrieving user database list:", err));
    }
  }, [isAuthenticated, activeTab]);

  // 🔐 Secure login handshake pointing to your database server
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'include',
        body: JSON.stringify({ username: usernameInput, password: password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        alert(data.message || "Invalid credentials.");
      }
    } catch (err) {
      alert("Verification Server is offline. Run your backend node server!");
    }
  };

  // 👥 Create user logic
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert("Please enter both a username and password.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert("Account registered successfully on Disk D!");
        setUsersList([...usersList, newUsername.toLowerCase().trim()]);
        setNewUsername('');
        setNewPassword('');
      } else {
        alert(data.message || "Failed to create account.");
      }
    } catch (err) {
      alert("Connection to authentication pipeline lost.");
    }
  };

  // 🗑️ Delete user account logic
  const handleDeleteUser = async (usernameToDelete: string) => {
    if (usernameToDelete === 'aakash') {
      alert("Cannot delete primary root administrator account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user [${usernameToDelete}]?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/user/${usernameToDelete}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(`Deleted user [${usernameToDelete}] successfully.`);
        setUsersList(usersList.filter(u => u !== usernameToDelete));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Connection error occurred while deleting user.");
    }
  };

  // 1. SAVE SYSTEM CONFIG OVERRIDES
  const handleSaveConfig = () => {
    setDb((prev) => ({
      ...prev,
      system_config: {
        ...prev.system_config,
        current_active_week: currentWeek
      },
      weekly_output_targets: {
        ...prev.weekly_output_targets,
        career_min_jobs: minJobs,
        github_min_commits: minCommits
      }
    }));
    alert("System configurations hotpatched successfully!");
  };

  // 2. BACKUP DATABASE (Export as JSON)
  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `db-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. RESTORE DATABASE FROM BACKUP FILE
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.modules_data) {
          setDb(parsed);
          alert("Database snapshot restored and merged successfully!");
        } else {
          alert("Invalid backup file layout.");
        }
      } catch (err) {
        alert("Failed to parse database file.");
      }
    };
    reader.readAsText(file);
  };

  // 4. DIRECT PLAIN JSON WRITE BACK TO DB STATE
  const handleSaveRawJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed.modules_data) {
        alert("Verification failed: Root 'modules_data' block missing.");
        return;
      }
      setDb(parsed);
      alert("Raw database state overwritten successfully!");
    } catch (e) {
      alert("Syntax Error: Invalid JSON configuration.");
    }
  };

  // 5. PURGE RECORDS AND LOG DELETIONS
  const executeSystemPurge = (category: 'daily' | 'jobs' | 'finnish' | 'github', id: string, identifyingInfo: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${category} record?`)) return;

    setDb((prev) => {
      const updatedModules = { ...prev.modules_data };

      if (category === 'daily') {
        updatedModules.learning_notes = (updatedModules.learning_notes || []).filter(item => item.id !== id);
      } else if (category === 'jobs') {
        updatedModules.job_tracker = (updatedModules.job_tracker || []).filter(item => item.id !== id);
      } else if (category === 'finnish') {
        updatedModules.finnish_tracker = (updatedModules.finnish_tracker || []).filter(item => item.id !== id);
      } else if (category === 'github') {
        updatedModules.github_tracker = (updatedModules.github_tracker || []).filter(item => item.id !== id);
      }

      return {
        ...prev,
        modules_data: updatedModules,
      };
    });

    const newAuditRecord: DeleteRecord = {
      id: Math.random().toString(36).substr(2, 9),
      category,
      deletedAt: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
      identifyingInfo
    };
    setAuditLogs([newAuditRecord, ...auditLogs]);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
            title="Exit Admin Panel"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-rose-500 w-8 h-8" />
            <h1 className="text-xl font-bold text-white">Security Clearance</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500 mb-2"
                placeholder="Enter username..."
              />
              <label className="block text-xs font-medium text-slate-400 mb-1">Access Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  placeholder="Enter local secret..."
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 rounded-xl text-sm transition-all">
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Admin Console
  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden text-white font-sans">

      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-xs tracking-wider text-slate-200">CONSOLE ADMIN</span>
            </div>
            <button onClick={onClose} className="md:hidden p-1.5 hover:bg-slate-800 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <div className="hidden md:block text-[10px] text-slate-500 uppercase font-bold tracking-wider px-3 mb-1">Direct Variables</div>
            <button onClick={() => { setActiveTab('config'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'config' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Settings className="w-4 h-4" /> System Overrides
            </button>
            <button onClick={() => { setActiveTab('json'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'json' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Database className="w-4 h-4" /> Raw JSON Terminal
            </button>
            <button onClick={() => { setActiveTab('users'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'users' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Users className="w-4 h-4" /> User Management
            </button>

            <div className="hidden md:block h-px bg-slate-850 my-2" />
            <div className="hidden md:block text-[10px] text-slate-500 uppercase font-bold tracking-wider px-3 mb-1">Manage Modules</div>

            <button onClick={() => { setActiveTab('daily'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'daily' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <ClipboardList className="w-4 h-4" /> Daily Notes
            </button>
            <button onClick={() => { setActiveTab('jobs'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'jobs' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Briefcase className="w-4 h-4" /> Job Directory
            </button>
            <button onClick={() => { setActiveTab('finnish'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'finnish' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Globe className="w-4 h-4" /> Finnish Vocab
            </button>
            <button onClick={() => { setActiveTab('github'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'github' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <GithubIcon className="w-4 h-4" /> GitHub History
            </button>

            <div className="hidden md:block h-px bg-slate-850 my-2" />

            <button onClick={() => { setActiveTab('audit'); setSearchTerm(''); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${activeTab === 'audit' ? 'bg-amber-600 text-white' : 'text-amber-500 hover:bg-amber-500/10'}`}>
              <History className="w-4 h-4" /> Purge History ({auditLogs.length})
            </button>
          </nav>
        </div>

        <div className="hidden md:block text-[10px] text-slate-600 font-mono">
          Secure Session Active
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col min-w-0 bg-slate-950">
        {/* Top Control Bar */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-slate-900 bg-slate-900/40">
          <div>
            <h1 className="text-xl font-bold capitalize text-white">
              {activeTab === 'config' ? 'System Overrides' : activeTab === 'json' ? 'Raw JSON Editor' : activeTab === 'users' ? 'User Management' : `${activeTab} Database`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'config' ? 'Directly change current week and application metrics.' : activeTab === 'users' ? 'Add, inspect, or delete platform access accounts.' : 'Direct local variables access controller.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input for module lists */}
            {!['config', 'json', 'audit', 'users'].includes(activeTab) && (
              <div className="relative w-48 hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none"
                />
              </div>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-semibold rounded-lg transition-all"
            >
              <span>Close Console</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* TAB 1: SYSTEM SETTINGS OVERRIDES */}
            {activeTab === 'config' && (
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-500" /> Hotpatch Engine Configurations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Active Week */}
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs text-slate-400 font-medium">Current Active Week Override</label>
                      <button
                        onClick={() => toggleHelp('activeWeek')}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="What does this do?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {visibleHelp['activeWeek'] && (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 mb-2 leading-relaxed animate-fadeIn">
                        💡 **What this does:** Changes which roadmap week is marked active. Updating this instantly shifts your dashboard views to highlight notes and tasks belonging to this specific week number!
                      </div>
                    )}
                    <input
                      type="number"
                      value={currentWeek}
                      onChange={(e) => setCurrentWeek(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-500">Changes the current dashboard timeline rendering window.</p>
                  </div>

                  {/* Target: Min Jobs */}
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs text-slate-400 font-medium">Target: Minimum Job Applications</label>
                      <button
                        onClick={() => toggleHelp('minJobs')}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="What does this do?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {visibleHelp['minJobs'] && (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 mb-2 leading-relaxed animate-fadeIn">
                        💡 **What this does:** This sets the milestone counter. If you set this to 5, the Dashboard will count your active job applications this week, check it against 5, and light up your career goal widget in green once met!
                      </div>
                    )}
                    <input
                      type="number"
                      value={minJobs}
                      onChange={(e) => setMinJobs(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-500">Weekly target quota for target checks.</p>
                  </div>

                  {/* Target: Min Commits */}
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs text-slate-400 font-medium">Target: Minimum Weekly Commits</label>
                      <button
                        onClick={() => toggleHelp('minCommits')}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="What does this do?"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {visibleHelp['minCommits'] && (
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 mb-2 leading-relaxed animate-fadeIn">
                        💡 **What this does:** Changes the required GitHub commit target for the week. The Dashboard reads this value to compute whether you have coded enough this week to complete your Github Target.
                      </div>
                    )}
                    <input
                      type="number"
                      value={minCommits}
                      onChange={(e) => setMinCommits(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-500">Sets global green metric output quota threshold.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSaveConfig}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-lg transition-all"
                    >
                      <Save className="w-4 h-4" /> Save System Overrides
                    </button>

                    <div className="relative group">
                      <button
                        onClick={handleExportBackup}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-all"
                      >
                        <Download className="w-4 h-4" /> Export Backup (.json)
                      </button>
                    </div>

                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" /> Restore Snapshot
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>

                    <button
                      onClick={() => toggleHelp('backupExplanations')}
                      className="p-2 text-slate-500 hover:text-slate-300 transition-all"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {visibleHelp['backupExplanations'] && (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-450 space-y-2">
                      <p>💾 **Export Backup (.json):** Pulls all current tasks, logs, and settings out of your app state and packages them into a file downloaded directly to your local computer. Save these files periodically!</p>
                      <p>🔄 **Restore Snapshot:** If your database ever gets corrupted, lost, or cleared, choose a previously saved `.json` backup file here. It will immediately re-populate your entire app with your saved historical data!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LIVE RAW JSON EDITOR TERMINAL */}
            {activeTab === 'json' && (
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-500" /> Direct Database Schema Hot-Write
                    </h3>
                    <button
                      onClick={() => toggleHelp('jsonConsole')}
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">D: DRIVE ROOT PIPELINE</span>
                </div>

                {visibleHelp['jsonConsole'] && (
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
                    ⚙️ **The Ultimate Console:** Below is the absolute exact structure of your database file currently running on your D: drive.
                    - If you see a typo, a wrong ID, or want to fix a broken field manually, you can edit this text area directly.
                    - Once you click **"Commit Schema Changes"**, your edits are parsed, integrated, and written directly back onto your computer disk!
                    - *Warning: Entering invalid JSON will trigger a warning. Use valid syntax only!*
                  </div>
                )}

                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  rows={20}
                  className="w-full bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-850 rounded-xl p-4 focus:outline-none focus:border-rose-500 leading-relaxed resize-y"
                  placeholder="Loading current database schema..."
                />
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveRawJson}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" /> Commit Schema Changes
                  </button>
                  <button
                    onClick={() => setRawJson(JSON.stringify(db, null, 2))}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition-all"
                  >
                    Revert to current
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: USER MANAGEMENT PANEL */}
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Safe Users Directory List */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-500" /> Active System Users
                    </h3>
                    <button
                      onClick={() => toggleHelp('userManagementHelp')}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {visibleHelp['userManagementHelp'] && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-450 leading-relaxed">
                      💡 **Security Architecture:** The API removes the password hashes before sending this directory list over the local web bridge, meaning your cryptographic data stays secure inside `database.json`.
                    </div>
                  )}

                  <div className="space-y-2">
                    {usersList.map((user) => (
                      <div key={user} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm font-semibold font-mono text-slate-200">{user}</span>
                          {user === 'aakash' && (
                            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-sans font-medium">Root Admin</span>
                          )}
                        </div>
                        {user !== 'aakash' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                            title={`Delete ${user}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Registration Form */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 h-fit space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
                    Add New Operator
                  </h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        placeholder="e.g. recruiter"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5" /> Provision Access
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* MODULE DATA MANAGER LISTS */}
            {!['config', 'json', 'audit', 'users'].includes(activeTab) && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Manage your individual raw database records below. Use the search bar to locate specific entries.
                  </span>
                  <button
                    onClick={() => toggleHelp('moduleList')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" /> Explain Purge
                  </button>
                </div>

                {visibleHelp['moduleList'] && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
                    🗑️ **Direct Records Purge:** Normally, you cannot easily delete individual historical items (like old notes, deleted job applications, or bad practice minutes) from standard pages.
                    - Here, you can search and locate any single row in the database.
                    - Click the red **Trash Can** to remove that record forever from your application state and D: drive storage.
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-xs font-semibold text-slate-400">
                        <th className="px-5 py-3.5">Identifier</th>
                        <th className="px-5 py-3.5">Details</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                      {activeTab === 'daily' && logs.filter(l => l.note.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[10px] text-rose-400">{item.date}</td>
                          <td className="px-5 py-3.5 max-w-md truncate text-slate-300">{item.note}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => executeSystemPurge('daily', item.id, `Daily Note: ${item.date}`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'jobs' && jobs.filter(j => j.company.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-white">{item.company}</td>
                          <td className="px-5 py-3.5 text-slate-400">{item.role} • <span className="text-[10px]">{item.status}</span></td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => executeSystemPurge('jobs', item.id, `Job: ${item.company} (${item.role})`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'finnish' && vocab.filter(v => v.activity.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-sky-400">{item.activity}</td>
                          <td className="px-5 py-3.5 text-slate-300">{item.minutes_spent} minutes <span className="text-[10px] text-slate-500">[{item.date}]</span></td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => executeSystemPurge('finnish', item.id, `Vocab Log: ${item.activity}`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'github' && syncs.filter(g => g.repo_name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[10px]">{item.id}</td>
                          <td className="px-5 py-3.5 text-slate-300">{item.repo_name} ({item.commits_this_week} commits)</td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => executeSystemPurge('github', item.id, `Github Repo: ${item.repo_name}`)} className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIT HISTORY */}
            {activeTab === 'audit' && (
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] uppercase font-mono text-amber-500 tracking-wider">Deletion History Audit Log</h3>
                  <button
                    onClick={() => toggleHelp('auditLog')}
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                {visibleHelp['auditLog'] && (
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
                    📋 **Traceability:** Every time you delete an item using this Admin Console during your current local session, a trace of what was deleted and when is written here. This prevents mistakes and gives you a trail of system actions.
                  </div>
                )}

                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No system files purged during this window lifecycle.</p>
                ) : (
                  <div className="space-y-1.5">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase text-[10px]">[{log.category}]</span>
                          <span className="text-slate-300 font-sans">{log.identifyingInfo}</span>
                        </div>
                        <span className="text-slate-500">{log.deletedAt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}