import { useState, useRef } from "react";
import {
  LayoutDashboard, Plus, Trash2, Pencil, X, CheckCircle2,
  Clock, Circle, ChevronDown, AlertTriangle, ImagePlus,
  Loader2, MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useKanban,
  type KanbanTask,
  type KanbanStatus,
  type KanbanPriority,
  type CreateTaskPayload,
} from "@/hooks/Kanban/useKanban";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── constants ─── */
const COLUMNS: { key: KanbanStatus; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  {
    key: "todo",
    label: "To Do",
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    icon: <Circle className="w-4 h-4 text-slate-400" />,
  },
  {
    key: "in_progress",
    label: "In Progress",
    color: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: <Clock className="w-4 h-4 text-amber-500" />,
  },
  {
    key: "done",
    label: "Done",
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
];

const PRIORITY_META: Record<KanbanPriority, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300" },
  medium: { label: "Medium", cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300" },
  high: { label: "High", cls: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300" },
};

/* ─── helpers ─── */
function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function AvatarChip({ user }: { user: { firstName: string; lastName: string; profileImage?: string } | null }) {
  if (!user) return null;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden text-[9px] font-bold text-primary shrink-0">
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
        ) : initials}
      </div>
      <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
        {user.firstName} {user.lastName}
      </span>
    </div>
  );
}

