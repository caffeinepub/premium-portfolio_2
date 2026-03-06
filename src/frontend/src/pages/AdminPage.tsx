import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Star,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ContactInfo, Project, Review } from "../backend";
import { getBackend } from "../lib/backendClient";

// ─────────────────────────────────────────
// Auth gate
// ─────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const client = await getBackend();
      const ok = await client.verifyAdminPassword(password);
      if (ok) {
        onSuccess();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          {/* Glow decoration */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.26 20 / 0.12) 0%, transparent 70%)",
            }}
          />

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.24 22), oklch(0.55 0.28 10))",
              }}
            >
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg gradient-text">
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">
                Portfolio Management
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow"
              style={{
                background: "oklch(0.65 0.26 20 / 0.15)",
                border: "1px solid oklch(0.65 0.26 20 / 0.3)",
              }}
            >
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Enter Password
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-sm text-muted-foreground"
              >
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="bg-input/50 border-border/50 pr-10 focus:border-primary/50 focus:ring-primary/20"
                  data-ocid="admin.password_input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive"
                    data-ocid="admin.error_state"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full py-5 font-semibold bg-primary text-primary-foreground hover:shadow-glow transition-all duration-200"
              data-ocid="admin.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────
// Project Form
// ─────────────────────────────────────────
interface ProjectFormData {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  link: string;
  featured: boolean;
  order: string;
}

const EMPTY_PROJECT: ProjectFormData = {
  title: "",
  description: "",
  imageUrl: "",
  category: "Web Dev",
  link: "",
  featured: false,
  order: "0",
};

const CATEGORIES = ["Web Dev", "Design", "AI", "Editing"];

