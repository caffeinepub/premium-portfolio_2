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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  Code2,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  Palette,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ContactInfo, Project, Review } from "../backend";
import {
  type CustomSkill,
  DEFAULT_DESIGN_SETTINGS,
  DEFAULT_HERO_SETTINGS,
  type DesignSettings,
  type HeroSettings,
  addLocalProject,
  addLocalReview,
  deleteLocalProject,
  deleteLocalReview,
  getLocalContact,
  getLocalCustomSkills,
  getLocalDesignSettings,
  getLocalHeroSettings,
  getLocalProjects,
  getLocalReviews,
  saveLocalContact,
  saveLocalCustomSkills,
  saveLocalDesignSettings,
  saveLocalHeroSettings,
  updateLocalProject,
  updateLocalReview,
} from "../lib/localDataStore";

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
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (password === "portfolio2024") {
      onSuccess();
    } else {
      setError("Incorrect password. Please try again.");
    }
    setLoading(false);
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
                  data-ocid="admin.input"
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
              data-ocid="admin.link"
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

  const handleSave = () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (project) {
        updateLocalProject(
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
        addLocalProject(
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
              data-ocid="project.input"
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
                <SelectTrigger
                  className="bg-input/50"
                  data-ocid="project.select"
                >
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
              data-ocid="project.checkbox"
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

  const handleSave = () => {
    if (!form.author.trim()) return;
    setSaving(true);
    try {
      if (review) {
        updateLocalReview(
          review.id,
          form.author,
          form.role,
          form.text,
          BigInt(Number.parseInt(form.rating) || 5),
          form.avatarUrl,
        );
        toast.success("Review updated");
      } else {
        addLocalReview(
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
                data-ocid="review.input"
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
                <SelectTrigger
                  className="bg-input/50"
                  data-ocid="review.select"
                >
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

  const load = useCallback(() => {
    try {
      const localProjects = getLocalProjects();
      setProjects(
        localProjects.sort((a, b) => Number(a.order) - Number(b.order)),
      );
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: bigint) => {
    try {
      deleteLocalProject(id);
      toast.success("Project deleted");
      load();
    } catch {
      toast.error("Failed to delete project");
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
            No projects added yet. Click "Add Project" to get started.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Projects you add here will appear on your portfolio automatically.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <Table data-ocid="admin.projects.table">
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
                      {project.description.slice(0, 60)}
                      {project.description.length > 60 ? "..." : ""}
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
                        data-ocid={`admin.project.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(project.id)}
                        data-ocid={`admin.project.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

  const load = useCallback(() => {
    try {
      const localReviews = getLocalReviews();
      setReviews(localReviews);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: bigint) => {
    try {
      deleteLocalReview(id);
      toast.success("Review deleted");
      load();
    } catch {
      toast.error("Failed to delete review");
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
          <p className="text-muted-foreground">No reviews added yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Reviews you add here will appear on your portfolio automatically.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <Table data-ocid="admin.reviews.table">
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
                      {review.text.slice(0, 60)}
                      {review.text.length > 60 ? "..." : ""}
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
                        data-ocid={`admin.review.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(review.id)}
                        data-ocid={`admin.review.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
    const localContact = getLocalContact();
    if (localContact) {
      setForm(localContact);
    }
    setLoading(false);
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveLocalContact(form);
      toast.success("Contact info saved successfully!");
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
              data-ocid="contact.name.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Your professional title"
              className="bg-input/50"
              data-ocid="contact.title.input"
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
            data-ocid="contact.bio.textarea"
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
              data-ocid="contact.email.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>GitHub Username</Label>
            <Input
              value={form.github}
              onChange={(e) => setForm({ ...form, github: e.target.value })}
              placeholder="yourusername"
              className="bg-input/50"
              data-ocid="contact.github.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>LinkedIn Username</Label>
            <Input
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="yourusername"
              className="bg-input/50"
              data-ocid="contact.linkedin.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Twitter / X Username</Label>
            <Input
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              placeholder="yourusername"
              className="bg-input/50"
              data-ocid="contact.twitter.input"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:shadow-glow px-6"
            data-ocid="admin.contact.save_button"
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
// Hero Tab
// ─────────────────────────────────────────
function HeroTab() {
  const [form, setForm] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(getLocalHeroSettings());
  }, []);

  const updateStat = (
    index: number,
    field: "value" | "label",
    value: string,
  ) => {
    const newStats = [...form.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setForm({ ...form, stats: newStats });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      saveLocalHeroSettings(form);
      toast.success(
        "Hero settings saved! Reload the portfolio to see changes.",
      );
    } catch {
      toast.error("Failed to save hero settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Hero Section</h2>
          <p className="text-sm text-muted-foreground">
            Customize your hero content
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-6">
        {/* Tagline */}
        <div className="space-y-1.5">
          <Label>Greeting / Tagline</Label>
          <Input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="Hello, I'm"
            className="bg-input/50"
            data-ocid="hero.tagline.input"
          />
          <p className="text-xs text-muted-foreground">
            The line that appears before your name (e.g. "Hello, I'm")
          </p>
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5">
          <Label>Subtitle</Label>
          <Textarea
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Crafting beautiful digital experiences..."
            className="bg-input/50 resize-none"
            rows={3}
            data-ocid="hero.subtitle.textarea"
          />
        </div>

        {/* Availability text */}
        <div className="space-y-1.5">
          <Label>Availability Badge Text</Label>
          <Input
            value={form.availabilityText}
            onChange={(e) =>
              setForm({ ...form, availabilityText: e.target.value })
            }
            placeholder="Available for new projects"
            className="bg-input/50"
            data-ocid="hero.availability.input"
          />
        </div>

        {/* CTA buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Primary Button Label</Label>
            <Input
              value={form.ctaPrimary}
              onChange={(e) => setForm({ ...form, ctaPrimary: e.target.value })}
              placeholder="View My Work"
              className="bg-input/50"
              data-ocid="hero.cta-primary.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Secondary Button Label</Label>
            <Input
              value={form.ctaSecondary}
              onChange={(e) =>
                setForm({ ...form, ctaSecondary: e.target.value })
              }
              placeholder="Contact Me"
              className="bg-input/50"
              data-ocid="hero.cta-secondary.input"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <Label>Stats Row</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.stats.map((stat, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stats are positional, order never changes
              <div key={i} className="glass rounded-xl p-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Stat {i + 1}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(i, "value", e.target.value)}
                      placeholder="7+"
                      className="bg-input/50 h-8 text-sm"
                      data-ocid={`hero.stat.value.${i + 1}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(i, "label", e.target.value)}
                      placeholder="Years Experience"
                      className="bg-input/50 h-8 text-sm"
                      data-ocid={`hero.stat.label.${i + 1}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:shadow-glow px-6"
            data-ocid="admin.hero.save_button"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Hero Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Design Tab
// ─────────────────────────────────────────
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Outfit", label: "Outfit" },
  { value: "Sora", label: "Sora" },
  { value: "Figtree", label: "Figtree" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Bricolage Grotesque", label: "Bricolage Grotesque" },
];

const COLOR_PRESETS = [
  { label: "Red", hue: 20, color: "oklch(0.65 0.26 20)" },
  { label: "Orange", hue: 40, color: "oklch(0.65 0.24 40)" },
  { label: "Pink", hue: 330, color: "oklch(0.65 0.26 330)" },
  { label: "Purple", hue: 280, color: "oklch(0.65 0.24 280)" },
  { label: "Blue", hue: 230, color: "oklch(0.60 0.22 230)" },
  { label: "Green", hue: 145, color: "oklch(0.60 0.22 145)" },
];

function DesignTab() {
  const [form, setForm] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(getLocalDesignSettings());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveLocalDesignSettings(form);
      toast.success(
        "Design settings saved! Reload the portfolio to see changes.",
      );
    } catch {
      toast.error("Failed to save design settings");
    } finally {
      setSaving(false);
    }
  };

  const previewColor = `oklch(0.65 0.26 ${form.primaryColorHue})`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Design Settings</h2>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your portfolio
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Background Style */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Background Style
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "pure-black" as const,
                label: "Pure Black",
                bg: "#000000",
              },
              {
                value: "dark-gray" as const,
                label: "Dark Gray",
                bg: "#111111",
              },
              { value: "deep-red" as const, label: "Deep Red", bg: "#1a0505" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, bgStyle: opt.value })}
                className={`relative rounded-xl p-3 border-2 transition-all duration-200 text-left ${
                  form.bgStyle === opt.value
                    ? "border-primary shadow-[0_0_12px_oklch(0.65_0.26_20/0.4)]"
                    : "border-border/30 hover:border-border/60"
                }`}
                data-ocid={`design.bg.${opt.value}.button`}
              >
                <div
                  className="w-full h-12 rounded-lg mb-2"
                  style={{ backgroundColor: opt.bg }}
                />
                <span className="text-xs font-medium">{opt.label}</span>
                {form.bgStyle === opt.value && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Accent Color
          </h3>
          {/* Color preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl border border-border/30 flex-shrink-0"
              style={{
                backgroundColor: previewColor,
                boxShadow: `0 0 16px ${previewColor}60`,
              }}
            />
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Hue: {form.primaryColorHue}°</span>
                <span style={{ color: previewColor }}>Preview</span>
              </div>
              <Slider
                value={[form.primaryColorHue]}
                onValueChange={([v]) =>
                  setForm({ ...form, primaryColorHue: v })
                }
                min={0}
                max={360}
                step={1}
                className="w-full"
                data-ocid="design.color.hue.input"
              />
            </div>
          </div>
          {/* Color presets */}
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hue}
                type="button"
                onClick={() =>
                  setForm({ ...form, primaryColorHue: preset.hue })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.primaryColorHue === preset.hue
                    ? "border-primary bg-primary/10"
                    : "border-border/30 hover:border-border/60"
                }`}
                data-ocid={`design.color.${preset.label.toLowerCase()}.button`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.color }}
                />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Glow Intensity */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Glow Intensity
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, glowIntensity: level })}
                className={`py-2.5 px-4 rounded-xl text-sm font-medium border-2 capitalize transition-all ${
                  form.glowIntensity === level
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-border/60"
                }`}
                data-ocid={`design.glow.${level}.button`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Font Pickers */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Typography
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Heading Font</Label>
              <Select
                value={form.fontHeading}
                onValueChange={(v) => setForm({ ...form, fontHeading: v })}
              >
                <SelectTrigger
                  className="bg-input/50"
                  data-ocid="design.font-heading.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Body Font</Label>
              <Select
                value={form.fontBody}
                onValueChange={(v) => setForm({ ...form, fontBody: v })}
              >
                <SelectTrigger
                  className="bg-input/50"
                  data-ocid="design.font-body.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Animations */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Animations
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable or disable page animations and transitions
              </p>
            </div>
            <Switch
              checked={form.animationsEnabled}
              onCheckedChange={(v) =>
                setForm({ ...form, animationsEnabled: v })
              }
              data-ocid="design.animations.switch"
            />
          </div>
        </div>

        {/* Section Visibility */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Section Visibility
          </h3>
          <p className="text-xs text-muted-foreground">
            Toggle which sections appear on your portfolio
          </p>
          <div className="space-y-3">
            {(
              ["work", "projects", "skills", "reviews", "contact"] as const
            ).map((section) => (
              <div
                key={section}
                className="flex items-center justify-between py-1"
              >
                <Label className="capitalize text-sm font-normal">
                  {section === "work"
                    ? "Featured Work (Carousel)"
                    : section.charAt(0).toUpperCase() + section.slice(1)}
                </Label>
                <Switch
                  checked={form.sections[section]}
                  onCheckedChange={(v) =>
                    setForm({
                      ...form,
                      sections: { ...form.sections, [section]: v },
                    })
                  }
                  data-ocid={`design.section.${section}.switch`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:shadow-glow px-6"
            data-ocid="admin.design.save_button"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Design Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Skills Tab
// ─────────────────────────────────────────
const DEFAULT_SKILLS = [
  { name: "JavaScript", category: "Languages" },
  { name: "TypeScript", category: "Languages" },
  { name: "Python", category: "Languages" },
  { name: "React", category: "Frameworks" },
  { name: "Node.js", category: "Frameworks" },
  { name: "Figma", category: "Design" },
  { name: "CSS / Tailwind", category: "Frameworks" },
  { name: "Git", category: "Tools" },
  { name: "Docker", category: "Tools" },
  { name: "Photoshop", category: "Design" },
];

const SKILL_CATEGORIES = ["Languages", "Frameworks", "Tools", "Design"];

function SkillsTab() {
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Languages",
    level: "3",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCustomSkills(getLocalCustomSkills());
  }, []);

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    const skill: CustomSkill = {
      id: Date.now().toString(),
      name: newSkill.name,
      category: newSkill.category,
      level: Number.parseInt(newSkill.level),
    };
    const updated = [...customSkills, skill];
    setCustomSkills(updated);
    saveLocalCustomSkills(updated);
    setNewSkill({ name: "", category: "Languages", level: "3" });
    toast.success("Skill added");
  };

  const handleDeleteSkill = (id: string) => {
    const updated = customSkills.filter((s) => s.id !== id);
    setCustomSkills(updated);
    saveLocalCustomSkills(updated);
    toast.success("Skill removed");
  };

  const handleSaveAll = () => {
    setSaving(true);
    try {
      saveLocalCustomSkills(customSkills);
      toast.success("Skills saved successfully!");
    } catch {
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Skills</h2>
          <p className="text-sm text-muted-foreground">Manage your skill set</p>
        </div>
      </div>

      {/* Default skills (read-only display) */}
      <div className="glass rounded-2xl p-5 mb-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Default Skills
          <span className="text-xs text-muted-foreground font-normal">
            (always shown)
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SKILLS.map((skill) => (
            <span
              key={skill.name}
              className="text-xs px-3 py-1.5 rounded-full glass border border-border/30 text-muted-foreground"
            >
              {skill.name}
              <span className="ml-1.5 text-muted-foreground/50">
                · {skill.category}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Add custom skill */}
      <div className="glass rounded-2xl p-5 mb-5 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Add Custom Skill
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5 sm:col-span-1">
            <Label>Skill Name</Label>
            <Input
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
              placeholder="e.g. Rust, Blender..."
              className="bg-input/50"
              data-ocid="skills.name.input"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={newSkill.category}
              onValueChange={(v) => setNewSkill({ ...newSkill, category: v })}
            >
              <SelectTrigger
                className="bg-input/50"
                data-ocid="skills.category.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Level (1–5)</Label>
            <Select
              value={newSkill.level}
              onValueChange={(v) => setNewSkill({ ...newSkill, level: v })}
            >
              <SelectTrigger
                className="bg-input/50"
                data-ocid="skills.level.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((l) => (
                  <SelectItem key={l} value={l.toString()}>
                    {"★".repeat(l)}
                    {"☆".repeat(5 - l)} ({l})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleAddSkill}
          disabled={!newSkill.name.trim()}
          className="bg-primary text-primary-foreground hover:shadow-glow"
          data-ocid="skills.add_button"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Skill
        </Button>
      </div>

      {/* Custom skills list */}
      {customSkills.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden mb-5">
          <div className="px-5 py-3 border-b border-border/20">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Your Custom Skills ({customSkills.length})
            </h3>
          </div>
          <Table data-ocid="skills.table">
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Skill</TableHead>
                <TableHead className="text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-muted-foreground">Level</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customSkills.map((skill, i) => (
                <TableRow
                  key={skill.id}
                  className="border-border/20 hover:bg-white/3"
                  data-ocid={`skills.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {skill.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                      {skill.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-yellow-400">
                      {"★".repeat(skill.level)}
                      {"☆".repeat(5 - skill.level)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteSkill(skill.id)}
                      data-ocid={`skills.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {customSkills.length === 0 && (
        <div
          className="text-center py-10 glass rounded-2xl mb-5"
          data-ocid="skills.empty_state"
        >
          <Code2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No custom skills added yet.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:shadow-glow px-6"
          data-ocid="admin.skills.save_button"
        >
          {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save All Skills"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Live Preview Panel
// ─────────────────────────────────────────
function LivePreviewPanel({ onClose }: { onClose: () => void }) {
  const previewUrl = `${window.location.origin}/?preview=1`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="ml-auto w-full max-w-2xl h-full flex flex-col glass-strong border-l border-border/30"
          style={{ background: "oklch(0.06 0.01 15 / 0.98)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-border/30 flex-shrink-0"
            style={{ background: "oklch(0.08 0.015 15)" }}
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-sm gradient-text">
                Live Preview
              </span>
              <span className="text-xs text-muted-foreground">
                — Save changes first to see updates
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="preview.close_button"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* iframe */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={previewUrl}
              title="Portfolio Preview"
              className="w-full h-full border-0"
              style={{ background: "#000" }}
            />
          </div>

          {/* Refresh bar */}
          <div
            className="flex items-center justify-between px-4 py-2 border-t border-border/30 flex-shrink-0"
            style={{ background: "oklch(0.08 0.015 15)" }}
          >
            <span className="text-xs text-muted-foreground">{previewUrl}</span>
            <button
              type="button"
              onClick={() => {
                const iframe = document.querySelector(
                  'iframe[title="Portfolio Preview"]',
                ) as HTMLIFrameElement;
                if (iframe) {
                  // Force reload the iframe by reassigning its current src
                  const currentSrc = iframe.src;
                  iframe.src = "";
                  iframe.src = currentSrc;
                }
              }}
              className="text-xs text-primary hover:underline"
              data-ocid="preview.button"
            >
              ↺ Refresh
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [previewOpen, setPreviewOpen] = useState(false);

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

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              data-ocid="admin.portfolio.link"
            >
              <Eye className="w-4 h-4" />
              View Portfolio
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="hidden sm:flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:shadow-glow transition-all"
              data-ocid="admin.preview.open_modal_button"
            >
              <Monitor className="w-4 h-4" />
              Preview
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive gap-1.5"
              data-ocid="admin.logout.button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="glass border border-border/30 p-1 h-auto gap-1 w-max">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                data-ocid="admin.projects.tab"
              >
                <LayoutDashboard className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                data-ocid="admin.reviews.tab"
              >
                <Star className="w-4 h-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                data-ocid="admin.contact.tab"
              >
                <User className="w-4 h-4" />
                Contact Info
              </TabsTrigger>
              <TabsTrigger
                value="hero"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                data-ocid="admin.hero.tab"
              >
                <Sparkles className="w-4 h-4" />
                Hero
              </TabsTrigger>
              <TabsTrigger
                value="design"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                data-ocid="admin.design.tab"
              >
                <Palette className="w-4 h-4" />
                Design
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                data-ocid="admin.skills.tab"
              >
                <Code2 className="w-4 h-4" />
                Skills
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="focus-visible:outline-none">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="reviews" className="focus-visible:outline-none">
            <ReviewsTab />
          </TabsContent>
          <TabsContent value="contact" className="focus-visible:outline-none">
            <ContactTab />
          </TabsContent>
          <TabsContent value="hero" className="focus-visible:outline-none">
            <HeroTab />
          </TabsContent>
          <TabsContent value="design" className="focus-visible:outline-none">
            <DesignTab />
          </TabsContent>
          <TabsContent value="skills" className="focus-visible:outline-none">
            <SkillsTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Live Preview Panel */}
      {previewOpen && (
        <LivePreviewPanel onClose={() => setPreviewOpen(false)} />
      )}
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
