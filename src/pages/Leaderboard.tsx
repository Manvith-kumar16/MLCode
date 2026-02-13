import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";

const rankStyle = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-amber-600";
  return "text-muted-foreground";
};

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/auth/leaderboard');
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error(error);
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" /> Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Top ML practitioners ranked by score</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 w-16">Rank</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">Solved</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No users found yet. Be the first to join!
                </td>
              </tr>
            ) : (
              leaderboardData.map((u, i) => (
                <motion.tr
                  key={u.rank} // Use rank as key since it's unique in the list
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/30 last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${rankStyle(u.rank)}`}>
                      {u.rank <= 3 ? <Medal className="h-4 w-4 inline" /> : u.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">
                        {u.username && u.username[0] ? u.username[0].toUpperCase() : '?'}
                      </div>
                      <span className="font-medium text-sm">{u.username || 'Unknown User'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary text-sm">{u.score.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden sm:table-cell">{u.solved}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm text-medium flex items-center justify-end gap-1">
                      <Flame className="h-3 w-3" /> {u.streak}
                    </span>
                  </td>
                </motion.tr>
              )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
