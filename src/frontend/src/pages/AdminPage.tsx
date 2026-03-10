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
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Download,
  Eye,
  EyeOff,
  FileImage,
  Globe,
  History,
  ImagePlus,
  Images,
  LayoutDashboard,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Type,
  User,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ContactInfo, Project, Review } from "../backend";
import { sampleProjects } from "../data/sampleData";
import { deleteImages, loadImages, saveImages } from "../lib/imageStore";
import {
  type CustomSkill,
  DEFAULT_DESIGN_SETTINGS,
  DEFAULT_HERO_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SOCIAL_SETTINGS,
  type DesignSettings,
  type HeroSettings,
  type ProjectExtras,
  type SiteSettings,
  type SocialSettings,
  addLocalProject,
  addLocalReview,
  applyDesignToDOM,
  deleteLocalProject,
  deleteLocalReview,
  getLocalContact,
  getLocalCustomSkills,
  getLocalDesignSettings,
  getLocalHeroSettings,
  getLocalProjects,
  getLocalReviews,
  getProjectExtra,
  getSiteSettings,
  getSocialSettings,
  saveLocalContact,
  saveLocalCustomSkills,
  saveLocalDesignSettings,
  saveLocalHeroSettings,
  saveSiteSettings,
  saveSocialSettings,
  updateLocalProject,
  updateLocalReview,
  upsertProjectExtra,
} from "../lib/localDataStore";

// ─────────────────────────────────────────
// Auth Security Types & Helpers
// ─────────────────────────────────────────

const AUTH_STATE_KEY = "admin_auth_state";
const SESSION_KEY = "admin_session_start";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 3;
const PIN_LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PIN_MAX_ATTEMPTS = 3;

interface LoginHistoryEntry {
  timestamp: number;
  success: boolean;
  note?: string;
}

interface AuthState {
  attempts: number;
  lockedUntil: number;
  attemptTimestamps: number[];
  loginHistory: LoginHistoryEntry[];
  // PIN specific
  pinAttempts: number;
  pinLockedUntil: number;
}

function getAuthState(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STATE_KEY);
    if (!raw)
      return {
        attempts: 0,
        lockedUntil: 0,
        attemptTimestamps: [],
        loginHistory: [],
        pinAttempts: 0,
        pinLockedUntil: 0,
      };
    return {
      attempts: 0,
      lockedUntil: 0,
      attemptTimestamps: [],
      loginHistory: [],
      pinAttempts: 0,
      pinLockedUntil: 0,
      ...JSON.parse(raw),
    };
  } catch {
    return {
      attempts: 0,
      lockedUntil: 0,
      attemptTimestamps: [],
      loginHistory: [],
      pinAttempts: 0,
      pinLockedUntil: 0,
    };
  }
}

function saveAuthState(state: AuthState): void {
  localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state));
}

function addLoginHistory(
  state: AuthState,
  success: boolean,
  note?: string,
): AuthState {
  const entry: LoginHistoryEntry = {
    timestamp: Date.now(),
    success,
    note,
  };
  return {
    ...state,
    loginHistory: [entry, ...state.loginHistory].slice(0, 20),
  };
}

