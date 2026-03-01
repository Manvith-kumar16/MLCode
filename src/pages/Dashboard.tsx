import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Target, Award, TrendingUp, ArrowRight, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import SubmissionHeatmap from "@/components/SubmissionHeatmap";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/signin"); return; }
        const headers = { "auth-token": token, "Content-Type": "application/json" };

        const userRes = await fetch("http://localhost:5001/api/auth/me", { headers });
        if (!userRes.ok) throw new Error("Failed to fetch user data");
        const userData = await userRes.json();
        setUser(userData);

        const subRes = await fetch(`http://localhost:5001/api/submissions/user/${userData._id}`, { headers });
        if (subRes.ok) setSubmissions(await subRes.json());

        const statsRes = await fetch(`http://localhost:5001/api/submissions/stats/${userData._id}`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setHeatmapData(statsData.map((s: any) => ({ date: s._id, count: s.count })));
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const { rank = 0, points = 0, streak = { current: 0 }, problemsSolved = { easy: 0, medium: 0, hard: 0 } } = user;
  const totalSolved = problemsSolved.easy + problemsSolved.medium + problemsSolved.hard;

  const statCards = [
    {
      label: "Problems Solved",
      value: totalSolved,
      icon: Target,
      gradient: "from-orange-500/20 to-primary/10",
      border: "border-orange-500/20",
      iconColor: "text-orange-500",
      glow: "shadow-orange-500/10",
    },
    {
      label: "Current Streak",
      value: `${streak.current}d`,
      icon: Flame,
      gradient: "from-red-500/20 to-orange-500/10",
      border: "border-red-500/20",
      iconColor: "text-red-400",
      glow: "shadow-red-500/10",
    },
    {
      label: "Total Points",
      value: points,
      icon: Award,
      gradient: "from-emerald-500/20 to-green-500/10",
      border: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    {
      label: "Global Rank",
      value: rank === 0 ? "—" : `#${rank}`,
      icon: TrendingUp,
      gradient: "from-blue-500/20 to-indigo-500/10",
      border: "border-blue-500/20",
      iconColor: "text-blue-400",
      glow: "shadow-blue-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e1015] text-foreground">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30" />
              : <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center text-sm font-bold text-white ring-2 ring-primary/30">{user.name?.charAt(0).toUpperCase()}</div>
            }
            <div>
              <h1 className="text-xl font-bold">Welcome back, <span className="text-primary">{user.name?.split(" ")[0]}</span> 👋</h1>
              <p className="text-xs text-muted-foreground">Here's your ML learning progress</p>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 overflow-hidden shadow-lg ${card.glow} backdrop-blur-sm`}
            >
              {/* icon bg glow */}
              <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/5 blur-lg" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center ${card.iconColor}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight">{card.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Difficulty Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <h2 className="font-semibold text-sm text-foreground/80 mb-5">By Difficulty</h2>
            <div className="space-y-4">
              {[
                { label: "Easy", solved: problemsSolved.easy, color: "bg-emerald-500", text: "text-emerald-500", glow: "shadow-emerald-500/30" },
                { label: "Medium", solved: problemsSolved.medium, color: "bg-yellow-500", text: "text-yellow-500", glow: "shadow-yellow-500/30" },
                { label: "Hard", solved: problemsSolved.hard, color: "bg-red-500", text: "text-red-500", glow: "shadow-red-500/30" },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className={`font-semibold ${d.text}`}>{d.label}</span>
                    <span className="text-muted-foreground font-medium">{d.solved} solved</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${d.color} rounded-full shadow-sm ${d.glow} transition-all duration-1000`}
                      style={{ width: d.solved === 0 ? "2px" : `${Math.min(100, (d.solved / Math.max(1, (problemsSolved.easy + problemsSolved.medium + problemsSolved.hard))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total circle */}
            <div className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20 shrink-0">
                {totalSolved}
              </div>
              <div>
                <div className="text-sm font-semibold">Total Solved</div>
                <div className="text-xs text-muted-foreground">Keep going! 🔥</div>
              </div>
            </div>
          </motion.div>

          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-sm text-foreground/80">Recent Submissions</h2>
              <Link to="/problems" className="text-xs text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {submissions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No submissions yet. Start solving!</p>
                </div>
              ) : (
                submissions.slice(0, 6).map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-border/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${s.status === "Accepted" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        {s.status === "Accepted"
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          : <XCircle className="h-3.5 w-3.5 text-red-400" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{s.problemTitle || s.problemId}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(s.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={`text-xs font-semibold ${s.status === "Accepted" ? "text-emerald-500" : s.status?.includes("Error") ? "text-yellow-500" : "text-red-400"}`}>
                        {s.status}
                      </p>
                      {s.executionTime !== undefined && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                          <Clock className="h-2.5 w-2.5" />{s.executionTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Activity Heatmap — Real data via SubmissionHeatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6 backdrop-blur-sm"
        >
          <h2 className="font-semibold text-sm text-foreground/80 mb-4">{new Date().getFullYear()} Activity</h2>
          <SubmissionHeatmap data={heatmapData} />
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
