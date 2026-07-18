import React, { useState } from 'react';

interface NoteItem {
  id: string;
  roadmap_id?: string;
  title?: string;
  heading?: string;
  sourceUrl?: string;
  note: string;
  date: string;
  tag?: string;
}

interface StructuredNoteContent {
  type: 'note' | 'course';
  title: string;
  heading: string;
  sourceUrl: string;
  tag: string;
  note: string;
  isPaid?: boolean;
  progressPercent?: number;
  currentMilestone?: string;
}

interface NotesPageProps {
  notes: NoteItem[];
  onAddNote: (noteText: string) => void;
}

const PRE_COLLECTED_MATERIALS: NoteItem[] = [
  {
    id: "mock-1",
    title: "Vector Locality & Custom Cache Structures",
    heading: "Hardware Layer Constraints",
    sourceUrl: "https://arxiv.org/abs/2111.00000",
    tag: "Systems",
    date: "System Baseline",
    note: JSON.stringify({
      type: 'note',
      title: "Vector Locality & Custom Cache Structures",
      heading: "Hardware Layer Constraints",
      sourceUrl: "https://arxiv.org/abs/2111.00000",
      tag: "Systems",
      note: "CPU/GPU cache row alignment dictates matrix conversion optimization steps. When constructing raw directed graph matrix arrays without memory pointers, structure layout arrays consecutively to maintain multi-tier cache memory locality bounds."
    })
  },
  {
    id: "mock-c1",
    title: "Deep Learning Specialization",
    heading: "DeepLearning.AI (Coursera)",
    sourceUrl: "https://www.coursera.org",
    tag: "Theory",
    date: "System Baseline",
    note: JSON.stringify({
      type: 'course',
      title: "Deep Learning Specialization",
      heading: "DeepLearning.AI (Coursera)",
      sourceUrl: "https://www.coursera.org",
      tag: "Theory",
      note: "Currently unpacking Backpropagation calculus and vector initialization steps.",
      isPaid: true,
      progressPercent: 45,
      currentMilestone: "Finished Course 2: Improving Deep Neural Networks"
    })
  }
];

