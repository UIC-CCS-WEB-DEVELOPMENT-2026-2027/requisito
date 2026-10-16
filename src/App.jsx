import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import { DOCUMENTS } from "./data/documents";
import "./App.css";

const STORAGE_KEY = "requisito-progress";

function readProgress() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function Icon({ type }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const content = {
    document: <><path d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M15 3v4h4M8 11h8M8 15h6" /></>,
    "health-id": <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M5 16c.8-2 5.2-2 6 0M14 9h4M14 13h4" /></>,
    "health-card": <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 8v8M8 12h8" /></>,
    passport: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="11" r="3" /><path d="M9 11h6M12 8v6" /></>,
  }[type];
  return <svg {...common}>{content}</svg>;
}

function Footer() {
  return <footer className="site-footer">Requisito is an independent concept inspired by eGov. It is not affiliated with or endorsed by the Philippine government. Always confirm requirements and fees on the official agency website.</footer>;
}

function PrototypeSection({ title, eyebrow, children }) {
  return <main className="page-shell info-page"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="info-page__content">{children}</div></main>;
}

function Button({ children, onClick, variant = "primary", type = "button" }) {
  return <button type={type} className={`btn btn--${variant}`} onClick={onClick}>{children}</button>;
}

function Progress({ document, progress }) {
  const count = progress[document.id]?.filter(Boolean).length || 0;
  const total = document.requirements.length;
  return <div className="progress" aria-label={`${count} of ${total} requirements ready`}><div className="progress__track"><span style={{ width: `${(count / total) * 100}%` }} /></div><small>{count} of {total} requirements ready</small></div>;
}

function DocumentCard({ document, progress, onOpen }) {
  return <article className="document-card">
    <div className="document-card__icon"><Icon type={document.icon} /></div>
    <span className="document-card__category">{document.category}</span>
    <h2>{document.name}</h2>
    <p>{document.description}</p>
    <Progress document={document} progress={progress} />
    <Button onClick={() => onOpen(document.id)}>View requirements <span aria-hidden="true">→</span></Button>
  </article>;
}

