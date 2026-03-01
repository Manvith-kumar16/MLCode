import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Flame, Brain, MapPin, Link as LinkIcon, Github, Linkedin, Eye, MessageSquare, Star, CheckCircle2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SubmissionHeatmap from "@/components/SubmissionHeatmap";
import RecentSubmissions from "@/components/RecentSubmissions";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  rank: number;
  points: number;
  username?: string;
  problemsSolved: { easy: number; medium: number; hard: number };
  badges: Array<{ name: string; desc: string; earned: boolean }>;
  socials: { github: string; linkedin: string; website: string };
  streak: { current: number; lastActive: Date };
  bio: string;
  location: string;
  createdAt: string;
}

const SYSTEM_BADGES = [
  { name: "First Blood", desc: "Solve your first problem", icon: Trophy, color: "from-yellow-500 to-orange-500" },
  { name: "Streak Master", desc: "7-day streak", icon: Flame, color: "from-orange-500 to-red-500" },
  { name: "Algorithm Guru", desc: "Solve 100 hard problems", icon: Brain, color: "from-purple-500 to-indigo-500" },
];

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [submissionStats, setSubmissionStats] = useState<{ date: string; count: number }[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [totalProblems, setTotalProblems] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:5001/api/auth/me", {
          headers: { "auth-token": token },
        });
        const data = await response.json();
        if (response.ok) {
          data.socials = data.socials || {};
          data.streak = data.streak || { current: 0 };
          data.bio = data.bio || "";
          data.location = data.location || "";
          data.problemsSolved = data.problemsSolved || { easy: 0, medium: 0, hard: 0 };
          data.badges = data.badges || [];
          setUser(data);

          if (data._id) {
            const statsRes = await fetch(`http://localhost:5001/api/submissions/stats/${data._id}`, { headers: { "auth-token": token } });
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              setSubmissionStats(statsData.map((item: any) => ({ date: item._id, count: item.count })));
            }
            const subsRes = await fetch(`http://localhost:5001/api/submissions/user/${data._id}`, { headers: { "auth-token": token } });
            if (subsRes.ok) setRecentSubmissions(await subsRes.json());

            const probRes = await fetch("http://localhost:5001/api/problems", { headers: { "auth-token": token } });
            if (probRes.ok) {
              const probData = await probRes.json();
              const counts = { easy: 0, medium: 0, hard: 0, total: probData.length };
              probData.forEach((p: any) => {
                const diff = (p.difficulty || "easy").toLowerCase();
                if (diff in counts) (counts as any)[diff]++;
              });
              setTotalProblems(counts);
            }

            // Fetch real rank
            const rankRes = await fetch(`http://localhost:5001/api/auth/rank/${data._id}`, { headers: { "auth-token": token } });
            if (rankRes.ok) {
              const { rank } = await rankRes.json();
              setUser((prev: any) => prev ? { ...prev, rank } : prev);
            }
          }
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      </div>
    </div>
  );
  if (!user) return <div className="p-8 text-center text-muted-foreground">Please sign in to view your profile.</div>;

  const totalSolved = user.problemsSolved.easy + user.problemsSolved.medium + user.problemsSolved.hard;
  const progressPct = Math.min(100, (totalSolved / Math.max(1, totalProblems.total)) * 100);
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="min-h-screen bg-[#0e1015] text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-12">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ===== LEFT COLUMN ===== */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-5">

            {/* Profile Card */}
            <div className="relative rounded-2xl border border-border/10 bg-[#1a1c23]/80 backdrop-blur-sm overflow-hidden">
              <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="relative h-28 w-28 rounded-full overflow-hidden ring-2 ring-border/20">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-primary text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
                    }
                  </div>
                </div>

                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground mb-1">@{(user.username || user.name).toLowerCase().replace(/\s/g, '')}</p>
                {user.bio && <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed max-w-[220px]">{user.bio}</p>}

                {/* Points / Rank Pills */}
                <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                  <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-semibold">{user.points || 0} pts</span>
                  <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-semibold">Rank #{user.rank != null ? user.rank : "—"}</span>
                </div>

                <Button
                  className="mt-5 w-full gap-2 bg-white/5 hover:bg-white/10 border border-border/20 text-sm font-medium h-9 rounded-lg text-foreground transition-all"
                  onClick={() => navigate("/edit-profile")}
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </div>

              {/* Meta Info */}
              <div className="px-6 pb-5 space-y-2.5 border-t border-border/10 pt-4">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>{user.location || "No location set"}</span>
                </div>
                {user.socials?.website && (
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <LinkIcon className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <a href={user.socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate transition-colors">{user.socials.website}</a>
                  </div>
                )}
                {(user.socials?.github || user.socials?.linkedin) && (
                  <div className="flex items-center gap-3 pt-1">
                    {user.socials.github && (
                      <a href={user.socials.github} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border/10">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {user.socials.linkedin && (
                      <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-blue-400 transition-all border border-border/10">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Streak Card */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-4 flex items-center gap-4 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <Flame className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{user.streak.current} <span className="text-sm font-normal text-muted-foreground">days</span></div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
            </div>

            {/* Community Stats Card */}
            <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3">Community Stats</h3>
              {[
                { icon: Eye, label: "Views", value: 0 },
                { icon: CheckCircle2, label: "Solutions", value: totalSolved },
                { icon: MessageSquare, label: "Discuss", value: 0 },
                { icon: Star, label: "Reputation", value: user.points || 0 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ===== RIGHT COLUMN ===== */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">

            {/* Stats Row */}
            <div className="grid sm:grid-cols-2 gap-5">

              {/* Solved Problems Ring */}
              <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <h3 className="font-semibold text-sm text-foreground/80 mb-5">Solved Problems</h3>
                <div className="flex items-center gap-6">
                  {/* SVG Ring */}
                  <div className="relative shrink-0 h-28 w-28">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="54" fill="none"
                        stroke="url(#ring-grad)" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progressPct / 100)}
                        style={{ transition: "stroke-dashoffset 1.2s ease" }}
                      />
                      <defs>
                        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#eab308" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">{totalSolved}</span>
                      <span className="text-xs text-muted-foreground">Solved</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {[
                      { label: "Easy", solved: user.problemsSolved.easy, total: totalProblems.easy, color: "bg-emerald-500", text: "text-emerald-500" },
                      { label: "Medium", solved: user.problemsSolved.medium, total: totalProblems.medium, color: "bg-yellow-500", text: "text-yellow-500" },
                      { label: "Hard", solved: user.problemsSolved.hard, total: totalProblems.hard, color: "bg-red-500", text: "text-red-500" },
                    ].map(({ label, solved, total, color, text }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-semibold ${text}`}>{label}</span>
                          <span className="text-muted-foreground">{solved} / {total || 0}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5">
                          <div className={`h-full rounded-full ${color} transition-all duration-1000`}
                            style={{ width: `${Math.min(100, (solved / Math.max(1, total)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-sm text-foreground/80">Badges</h3>
                  <span className="text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full">{user.badges.length} earned</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {SYSTEM_BADGES.map((badge) => {
                    const isEarned = user.badges.some(b => b.name === badge.name);
                    const BIcon = badge.icon;
                    return (
                      <div key={badge.name}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-default
                          ${isEarned ? "border-primary/30 bg-primary/10" : "border-white/5 bg-white/[0.02] opacity-40 grayscale"}`}
                        title={badge.desc}
                      >
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${badge.color} ${!isEarned && "opacity-50"}`}>
                          <BIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium leading-tight">{badge.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submission Heatmap */}
            <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground/80">{new Date().getFullYear()} Submissions</h3>
              </div>
              <SubmissionHeatmap data={submissionStats} />
            </div>

            {/* Recent Submissions */}
            <div className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 p-6">
              <h3 className="font-semibold text-sm text-foreground/80 mb-4">Recent Submissions</h3>
              <RecentSubmissions submissions={recentSubmissions.slice(0, 5)} />
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