/* ─── Task Card ─── */
function TaskCard({
  task,
  onEdit,
  onDelete,
  onMoveRight,
  isLast,
}: {
  task: KanbanTask;
  onEdit: (t: KanbanTask) => void;
  onDelete: (id: string) => void;
  onMoveRight: (t: KanbanTask) => void;
  isLast: boolean;
}) {
  const pm = PRIORITY_META[task.priority];
  return (
    <div className="group relative rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 overflow-hidden animate-pop-in">
      {/* image */}
      {task.image && (
        <div className="w-full h-36 overflow-hidden">
          <img src={task.image} alt={task.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-3.5 flex flex-col gap-2.5">
        {/* priority badge */}
        <span className={cn("self-start text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", pm.cls)}>
          {pm.label}
        </span>

        {/* title */}
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{task.title}</p>

        {/* description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        {/* footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
          <AvatarChip user={task.createdBy} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Move right */}
            {!isLast && (
              <button
                onClick={() => onMoveRight(task)}
                title="Move to next stage"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <MoveRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onEdit(task)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Edit task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Form Modal ─── */
function TaskModal({
  mode,
  initial,
  defaultStatus,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial?: KanbanTask;
  defaultStatus?: KanbanStatus;
  onClose: () => void;
  onSave: (data: CreateTaskPayload & { _id?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<KanbanStatus>(initial?.status || defaultStatus || "todo");
  const [priority, setPriority] = useState<KanbanPriority>(initial?.priority || "medium");
  const [image, setImage] = useState<string | null>(initial?.image || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3 MB"); return; }
    setUploading(true);
    try {
      const b64 = await toBase64(file);
      setImage(b64);
    } catch {
      toast.error("Failed to read image");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      _id: initial?._id,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      image,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl animate-scale-in overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <h2 className="font-bold text-foreground text-lg">
            {mode === "create" ? "New Task" : "Edit Task"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* image picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative w-full h-36 rounded-xl border-2 border-dashed border-border/70 overflow-hidden cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center",
              image ? "border-solid border-border/30" : ""
            )}
          >
            {image ? (
              <>
                <img src={image} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="w-7 h-7" />
                <span className="text-xs font-medium">Click to add image (max 3 MB)</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
            <input
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              placeholder="Task title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          {/* description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              rows={3}
              placeholder="Optional details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
          </div>

          {/* status + priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
              <div className="relative">
                <select
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as KanbanStatus)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
              <div className="relative">
                <select
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as KanbanPriority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="rounded-xl gap-2" disabled={saving || !title.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "create" ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              {saving ? "Saving…" : mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Status Move Modal (Employee) ─── */
function StatusMoveModal({
  task,
  onClose,
  onMove,
}: {
  task: KanbanTask;
  onClose: () => void;
  onMove: (id: string, status: KanbanStatus) => Promise<void>;
}) {
  const nextStatus: Record<KanbanStatus, KanbanStatus> = {
    todo: "in_progress",
    in_progress: "done",
    done: "done",
  };
  const next = nextStatus[task.status];
  const [saving, setSaving] = useState(false);

  const handleMove = async () => {
    setSaving(true);
    await onMove(task._id, next);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl animate-scale-in p-6 flex flex-col gap-4">
        <h2 className="font-bold text-foreground text-base">Move Task</h2>
        <p className="text-sm text-muted-foreground">
          Move <span className="font-semibold text-foreground">"{task.title}"</span> to{" "}
          <span className="font-semibold text-primary">
            {next === "in_progress" ? "In Progress" : "Done"}
          </span>
          ?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" className="rounded-xl" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="rounded-xl gap-2" onClick={handleMove} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoveRight className="w-4 h-4" />}
            Move
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Column ─── */
function Column({
  col,
  tasks,
  onAdd,
  onEdit,
  onDelete,
  onMoveRight,
  isLastCol,
}: {
  col: (typeof COLUMNS)[number];
  tasks: KanbanTask[];
  onAdd?: () => void;
  onEdit: (t: KanbanTask) => void;
  onDelete: (id: string) => void;
  onMoveRight: (t: KanbanTask) => void;
  isLastCol: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* column header */}
      <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl", col.bg)}>
        <div className="flex items-center gap-2">
          {col.icon}
          <span className={cn("text-sm font-bold", col.color)}>{col.label}</span>
          <span className="text-xs font-bold text-muted-foreground/60 bg-background/60 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Add task to this column"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* cards */}
      <div className="flex flex-col gap-3">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40 gap-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-xs font-medium">No tasks here</span>
          </div>
        )}
        {tasks.map((t) => (
          <TaskCard
            key={t._id}
            task={t}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveRight={onMoveRight}
            isLast={isLastCol}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function KanbanPage() {
  const { tasks, tasksByStatus, loading, createTask, updateTask, deleteTask } = useKanban();

  const [showCreate, setShowCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState<KanbanStatus>("todo");
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [movingTask, setMovingTask] = useState<KanbanTask | null>(null);

  /* create */
  const handleCreate = async (data: any) => {
    const res = await createTask({
      title: data.title,
      description: data.description,
      status: data.status || createStatus,
      priority: data.priority,
      image: data.image || null,
    });
    if (res.success) {
      toast.success("Task created!");
      setShowCreate(false);
    } else {
      toast.error(res.error || "Failed to create task");
    }
  };

  /* edit */
  const handleEdit = async (data: any) => {
    if (!editingTask) return;
    const res = await updateTask(editingTask._id, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      image: data.image,
    });
    if (res.success) {
      toast.success("Task updated!");
      setEditingTask(null);
    } else {
      toast.error(res.error || "Failed to update task");
    }
  };

  /* HR/Employee: delete */
  const handleDelete = async (id: string) => {
    const res = await deleteTask(id);
    if (res.success) toast.success("Task deleted");
    else toast.error("Failed to delete task");
  };

  /* HR/Employee: move to next status */
  const handleMoveConfirm = async (id: string, status: KanbanStatus) => {
    const res = await updateTask(id, { status });
    if (res.success) toast.success("Task moved!");
    else toast.error("Failed to move task");
  };

  const totalTasks = tasks.length;
  const donePct = totalTasks ? Math.round((tasksByStatus.done.length / totalTasks) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-slide-up-fade pb-10">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-card p-6 sm:p-8 shadow-sm border border-border/50">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* left */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Kanban Board
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5 font-medium">
                Track your tasks across To Do, In Progress, and Done
              </p>
            </div>
          </div>

          {/* right: stats + create */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* progress pill */}
            <div className="flex items-center gap-3 bg-muted/60 border border-border/50 rounded-xl px-4 py-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${donePct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground">{donePct}%</span>
                </div>
              </div>
            </div>

            {/* stat chips */}
            <div className="flex items-center gap-2">
              {COLUMNS.map((c) => (
                <div key={c.key} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold", c.bg, c.color)}>
                  {c.icon}
                  {tasksByStatus[c.key].length}
                </div>
              ))}
            </div>

            <Button
              onClick={() => { setCreateStatus("todo"); setShowCreate(true); }}
              className="h-10 rounded-xl gap-2 font-semibold px-5"
            >
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* ── Board ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col, colIdx) => (
            <Column
              key={col.key}
              col={col}
              tasks={tasksByStatus[col.key]}
              onAdd={() => { setCreateStatus(col.key); setShowCreate(true); }}
              onEdit={setEditingTask}
              onDelete={handleDelete}
              onMoveRight={(t) => setMovingTask(t)}
              isLastCol={colIdx === COLUMNS.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <TaskModal
          mode="create"
          defaultStatus={createStatus}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}
      {editingTask && (
        <TaskModal
          mode="edit"
          initial={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEdit}
        />
      )}
      {movingTask && (
        <StatusMoveModal
          task={movingTask}
          onClose={() => setMovingTask(null)}
          onMove={handleMoveConfirm}
        />
      )}
    </div>
  );
}