interface ProjectDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProjectDialog({
  open,
  project,
  onClose,
  onSaved,
}: ProjectDialogProps) {
  const [form, setForm] = useState<ProjectFormData>(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        category: project.category,
        link: project.link,
        featured: project.featured,
        order: project.order.toString(),
      });
    } else {
      setForm(EMPTY_PROJECT);
    }
  }, [project]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const client = await getBackend();
      if (project) {
        await client.updateProject(
          project.id,
          form.title,
          form.description,
          form.imageUrl,
          form.category,
          form.link,
          form.featured,
          BigInt(Number.parseInt(form.order) || 0),
        );
        toast.success("Project updated successfully");
      } else {
        await client.addProject(
          form.title,
          form.description,
          form.imageUrl,
          form.category,
          form.link,
          form.featured,
          BigInt(Number.parseInt(form.order) || 0),
        );
        toast.success("Project added successfully");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="glass-strong max-w-lg border-border/50"
        data-ocid="admin.project.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">
            {project ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Project title"
              className="bg-input/50"
              data-ocid="project.form_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description..."
              className="bg-input/50 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="bg-input/50"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              className="bg-input/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Project Link</Label>
            <Input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              className="bg-input/50"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="featured"
              checked={form.featured}
              onCheckedChange={(v) =>
                setForm({ ...form, featured: Boolean(v) })
              }
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured project (show in carousel)
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/50"
            data-ocid="admin.project.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="bg-primary text-primary-foreground hover:shadow-glow"
            data-ocid="admin.project.save_button"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : project ? "Save Changes" : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────
// Review Form
// ─────────────────────────────────────────
interface ReviewFormData {
  author: string;
  role: string;
  text: string;
  rating: string;
  avatarUrl: string;
}

const EMPTY_REVIEW: ReviewFormData = {
  author: "",
  role: "",
  text: "",
  rating: "5",
  avatarUrl: "",
};

interface ReviewDialogProps {
  open: boolean;
  review: Review | null;
  onClose: () => void;
  onSaved: () => void;
}

function ReviewDialog({ open, review, onClose, onSaved }: ReviewDialogProps) {
  const [form, setForm] = useState<ReviewFormData>(EMPTY_REVIEW);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (review) {
      setForm({
        author: review.author,
        role: review.role,
        text: review.text,
        rating: review.rating.toString(),
        avatarUrl: review.avatarUrl,
      });
    } else {
      setForm(EMPTY_REVIEW);
    }
  }, [review]);

  const handleSave = async () => {
    if (!form.author.trim()) return;
    setSaving(true);
    try {
      const client = await getBackend();
      if (review) {
        await client.updateReview(
          review.id,
          form.author,
          form.role,
          form.text,
          BigInt(Number.parseInt(form.rating) || 5),
          form.avatarUrl,
        );
        toast.success("Review updated");
      } else {
        await client.addReview(
          form.author,
          form.role,
          form.text,
          BigInt(Number.parseInt(form.rating) || 5),
          form.avatarUrl,
        );
        toast.success("Review added");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="glass-strong max-w-lg border-border/50"
        data-ocid="admin.review.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">
            {review ? "Edit Review" : "Add New Review"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Author Name *</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="John Smith"
                className="bg-input/50"
                data-ocid="review.form_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role / Company</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="CEO at Acme"
                className="bg-input/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Review Text</Label>
            <Textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="What did they say?"
              className="bg-input/50 resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <Select
                value={form.rating}
                onValueChange={(v) => setForm({ ...form, rating: v })}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {"⭐".repeat(r)} ({r})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Avatar URL</Label>
              <Input
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm({ ...form, avatarUrl: e.target.value })
                }
                placeholder="https://..."
                className="bg-input/50"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/50"
            data-ocid="admin.review.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.author.trim()}
            className="bg-primary text-primary-foreground hover:shadow-glow"
            data-ocid="admin.review.save_button"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : review ? "Save Changes" : "Add Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────
// Projects Tab
// ─────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    try {
      const client = await getBackend();
      const data = await client.getAllProjects();
      setProjects(data.sort((a, b) => Number(a.order) - Number(b.order)));
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      const client = await getBackend();
      await client.deleteProject(id);
      toast.success("Project deleted");
      load();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} total
          </p>
        </div>
        <Button
          onClick={() => {
            setEditProject(null);
            setDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:shadow-glow"
          data-ocid="admin.add_project_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Project
        </Button>
      </div>

      {loading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="admin.projects.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div
          className="text-center py-16 glass rounded-2xl"
          data-ocid="admin.projects.empty_state"
        >
          <LayoutDashboard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No projects yet. Add your first one!
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">
                  Category
                </TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">
                  Featured
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, i) => (
                <TableRow
                  key={project.id.toString()}
                  className="border-border/20 hover:bg-white/3 transition-colors"
                  data-ocid={`admin.project.row.${i + 1}`}
                >
                  <TableCell>
                    <div className="font-medium text-sm truncate max-w-48">
                      {project.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-48 hidden sm:hidden md:block">
                      {project.description.slice(0, 60)}...
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                      {project.category}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {project.featured ? (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <span className="text-muted-foreground/40 text-sm">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          setEditProject(project);
                          setDialogOpen(true);
                        }}
                        data-ocid={`admin.project_edit_button.${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        data-ocid={`admin.project_delete_button.${i + 1}`}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        project={editProject}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Reviews Tab
// ─────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    try {
      const client = await getBackend();
      const data = await client.getAllReviews();
      setReviews(data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      const client = await getBackend();
      await client.deleteReview(id);
      toast.success("Review deleted");
      load();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} total
          </p>
        </div>
        <Button
          onClick={() => {
            setEditReview(null);
            setDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:shadow-glow"
          data-ocid="admin.add_review_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Review
        </Button>
      </div>

      {loading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="admin.reviews.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-16 glass rounded-2xl"
          data-ocid="admin.reviews.empty_state"
        >
          <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Author</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">
                  Rating
                </TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">
                  Preview
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review, i) => (
                <TableRow
                  key={review.id.toString()}
                  className="border-border/20 hover:bg-white/3"
                  data-ocid={`admin.review.row.${i + 1}`}
                >
                  <TableCell>
                    <div className="font-medium text-sm">{review.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {review.role}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5]
                        .slice(0, Number(review.rating))
                        .map((pos) => (
                          <Star
                            key={pos}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-48">
                      {review.text.slice(0, 60)}...
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          setEditReview(review);
                          setDialogOpen(true);
                        }}
                        data-ocid={`admin.review_edit_button.${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        data-ocid={`admin.review_delete_button.${i + 1}`}
                      >
                        {deletingId === review.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ReviewDialog
        open={dialogOpen}
        review={editReview}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Contact Tab
// ─────────────────────────────────────────
function ContactTab() {
  const [form, setForm] = useState<ContactInfo>({
    name: "",
    title: "",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const client = await getBackend();
        const data = await client.getContactInfo();
        if (data) setForm(data);
      } catch {
        toast.error("Failed to load contact info");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const client = await getBackend();
      await client.setContactInfo(
        form.name,
        form.title,
        form.bio,
        form.email,
        form.github,
        form.linkedin,
        form.twitter,
      );
      toast.success("Contact info saved");
    } catch {
      toast.error("Failed to save contact info");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center py-16"
        data-ocid="admin.contact.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Contact Info</h2>
          <p className="text-sm text-muted-foreground">
            Update your public profile
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="bg-input/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Your professional title"
              className="bg-input/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell the world about yourself..."
            className="bg-input/50 resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="bg-input/50"
              type="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label>GitHub Username</Label>
            <Input
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              placeholder="yourusername"
              className="bg-input/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label>LinkedIn Username</Label>
            <Input
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="yourusername"
              className="bg-input/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Twitter / X Username</Label>
            <Input
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              placeholder="yourusername"
              className="bg-input/50"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:shadow-glow px-6"
            data-ocid="admin.contact_save_button"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Contact Info"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-border/30 sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.24 22), oklch(0.55 0.28 10))",
              }}
            >
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <span className="font-display font-bold gradient-text">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Portfolio
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="glass border border-border/30 p-1 h-auto gap-1">
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-5 py-2.5 text-sm font-medium gap-2"
              data-ocid="admin.projects_tab"
            >
              <LayoutDashboard className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-5 py-2.5 text-sm font-medium gap-2"
              data-ocid="admin.reviews_tab"
            >
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-5 py-2.5 text-sm font-medium gap-2"
              data-ocid="admin.contact_tab"
            >
              <User className="w-4 h-4" />
              Contact Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="focus-visible:outline-none">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="reviews" className="focus-visible:outline-none">
            <ReviewsTab />
          </TabsContent>
          <TabsContent value="contact" className="focus-visible:outline-none">
            <ContactTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// Root Admin Page
// ─────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {authenticated ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AdminDashboard onLogout={() => setAuthenticated(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AdminLogin onSuccess={() => setAuthenticated(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