const NotesPage: React.FC<NotesPageProps> = ({ notes, onAddNote }) => {
  const [entryType, setEntryType] = useState<'note' | 'course'>('note');

  // Input States
  const [title, setTitle] = useState('');
  const [heading, setHeading] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tag, setTag] = useState('Theory');
  const [noteContent, setNoteContent] = useState('');

  // Course Specific States
  const [isPaid, setIsPaid] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState('');

  // Filters
  const [filterTag, setFilterTag] = useState('All');
  const [filterType, setFilterType] = useState<'All' | 'note' | 'course'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!noteContent.trim() || !title.trim()) return;

    const structuredPayload: StructuredNoteContent = {
      type: entryType,
      title: title.trim(),
      heading: heading.trim() || (entryType === 'course' ? "Self-Guided" : "General Study Note"),
      sourceUrl: sourceUrl.trim(),
      tag,
      note: noteContent.trim(),
      ...(entryType === 'course' && {
        isPaid,
        progressPercent: Math.min(Math.max(Number(progressPercent) || 0, 0), 100),
        currentMilestone: currentMilestone.trim() || "Enrolled / Just Started"
      })
    };

    onAddNote(JSON.stringify(structuredPayload));

    setTitle('');
    setHeading('');
    setSourceUrl('');
    setNoteContent('');
    setIsPaid(false);
    setProgressPercent(0);
    setCurrentMilestone('');
  };

  const parseNoteData = (rawItem: NoteItem) => {
    try {
      const parsed = JSON.parse(rawItem.note) as StructuredNoteContent;
      return {
        id: rawItem.id,
        date: rawItem.date,
        type: parsed.type || 'note',
        title: parsed.title,
        heading: parsed.heading,
        sourceUrl: parsed.sourceUrl,
        tag: parsed.tag,
        note: parsed.note,
        isPaid: parsed.isPaid || false,
        progressPercent: parsed.progressPercent || 0,
        currentMilestone: parsed.currentMilestone || ""
      };
    } catch {
      return {
        id: rawItem.id,
        date: rawItem.date,
        type: 'note' as const,
        title: rawItem.title || "Legacy Study Log Entry",
        heading: rawItem.heading || "General Reference",
        sourceUrl: rawItem.sourceUrl || "",
        tag: rawItem.tag || "Theory",
        note: rawItem.note,
        isPaid: false,
        progressPercent: 0,
        currentMilestone: ""
      };
    }
  };

  const parsedUserNotes = notes.map(parseNoteData);
  const displayNotes = parsedUserNotes.length === 0 ? PRE_COLLECTED_MATERIALS.map(parseNoteData) : parsedUserNotes;

  const filteredNotes = displayNotes.filter(n => {
    const matchTag = filterTag === 'All' || n.tag === filterTag;
    const matchType = filterType === 'All' || n.type === filterType;
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        n.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        n.heading.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchType && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-dynamic-primary font-sans min-h-screen">

      {/* HEADER SECTION */}
      <div className="mb-9 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-dynamic pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            Technical Learning Hub
          </h2>

        </div>

        {/* SEARCH AND COMBINED SEGMENT FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search indexing matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-dynamic text-xs font-mono bg-[var(--pill-bg)] focus:outline-none focus:border-[var(--accent-color)] sm:w-48"
          />

          {/* Type Filter */}
          <div className="flex bg-[var(--pill-bg)] p-1 rounded-lg border border-dynamic">
            {[
              { key: 'All', label: '📚 All' },
              { key: 'note', label: '📝 Research' },
              { key: 'course', label: '🎓 Courses' }
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilterType(t.key as any)}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  filterType === t.key
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-dynamic-secondary hover:text-dynamic-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tag Taxonomy Filter */}
          <div className="flex bg-[var(--pill-bg)] p-1 rounded-lg border border-dynamic">
            {['All', 'Theory', 'Implementation', 'Systems', 'Databases'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterTag(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  filterTag === t
                    ? 'bg-[var(--accent-color)] text-white shadow-sm'
                    : 'text-dynamic-secondary hover:text-dynamic-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE WRAPPER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">

        {/* SIDEBAR FORM CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 flex flex-col gap-4 sticky top-24 backdrop-blur-xl transition-all duration-500"
          style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
        >
          <div className="flex justify-between items-center border-b border-dynamic pb-3">
            <h3 className="font-bold text-sm tracking-wider uppercase">➕ Index Entry</h3>

            {/* INTAKE MODE SELECTOR SWITCH */}
            <div className="flex bg-black/20 p-0.5 rounded-md border border-dynamic">
              <button
                type="button"
                onClick={() => setEntryType('note')}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${entryType === 'note' ? 'bg-[var(--accent-color)] text-white' : 'text-dynamic-secondary'}`}
              >
                Note
              </button>
              <button
                type="button"
                onClick={() => setEntryType('course')}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${entryType === 'course' ? 'bg-emerald-600 text-white' : 'text-dynamic-secondary'}`}
              >
                Course
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">
              {entryType === 'course' ? 'Course Title / Certification' : 'Document Title'}
            </label>
            <input
              type="text"
              placeholder={entryType === 'course' ? "e.g. Deep Learning Specialization" : "e.g. Attention Is All You Need"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="p-2.5 bg-black/10 border border-dynamic rounded-lg text-sm text-dynamic-primary focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">
                {entryType === 'course' ? 'Platform / Institute' : 'Heading Context'}
              </label>
              <input
                type="text"
                placeholder={entryType === 'course' ? "e.g. Coursera" : "e.g. Transformers"}
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="p-2.5 bg-black/10 border border-dynamic rounded-lg text-sm text-dynamic-primary focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">Taxonomy Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="p-2.5 bg-black/10 border border-dynamic rounded-lg text-sm text-dynamic-primary cursor-pointer focus:outline-none"
              >
                <option value="Theory">Theory</option>
                <option value="Implementation">Implementation</option>
                <option value="Systems">Systems</option>
                <option value="Databases">Databases</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC FORM SEGMENTS EXTENSION BASED ON TOGGLE STATE */}
          {entryType === 'course' && (
            <div className="bg-emerald-500/5 border border-dashed border-emerald-500/30 p-3 rounded-lg flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">Pricing Tier</label>
                  <div className="flex gap-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`flex-1 py-1 text-[10px] font-semibold border rounded transition-colors ${!isPaid ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-black/10 border-dynamic text-dynamic-secondary'}`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`flex-1 py-1 text-[10px] font-semibold border rounded transition-colors ${isPaid ? 'bg-amber-500 border-amber-400 text-black' : 'bg-black/10 border-dynamic text-dynamic-secondary'}`}
                    >
                      Paid
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">Progress</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="%"
                      value={progressPercent || ''}
                      onChange={(e) => setProgressPercent(Number(e.target.value))}
                      className="p-1.5 bg-black/10 border border-dynamic rounded-md text-sm text-dynamic-primary w-full pr-6 focus:outline-none"
                    />
                    <span className="absolute right-2 text-xs opacity-40">%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">Current Syllabus Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. Course 2: Convolutions"
                  value={currentMilestone}
                  onChange={(e) => setCurrentMilestone(e.target.value)}
                  className="p-1.5 bg-black/10 border border-dynamic rounded-md text-xs text-dynamic-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">
              {entryType === 'course' ? 'Resource Portal / URL' : 'Source URL (Reference)'}
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="p-2.5 bg-black/10 border border-dynamic rounded-lg text-sm text-dynamic-primary focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-widest text-dynamic-secondary uppercase">
              {entryType === 'course' ? 'Strategic Intent & Objectives' : 'Core Notes & Analysis'}
            </label>
            <textarea
              rows={entryType === 'course' ? 4 : 6}
              placeholder={entryType === 'course' ? "What specific milestone knowledge are you acquiring?" : "Deconstruct parameters, mathematical matrices..."}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="p-3 bg-black/10 border border-dynamic rounded-lg text-sm text-dynamic-primary resize-none leading-relaxed focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg shadow transition-opacity hover:opacity-90 text-white ${
              entryType === 'course' ? 'bg-emerald-600' : 'bg-[var(--accent-color)]'
            }`}
          >
            Commit to Knowledge Matrix
          </button>
        </form>

        {/* FEED STREAM CONTAINER */}
        <div className="flex flex-col gap-5 w-full">
          {filteredNotes.map((item) => {
            const isCourse = item.type === 'course';
            return (
              <div
                key={item.id}
                className="rounded-2xl border p-6 flex flex-col gap-3.5 relative backdrop-blur-xl transition-all duration-300 hover:border-dynamic-primary"
                style={{
                  backgroundColor: 'var(--bg-glass)',
                  borderColor: isCourse ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-glass)'
                }}
              >
                {/* Top tracking line */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isCourse
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                      {isCourse ? '🎓 Course' : '📝 Research'}
                    </span>
                    <span className="text-[9px] font-mono tracking-wide px-2 py-0.5 rounded bg-[var(--pill-bg)] border border-dynamic text-dynamic-secondary">
                      {item.tag}
                    </span>
                    {isCourse && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.isPaid ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {item.isPaid ? 'Premium Tier' : 'Open Source'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono opacity-40">{item.date}</span>
                </div>

                {/* Title and context mapping */}
                <div>
                  <span className="text-xs text-dynamic-secondary font-medium tracking-wide">{item.heading}</span>
                  <h4 className="text-lg font-bold tracking-tight text-dynamic-primary mt-0.5">{item.title}</h4>
                </div>

                {/* COURSE DETAILED PROGRESS ENGINE */}
                {isCourse && (
                  <div className="bg-black/10 border border-dynamic p-3.5 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-dynamic-secondary">Active Segment: <strong className="text-dynamic-primary font-sans">{item.currentMilestone}</strong></span>
                      <span className="text-emerald-400 font-bold">{item.progressPercent}%</span>
                    </div>
                    {/* Visual Tracking bar */}
                    <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden border border-dynamic">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="h-[1px] w-full border-b border-dynamic opacity-60" />

                {/* Main Raw Payload Text */}
                <p className="text-sm text-dynamic-secondary leading-relaxed whitespace-pre-wrap font-sans">
                  {item.note}
                </p>

                {/* Reference Link Nodes */}
                {item.sourceUrl && (
                  <div className="flex justify-start mt-1">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-wide transition-opacity hover:opacity-70 ${
                        isCourse ? 'text-emerald-400' : 'text-[var(--accent-color)]'
                      }`}
                    >
                      🔗 {isCourse ? 'Launch Course Portal' : 'Access Whitepaper Reference'}
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="p-12 text-center text-xs font-mono text-dynamic-secondary rounded-2xl border border-dashed border-dynamic bg-[var(--pill-bg)]">
              No index entries found matching active telemetry attributes.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotesPage;