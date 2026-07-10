// src/pages/NotesPage.tsx
import React, { useState } from 'react';

interface NoteItem {
  id: string;
  roadmap_id?: string;
  title?: string;
  heading?: string;
  sourceUrl?: string;
  note: string; // The core text field serialized to match App.tsx
  date: string;
  tag?: string;
}

// Unified payload type for serialization
interface StructuredNoteContent {
  type: 'note' | 'course';
  title: string;
  heading: string; // Used as Platform/Provider for courses (e.g. Coursera, Udemy)
  sourceUrl: string;
  tag: string;
  note: string; // Serves as Core Notes for a note, or Progress Update for a course
  // Explicit Course Tracking fields:
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
  // Intake Type Mode
  const [entryType, setEntryType] = useState<'note' | 'course'>('note');

  // Input tracking states
  const [title, setTitle] = useState('');
  const [heading, setHeading] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tag, setTag] = useState('Theory');
  const [noteContent, setNoteContent] = useState('');

  // Specific Course tracking states
  const [isPaid, setIsPaid] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState('');

  // Filtering states
  const [filterTag, setFilterTag] = useState('All');
  const [filterType, setFilterType] = useState<'All' | 'note' | 'course'>('All');

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

    // Clear inputs safely
    setTitle('');
    setHeading('');
    setSourceUrl('');
    setNoteContent('');
    setIsPaid(false);
    setProgressPercent(0);
    setCurrentMilestone('');
  };

  // Safe structural extraction parsing engine
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
      // Graceful native fallback legacy normalization
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

  // Master data filtering array combination
  const filteredNotes = displayNotes.filter(n => {
    const matchTag = filterTag === 'All' || n.tag === filterTag;
    const matchType = filterType === 'All' || n.type === filterType;
    return matchTag && matchType;
  });

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 24px', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.8px' }}>
            Technical Learning Hub
          </h2>
          <p style={{ margin: 0, fontSize: '14.5px', color: 'rgba(255,255,255,0.4)' }}>
            Document core taxonomy blocks, whitepaper breakthroughs, and operational course milestones.
          </p>
        </div>

        {/* COMBINED SEGMENT FILTERS */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <div style={{ display: 'flex', background: '#0d0d12', padding: '4px', borderRadius: '8px', border: '1px solid #16161c' }}>
            {[
              { key: 'All', label: '📚 Everything' },
              { key: 'note', label: '📝 Research' },
              { key: 'course', label: '🎓 Courses' }
            ].map((t) => (
              <button key={t.key} type="button" onClick={() => setFilterType(t.key as any)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: filterType === t.key ? '#334155' : 'transparent', color: filterType === t.key ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.15s ease'
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tag Taxonomy Filter */}
          <div style={{ display: 'flex', background: '#0d0d12', padding: '4px', borderRadius: '8px', border: '1px solid #16161c' }}>
            {['All', 'Theory', 'Implementation', 'Systems', 'Databases'].map((t) => (
              <button key={t} type="button" onClick={() => setFilterTag(t)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: filterTag === t ? '#4f8cff' : 'transparent', color: filterTag === t ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.15s ease'
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE WRAPPER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', alignItems: 'start' }}>

        {/* SIDEBAR: INJECT NEW MATERIALS FORM */}
        <form onSubmit={handleSubmit} style={{ background: '#0d0d12', border: '1px solid #16161c', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #16161c', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>➕ Index Entry</h3>
            {/* INTAKE MODE SELECTOR SWITCH */}
            <div style={{ display: 'flex', background: '#14141a', padding: '2px', borderRadius: '6px', border: '1px solid #222' }}>
              <button type="button" onClick={() => setEntryType('note')} style={{ border: 'none', padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', background: entryType === 'note' ? '#4f8cff' : 'transparent', color: '#fff' }}>Note</button>
              <button type="button" onClick={() => setEntryType('course')} style={{ border: 'none', padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', background: entryType === 'course' ? '#10b981' : 'transparent', color: '#fff' }}>Course</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              {entryType === 'course' ? 'Course Title / Certification' : 'Document Title'}
            </label>
            <input type="text" placeholder={entryType === 'course' ? "e.g. Deep Learning Specialization" : "e.g. Attention Is All You Need Paper"} value={title} onChange={(e) => setTitle(e.target.value)} required
              style={{ padding: '10px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '8px', fontSize: '13.5px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                {entryType === 'course' ? 'Platform / Institute' : 'Heading Context'}
              </label>
              <input type="text" placeholder={entryType === 'course' ? "e.g. Coursera / Stanford" : "e.g. Transformers"} value={heading} onChange={(e) => setHeading(e.target.value)}
                style={{ padding: '10px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '8px', fontSize: '13.5px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Taxonomy Tag</label>
              <select value={tag} onChange={(e) => setTag(e.target.value)}
                style={{ padding: '10px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                <option value="Theory">Theory</option>
                <option value="Implementation">Implementation</option>
                <option value="Systems">Systems</option>
                <option value="Databases">Databases</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC FORM SEGMENTS EXTENSION BASED ON TOGGLE STATE */}
          {entryType === 'course' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px dashed rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Pricing Tier</label>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <button type="button" onClick={() => setIsPaid(false)} style={{ flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #262632', borderRadius: '4px', cursor: 'pointer', background: !isPaid ? '#10b981' : '#14141a', color: '#fff', fontWeight: 600 }}>Free</button>
                    <button type="button" onClick={() => setIsPaid(true)} style={{ flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #262632', borderRadius: '4px', cursor: 'pointer', background: isPaid ? '#eab308' : '#14141a', color: isPaid ? '#000' : '#fff', fontWeight: 600 }}>Paid</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Completion Progress</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type="number" min="0" max="100" placeholder="%" value={progressPercent || ''} onChange={(e) => setProgressPercent(Number(e.target.value))}
                      style={{ padding: '8px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '6px', fontSize: '12.5px', width: '100%' }} />
                    <span style={{ position: 'absolute', right: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Current Syllabus Milestone</label>
                <input type="text" placeholder="e.g. Section 4: Convolutions" value={currentMilestone} onChange={(e) => setCurrentMilestone(e.target.value)}
                  style={{ padding: '8px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '6px', fontSize: '12.5px' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              {entryType === 'course' ? 'Resource Portal / URL' : 'Source URL (Reference)'}
            </label>
            <input type="url" placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
              style={{ padding: '10px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '8px', fontSize: '13.5px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              {entryType === 'course' ? 'Strategic Intent & Objectives' : 'Core Notes & Analysis'}
            </label>
            <textarea rows={ entryType === 'course' ? 4 : 6 } placeholder={entryType === 'course' ? "What specific framework capstone outputs are you gaining here?" : "Deconstruct optimization loops or proofs..."} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} required
              style={{ padding: '12px', background: '#14141a', border: '1px solid #262632', color: '#fff', borderRadius: '8px', fontSize: '13.5px', resize: 'none', lineHeight: '1.5' }} />
          </div>

          <button type="submit"
            style={{
              background: entryType === 'course' ? '#10b981' : '#4f8cff',
              color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
            }}>
            Commit to Knowledge Matrix
          </button>
        </form>

        {/* FEED: UNIFIED RENDER FILTER LANE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          {filteredNotes.map((item) => {
            const isCourse = item.type === 'course';
            return (
              <div key={item.id}
                style={{
                  background: '#07070a', border: `1px solid ${isCourse ? 'rgba(16, 185, 129, 0.15)' : '#16161c'}`, borderRadius: '14px',
                  padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative'
                }}>

                {/* Top metadata tracking lane */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', background: isCourse ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 140, 255, 0.1)', color: isCourse ? '#10b981' : '#4f8cff', border: `1px solid ${isCourse ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 140, 255, 0.2)'}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {isCourse ? '🎓 Course' : '📝 Research'}
                    </span>
                    <span style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.tag}
                    </span>
                    {isCourse && (
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', background: item.isPaid ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255,255,255,0.05)', color: item.isPaid ? '#eab308' : 'rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {item.isPaid ? 'Paid' : 'Free Tier'}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{item.date}</span>
                </div>

                {/* Title & Section Headings Hierarchy */}
                <div>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{item.heading}</span>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{item.title}</h4>
                </div>

                {/* VISUAL COMPONENT LAYER IF IT'S A COURSE TRACKING TARGET */}
                {isCourse && (
                  <div style={{ background: '#101016', border: '1px solid #1a1a24', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Current Step: <strong style={{ color: '#fff' }}>{item.currentMilestone}</strong></span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{item.progressPercent}%</span>
                    </div>
                    {/* Native CSS Tracking Bar */}
                    <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )}

                <hr style={{ border: 'none', height: '1px', background: '#161622', margin: '4px 0' }} />

                {/* Central Text Content */}
                <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {item.note}
                </p>

                {/* Interactive Anchor */}
                {item.sourceUrl && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: isCourse ? '#10b981' : '#4f8cff', textDecoration: 'none', fontWeight: 700 }}>
                      🔗 {isCourse ? 'Access Course Portal / Syllabus' : 'Review Reference Source Material'}
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '14px', background: '#0b0b10', borderRadius: '12px', border: '1px dashed #16161c' }}>
              No items indexed matching filters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotesPage;