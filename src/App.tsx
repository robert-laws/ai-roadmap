import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  Circle,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileUp,
  Filter,
  Flag,
  GalleryHorizontalEnd,
  Gauge,
  GitBranch,
  Home,
  ImageIcon,
  Layers3,
  Link as LinkIcon,
  ListChecks,
  Map,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wrench,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { allLessons, findLesson, findTrack, goals, northStar, toolInventory, tracks } from "./data/curriculum";
import { downloadBackup, fileToThumbnail, parseBackup } from "./lib/exportImport";
import {
  clearAllData,
  deleteArtifact,
  loadArtifacts,
  loadProgress,
  saveArtifact,
  saveProgress
} from "./lib/storage";
import type { ArtifactType, Lesson, LessonProgress, LessonStatus, StoredArtifact, Track, TrackId } from "./types";

type ProgressMap = Record<string, LessonProgress>;
type DashboardView = "roadmap" | "timeline" | "kanban" | "gallery";

const artifactTypes: ArtifactType[] = ["image", "video", "audio", "document", "link", "text", "other"];

const now = () => new Date().toISOString();

const defaultProgress = (lessonId: string): LessonProgress => ({
  lessonId,
  status: "not-started",
  completedSteps: [],
  notes: "",
  reflection: "",
  confidence: 0,
  currentFocus: false,
  updatedAt: now()
});

const statusLabel: Record<LessonStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  complete: "Complete"
};

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const percent = (completed: number, total: number) => (total === 0 ? 0 : Math.round((completed / total) * 100));

const lessonStepPercent = (lesson: Lesson, progress: LessonProgress) =>
  percent(progress.completedSteps.length, lesson.steps.length);

const trackStats = (track: Track, progress: ProgressMap) => {
  const totalSteps = track.lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);
  const completedSteps = track.lessons.reduce(
    (sum, lesson) => sum + (progress[lesson.id]?.completedSteps.length ?? 0),
    0
  );
  const completeLessons = track.lessons.filter((lesson) => progress[lesson.id]?.status === "complete").length;
  return {
    percent: percent(completedSteps, totalSteps),
    completedSteps,
    totalSteps,
    completeLessons,
    totalLessons: track.lessons.length
  };
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

