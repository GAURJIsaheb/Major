import { useState } from "react";
import { Megaphone, Plus, Trash2, Clock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBulletins, type BulletinItem } from "@/hooks/Bulletins/useBulletins";
import { toast } from "sonner";

function timeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export default function BulletinsPanel() {
  const { visible, role, dismiss, createBulletin, deleteBulletin } = useBulletins();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    const res = await createBulletin(title.trim(), message.trim());
    setSubmitting(false);
    if (res.success) {
      toast.success("Bulletin posted — visible to all for 24 hours");
      setTitle("");
      setMessage("");
      setShowForm(false);
    } else {
      toast.error(res.error || "Failed to create bulletin");
    }
  };

  const handleDelete = async (b: BulletinItem) => {
    await deleteBulletin(b._id);
    toast.success("Bulletin removed");
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-slide-up-fade pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card p-6 sm:p-8 shadow-sm border border-border/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/40">
              <Megaphone className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Bulletins
              </h1>
              <p className="text-muted-foreground text-sm mt-1 font-medium">
                Company-wide announcements — active for 24 hours
              </p>
            </div>
          </div>
          {role === "HR" && (
            <Button
              onClick={() => setShowForm((v) => !v)}
              className="h-11 font-semibold gap-2 whitespace-nowrap rounded-xl px-5"
            >
              <Plus className="h-5 w-5" />
              New Bulletin
            </Button>
          )}
        </div>

        {/* Create form (HR only) */}
        {showForm && role === "HR" && (
          <form
            onSubmit={handleCreate}
            className="relative z-10 mt-6 p-5 rounded-xl border border-border/60 bg-muted/30 backdrop-blur-sm flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Title
              </label>
              <input
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                placeholder="e.g. Office Closed Tomorrow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Message
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                rows={3}
                placeholder="Write your announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                required
              />
              <span className="text-xs text-muted-foreground text-right">{message.length}/500</span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !title.trim() || !message.trim()}
                className="rounded-lg gap-2"
              >
                <Megaphone className="h-4 w-4" />
                {submitting ? "Posting..." : "Post Bulletin"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Bulletin list */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-base font-medium">No active bulletins right now</p>
          <p className="text-sm text-muted-foreground/70">
            {role === "HR" ? "Create one using the button above." : "Check back later."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((b) => (
            <div
              key={b._id}
              className="group relative rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20"
            >
              {/* Glow accent */}
              <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-violet-500 to-indigo-500" />

              <div className="pl-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-foreground text-base leading-snug">{b.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Expiry badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      {timeLeft(b.expiresAt)}
                    </span>
                    {/* HR: delete */}
                    {role === "HR" && (
                      <button
                        onClick={() => handleDelete(b)}
                        className="ml-1 flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete bulletin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Everyone: dismiss from view */}
                    <button
                      onClick={() => dismiss(b._id)}
                      className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Dismiss"
                      title="Dismiss from view"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">{b.message}</p>

                {b.createdBy && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-1">
                    <User className="w-3 h-3" />
                    <span>
                      Posted by {b.createdBy.firstName} {b.createdBy.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
