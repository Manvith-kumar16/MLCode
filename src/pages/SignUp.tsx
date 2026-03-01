import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, User, Loader2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const perks = [
  "Practice 100+ real-world ML challenges",
  "Built-in Python code editor with instant feedback",
  "Track progress with streaks & submission heatmaps",
  "Compete on the global ML leaderboard",
];

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1015] text-foreground flex">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/6 rounded-full blur-3xl" />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[48%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Blobs */}
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black text-foreground tracking-tight">ML Code</span>
        </Link>

        {/* Center content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
              <Sparkles className="h-3 w-3" /> Free to join
            </div>
            <h1 className="text-4xl font-black leading-tight text-foreground">
              Join a community of{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-primary bg-clip-text text-transparent">
                ML engineers.
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm max-w-sm">
              Create your free account and start practicing the machine learning problems that matter in real interviews and projects.
            </p>
          </div>

          {/* Perk list */}
          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-sm text-muted-foreground">{perk}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-muted-foreground/50">© 2026 ML Code. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black">ML Code</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 backdrop-blur-sm p-8 shadow-2xl">

            <div className="mb-7">
              <h2 className="text-2xl font-black text-foreground">Create account</h2>
              <p className="text-sm text-muted-foreground mt-1">Start your ML journey today — it's free</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 shadow-lg shadow-emerald-500/20"
              >
                {isLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                  : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground/60 mt-4">
              By creating an account, you agree to our{" "}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border/20" />
              <span className="text-xs text-muted-foreground font-medium">Already a member?</span>
              <div className="flex-1 h-px bg-border/20" />
            </div>

            <Link to="/signin"
              className="w-full h-10 rounded-lg border border-border/20 bg-white/[0.03] hover:bg-white/[0.06] text-sm font-semibold flex items-center justify-center text-foreground transition-colors"
            >
              Sign In Instead
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