// ─────────────────────────────────────────
// PIN Step Component
// ─────────────────────────────────────────
function PinStep({
  onSuccess,
  onBack,
}: { onSuccess: () => void; onBack: () => void }) {
  const [pins, setPins] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRefs = [inputRef0, inputRef1, inputRef2, inputRef3];

  useEffect(() => {
    const state = getAuthState();
    if (state.pinLockedUntil > Date.now()) {
      setLocked(true);
      const secs = Math.ceil((state.pinLockedUntil - Date.now()) / 1000);
      setLockSecondsLeft(secs);
    }
  }, []);

  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      const state = getAuthState();
      const remaining = Math.ceil((state.pinLockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLocked(false);
        setLockSecondsLeft(0);
        // Reset pin attempts after lockout
        const updated = {
          ...state,
          pinAttempts: 0,
          pinLockedUntil: 0,
        };
        saveAuthState(updated);
        clearInterval(interval);
      } else {
        setLockSecondsLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const handlePinChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPins = [...pins];
    newPins[idx] = digit;
    setPins(newPins);
    if (digit && idx < 3) {
      inputRefs[idx + 1].current?.focus();
    }
    // Auto-submit when 4 digits filled
    if (idx === 3 && digit) {
      const fullPin = [...newPins.slice(0, 3), digit].join("");
      if (fullPin.length === 4) {
        handleVerifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pins[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handleVerifyPin = async (pinValue?: string) => {
    const pin = pinValue ?? pins.join("");
    if (pin.length < 4) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 300));

    const storedPin = localStorage.getItem("admin_pin") || "2024";
    const state = getAuthState();

    if (pin === storedPin) {
      const updated = addLoginHistory(
        { ...state, pinAttempts: 0, pinLockedUntil: 0 },
        true,
        "Login successful",
      );
      saveAuthState(updated);
      localStorage.setItem(SESSION_KEY, Date.now().toString());
      onSuccess();
    } else {
      const newAttempts = state.pinAttempts + 1;
      let updated: AuthState;
      if (newAttempts >= PIN_MAX_ATTEMPTS) {
        const lockUntil = Date.now() + PIN_LOCKOUT_DURATION_MS;
        updated = addLoginHistory(
          { ...state, pinAttempts: 0, pinLockedUntil: lockUntil },
          false,
          "Too many PIN attempts — locked",
        );
        saveAuthState(updated);
        setLocked(true);
        setLockSecondsLeft(Math.ceil(PIN_LOCKOUT_DURATION_MS / 1000));
        setError("Too many wrong PINs. Locked for 5 minutes.");
      } else {
        updated = addLoginHistory(
          { ...state, pinAttempts: newAttempts },
          false,
          "Wrong PIN",
        );
        saveAuthState(updated);
        setError(
          `Incorrect PIN. ${PIN_MAX_ATTEMPTS - newAttempts} attempt${PIN_MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`,
        );
        setPins(["", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    }
    setLoading(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "var(--theme-primary-dim)",
          border: "1px solid var(--theme-primary-border)",
        }}
        animate={locked ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{
          repeat: locked ? Number.POSITIVE_INFINITY : 0,
          duration: 1.5,
        }}
      >
        {locked ? (
          <Lock className="w-7 h-7 text-primary" />
        ) : (
          <ShieldCheck className="w-7 h-7 text-primary" />
        )}
      </motion.div>

      <h2 className="font-display text-2xl font-bold text-foreground mb-1">
        Two-Step Verification
      </h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        {locked
          ? `Access locked. Try again in ${formatTime(lockSecondsLeft)}`
          : "Enter your 4-digit security PIN"}
      </p>

      {locked ? (
        <div
          className="w-full text-center py-4 px-6 rounded-xl text-sm font-medium"
          style={{
            background: "oklch(0.63 0.22 25 / 0.12)",
            border: "1px solid oklch(0.63 0.22 25 / 0.3)",
            color: "oklch(0.75 0.20 25)",
          }}
          data-ocid="admin.pin.error_state"
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Locked — {formatTime(lockSecondsLeft)} remaining
        </div>
      ) : (
        <>
          {/* PIN boxes */}
          <div className="flex gap-3 mb-4">
            {pins.map((pin, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional PIN digits
              <motion.div key={idx} whileTap={{ scale: 0.95 }}>
                <input
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-14 h-16 text-center text-2xl font-bold rounded-2xl outline-none transition-all duration-200 bg-transparent"
                  style={{
                    border: pin
                      ? "2px solid var(--theme-primary)"
                      : "2px solid var(--theme-border-line)",
                    color: "var(--theme-primary)",
                    boxShadow: pin
                      ? "0 0 16px var(--theme-primary-glow), inset 0 0 8px var(--theme-primary-dim)"
                      : "none",
                    caretColor: "var(--theme-primary)",
                  }}
                  data-ocid={`admin.pin.input.${idx + 1}`}
                />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-destructive mb-4 text-center"
                data-ocid="admin.pin.error_state"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            onClick={() => handleVerifyPin()}
            disabled={loading || pins.join("").length < 4}
            className="w-full py-5 font-semibold bg-primary text-primary-foreground hover:shadow-glow transition-all duration-200 mb-3"
            data-ocid="admin.pin.submit_button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Verifying PIN...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 w-4 h-4" />
                Verify PIN
              </>
            )}
          </Button>
        </>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-primary transition-colors mt-1"
        data-ocid="admin.pin.back_button"
      >
        ← Back to password
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Auth gate
// ─────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<"password" | "pin">("password");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  // Check lock state on mount
  useEffect(() => {
    const state = getAuthState();
    if (state.lockedUntil > Date.now()) {
      setLocked(true);
      const secs = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      setLockSecondsLeft(secs);
    }
    if (state.attempts > 0) {
      setAttemptsLeft(MAX_ATTEMPTS - state.attempts);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      const state = getAuthState();
      const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLocked(false);
        setLockSecondsLeft(0);
        setAttemptsLeft(null);
        const updated = {
          ...state,
          attempts: 0,
          lockedUntil: 0,
          attemptTimestamps: [],
        };
        saveAuthState(updated);
        clearInterval(interval);
      } else {
        setLockSecondsLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || locked) return;

    const state = getAuthState();

    // Rate limit: max RATE_LIMIT_MAX attempts in RATE_LIMIT_WINDOW_MS
    const now = Date.now();
    const recentAttempts = (state.attemptTimestamps ?? []).filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );
    if (recentAttempts.length >= RATE_LIMIT_MAX) {
      setError("Too many attempts. Please wait 60 seconds.");
      return;
    }

    setLoading(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 450));

    const storedPassword =
      localStorage.getItem("admin_password") || "portfolio2024";

    if (password === storedPassword) {
      // Password correct → advance to PIN step
      const updated = addLoginHistory(
        { ...state, attempts: 0, lockedUntil: 0, attemptTimestamps: [] },
        false, // not fully success yet, PIN step pending
        "Password accepted — awaiting PIN",
      );
      saveAuthState(updated);
      setAttemptsLeft(null);
      setStep("pin");
    } else {
      const newTimestamps = [...(state.attemptTimestamps ?? []), now];
      const newAttempts = state.attempts + 1;
      let updated: AuthState;

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = now + LOCKOUT_DURATION_MS;
        updated = addLoginHistory(
          {
            ...state,
            attempts: 0,
            lockedUntil: lockUntil,
            attemptTimestamps: [],
          },
          false,
          "Account locked after 5 failed attempts",
        );
        saveAuthState(updated);
        setLocked(true);
        setLockSecondsLeft(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setAttemptsLeft(0);
        setError("Too many failed attempts. Access locked for 15 minutes.");
      } else {
        updated = addLoginHistory(
          { ...state, attempts: newAttempts, attemptTimestamps: newTimestamps },
          false,
          "Wrong password",
        );
        saveAuthState(updated);
        const remaining = MAX_ATTEMPTS - newAttempts;
        setAttemptsLeft(remaining);
        setError("Incorrect password.");
      }
    }
    setLoading(false);
  };

  const handleEmergencyReset = () => {
    saveAuthState({
      attempts: 0,
      lockedUntil: 0,
      attemptTimestamps: [],
      loginHistory: getAuthState().loginHistory,
      pinAttempts: 0,
      pinLockedUntil: 0,
    });
    setLocked(false);
    setLockSecondsLeft(0);
    setAttemptsLeft(null);
    setError("");
    setShowEmergencyConfirm(false);
    setPassword("");
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
                "radial-gradient(circle, var(--theme-primary-dim) 0%, transparent 70%)",
            }}
          />

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--theme-primary), var(--theme-accent))",
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

          <AnimatePresence mode="wait">
            {step === "password" ? (
              <motion.div
                key="pw-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex flex-col items-center mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: locked
                        ? "oklch(0.63 0.22 25 / 0.15)"
                        : "var(--theme-primary-dim)",
                      border: locked
                        ? "1px solid oklch(0.63 0.22 25 / 0.3)"
                        : "1px solid var(--theme-primary-border)",
                    }}
                    animate={locked ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                    transition={{
                      repeat: locked ? Number.POSITIVE_INFINITY : 0,
                      duration: 1.5,
                    }}
                  >
                    <Lock
                      className="w-6 h-6"
                      style={{
                        color: locked
                          ? "oklch(0.75 0.20 25)"
                          : "var(--theme-primary)",
                      }}
                    />
                  </motion.div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {locked ? "Access Locked" : "Enter Password"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 text-center">
                    {locked
                      ? `Try again in ${formatTime(lockSecondsLeft)}`
                      : "Step 1 of 2 — Password verification"}
                  </p>
                </div>

                {locked ? (
                  <div
                    className="w-full text-center py-5 px-6 rounded-2xl text-sm font-medium mb-4"
                    style={{
                      background: "oklch(0.63 0.22 25 / 0.10)",
                      border: "1px solid oklch(0.63 0.22 25 / 0.25)",
                      color: "oklch(0.75 0.20 25)",
                    }}
                    data-ocid="admin.lockout.error_state"
                  >
                    <AlertTriangle className="w-5 h-5 inline mr-2 mb-0.5" />
                    <span className="font-semibold">Locked</span> —{" "}
                    {formatTime(lockSecondsLeft)} remaining
                    <div className="text-xs mt-1 opacity-70">
                      Too many failed attempts
                    </div>
                  </div>
                ) : (
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
                          aria-label={
                            showPw ? "Hide password" : "Show password"
                          }
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

                      {attemptsLeft !== null && attemptsLeft > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {attemptsLeft}/{MAX_ATTEMPTS} attempts remaining
                        </p>
                      )}
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
                        <>
                          <Lock className="mr-2 w-4 h-4" />
                          Continue to PIN
                        </>
                      )}
                    </Button>
                  </form>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-ocid="admin.link"
                  >
                    ← Back to Portfolio
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyConfirm(true)}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                    data-ocid="admin.emergency.button"
                  >
                    Emergency Reset
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pin-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <PinStep
                  onSuccess={onSuccess}
                  onBack={() => {
                    setStep("password");
                    setPassword("");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Emergency Reset Confirm Dialog */}
      <Dialog
        open={showEmergencyConfirm}
        onOpenChange={setShowEmergencyConfirm}
      >
        <DialogContent
          className="glass-strong border-border/50 max-w-sm"
          data-ocid="admin.emergency.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Emergency Reset
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will clear all lockout state and attempt counters. Your
            password will NOT be changed.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowEmergencyConfirm(false)}
              className="border-border/50"
              data-ocid="admin.emergency.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmergencyReset}
              data-ocid="admin.emergency.confirm_button"
            >
              Reset Lockout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────
// Project Form
// ─────────────────────────────────────────

/** A single image slot -- can be a new File (to be saved) or an existing stored ID */
interface ImageSlot {
  /** Preview URL for display (object URL for new files, or loaded data URL for existing) */
  previewUrl: string;
  /** If this is a brand-new file picked by the user */
  file?: File;
  /** If this already exists in IndexedDB, its stored ID */
  existingId?: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  link: string;
  featured: boolean;
  order: string;
  // extras
  techTags: string;
  status: "completed" | "in-progress" | "concept";
  year: string;
  // image upload -- uses slots, not raw base64
  imageSlots: ImageSlot[];
  urlInputVisible: boolean; // toggle for the URL fallback
}

const EMPTY_PROJECT: ProjectFormData = {
  title: "",
  description: "",
  imageUrl: "",
  category: "Web Dev",
  link: "",
  featured: false,
  order: "0",
  techTags: "",
  status: "completed",
  year: new Date().getFullYear().toString(),
  imageSlots: [],
  urlInputVisible: false,
};

const CATEGORIES = ["Web Dev", "Design", "AI", "Editing"];

const STATUS_OPTIONS: {
  value: ProjectFormData["status"];
  label: string;
  color: string;
}[] = [
  { value: "completed", label: "Completed", color: "oklch(0.70 0.18 145)" },
  { value: "in-progress", label: "In Progress", color: "oklch(0.72 0.20 65)" },
  { value: "concept", label: "Concept", color: "oklch(0.65 0.05 220)" },
];

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
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new files as slots with object URL previews (no base64, no localStorage bloat)
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imageFiles.length === 0) return;

    const newSlots: ImageSlot[] = imageFiles.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setForm((prev) => ({
      ...prev,
      imageSlots: [...prev.imageSlots, ...newSlots],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const slot = prev.imageSlots[index];
      // Revoke object URL to free memory if it was a new file
      if (slot.file && slot.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(slot.previewUrl);
      }
      return {
        ...prev,
        imageSlots: prev.imageSlots.filter((_, i) => i !== index),
      };
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  useEffect(() => {
    if (project) {
      const extras = getProjectExtra(project.id.toString());
      const imageIds = extras?.imageIds ?? [];

      // Load existing images from IndexedDB as preview slots
      const loadExistingImages = async () => {
        let slots: ImageSlot[] = [];

        if (imageIds.length > 0) {
          const loaded = await loadImages(imageIds);
          slots = imageIds
            .map((id, i) => ({
              previewUrl: loaded[i] ?? "",
              existingId: id,
            }))
            .filter((s) => s.previewUrl !== "");
        } else if (project.imageUrl.startsWith("idb:")) {
          // New format: primary image is stored in IndexedDB with this ID
          const id = project.imageUrl.slice(4);
          const loaded = await loadImages([id]);
          if (loaded[0]) {
            slots = [{ previewUrl: loaded[0], existingId: id }];
          }
        } else if (extras?.extraImages && extras.extraImages.length > 0) {
          // Migration: old base64 data in extraImages
          slots = extras.extraImages.map((dataUrl) => ({
            previewUrl: dataUrl,
          }));
        } else if (project.imageUrl.startsWith("data:image/")) {
          // Old single base64 primary image
          slots = [{ previewUrl: project.imageUrl }];
        }

        // Determine URL input visibility: only show if imageUrl is a plain http(s) URL
        const isIdbRef = project.imageUrl.startsWith("idb:");
        const isBase64 = project.imageUrl.startsWith("data:image/");
        const isHttpUrl = project.imageUrl.startsWith("http");

        setForm({
          title: project.title,
          description: project.description,
          imageUrl: isHttpUrl ? project.imageUrl : "",
          category: project.category,
          link: project.link,
          featured: project.featured,
          order: project.order.toString(),
          techTags: extras?.techTags?.join(", ") ?? "",
          status: extras?.status ?? "completed",
          year: extras?.year ?? new Date().getFullYear().toString(),
          imageSlots: slots,
          urlInputVisible: isHttpUrl,
        });
        void isIdbRef;
        void isBase64; // suppress unused warnings
      };

      loadExistingImages();
    } else {
      setForm(EMPTY_PROJECT);
    }
  }, [project]);

  const techTagsPreview = form.techTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const projectIdStr = project
        ? project.id.toString()
        : `new_${Date.now()}`;

      // Convert all slots to data URLs for IndexedDB storage
      // For new files (File object), read as data URL
      // For existing slots (existingId), keep as-is in IndexedDB
      const dataUrlPromises = form.imageSlots.map(async (slot) => {
        if (slot.file) {
          // New file -- convert to data URL for storage
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(slot.file!);
          });
        }
        if (slot.existingId) {
          // Already stored -- load from IndexedDB
          const existing = await loadImages([slot.existingId]);
          return existing[0] ?? slot.previewUrl;
        }
        // Old base64 slot (migration path)
        return slot.previewUrl;
      });

      const dataUrls = await Promise.all(dataUrlPromises);

      // Save all images to IndexedDB, get back IDs
      const oldIds = getProjectExtra(projectIdStr)?.imageIds ?? [];
      const imageIds = await saveImages(projectIdStr, dataUrls, oldIds);

      // Clean up old IDs that are no longer used
      const removedIds = oldIds.filter((id) => !imageIds.includes(id));
      if (removedIds.length > 0) {
        await deleteImages(removedIds);
      }

      // Use first image ID as primary reference (stored as "idb:<id>" in project record)
      // This avoids storing large base64 data in localStorage which causes quota errors
      const primaryImage =
        imageIds.length > 0 ? `idb:${imageIds[0]}` : form.imageUrl || "";

      let savedId: bigint;
      if (project) {
        updateLocalProject(
          project.id,
          form.title,
          form.description,
          primaryImage,
          form.category,
          form.link,
          form.featured,
          BigInt(Number.parseInt(form.order) || 0),
        );
        savedId = project.id;
        toast.success("Project updated successfully");
      } else {
        const newProject = addLocalProject(
          form.title,
          form.description,
          primaryImage,
          form.category,
          form.link,
          form.featured,
          BigInt(Number.parseInt(form.order) || 0),
        );
        savedId = newProject.id;
        toast.success("Project added successfully");
      }

      // Save extras with imageIds (NOT base64 data)
      const extras: ProjectExtras = {
        id: savedId.toString(),
        techTags: form.techTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
        year: form.year,
        imageIds,
      };
      upsertProjectExtra(extras);

      // Revoke any object URLs we created
      for (const slot of form.imageSlots) {
        if (slot.file && slot.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Save project error:", err);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="glass-strong max-w-lg border-border/50 max-h-[90vh] overflow-y-auto"
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
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as ProjectFormData["status"] })
                }
              >
                <SelectTrigger
                  className="bg-input/50"
                  data-ocid="project.status.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2024"
                className="bg-input/50"
                data-ocid="project.year.input"
              />
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
            <Label>Tech Tags</Label>
            <Input
              value={form.techTags}
              onChange={(e) => setForm({ ...form, techTags: e.target.value })}
              placeholder="React, Node.js, Figma"
              className="bg-input/50"
              data-ocid="project.tags.input"
            />
            {techTagsPreview.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {techTagsPreview.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.65 0.26 20 / 0.15)",
                      border: "1px solid oklch(0.65 0.26 20 / 0.3)",
                      color: "oklch(0.78 0.22 22)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ─── Multi-Image Upload ─── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5 text-primary" />
                Project Images
              </Label>
              {form.imageSlots.length > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "oklch(0.65 0.26 20 / 0.15)",
                    border: "1px solid oklch(0.65 0.26 20 / 0.3)",
                    color: "oklch(0.78 0.22 22)",
                  }}
                >
                  {form.imageSlots.length}{" "}
                  {form.imageSlots.length === 1 ? "image" : "images"} selected
                </span>
              )}
            </div>

            {/* Dropzone */}
            <div
              data-ocid="project.dropzone"
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
                dragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-border/40"
              }`}
              style={{ minHeight: "90px" }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                data-ocid="project.upload_button"
                onChange={(e) => handleFilesSelected(e.target.files)}
                onClick={(e) => {
                  // Reset value so same file can be re-selected
                  (e.target as HTMLInputElement).value = "";
                }}
              />

              {form.imageSlots.length === 0 ? (
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-center py-6 px-4 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{
                      background: "oklch(0.65 0.26 20 / 0.12)",
                      border: "1px solid oklch(0.65 0.26 20 / 0.25)",
                    }}
                  >
                    <ImagePlus className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80">
                    Click to upload or drag images here
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    JPG, PNG, WebP accepted · Multiple images allowed
                  </p>
                </button>
              ) : (
                <div className="p-3">
                  {/* Thumbnail grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {form.imageSlots.map((slot, idx) => (
                      <div
                        key={
                          slot.existingId ?? slot.previewUrl.slice(0, 40) + idx
                        }
                        className="relative group rounded-lg overflow-hidden aspect-video"
                        style={{ background: "oklch(0.12 0.01 15)" }}
                      >
                        {slot.previewUrl ? (
                          <img
                            src={slot.previewUrl}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        {idx === 0 && (
                          <div
                            className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: "oklch(0.65 0.26 20 / 0.9)",
                              color: "#fff",
                            }}
                          >
                            PRIMARY
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "oklch(0.25 0.05 15 / 0.85)" }}
                          aria-label={`Remove image ${idx + 1}`}
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {/* Add more button */}
                    <button
                      type="button"
                      className="rounded-lg border-2 border-dashed border-border/40 flex flex-col items-center justify-center aspect-video hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] mt-0.5">Add more</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* URL fallback toggle */}
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  urlInputVisible: !prev.urlInputVisible,
                }))
              }
            >
              {form.urlInputVisible ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {form.urlInputVisible
                ? "Hide URL input"
                : "Or enter image URL instead"}
            </button>

            {form.urlInputVisible && (
              <div className="space-y-1">
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                  className="bg-input/50 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  URL is used only if no images are uploaded above.
                </p>
              </div>
            )}
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
// Status Badge helper
// ─────────────────────────────────────────
function StatusBadge({ status }: { status: ProjectExtras["status"] }) {
  const map = {
    completed: {
      label: "Completed",
      color: "oklch(0.70 0.18 145)",
      bg: "oklch(0.70 0.18 145 / 0.12)",
    },
    "in-progress": {
      label: "In Progress",
      color: "oklch(0.72 0.20 65)",
      bg: "oklch(0.72 0.20 65 / 0.12)",
    },
    concept: {
      label: "Concept",
      color: "oklch(0.65 0.05 220)",
      bg: "oklch(0.65 0.05 220 / 0.12)",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color.replace(")", " / 0.3)")}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────
// Projects Tab
// ─────────────────────────────────────────
interface ProjectsTabProps {
  onSaved?: () => void;
}

function ProjectsTab({ onSaved }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
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
      onSaved?.();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleImportDefaults = () => {
    setImporting(true);
    try {
      const existing = getLocalProjects();
      const existingIds = new Set(existing.map((p) => p.id.toString()));
      let added = 0;
      for (const sp of sampleProjects) {
        if (!existingIds.has(sp.id.toString())) {
          addLocalProject(
            sp.title,
            sp.description,
            sp.imageUrl,
            sp.category,
            sp.link,
            sp.featured,
            sp.order,
          );
          added++;
        }
      }
      if (added > 0) {
        toast.success(
          `${added} default project${added > 1 ? "s" : ""} imported! You can now edit or delete them.`,
        );
      } else {
        toast.info("All default projects are already imported.");
      }
      load();
      onSaved?.();
    } catch {
      toast.error("Failed to import default projects");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportDefaults}
            disabled={importing}
            className="border-border/50 text-muted-foreground hover:text-foreground gap-1.5"
            data-ocid="admin.import_defaults_button"
          >
            {importing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Import Defaults
          </Button>
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
          <p className="text-muted-foreground">No projects added yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-2 mb-4">
            Import default projects or add your own.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportDefaults}
            disabled={importing}
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
          >
            {importing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Import Default Projects
          </Button>
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
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">
                  Tags
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
              {projects.map((project, i) => {
                const extras = getProjectExtra(project.id.toString());
                return (
                  <TableRow
                    key={project.id.toString()}
                    className="border-border/20 hover:bg-white/3 transition-colors"
                    data-ocid={`admin.project.row.${i + 1}`}
                  >
                    <TableCell>
                      <div className="font-medium text-sm truncate max-w-40">
                        {project.title}
                      </div>
                      {extras?.year && (
                        <div className="text-xs text-muted-foreground/60 mt-0.5">
                          {extras.year}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                        {project.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {extras?.status ? (
                        <StatusBadge status={extras.status} />
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {extras?.techTags && extras.techTags.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {extras.techTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: "oklch(0.65 0.26 20 / 0.1)",
                                color: "oklch(0.75 0.18 22)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {extras.techTags.length > 2 && (
                            <span className="text-xs text-muted-foreground/60">
                              +{extras.techTags.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-sm">
                          —
                        </span>
                      )}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        project={editProject}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          load();
          onSaved?.();
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Reviews Tab
// ─────────────────────────────────────────
interface ReviewsTabProps {
  onSaved?: () => void;
}

function ReviewsTab({ onSaved }: ReviewsTabProps) {
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
      onSaved?.();
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
        onSaved={() => {
          load();
          onSaved?.();
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Contact Tab (with Social Media)
// ─────────────────────────────────────────
interface ContactTabProps {
  onSaved?: () => void;
}

function ContactTab({ onSaved }: ContactTabProps) {
  const [form, setForm] = useState<ContactInfo>({
    name: "",
    title: "",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
  const [social, setSocial] = useState<SocialSettings>({
    ...DEFAULT_SOCIAL_SETTINGS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const localContact = getLocalContact();
    if (localContact) {
      setForm(localContact);
    }
    setSocial(getSocialSettings());
    setLoading(false);
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveLocalContact(form);
      saveSocialSettings(social);
      toast.success("Contact info & social media saved!");
      onSaved?.();
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

      <div className="space-y-5">
        {/* Basic Info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Basic Information
          </h3>

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
        </div>

        {/* Social Media */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Social Media
            <span className="text-xs text-muted-foreground font-normal">
              (additional platforms)
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  }}
                >
                  📷
                </span>
                Instagram Handle
              </Label>
              <Input
                value={social.instagram ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, instagram: e.target.value })
                }
                placeholder="@username"
                className="bg-input/50"
                data-ocid="contact.instagram.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span className="text-sm">▶️</span>
                YouTube Channel
              </Label>
              <Input
                value={social.youtube ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, youtube: e.target.value })
                }
                placeholder="channel name or URL"
                className="bg-input/50"
                data-ocid="contact.youtube.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span className="text-sm">🎨</span>
                Behance Username
              </Label>
              <Input
                value={social.behance ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, behance: e.target.value })
                }
                placeholder="yourusername"
                className="bg-input/50"
                data-ocid="contact.behance.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span className="text-sm">🏀</span>
                Dribbble Username
              </Label>
              <Input
                value={social.dribbble ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, dribbble: e.target.value })
                }
                placeholder="yourusername"
                className="bg-input/50"
                data-ocid="contact.dribbble.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                Discord Username
              </Label>
              <Input
                value={social.discord ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, discord: e.target.value })
                }
                placeholder="user#1234 or username"
                className="bg-input/50"
                data-ocid="contact.discord.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <span className="text-sm">📱</span>
                WhatsApp Number
              </Label>
              <Input
                value={social.whatsapp ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, whatsapp: e.target.value })
                }
                placeholder="+91XXXXXXXXXX"
                className="bg-input/50"
                data-ocid="contact.whatsapp.input"
              />
            </div>
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
            {saving ? "Saving..." : "Save Contact & Social"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Hero Tab
// ─────────────────────────────────────────
interface HeroTabProps {
  onSaved?: () => void;
}

function HeroTab({ onSaved }: HeroTabProps) {
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
      toast.success("Hero settings saved!");
      onSaved?.();
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
              // biome-ignore lint/suspicious/noArrayIndexKey: stats are positional
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
  { value: "Inter", label: "Inter (Clean)" },
  { value: "Outfit", label: "Outfit (Modern)" },
  { value: "Sora", label: "Sora (Rounded)" },
  { value: "Figtree", label: "Figtree (Friendly)" },
  { value: "Playfair Display", label: "Playfair (Elegant)" },
  { value: "Bricolage Grotesque", label: "Bricolage (Bold)" },
  { value: "Space Grotesk", label: "Space Grotesk (Tech)" },
  { value: "DM Sans", label: "DM Sans (Minimal)" },
];

const THEME_PRESETS: Array<{
  id: DesignSettings["themePreset"];
  label: string;
  hue: number;
  chroma: number;
  bg: DesignSettings["bgStyle"];
  color: string;
  emoji: string;
}> = [
  {
    id: "neon-red",
    label: "Neon Red",
    hue: 20,
    chroma: 0.26,
    bg: "pure-black",
    color: "oklch(0.65 0.26 20)",
    emoji: "🔴",
  },
  {
    id: "neon-blue",
    label: "Neon Blue",
    hue: 230,
    chroma: 0.24,
    bg: "pure-black",
    color: "oklch(0.60 0.24 230)",
    emoji: "🔵",
  },
  {
    id: "neon-green",
    label: "Neon Green",
    hue: 145,
    chroma: 0.24,
    bg: "pure-black",
    color: "oklch(0.65 0.24 145)",
    emoji: "🟢",
  },
  {
    id: "neon-purple",
    label: "Neon Purple",
    hue: 280,
    chroma: 0.26,
    bg: "pure-black",
    color: "oklch(0.62 0.26 280)",
    emoji: "🟣",
  },
  {
    id: "neon-pink",
    label: "Neon Pink",
    hue: 330,
    chroma: 0.28,
    bg: "pure-black",
    color: "oklch(0.65 0.28 330)",
    emoji: "🩷",
  },
  {
    id: "neon-gold",
    label: "Neon Gold",
    hue: 60,
    chroma: 0.22,
    bg: "dark-gray",
    color: "oklch(0.75 0.22 60)",
    emoji: "🟡",
  },
  {
    id: "cyber-teal",
    label: "Cyber Teal",
    hue: 185,
    chroma: 0.22,
    bg: "dark-gray",
    color: "oklch(0.65 0.22 185)",
    emoji: "🩵",
  },
  {
    id: "solar-orange",
    label: "Solar Orange",
    hue: 45,
    chroma: 0.26,
    bg: "deep-red",
    color: "oklch(0.70 0.26 45)",
    emoji: "🟠",
  },
  {
    id: "custom",
    label: "Custom",
    hue: 20,
    chroma: 0.26,
    bg: "pure-black",
    color: "oklch(0.65 0.26 20)",
    emoji: "🎨",
  },
];

const COLOR_PRESETS = [
  { label: "Red", hue: 20, chroma: 0.26, color: "oklch(0.65 0.26 20)" },
  { label: "Orange", hue: 45, chroma: 0.26, color: "oklch(0.68 0.26 45)" },
  { label: "Gold", hue: 60, chroma: 0.22, color: "oklch(0.75 0.22 60)" },
  { label: "Green", hue: 145, chroma: 0.24, color: "oklch(0.65 0.24 145)" },
  { label: "Teal", hue: 185, chroma: 0.22, color: "oklch(0.65 0.22 185)" },
  { label: "Blue", hue: 230, chroma: 0.24, color: "oklch(0.60 0.24 230)" },
  { label: "Purple", hue: 280, chroma: 0.26, color: "oklch(0.62 0.26 280)" },
  { label: "Pink", hue: 330, chroma: 0.28, color: "oklch(0.65 0.28 330)" },
];

interface DesignTabProps {
  onSaved?: () => void;
}

function DesignTab({ onSaved }: DesignTabProps) {
  const [form, setForm] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(getLocalDesignSettings());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveLocalDesignSettings(form);
      // Apply CSS variables immediately so changes are visible without page reload
      applyDesignToDOM(form);
      toast.success("Design settings saved! Changes applied live.");
      onSaved?.();
    } catch {
      toast.error("Failed to save design settings");
    } finally {
      setSaving(false);
    }
  };

  const previewColor = `oklch(0.65 ${form.primaryColorChroma ?? 0.26} ${form.primaryColorHue})`;

  const applyThemePreset = (preset: (typeof THEME_PRESETS)[0]) => {
    if (preset.id === "custom") {
      setForm({ ...form, themePreset: "custom" });
      return;
    }
    setForm({
      ...form,
      themePreset: preset.id,
      primaryColorHue: preset.hue,
      primaryColorChroma: preset.chroma,
      bgStyle: preset.bg,
    });
  };

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
        {/* Theme Presets */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Theme Presets
            <span className="text-xs text-muted-foreground font-normal">
              (one-click themes)
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyThemePreset(preset)}
                className={`relative rounded-xl p-3 border-2 transition-all duration-200 text-left flex items-center gap-2 ${
                  form.themePreset === preset.id
                    ? "border-primary bg-primary/10 shadow-[0_0_10px_oklch(0.65_0.26_20/0.3)]"
                    : "border-border/30 hover:border-border/60"
                }`}
                data-ocid={`design.theme.${preset.id}.button`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
                  style={{
                    background: `radial-gradient(circle, ${preset.color}, oklch(0.15 0.02 ${preset.hue}))`,
                    boxShadow: `0 0 8px ${preset.color}60`,
                  }}
                >
                  {preset.emoji}
                </div>
                <div>
                  <div className="text-xs font-semibold leading-tight">
                    {preset.label}
                  </div>
                </div>
                {form.themePreset === preset.id && (
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background Style */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Background Style
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
              {
                value: "deep-blue" as const,
                label: "Deep Blue",
                bg: "#020614",
              },
              {
                value: "deep-purple" as const,
                label: "Deep Purple",
                bg: "#0d0514",
              },
              { value: "midnight" as const, label: "Midnight", bg: "#080c14" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    bgStyle: opt.value,
                    themePreset: "custom",
                  })
                }
                className={`relative rounded-xl p-2 border-2 transition-all duration-200 text-center ${
                  form.bgStyle === opt.value
                    ? "border-primary"
                    : "border-border/30 hover:border-border/60"
                }`}
                data-ocid={`design.bg.${opt.value}.button`}
              >
                <div
                  className="w-full h-8 rounded-lg mb-1.5"
                  style={{ backgroundColor: opt.bg }}
                />
                <span className="text-[10px] font-medium leading-tight block">
                  {opt.label}
                </span>
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
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl border border-border/30 flex-shrink-0"
              style={{
                backgroundColor: previewColor,
                boxShadow: `0 0 16px ${previewColor}60`,
              }}
            />
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Hue: {form.primaryColorHue}°</span>
                  <span style={{ color: previewColor }}>Color</span>
                </div>
                <Slider
                  value={[form.primaryColorHue]}
                  onValueChange={([v]) =>
                    setForm({
                      ...form,
                      primaryColorHue: v,
                      themePreset: "custom",
                    })
                  }
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                  data-ocid="design.color.hue.input"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>
                    Saturation:{" "}
                    {Math.round((form.primaryColorChroma ?? 0.26) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[Math.round((form.primaryColorChroma ?? 0.26) * 100)]}
                  onValueChange={([v]) =>
                    setForm({
                      ...form,
                      primaryColorChroma: v / 100,
                      themePreset: "custom",
                    })
                  }
                  min={5}
                  max={37}
                  step={1}
                  className="w-full"
                  data-ocid="design.color.chroma.input"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hue}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    primaryColorHue: preset.hue,
                    primaryColorChroma: preset.chroma,
                    themePreset: "custom",
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  form.primaryColorHue === preset.hue &&
                  form.themePreset === "custom"
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
                {level === "low"
                  ? "⬇ Low"
                  : level === "medium"
                    ? "◼ Medium"
                    : "⬆ High"}
              </button>
            ))}
          </div>
        </div>

        {/* Card & Button Style */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Card Style
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["glass", "solid", "minimal", "bordered"] as const).map(
              (style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setForm({ ...form, cardStyle: style })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 capitalize transition-all ${
                    form.cardStyle === style
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:border-border/60"
                  }`}
                  data-ocid={`design.card.${style}.button`}
                >
                  {style === "glass"
                    ? "✨ Glass"
                    : style === "solid"
                      ? "■ Solid"
                      : style === "minimal"
                        ? "○ Minimal"
                        : "□ Bordered"}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Button Style */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Button Style
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(["rounded", "pill", "sharp"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setForm({ ...form, buttonStyle: style })}
                className={`py-2.5 px-4 rounded-xl text-xs font-medium border-2 capitalize transition-all ${
                  form.buttonStyle === style
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/30 text-muted-foreground hover:border-border/60"
                }`}
                data-ocid={`design.button.${style}.button`}
              >
                {style === "rounded"
                  ? "⬭ Rounded"
                  : style === "pill"
                    ? "⬭ Pill"
                    : "▭ Sharp"}
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

interface SkillsTabProps {
  onSaved?: () => void;
}

function SkillsTab({ onSaved }: SkillsTabProps) {
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
    onSaved?.();
  };

  const handleDeleteSkill = (id: string) => {
    const updated = customSkills.filter((s) => s.id !== id);
    setCustomSkills(updated);
    saveLocalCustomSkills(updated);
    toast.success("Skill removed");
    onSaved?.();
  };

  const handleSaveAll = () => {
    setSaving(true);
    try {
      saveLocalCustomSkills(customSkills);
      toast.success("Skills saved successfully!");
      onSaved?.();
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
// Site Settings Tab
// ─────────────────────────────────────────
interface SiteSettingsTabProps {
  onSaved?: () => void;
}

function SiteSettingsTab({ onSaved }: SiteSettingsTabProps) {
  const [form, setForm] = useState<SiteSettings>({ ...DEFAULT_SITE_SETTINGS });
  const [saving, setSaving] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(getSiteSettings());
  }, []);

  const handleLogoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoImageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const updateNavLink = (i: number, field: "label" | "href", value: string) => {
    const updated = [...form.headerNavLinks];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, headerNavLinks: updated });
  };

  const addNavLink = () => {
    setForm({
      ...form,
      headerNavLinks: [
        ...form.headerNavLinks,
        { label: "New Link", href: "#section" },
      ],
    });
  };

  const removeNavLink = (i: number) => {
    setForm({
      ...form,
      headerNavLinks: form.headerNavLinks.filter((_, idx) => idx !== i),
    });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      saveSiteSettings(form);
      toast.success("Site settings saved!");
      onSaved?.();
    } catch {
      toast.error("Failed to save site settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Site Settings</h2>
          <p className="text-sm text-muted-foreground">
            Logo, name, header, footer and advanced settings
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Identity */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-primary" />
            Site Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Site Name</Label>
              <Input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                placeholder="Ganesh Raikwar"
                className="bg-input/50"
                data-ocid="site.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Site Tagline</Label>
              <Input
                value={form.siteTagline}
                onChange={(e) =>
                  setForm({ ...form, siteTagline: e.target.value })
                }
                placeholder="Full-Stack Developer"
                className="bg-input/50"
                data-ocid="site.tagline.input"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FileImage className="w-3.5 h-3.5 text-primary" />
            Logo
          </h3>

          <div className="flex items-start gap-4">
            {/* Logo preview */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                background: form.logoImageUrl
                  ? undefined
                  : "linear-gradient(135deg, oklch(0.75 0.24 22), oklch(0.55 0.28 10))",
              }}
            >
              {form.logoImageUrl ? (
                <img
                  src={form.logoImageUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-bold text-lg text-white">
                  {form.logoText?.slice(0, 2) || "GR"}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="space-y-1.5">
                <Label>Logo Text (initials)</Label>
                <Input
                  value={form.logoText}
                  onChange={(e) =>
                    setForm({ ...form, logoText: e.target.value })
                  }
                  placeholder="GR"
                  className="bg-input/50"
                  maxLength={3}
                  data-ocid="site.logo-text.input"
                />
                <p className="text-xs text-muted-foreground">
                  Shown if no logo image uploaded. Max 3 characters.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleLogoUpload(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoFileRef.current?.click()}
                  className="border-border/50 gap-1.5 text-xs"
                  data-ocid="site.logo.upload_button"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Upload Logo Image
                </Button>
                {form.logoImageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm({ ...form, logoImageUrl: "" })}
                    className="text-destructive hover:bg-destructive/10 text-xs gap-1"
                    data-ocid="site.logo.delete_button"
                  >
                    <X className="w-3 h-3" />
                    Remove Image
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header Settings */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-primary" />
            Header & Navigation
          </h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <Label className="text-sm font-medium">Sticky Header</Label>
              <p className="text-xs text-muted-foreground">
                Header stays visible when scrolling
              </p>
            </div>
            <Switch
              checked={form.headerSticky}
              onCheckedChange={(v) => setForm({ ...form, headerSticky: v })}
              data-ocid="site.header-sticky.switch"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Nav Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNavLink}
                className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
                data-ocid="site.nav.add_button"
              >
                <Plus className="w-3 h-3" />
                Add Link
              </Button>
            </div>
            <div className="space-y-2">
              {form.headerNavLinks.map((link, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional nav links
                  key={i}
                  className="flex items-center gap-2"
                  data-ocid={`site.nav.item.${i + 1}`}
                >
                  <Input
                    value={link.label}
                    onChange={(e) => updateNavLink(i, "label", e.target.value)}
                    placeholder="Label"
                    className="bg-input/50 text-sm h-8 flex-1"
                    data-ocid={`site.nav.label.${i + 1}`}
                  />
                  <Input
                    value={link.href}
                    onChange={(e) => updateNavLink(i, "href", e.target.value)}
                    placeholder="#section or /page"
                    className="bg-input/50 text-sm h-8 flex-1"
                    data-ocid={`site.nav.href.${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                    onClick={() => removeNavLink(i)}
                    data-ocid={`site.nav.delete_button.${i + 1}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-primary" />
            Footer
          </h3>

          <div className="space-y-1.5">
            <Label>Footer Logo Text</Label>
            <Input
              value={form.footerLogoText}
              onChange={(e) =>
                setForm({ ...form, footerLogoText: e.target.value })
              }
              placeholder="GR"
              className="bg-input/50"
              data-ocid="site.footer-logo.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Footer Tagline</Label>
            <Input
              value={form.footerText}
              onChange={(e) => setForm({ ...form, footerText: e.target.value })}
              placeholder="Built with passion and creativity."
              className="bg-input/50"
              data-ocid="site.footer-text.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Copyright Text</Label>
            <Input
              value={form.footerCopyright}
              onChange={(e) =>
                setForm({ ...form, footerCopyright: e.target.value })
              }
              placeholder="© 2026 Ganesh Raikwar. All rights reserved."
              className="bg-input/50"
              data-ocid="site.footer-copyright.input"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate with current year.
            </p>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <Label className="text-sm font-medium">
                Show Social Icons in Footer
              </Label>
            </div>
            <Switch
              checked={form.footerShowSocial}
              onCheckedChange={(v) => setForm({ ...form, footerShowSocial: v })}
              data-ocid="site.footer-social.switch"
            />
          </div>
        </div>

        {/* Advanced Effects */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Advanced Effects
          </h3>

          {[
            {
              key: "animatedIcons" as const,
              label: "Animated Icons",
              desc: "Icons pulse and glow with animation",
            },
            {
              key: "cursorGlow" as const,
              label: "Cursor Glow Effect",
              desc: "Mouse cursor leaves a glowing trail",
            },
            {
              key: "particleBackground" as const,
              label: "Particle Background",
              desc: "Floating particles in the background",
            },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={form[key] as boolean}
                onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                data-ocid={`site.${key}.switch`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:shadow-glow px-6"
            data-ocid="admin.site.save_button"
          >
            {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Site Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Security Tab
// ─────────────────────────────────────────
function SecurityTab({ onLogout }: { onLogout: () => void }) {
  // ── Change Password ──
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showPws, setShowPws] = useState(false);

  // ── Change PIN ──
  const [curPin, setCurPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinSaving, setPinSaving] = useState(false);

  // ── Login History ──
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);

  // ── Session ──
  const [sessionStart] = useState<number>(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? Number.parseInt(raw) : Date.now();
  });

  useEffect(() => {
    const state = getAuthState();
    setHistory(state.loginHistory ?? []);
  }, []);

  const handleSavePassword = () => {
    const storedPassword =
      localStorage.getItem("admin_password") || "portfolio2024";
    if (curPw !== storedPassword) {
      toast.error("Current password is incorrect");
      return;
    }
    if (!newPw.trim() || newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setPwSaving(true);
    localStorage.setItem("admin_password", newPw);
    toast.success("Password updated successfully!");
    setCurPw("");
    setNewPw("");
    setConfirmPw("");
    setPwSaving(false);
  };

  const handleSavePin = () => {
    const storedPin = localStorage.getItem("admin_pin") || "2024";
    if (curPin !== storedPin) {
      toast.error("Current PIN is incorrect");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      toast.error("New PIN must be exactly 4 digits");
      return;
    }
    setPinSaving(true);
    localStorage.setItem("admin_pin", newPin);
    toast.success("PIN updated successfully!");
    setCurPin("");
    setNewPin("");
    setPinSaving(false);
  };

  const handleClearHistory = () => {
    const state = getAuthState();
    const updated = { ...state, loginHistory: [] };
    saveAuthState(updated);
    setHistory([]);
    toast.success("Login history cleared");
  };

  const formatTs = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSessionDuration = () => {
    const diff = Math.floor((Date.now() - sessionStart) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Security</h2>
          <p className="text-sm text-muted-foreground">
            Password, PIN, and session management
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Change Password */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-primary" />
            Change Password
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showPws ? "text" : "password"}
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-input/50 pr-10"
                  data-ocid="security.cur-password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPws(!showPws)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPws ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type={showPws ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="bg-input/50"
                  data-ocid="security.new-password.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type={showPws ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className="bg-input/50"
                  data-ocid="security.confirm-password.input"
                />
              </div>
            </div>
            <Button
              onClick={handleSavePassword}
              disabled={pwSaving || !curPw || !newPw || !confirmPw}
              className="bg-primary text-primary-foreground hover:shadow-glow"
              data-ocid="security.save-password.button"
            >
              {pwSaving ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 w-4 h-4" />
              )}
              Update Password
            </Button>
          </div>
        </div>

        {/* Change PIN */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-primary" />
            Change PIN
            <span className="text-xs text-muted-foreground font-normal">
              (4-digit second-factor)
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Current PIN</Label>
              <Input
                type="number"
                value={curPin}
                onChange={(e) => setCurPin(e.target.value.slice(0, 4))}
                placeholder="Current 4-digit PIN"
                className="bg-input/50 [appearance:textfield]"
                data-ocid="security.cur-pin.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New PIN</Label>
              <Input
                type="number"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                placeholder="New 4-digit PIN"
                className="bg-input/50 [appearance:textfield]"
                data-ocid="security.new-pin.input"
              />
            </div>
          </div>
          <Button
            onClick={handleSavePin}
            disabled={pinSaving || !curPin || !newPin}
            className="bg-primary text-primary-foreground hover:shadow-glow"
            data-ocid="security.save-pin.button"
          >
            {pinSaving ? (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 w-4 h-4" />
            )}
            Update PIN
          </Button>
        </div>

        {/* Login History */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              Login History
              <span className="text-xs text-muted-foreground font-normal">
                (last {Math.min(history.length, 5)})
              </span>
            </h3>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-xs text-muted-foreground hover:text-destructive h-7 gap-1"
                data-ocid="security.clear-history.button"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <div
              className="text-center py-8"
              data-ocid="security.history.empty_state"
            >
              <History className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No login history yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((entry, i) => (
                <div
                  key={`${entry.timestamp}-${i}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{
                    background: entry.success
                      ? "oklch(0.70 0.18 145 / 0.06)"
                      : "oklch(0.63 0.22 25 / 0.06)",
                    border: `1px solid ${entry.success ? "oklch(0.70 0.18 145 / 0.15)" : "oklch(0.63 0.22 25 / 0.15)"}`,
                  }}
                  data-ocid={`security.history.item.${i + 1}`}
                >
                  <div className="flex items-center gap-2.5">
                    {entry.success ? (
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "oklch(0.70 0.18 145)" }}
                      />
                    ) : (
                      <AlertTriangle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "oklch(0.63 0.22 25)" }}
                      />
                    )}
                    <div>
                      <div className="text-xs font-medium">
                        {entry.success ? (
                          <span style={{ color: "oklch(0.70 0.18 145)" }}>
                            Success
                          </span>
                        ) : (
                          <span style={{ color: "oklch(0.75 0.20 25)" }}>
                            Failed
                          </span>
                        )}
                        {entry.note && (
                          <span className="text-muted-foreground font-normal ml-1.5">
                            — {entry.note}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTs(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Session */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-primary" />
            Active Session
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Session started:{" "}
                {new Date(sessionStart).toLocaleTimeString("en-IN")}
                <span className="text-primary ml-1">
                  ({formatSessionDuration()} ago)
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem(SESSION_KEY);
                onLogout();
              }}
              className="text-destructive hover:bg-destructive/10 gap-1.5"
              data-ocid="security.logout.button"
            >
              <LogOut className="w-4 h-4" />
              Logout & Clear Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Inline Preview Pane (desktop sidebar)
// ─────────────────────────────────────────
interface InlinePreviewPaneProps {
  version: number;
  onClose: () => void;
}

function InlinePreviewPane({ version, onClose }: InlinePreviewPaneProps) {
  const previewUrl = `${window.location.origin}/`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "";
      iframeRef.current.src = previewUrl;
    }
  };

  return (
    <div
      className="flex flex-col h-full border-l border-border/30"
      style={{ background: "oklch(0.06 0.01 15)" }}
    >
      {/* Pane header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 flex-shrink-0"
        style={{ background: "oklch(0.08 0.015 15)" }}
      >
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-sm gradient-text">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"
            title="Refresh preview"
            data-ocid="preview.button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
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
      </div>

      {/* iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          key={version}
          src={previewUrl}
          title="Portfolio Preview"
          className="w-full h-full border-0"
          style={{ background: "#000" }}
        />
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t border-border/30 flex-shrink-0"
        style={{ background: "oklch(0.08 0.015 15)" }}
      >
        <span className="text-xs text-muted-foreground truncate max-w-[220px]">
          {previewUrl}
        </span>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0"
        >
          Open ↗
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Fullscreen Preview Panel (mobile)
// ─────────────────────────────────────────
function MobilePreviewPanel({ onClose }: { onClose: () => void }) {
  const previewUrl = `${window.location.origin}/`;

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
  const [previewVersion, setPreviewVersion] = useState(0);

  const handleSaved = useCallback(() => {
    setPreviewVersion((v) => v + 1);
  }, []);

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
              onClick={() => setPreviewOpen(!previewOpen)}
              className={`items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:shadow-glow transition-all ${
                previewOpen ? "bg-primary/15 shadow-glow" : ""
              }`}
              data-ocid="admin.preview.open_modal_button"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">
                {previewOpen ? "Hide Preview" : "Preview"}
              </span>
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

      {/* Body: split layout on lg+ when preview open */}
      <div className={`flex ${previewOpen ? "lg:h-[calc(100vh-64px)]" : ""}`}>
        {/* Main content */}
        <main
          className={`flex-1 min-w-0 overflow-y-auto ${previewOpen ? "lg:h-[calc(100vh-64px)]" : ""}`}
        >
          <div className="container mx-auto px-6 py-8">
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
                  <TabsTrigger
                    value="site"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                    data-ocid="admin.site.tab"
                  >
                    <Settings className="w-4 h-4" />
                    Site
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4 py-2.5 text-sm font-medium gap-2 whitespace-nowrap"
                    data-ocid="admin.security.tab"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Security
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="projects"
                className="focus-visible:outline-none"
              >
                <ProjectsTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent
                value="reviews"
                className="focus-visible:outline-none"
              >
                <ReviewsTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent
                value="contact"
                className="focus-visible:outline-none"
              >
                <ContactTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent value="hero" className="focus-visible:outline-none">
                <HeroTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent
                value="design"
                className="focus-visible:outline-none"
              >
                <DesignTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent
                value="skills"
                className="focus-visible:outline-none"
              >
                <SkillsTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent value="site" className="focus-visible:outline-none">
                <SiteSettingsTab onSaved={handleSaved} />
              </TabsContent>
              <TabsContent
                value="security"
                className="focus-visible:outline-none"
              >
                <SecurityTab onLogout={onLogout} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Inline preview pane (desktop only when open) */}
        {previewOpen && (
          <aside className="hidden lg:flex flex-col w-[420px] flex-shrink-0 sticky top-16 h-[calc(100vh-64px)]">
            <InlinePreviewPane
              version={previewVersion}
              onClose={() => setPreviewOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Mobile fullscreen preview (only on small screens) */}
      {previewOpen && (
        <div className="lg:hidden">
          <MobilePreviewPanel onClose={() => setPreviewOpen(false)} />
        </div>
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