function App() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [artifacts, setArtifacts] = useState<StoredArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([loadProgress(), loadArtifacts()])
      .then(([storedProgress, storedArtifacts]) => {
        if (!mounted) {
          return;
        }
        setProgress(Object.fromEntries(storedProgress.map((item) => [item.lessonId, item])));
        setArtifacts(storedArtifacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const persistProgress = async (lessonId: string, recipe: (current: LessonProgress) => LessonProgress) => {
    const current = progress[lessonId] ?? defaultProgress(lessonId);
    const next = { ...recipe(current), updatedAt: now() };
    setProgress((items) => ({ ...items, [lessonId]: next }));
    await saveProgress(next);
  };

  const toggleStep = async (lesson: Lesson, stepId: string) => {
    await persistProgress(lesson.id, (current) => {
      const completedSteps = current.completedSteps.includes(stepId)
        ? current.completedSteps.filter((id) => id !== stepId)
        : [...current.completedSteps, stepId];
      const status: LessonStatus =
        completedSteps.length === lesson.steps.length
          ? "complete"
          : completedSteps.length > 0
            ? "in-progress"
            : current.status === "complete"
              ? "in-progress"
              : current.status;
      return { ...current, completedSteps, status };
    });
  };

  const setLessonStatus = async (lesson: Lesson, status: LessonStatus) => {
    await persistProgress(lesson.id, (current) => ({
      ...current,
      status,
      completedSteps: status === "complete" ? lesson.steps.map((_, index) => `${lesson.id}-step-${index}`) : current.completedSteps
    }));
  };

  const setFocusLesson = async (lessonId: string) => {
    const updates = allLessons.map((lesson) => {
      const current = progress[lesson.id] ?? defaultProgress(lesson.id);
      return { ...current, currentFocus: lesson.id === lessonId, updatedAt: now() };
    });
    setProgress(Object.fromEntries(updates.map((item) => [item.lessonId, item])));
    await Promise.all(updates.map(saveProgress));
  };

  const updateLessonFields = async (lessonId: string, fields: Partial<LessonProgress>) => {
    await persistProgress(lessonId, (current) => ({ ...current, ...fields }));
  };

  const addArtifact = async (artifact: StoredArtifact) => {
    await saveArtifact(artifact);
    setArtifacts((items) => [artifact, ...items]);
  };

  const removeArtifact = async (id: string) => {
    await deleteArtifact(id);
    setArtifacts((items) => items.filter((artifact) => artifact.id !== id));
  };

  const importBackup = async (file: File) => {
    const parsed = await parseBackup(file);
    await Promise.all(parsed.progress.map(saveProgress));
    await Promise.all(parsed.artifacts.map(saveArtifact));
    setProgress(Object.fromEntries(parsed.progress.map((item) => [item.lessonId, item])));
    setArtifacts(parsed.artifacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setNotice("Backup imported into this browser.");
  };

  const resetAll = async () => {
    if (!window.confirm("Clear all local progress and uploaded examples in this browser?")) {
      return;
    }
    await clearAllData();
    setProgress({});
    setArtifacts([]);
    setNotice("Local progress and examples cleared.");
  };

  const appValue = {
    progress,
    artifacts,
    toggleStep,
    setLessonStatus,
    updateLessonFields,
    setFocusLesson,
    addArtifact,
    removeArtifact,
    importBackup,
    resetAll,
    notice,
    setNotice
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={cn("sidebar", !sidebarOpen && "sidebar--closed")} aria-label="Primary navigation">
        <div className="brand">
          <div className="brand__mark">
            <Sparkles size={20} aria-hidden />
          </div>
          {sidebarOpen && (
            <div>
              <strong>AI Roadmap Studio</strong>
              <span>Learning tracker</span>
            </div>
          )}
        </div>
        <button className="icon-button sidebar-toggle" type="button" onClick={() => setSidebarOpen((value) => !value)}>
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          <span className="sr-only">{sidebarOpen ? "Collapse navigation" : "Expand navigation"}</span>
        </button>
        <nav className="nav-list">
          <NavItem to="/" icon={<Home size={18} />} label="Dashboard" expanded={sidebarOpen} />
          <NavItem to="/gallery" icon={<GalleryHorizontalEnd size={18} />} label="Examples" expanded={sidebarOpen} />
          <NavItem to="/tools" icon={<Wrench size={18} />} label="Tools" expanded={sidebarOpen} />
          <NavItem to="/review" icon={<ClipboardCheck size={18} />} label="Review" expanded={sidebarOpen} />
        </nav>
        <div className="track-rail" aria-label="Track links">
          {tracks.map((track) => (
            <NavLink
              className="track-dot"
              style={{ "--track-accent": track.accent } as React.CSSProperties}
              to={`/track/${track.id}`}
              key={track.id}
              title={`Track ${track.id}: ${track.shortTitle}`}
            >
              <span className="track-dot__letter">{track.id}</span>
              {sidebarOpen && (
                <span className="track-dot__copy">
                  <strong>{track.shortTitle}</strong>
                  <small>{track.status}</small>
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </aside>
      <main className="main" id="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operation Sunrise</p>
            <h1>AI learning roadmap</h1>
          </div>
          <div className="topbar__actions">
            <Link className="button button--ghost" to="/review">
              <Archive size={16} />
              Backup
            </Link>
            <Link className="button button--dark" to="/lesson/a-pip-project-scaffold">
              <Flag size={16} />
              Start chosen path
            </Link>
          </div>
        </header>
        {notice && (
          <div className="notice" role="status">
            <ShieldCheck size={18} />
            <span>{notice}</span>
            <button className="icon-button" type="button" onClick={() => setNotice("")}>
              <X size={16} />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        )}
        {loading ? (
          <div className="loading-panel">
            <Gauge size={28} />
            Loading local progress...
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard {...appValue} />} />
            <Route path="/track/:trackId" element={<TrackPage {...appValue} />} />
            <Route path="/lesson/:lessonId" element={<LessonPage {...appValue} />} />
            <Route path="/gallery" element={<GalleryPage {...appValue} />} />
            <Route path="/tools" element={<ToolsPage progress={progress} />} />
            <Route
              path="/review"
              element={
                <ReviewPage
                  progress={progress}
                  artifacts={artifacts}
                  importBackup={importBackup}
                  resetAll={resetAll}
                  setNotice={setNotice}
                />
              }
            />
          </Routes>
        )}
      </main>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
}

function NavItem({ to, icon, label, expanded }: NavItemProps) {
  return (
    <NavLink className="nav-item" to={to} title={label}>
      {icon}
      {expanded && <span>{label}</span>}
    </NavLink>
  );
}

interface SharedProps {
  progress: ProgressMap;
  artifacts: StoredArtifact[];
  toggleStep: (lesson: Lesson, stepId: string) => Promise<void>;
  setLessonStatus: (lesson: Lesson, status: LessonStatus) => Promise<void>;
  updateLessonFields: (lessonId: string, fields: Partial<LessonProgress>) => Promise<void>;
  setFocusLesson: (lessonId: string) => Promise<void>;
  addArtifact: (artifact: StoredArtifact) => Promise<void>;
  removeArtifact: (id: string) => Promise<void>;
  importBackup: (file: File) => Promise<void>;
  resetAll: () => Promise<void>;
  notice: string;
  setNotice: (notice: string) => void;
}

function Dashboard({ progress, artifacts }: SharedProps) {
  const [view, setView] = useState<DashboardView>("roadmap");
  const nextLesson = useMemo(() => pickNextLesson(progress), [progress]);
  const completedSteps = allLessons.reduce((sum, lessonItem) => sum + (progress[lessonItem.id]?.completedSteps.length ?? 0), 0);
  const totalSteps = allLessons.reduce((sum, lessonItem) => sum + lessonItem.steps.length, 0);
  const focused = allLessons.find((lessonItem) => progress[lessonItem.id]?.currentFocus);
  const recentArtifacts = artifacts.slice(0, 4);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__content">
          <p className="eyebrow">North star</p>
          <h2>Build AI capability that turns into visible proof.</h2>
          <p>{northStar}</p>
          <div className="hero-actions">
            <Link className="button button--dark" to={nextLesson ? `/lesson/${nextLesson.id}` : "/track/A"}>
              <ListChecks size={16} />
              {nextLesson ? "Open next lesson" : "Open Track A"}
            </Link>
            <Link className="button button--light" to="/gallery">
              <ImageIcon size={16} />
              Review examples
            </Link>
          </div>
        </div>
        <ProgressDial value={percent(completedSteps, totalSteps)} label="overall progress" large />
      </section>

      <section className="dashboard-grid">
        <MetricCard icon={<Map size={20} />} label="Tracks" value="6" detail="A-F learning system" />
        <MetricCard icon={<BookOpen size={20} />} label="Lessons" value={String(allLessons.length)} detail="Self-contained work units" />
        <MetricCard icon={<Check size={20} />} label="Steps done" value={`${completedSteps}/${totalSteps}`} detail="Stored in this browser" />
        <MetricCard icon={<Archive size={20} />} label="Examples" value={String(artifacts.length)} detail="Local proof artifacts" />
      </section>

      <section className="split-panel">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current focus</p>
              <h3>{focused ? focused.title : nextLesson?.title ?? "Pick the first lesson"}</h3>
            </div>
            <Link className="icon-link" to={focused ? `/lesson/${focused.id}` : nextLesson ? `/lesson/${nextLesson.id}` : "/track/A"}>
              <ArrowRight size={18} />
              <span className="sr-only">Open focus lesson</span>
            </Link>
          </div>
          <p>{focused ? focused.objective : nextLesson?.objective ?? "Start with the Pip & Atlas project bible or the generic context exercise."}</p>
          <div className="tag-row">
            {(focused ?? nextLesson)?.tools.slice(0, 4).map((tool) => (
              <span className="tag" key={tool}>
                {tool}
              </span>
            ))}
          </div>
        </div>
        <div className="panel panel--dark">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Local storage</p>
              <h3>Your uploads stay private here</h3>
            </div>
            <Archive size={22} />
          </div>
          <p>
            Progress, notes, and files are saved in this browser with IndexedDB. Use Review to export a ZIP before switching browsers or publishing selected examples.
          </p>
          <Link className="button button--light" to="/review">
            <Download size={16} />
            Open backup tools
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Roadmap controls</p>
            <h3>View the same curriculum from different angles</h3>
          </div>
          <SegmentedControl<DashboardView>
            value={view}
            options={[
              ["roadmap", "Roadmap"],
              ["timeline", "Timeline"],
              ["kanban", "Kanban"],
              ["gallery", "Gallery"]
            ]}
            onChange={setView}
          />
        </div>
        {view === "roadmap" && <RoadmapView progress={progress} />}
        {view === "timeline" && <TimelineView progress={progress} />}
        {view === "kanban" && <KanbanView progress={progress} />}
        {view === "gallery" && <RecentGallery artifacts={recentArtifacts} />}
      </section>
    </div>
  );
}

function pickNextLesson(progress: ProgressMap) {
  return (
    allLessons.find((lessonItem) => progress[lessonItem.id]?.currentFocus) ??
    allLessons.find((lessonItem) => progress[lessonItem.id]?.status === "in-progress") ??
    allLessons.find((lessonItem) => lessonItem.id === "a-pip-project-scaffold") ??
    allLessons[0]
  );
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="segmented" role="tablist">
      {options.map(([key, label]) => (
        <button
          className={cn("segmented__button", value === key && "is-active")}
          key={key}
          type="button"
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="metric-card">
      <div className="metric-card__icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function ProgressDial({ value, label, large = false }: { value: number; label: string; large?: boolean }) {
  const style = { "--progress": `${value * 3.6}deg` } as React.CSSProperties;
  return (
    <div className={cn("progress-dial", large && "progress-dial--large")} style={style} aria-label={`${value}% ${label}`}>
      <strong>{value}%</strong>
      <span>{label}</span>
    </div>
  );
}

function RoadmapView({ progress }: { progress: ProgressMap }) {
  return (
    <div className="track-grid">
      {tracks.map((track) => (
        <TrackCard track={track} progress={progress} key={track.id} />
      ))}
    </div>
  );
}

function TrackCard({ track, progress }: { track: Track; progress: ProgressMap }) {
  const stats = trackStats(track, progress);
  const Icon = track.icon;
  return (
    <Link className="track-card" to={`/track/${track.id}`} style={{ "--track-accent": track.accent } as React.CSSProperties}>
      <div className="track-card__cover" style={{ background: track.cover }}>
        <Icon size={28} />
        <span>Track {track.id}</span>
      </div>
      <div className="track-card__body">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{track.status}</p>
            <h4>{track.shortTitle}</h4>
          </div>
          <ProgressDial value={stats.percent} label="done" />
        </div>
        <p>{track.socialPayoff}</p>
        <div className="mini-row">
          <span>{stats.completeLessons}/{stats.totalLessons} lessons</span>
          <span>{track.duration}</span>
        </div>
      </div>
    </Link>
  );
}

function TimelineView({ progress }: { progress: ProgressMap }) {
  return (
    <div className="timeline">
      {tracks.map((track, index) => {
        const stats = trackStats(track, progress);
        return (
          <div className="timeline-item" key={track.id}>
            <div className="timeline-item__marker" style={{ background: track.accent }}>
              {index + 1}
            </div>
            <div>
              <Link to={`/track/${track.id}`}>Track {track.id}: {track.title}</Link>
              <p>{track.dependencies.length ? `Depends on ${track.dependencies.join(", ")}` : "No prerequisite track"}</p>
              <div className="meter">
                <span style={{ width: `${stats.percent}%`, background: track.accent }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanView({ progress }: { progress: ProgressMap }) {
  const columns: Array<[LessonStatus, string]> = [
    ["not-started", "Not started"],
    ["in-progress", "In progress"],
    ["complete", "Complete"]
  ];
  return (
    <div className="kanban">
      {columns.map(([status, label]) => (
        <div className="kanban__column" key={status}>
          <h4>{label}</h4>
          {allLessons
            .filter((lessonItem) => (progress[lessonItem.id]?.status ?? "not-started") === status)
            .slice(0, 8)
            .map((lessonItem) => (
              <Link className="lesson-chip" to={`/lesson/${lessonItem.id}`} key={lessonItem.id}>
                <span>Track {lessonItem.trackId}</span>
                {lessonItem.title}
              </Link>
            ))}
        </div>
      ))}
    </div>
  );
}

function RecentGallery({ artifacts }: { artifacts: StoredArtifact[] }) {
  if (!artifacts.length) {
    return (
      <EmptyState
        icon={<GalleryHorizontalEnd size={24} />}
        title="No examples uploaded yet"
        body="Open a lesson and upload a proof artifact when you complete a step or checkpoint."
        action={<Link className="button button--dark" to="/lesson/a-pip-project-scaffold">Open first lesson</Link>}
      />
    );
  }
  return <ArtifactGrid artifacts={artifacts} onDelete={() => undefined} readonly />;
}

function TrackPage(props: SharedProps) {
  const { trackId } = useParams();
  const track = findTrack(trackId as TrackId);
  const navigate = useNavigate();
  const [pathFilter, setPathFilter] = useState("all");

  if (!track) {
    return <NotFound />;
  }

  const stats = trackStats(track, props.progress);
  const pathLabels = Array.from(new Set(track.lessons.map((item) => item.pathLabel).filter(Boolean))) as string[];
  const visibleLessons = track.lessons.filter((item) => pathFilter === "all" || item.pathLabel === pathFilter);
  const Icon = track.icon;

  return (
    <div className="page-stack">
      <button className="text-button" type="button" onClick={() => navigate(-1)}>
        <ChevronLeft size={16} />
        Back
      </button>
      <section className="track-hero" style={{ "--track-accent": track.accent, background: track.cover } as React.CSSProperties}>
        <div>
          <p className="eyebrow">Track {track.id}</p>
          <h2>{track.title}</h2>
          <p>{track.overview}</p>
          <div className="tag-row">
            <span className="tag tag--light">{track.status}</span>
            <span className="tag tag--light">{track.duration}</span>
            <span className="tag tag--light">{track.dependencies.length ? `Depends on ${track.dependencies.join(", ")}` : "No dependencies"}</span>
          </div>
        </div>
        <Icon size={52} />
      </section>

      <section className="dashboard-grid dashboard-grid--three">
        <MetricCard icon={<Gauge size={20} />} label="Progress" value={`${stats.percent}%`} detail={`${stats.completedSteps}/${stats.totalSteps} steps`} />
        <MetricCard icon={<BookOpen size={20} />} label="Lessons" value={`${stats.completeLessons}/${stats.totalLessons}`} detail="Completed lessons" />
        <MetricCard icon={<Star size={20} />} label="Proof" value="1" detail="Required capstone artifact" />
      </section>

      <section className="split-panel">
        <div className="panel">
          <p className="eyebrow">Social payoff</p>
          <h3>{track.socialPayoff}</h3>
          <p>{track.whyItMatters}</p>
        </div>
        <div className="panel">
          <p className="eyebrow">Proof of skill</p>
          <h3>{track.proofOfSkill}</h3>
          <p>Every lesson asks for a proof artifact so the track can produce portfolio evidence and content pipeline inputs.</p>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Lessons</p>
            <h3>Self-contained work units</h3>
          </div>
          {pathLabels.length > 0 && (
            <SegmentedControl
              value={pathFilter}
              options={[["all", "All"], ...pathLabels.map((label) => [label, label] as [string, string])]}
              onChange={setPathFilter}
            />
          )}
        </div>
        <div className="lesson-list">
          {visibleLessons.map((lessonItem) => (
            <LessonRow lesson={lessonItem} progress={props.progress[lessonItem.id] ?? defaultProgress(lessonItem.id)} key={lessonItem.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

function LessonRow({ lesson: lessonItem, progress }: { lesson: Lesson; progress: LessonProgress }) {
  const track = findTrack(lessonItem.trackId);
  const value = lessonStepPercent(lessonItem, progress);
  return (
    <Link className="lesson-row" to={`/lesson/${lessonItem.id}`} style={{ "--track-accent": track?.accent ?? "#111" } as React.CSSProperties}>
      <div className="lesson-row__status">
        {progress.status === "complete" ? <Check size={18} /> : <Circle size={18} />}
      </div>
      <div>
        <span>{lessonItem.pathLabel ?? `Track ${lessonItem.trackId}`} · {lessonItem.duration}</span>
        <strong>{lessonItem.title}</strong>
        <p>{lessonItem.objective}</p>
      </div>
      <div className="lesson-row__meta">
        <ProgressDial value={value} label="steps" />
      </div>
    </Link>
  );
}

function LessonPage(props: SharedProps) {
  const { lessonId } = useParams();
  const lessonItem = findLesson(lessonId ?? "");
  const navigate = useNavigate();

  if (!lessonItem) {
    return <NotFound />;
  }

  const track = findTrack(lessonItem.trackId)!;
  const progress = props.progress[lessonItem.id] ?? defaultProgress(lessonItem.id);
  const lessonArtifacts = props.artifacts.filter((artifact) => artifact.lessonId === lessonItem.id);
  const value = lessonStepPercent(lessonItem, progress);

  return (
    <div className="page-stack lesson-page" style={{ "--track-accent": track.accent } as React.CSSProperties}>
      <button className="text-button" type="button" onClick={() => navigate(-1)}>
        <ChevronLeft size={16} />
        Back
      </button>
      <section className="lesson-header">
        <div>
          <p className="eyebrow">Track {track.id} · {lessonItem.pathLabel ?? track.shortTitle}</p>
          <h2>{lessonItem.title}</h2>
          <p>{lessonItem.objective}</p>
          <div className="tag-row">
            <span className="tag">{lessonItem.duration}</span>
            {lessonItem.goalNumbers.map((goal) => (
              <span className="tag" key={goal}>Goal {goal}</span>
            ))}
          </div>
        </div>
        <ProgressDial value={value} label="lesson steps" large />
      </section>

      <section className="lesson-layout">
        <div className="lesson-main">
          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Working checklist</p>
                <h3>Step-by-step instructions</h3>
              </div>
              <select
                className="select"
                value={progress.status}
                onChange={(event) => props.setLessonStatus(lessonItem, event.target.value as LessonStatus)}
                aria-label="Lesson status"
              >
                {Object.entries(statusLabel).map(([valueKey, label]) => (
                  <option value={valueKey} key={valueKey}>{label}</option>
                ))}
              </select>
            </div>
            <div className="step-list">
              {lessonItem.steps.map((step, index) => {
                const stepId = `${lessonItem.id}-step-${index}`;
                const checked = progress.completedSteps.includes(stepId);
                return (
                  <label className={cn("step-item", checked && "is-complete")} key={stepId}>
                    <input type="checkbox" checked={checked} onChange={() => props.toggleStep(lessonItem, stepId)} />
                    <span>
                      <strong>Step {index + 1}</strong>
                      {step}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Prompts and commands</p>
                <h3>Reusable starts</h3>
              </div>
            </div>
            {lessonItem.prompts?.length ? (
              <div className="prompt-list">
                {lessonItem.prompts.map((prompt) => (
                  <code key={prompt}>{prompt}</code>
                ))}
              </div>
            ) : (
              <p>No reusable prompts are defined for this lesson yet.</p>
            )}
          </div>

          <div className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Proof area</p>
                <h3>Upload examples and working notes</h3>
              </div>
              <span className="local-pill">
                <ShieldCheck size={14} />
                Local only
              </span>
            </div>
            <p className="muted">Proof artifact: {lessonItem.proofArtifact}</p>
            <ArtifactForm lesson={lessonItem} onSave={props.addArtifact} />
            {lessonArtifacts.length > 0 && (
              <ArtifactGrid artifacts={lessonArtifacts} onDelete={props.removeArtifact} />
            )}
          </div>
        </div>

        <aside className="lesson-side">
          <div className="panel">
            <p className="eyebrow">Checkpoint</p>
            <h3>{lessonItem.checkpoint}</h3>
            <button className="button button--dark button--full" type="button" onClick={() => props.setFocusLesson(lessonItem.id)}>
              <Flag size={16} />
              Set as current focus
            </button>
          </div>
          <div className="panel">
            <p className="eyebrow">Prerequisites</p>
            <ul className="plain-list">
              {lessonItem.prerequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <p className="eyebrow">Tools</p>
            <div className="tag-row">
              {lessonItem.tools.map((tool) => (
                <span className="tag" key={tool}>{tool}</span>
              ))}
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">Notes</p>
            <textarea
              className="textarea"
              value={progress.notes}
              placeholder="What changed, failed, or should be repeated?"
              onChange={(event) => props.updateLessonFields(lessonItem.id, { notes: event.target.value })}
            />
            <label className="range-label">
              Confidence: {progress.confidence}/5
              <input
                type="range"
                min="0"
                max="5"
                value={progress.confidence}
                onChange={(event) => props.updateLessonFields(lessonItem.id, { confidence: Number(event.target.value) })}
              />
            </label>
            <textarea
              className="textarea"
              value={progress.reflection}
              placeholder="Reflection or next improvement..."
              onChange={(event) => props.updateLessonFields(lessonItem.id, { reflection: event.target.value })}
            />
          </div>
          {lessonItem.relatedLessonIds.length > 0 && (
            <div className="panel">
              <p className="eyebrow">Related lessons</p>
              <div className="related-list">
                {lessonItem.relatedLessonIds.map((id) => {
                  const related = findLesson(id);
                  return related ? (
                    <Link to={`/lesson/${related.id}`} key={related.id}>
                      Track {related.trackId}: {related.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function ArtifactForm({ lesson: lessonItem, onSave }: { lesson: Lesson; onSave: (artifact: StoredArtifact) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [toolUsed, setToolUsed] = useState(lessonItem.tools[0] ?? "");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<ArtifactType>("image");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | undefined>();
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const inferredType = file ? inferType(file.type) : type;
      const thumbnail = file ? await fileToThumbnail(file) : undefined;
      await onSave({
        id: crypto.randomUUID(),
        lessonId: lessonItem.id,
        trackId: lessonItem.trackId,
        title: title.trim() || file?.name || "Untitled example",
        caption: caption.trim(),
        toolUsed: toolUsed.trim(),
        tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
        type: inferredType,
        fileName: file?.name,
        mimeType: file?.type,
        size: file?.size,
        url: url.trim() || undefined,
        text: text.trim() || undefined,
        thumbnail,
        blob: file,
        createdAt: now()
      });
      setTitle("");
      setCaption("");
      setTags("");
      setUrl("");
      setText("");
      setFile(undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="artifact-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Four-panel test page" />
        </label>
        <label>
          Tool
          <input value={toolUsed} onChange={(event) => setToolUsed(event.target.value)} placeholder="Midjourney" />
        </label>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as ArtifactType)}>
            {artifactTypes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Tags
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="comic, test, prompt" />
        </label>
      </div>
      <label>
        Caption
        <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="What this proves or what you learned..." />
      </label>
      <div className="form-grid">
        <label>
          Link
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." />
        </label>
        <label>
          File
          <input
            type="file"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              setFile(nextFile);
              if (nextFile && !title) {
                setTitle(nextFile.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
        </label>
      </div>
      <label>
        Text example
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste prompt output, draft copy, or notes..." />
      </label>
      <button className="button button--dark" type="submit" disabled={saving}>
        <Upload size={16} />
        {saving ? "Saving..." : "Save example"}
      </button>
    </form>
  );
}

function inferType(mime: string): ArtifactType {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("text")) return "document";
  return "other";
}

function GalleryPage({ progress, artifacts, removeArtifact }: SharedProps) {
  const [trackId, setTrackId] = useState<TrackId | "all">("all");
  const [type, setType] = useState<ArtifactType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = artifacts.filter((artifact) => {
    const matchesTrack = trackId === "all" || artifact.trackId === trackId;
    const matchesType = type === "all" || artifact.type === type;
    const haystack = `${artifact.title} ${artifact.caption} ${artifact.toolUsed} ${artifact.tags.join(" ")}`.toLowerCase();
    return matchesTrack && matchesType && haystack.includes(query.toLowerCase());
  });

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Examples gallery</p>
          <h2>Proof artifacts across the roadmap</h2>
          <p>Filter locally stored work by track, media type, tool, caption, or tag.</p>
        </div>
        <Link className="button button--dark" to="/lesson/a-pip-project-scaffold">
          <FileUp size={16} />
          Add from a lesson
        </Link>
      </section>
      <section className="panel">
        <div className="filter-bar">
          <label className="search-field">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search examples" />
          </label>
          <label>
            <Filter size={16} />
            <select value={trackId} onChange={(event) => setTrackId(event.target.value as TrackId | "all")}>
              <option value="all">All tracks</option>
              {tracks.map((track) => (
                <option value={track.id} key={track.id}>Track {track.id}</option>
              ))}
            </select>
          </label>
          <label>
            <Settings2 size={16} />
            <select value={type} onChange={(event) => setType(event.target.value as ArtifactType | "all")}>
              <option value="all">All types</option>
              {artifactTypes.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>
      {filtered.length ? (
        <ArtifactGrid artifacts={filtered} onDelete={removeArtifact} progress={progress} />
      ) : (
        <EmptyState
          icon={<GalleryHorizontalEnd size={24} />}
          title="No matching examples"
          body="Upload proof artifacts from a lesson, or loosen the current filters."
        />
      )}
    </div>
  );
}

function ArtifactGrid({
  artifacts,
  onDelete,
  readonly = false
}: {
  artifacts: StoredArtifact[];
  onDelete: (id: string) => void;
  progress?: ProgressMap;
  readonly?: boolean;
}) {
  return (
    <div className="artifact-grid">
      {artifacts.map((artifact) => {
        const lessonItem = findLesson(artifact.lessonId);
        const previewUrl = artifact.blob ? URL.createObjectURL(artifact.blob) : undefined;
        return (
          <article className="artifact-card" key={artifact.id}>
            <div className="artifact-card__preview">
              {artifact.thumbnail ? (
                <img src={artifact.thumbnail} alt="" />
              ) : artifact.type === "image" && previewUrl ? (
                <img src={previewUrl} alt="" onLoad={() => URL.revokeObjectURL(previewUrl)} />
              ) : artifact.type === "link" ? (
                <LinkIcon size={34} />
              ) : artifact.type === "text" ? (
                <BookOpen size={34} />
              ) : (
                <Archive size={34} />
              )}
            </div>
            <div className="artifact-card__body">
              <div className="section-heading">
                <div>
                  <span>Track {artifact.trackId} · {artifact.type}</span>
                  <h4>{artifact.title}</h4>
                </div>
                {!readonly && (
                  <button className="icon-button" type="button" onClick={() => onDelete(artifact.id)}>
                    <Trash2 size={16} />
                    <span className="sr-only">Delete {artifact.title}</span>
                  </button>
                )}
              </div>
              <p>{artifact.caption || artifact.text || "No caption added."}</p>
              {artifact.url && (
                <a className="inline-link" href={artifact.url} target="_blank" rel="noreferrer">
                  Open link <ExternalLink size={14} />
                </a>
              )}
              <div className="mini-row">
                <span>{artifact.toolUsed || "Tool not set"}</span>
                <span>{formatDate(artifact.createdAt)}</span>
              </div>
              {lessonItem && (
                <Link className="inline-link" to={`/lesson/${lessonItem.id}`}>
                  {lessonItem.title}
                </Link>
              )}
              <div className="tag-row">
                {artifact.tags.slice(0, 4).map((tag) => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ToolsPage({ progress }: { progress: ProgressMap }) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Capabilities</p>
          <h2>Tools, goals, and how the roadmap uses them</h2>
          <p>The inventory mirrors the source roadmap and keeps every lesson tied to a capability target.</p>
        </div>
      </section>
      <section className="tool-grid">
        {toolInventory.map((tool) => (
          <article className="panel tool-card" key={tool.name}>
            <p className="eyebrow">{tool.status}</p>
            <h3>{tool.name}</h3>
            <p>{tool.role}</p>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">11 goals</p>
            <h3>Mapped to lessons and proof artifacts</h3>
          </div>
        </div>
        <div className="goal-grid">
          {goals.map((goal, index) => {
            const goalLessons = allLessons.filter((item) => item.goalNumbers.includes(index + 1));
            const complete = goalLessons.filter((item) => progress[item.id]?.status === "complete").length;
            return (
              <div className="goal-card" key={goal}>
                <span>{index + 1}</span>
                <strong>{goal}</strong>
                <p>{complete}/{goalLessons.length} linked lessons complete</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface ReviewProps {
  progress: ProgressMap;
  artifacts: StoredArtifact[];
  importBackup: (file: File) => Promise<void>;
  resetAll: () => Promise<void>;
  setNotice: (notice: string) => void;
}

function ReviewPage({ progress, artifacts, importBackup, resetAll, setNotice }: ReviewProps) {
  const progressList = Object.values(progress);
  const completeLessons = allLessons.filter((lessonItem) => progress[lessonItem.id]?.status === "complete").length;
  const activeLessons = allLessons.filter((lessonItem) => progress[lessonItem.id]?.status === "in-progress");

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Progress review</p>
          <h2>Backup, restore, and decide what is ready to publish</h2>
          <p>V1 is static and local-first. Export a ZIP before changing browsers, clearing data, or committing selected examples to the repo.</p>
        </div>
      </section>
      <section className="dashboard-grid dashboard-grid--three">
        <MetricCard icon={<Check size={20} />} label="Complete lessons" value={`${completeLessons}/${allLessons.length}`} detail="Across all tracks" />
        <MetricCard icon={<Flag size={20} />} label="Active lessons" value={String(activeLessons.length)} detail="Currently in progress" />
        <MetricCard icon={<Archive size={20} />} label="Examples" value={String(artifacts.length)} detail="Saved in IndexedDB" />
      </section>

      <section className="split-panel">
        <div className="panel">
          <p className="eyebrow">Export</p>
          <h3>Download progress and examples</h3>
          <p>Creates a ZIP with `progress.json` plus uploaded files. This is the backup and handoff format for V1.</p>
          <button className="button button--dark" type="button" onClick={() => downloadBackup(progressList, artifacts)}>
            <Download size={16} />
            Export ZIP
          </button>
        </div>
        <div className="panel">
          <p className="eyebrow">Import</p>
          <h3>Restore a previous backup</h3>
          <p>Import replaces local progress with the backup contents and restores artifact files included in the ZIP.</p>
          <label className="button button--light file-button">
            <Upload size={16} />
            Import ZIP
            <input
              type="file"
              accept=".zip,application/zip"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  await importBackup(file);
                } catch (error) {
                  setNotice(error instanceof Error ? error.message : "Import failed.");
                }
              }}
            />
          </label>
        </div>
      </section>

      <section className="panel panel--dark">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ready to publish workflow</p>
            <h3>Curate before committing examples</h3>
          </div>
          <GitBranch size={22} />
        </div>
        <p>
          Keep daily uploads local. When an example is ready for the public site, export the ZIP, move selected files into the repo, add curated metadata, and commit those public assets deliberately.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Maintenance</p>
            <h3>Reset local browser data</h3>
          </div>
          <button className="button button--danger" type="button" onClick={resetAll}>
            <RotateCcw size={16} />
            Clear local data
          </button>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

function NotFound() {
  return (
    <EmptyState
      icon={<Menu size={24} />}
      title="Page not found"
      body="The route does not match a track, lesson, or roadmap view."
      action={<Link className="button button--dark" to="/">Return to dashboard</Link>}
    />
  );
}

export default App;