function Home({ progress, onOpen }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", "Tax", "Health", "Travel"];
  const visible = useMemo(() => DOCUMENTS.filter((document) => {
    const matchesCategory = category === "All" || document.category === category;
    const text = `${document.name} ${document.description}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase().trim());
  }), [category, query]);

  return <main id="home" className="page-shell">
    <section className="hero">
      <p className="eyebrow">PHILIPPINE SERVICES DIRECTORY</p>
      <h1>Government Documents</h1>
      <p className="hero__subtitle">Find official Philippine government IDs, certificates, clearances, and registration documents in one place.</p>
    </section>
    <section className="tools" aria-label="Document filters">
      <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" aria-label="Search documents" /></label>
      <div className="chips" aria-label="Filter by category">{categories.map((item) => <button key={item} className={category === item ? "chip is-selected" : "chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </section>
    {visible.length ? <div id="documents" className="document-grid">{visible.map((document) => <DocumentCard key={document.id} document={document} progress={progress} onOpen={onOpen} />)}</div> : <p className="empty-state">No documents match your search</p>}
  </main>;
}

function ExploreServices({ onOpen }) {
  const categories = [
    { name: "Tax", description: "Registration and taxpayer documents", icon: "₱" },
    { name: "Health", description: "Membership and local health cards", icon: "+" },
    { name: "Travel", description: "Documents for travel and identity", icon: "◇" },
  ];
  return <main className="page-shell explore-page">
    <section className="hero"><p className="eyebrow">BROWSE BY NEED</p><h1>Explore Services</h1><p className="hero__subtitle">Choose a service category or browse the complete directory to find out what to prepare.</p></section>
    <div className="category-grid">{categories.map((category) => <button className="category-card" key={category.name} onClick={() => document.getElementById(`category-${category.name}`)?.scrollIntoView({ behavior: "smooth" })}><span>{category.icon}</span><strong>{category.name}</strong><small>{category.description}</small><em>Browse services →</em></button>)}</div>
    <section className="explore-list"><div className="section-heading"><div><p className="eyebrow">ALL DOCUMENTS</p><h2>Find what you need</h2></div><span>{DOCUMENTS.length} services</span></div>{DOCUMENTS.map((document) => <article className="explore-row" id={`category-${document.category}`} key={document.id}><div className="document-card__icon"><Icon type={document.icon} /></div><div><span className="document-card__category">{document.category}</span><h3>{document.name}</h3><p>{document.description}</p></div><Button onClick={() => onOpen(document.id)}>View requirements <span aria-hidden="true">→</span></Button></article>)}</section>
  </main>;
}

function Detail({ document, progress, onBack, onProgress, onReset, onCopy, showToast }) {
  const checked = progress[document.id] || [];
  return <main className="page-shell detail-page">
    <button className="back-link" onClick={onBack}>← Back to documents</button>
    <div className="detail-header"><div className="document-card__icon"><Icon type={document.icon} /></div><div><span className="document-card__category">{document.category}</span><h1>{document.name}</h1><p>{document.description}</p></div></div>
    <div className="detail-layout">
      <section className="detail-panel checklist-panel">
        <div className="panel-heading"><div><p className="eyebrow">PREPARE YOUR DOCUMENTS</p><h2>Requirements checklist</h2></div><Button variant="secondary" onClick={() => onCopy(document)}>Copy checklist</Button></div>
        <Progress document={document} progress={progress} />
        <div className="checklist">{document.requirements.map((requirement, index) => <label className="check-item" key={requirement.title}><input type="checkbox" checked={Boolean(checked[index])} onChange={(event) => onProgress(document, index, event.target.checked, showToast)} /><span><strong>{requirement.title}</strong><small>{requirement.note}</small></span></label>)}</div>
        <Button variant="secondary" onClick={() => onReset(document)}>Reset progress</Button>
      </section>
      <aside className="detail-panel glance"><h2>At a glance</h2><dl><div><dt>Agency</dt><dd>{document.agency}</dd></div><div><dt>Fee</dt><dd>{document.fee}</dd></div><div><dt>Processing time</dt><dd>{document.processingTime}</dd></div><div><dt>Where to apply</dt><dd>{document.whereToApply}</dd></div></dl><a className="official-link" href={document.officialWebsite} target="_blank" rel="noreferrer">Confirm on the official agency site ↗</a></aside>
    </div>
    <section className="detail-panel steps"><p className="eyebrow">YOUR NEXT STEPS</p><h2>How to apply</h2><ol>{document.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
  </main>;
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [activeNav, setActiveNav] = useState("Home");
  const [progress, setProgress] = useState(readProgress);
  const [toast, setToast] = useState("");
  const selected = DOCUMENTS.find((document) => document.id === selectedId);

  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* memory fallback remains active */ } }, [progress]);
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const updateProgress = (document, index, value) => {
    setProgress((current) => {
      const next = [...(current[document.id] || Array(document.requirements.length).fill(false))];
      next[index] = value;
      if (value && next.every(Boolean)) showToast("All set. You're ready to apply.");
      return { ...current, [document.id]: next };
    });
  };
  const resetProgress = (document) => setProgress((current) => ({ ...current, [document.id]: Array(document.requirements.length).fill(false) }));
  const copyChecklist = async (document) => {
    const checked = progress[document.id] || [];
    const text = `${document.name}\n${document.requirements.map((item, index) => `[${checked[index] ? "x" : " "}] ${item.title} — ${item.note}`).join("\n")}`;
    try { await navigator.clipboard.writeText(text); showToast("Checklist copied."); } catch { showToast("Copy is unavailable in this browser."); }
  };

  const navigateHome = () => { setSelectedId(null); setActiveNav("Home"); };
  const navigate = (label) => { setSelectedId(null); setActiveNav(label); };
  let page = selected ? <Detail document={selected} progress={progress} onBack={navigateHome} onProgress={updateProgress} onReset={resetProgress} onCopy={copyChecklist} showToast={showToast} /> : null;
  if (!selected && activeNav === "Home") page = <Home progress={progress} onOpen={(id) => { setSelectedId(id); setActiveNav("Home"); }} />;
  if (!selected && activeNav === "Explore Services") page = <ExploreServices onOpen={(id) => { setSelectedId(id); setActiveNav("Home"); }} />;
  if (!selected && activeNav === "How It Works") page = <PrototypeSection eyebrow="A SIMPLE PROCESS" title="How It Works"><p>Find a document, review the checklist, and prepare with confidence.</p><ol><li>Search or filter the government document you need.</li><li>Open the requirements checklist and mark what you already have.</li><li>Confirm the latest fees and requirements on the official agency website.</li></ol></PrototypeSection>;
  if (!selected && activeNav === "Verified Requirements") page = <PrototypeSection eyebrow="CHECK BEFORE YOU APPLY" title="Verified Requirements"><p>Requisito organizes practical preparation information in one place. Requirements, fees, and processing times can change, so always confirm the final details with the official agency.</p></PrototypeSection>;
  if (!selected && activeNav === "About") page = <PrototypeSection eyebrow="ABOUT REQUISITO" title="A clearer way to prepare"><p>Requisito is an independent concept for making Philippine government-document information easier to understand and prepare for.</p></PrototypeSection>;
  if (!selected && activeNav === "Help / FAQ") page = <PrototypeSection eyebrow="HELP / FAQ" title="Questions before you apply"><details open><summary>Are these official applications?</summary><p>No. Requisito is an independent information concept. Applications should be completed through the official agency channels.</p></details><details><summary>Can I save my checklist?</summary><p>Yes. Your checklist progress is saved locally in this browser.</p></details></PrototypeSection>;
  return <><Navbar active={activeNav} onHome={navigateHome} onNavigate={navigate} />{page}<Footer />{toast && <div className="toast" role="status">{toast}</div>}</>;
}
