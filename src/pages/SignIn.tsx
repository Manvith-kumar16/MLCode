import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, Loader2, ArrowRight, Sparkles, Code2, BarChart3, Trophy } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const features = [
  { icon: Code2,    label: "Real-world ML Problems",   desc: "Curated challenges across 10+ ML topics" },
  { icon: BarChart3, label: "Track Your Progress",      desc: "Heatmaps, streaks, and detailed stats" },
  { icon: Trophy,   label: "Compete Globally",          desc: "Live leaderboard with global rankings" },
];

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoading(true);
      const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const text = await response.text();
      const data = JSON.parse(text);
      if (!response.ok) throw new Error(data.message || "Google Sign In Failed");
      localStorage.setItem("token", data.token);
      toast.success("Signed in successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      localStorage.setItem("token", data.token);
      toast.success("Signed in successfully!");
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
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/6 rounded-full blur-3xl" />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[48%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
              <Sparkles className="h-3 w-3" /> The ML Practice Platform
            </div>
            <h1 className="text-4xl font-black leading-tight text-foreground">
              Master Machine Learning{" "}
              <span className="bg-gradient-to-r from-orange-400 to-primary bg-clip-text text-transparent">
                faster than ever.
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm max-w-sm">
              Practice real-world ML challenges, track your progress with heatmaps, and compete with engineers globally.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-border/10 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
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
          {/* Card */}
          <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 backdrop-blur-sm p-8 shadow-2xl">

            <div className="mb-7">
              <h2 className="text-2xl font-black text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue your ML journey</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg bg-gradient-to-r from-orange-500 to-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
              >
                {isLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                  : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border/20" />
              <span className="text-xs text-muted-foreground font-medium">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-border/20" />
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Sign In Failed")}
                theme="filled_black"
                size="large"
                width="320"
              />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:opacity-80 transition-opacity">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
