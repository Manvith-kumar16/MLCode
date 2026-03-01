import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Loader2, Crown, Star, Medal, TrendingUp, Brain } from "lucide-react";
import { toast } from "sonner";

const PODIUM_CONFIG = [
  { rank: 1, height: "h-36", color: "from-yellow-500 to-amber-400", glow: "shadow-yellow-500/40", textColor: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "🥇" },
  { rank: 2, height: "h-24", color: "from-slate-400 to-slate-300", glow: "shadow-slate-400/30", textColor: "text-slate-300", bg: "bg-slate-400/10 border-slate-400/30", label: "🥈" },
  { rank: 3, height: "h-20", color: "from-amber-700 to-amber-600", glow: "shadow-amber-700/30", textColor: "text-amber-600", bg: "bg-amber-700/10 border-amber-700/30", label: "🥉" },
];

const getRankStyle = (rank: number) => {
  if (rank === 1) return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", row: "bg-yellow-500/[0.04]" };
  if (rank === 2) return { text: "text-slate-300", bg: "bg-slate-400/10", border: "border-slate-400/20", row: "bg-slate-400/[0.04]" };
  if (rank === 3) return { text: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-600/20", row: "bg-amber-600/[0.04]" };
  return { text: "text-muted-foreground", bg: "bg-white/5", border: "border-border/10", row: "" };
};

const Avatar = ({ user }: { user: any }) => (
  <div className="h-9 w-9 rounded-full overflow-hidden shrink-0">
    {user.avatar
      ? <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
      : <div className="h-full w-full bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center text-sm font-bold text-white">
        {(user.username || "?")[0].toUpperCase()}
      </div>
    }
  </div>
);

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/auth/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        setLeaderboardData(await res.json());
      } catch {
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading rankings...</p>
        </div>
      </div>
    );
  }

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  // Re-order podium: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumRanks = [2, 1, 3];

  return (
    <div className="min-h-screen bg-[#0e1015] text-foreground">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-400 shadow-xl shadow-yellow-500/30 mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Top ML practitioners ranked by performance</p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-primary" /> ML Champions</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-500" /> Score based</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Live rankings</span>
          </div>
        </motion.div>

        {/* Podium — Top 3 */}
        {top3.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-end justify-center gap-4 mb-10"
          >
            {podiumOrder.map((user, idx) => {
              const rank = podiumRanks[idx];
              const cfg = PODIUM_CONFIG.find(c => c.rank === rank)!;
              return (
                <div key={rank} className="flex flex-col items-center gap-3" style={{ order: idx }}>
                  {/* Crown for #1 */}
                  {rank === 1 && <Crown className="h-6 w-6 text-yellow-400 animate-bounce" />}

                  {/* Avatar */}
                  <div className={`relative ${rank === 1 ? "scale-110" : ""}`}>
                    <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${cfg.color} opacity-60 blur-sm`} />
                    <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-background">
                      {user.avatar
                        ? <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                        : <div className={`h-full w-full bg-gradient-to-br ${cfg.color} flex items-center justify-center text-xl font-black text-white`}>
                          {(user.username || "?")[0].toUpperCase()}
                        </div>
                      }
                    </div>
                  </div>

                  {/* Name & Score */}
                  <div className="text-center">
                    <p className={`text-sm font-bold ${cfg.textColor}`}>{user.username || "Unknown"}</p>
                    <p className="text-xs font-semibold text-foreground">{user.score?.toLocaleString() || 0} pts</p>
                  </div>

                  {/* Podium block */}
                  <div className={`w-24 ${cfg.height} rounded-t-xl bg-gradient-to-t ${cfg.color} flex items-center justify-center shadow-lg ${cfg.glow} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
                    <span className="text-2xl">{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 overflow-hidden backdrop-blur-sm"
        >
          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_100px_80px_80px] px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/10 bg-white/[0.02]">
            <span>#</span>
            <span>User</span>
            <span className="text-right">Score</span>
            <span className="text-right hidden sm:block">Solved</span>
            <span className="text-right hidden md:block">Streak</span>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No one on the board yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/5">
              {leaderboardData.map((u, i) => {
                const style = getRankStyle(u.rank);
                return (
                  <motion.div
                    key={u.rank}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className={`grid grid-cols-[40px_1fr_100px_80px_80px] items-center px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${style.row}`}
                  >
                    {/* Rank */}
                    <div className={`flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold border ${style.bg} ${style.border} ${style.text}`}>
                      {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : u.rank}
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar user={u} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{u.username || "Unknown"}</p>
                        {u.rank <= 3 && (
                          <p className={`text-[10px] font-medium ${style.text}`}>
                            {u.rank === 1 ? "👑 Champion" : u.rank === 2 ? "⭐ Runner-up" : "🌟 3rd Place"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className={`text-right font-bold text-sm ${u.rank <= 3 ? style.text : "text-primary"}`}>
                      {u.score?.toLocaleString() || 0}
                    </div>

                    {/* Solved */}
                    <div className="text-right text-sm text-muted-foreground hidden sm:block">
                      {u.solved ?? 0}
                    </div>

                    {/* Streak */}
                    <div className="text-right hidden md:flex items-center justify-end gap-1">
                      <Flame className={`h-3.5 w-3.5 ${u.streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`} />
                      <span className="text-sm text-muted-foreground">{u.streak ?? 0}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">Rankings update in real-time · Ranked by total score</p>
      </div>
    </div>
  );
};

export default Leaderboard;
