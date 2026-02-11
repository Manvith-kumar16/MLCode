import { motion } from "framer-motion";
import { Trophy, Flame, Target, Calendar, Award } from "lucide-react";
import { userStats } from "@/data/problems";

const badges = [
  { name: "First Blood", desc: "Solve your first problem", earned: true },
  { name: "Streak Master", desc: "7-day streak", earned: true },
  { name: "ML Explorer", desc: "Try all categories", earned: false },
  { name: "Speed Demon", desc: "Solve in under 5 min", earned: true },
  { name: "Perfect Score", desc: "100% accuracy", earned: false },
  { name: "Century Club", desc: "Solve 100 problems", earned: false },
];

const Profile = () => (
  <div className="mx-auto max-w-4xl px-4 py-8">
    {/* Profile header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
          M
        </div>
        <div>
          <h1 className="text-xl font-bold">{userStats.username}</h1>
          <p className="text-sm text-muted-foreground">ML Enthusiast • Joined Jan 2025</p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Rank #{userStats.rank}</span>
            <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-medium" /> {userStats.streak} day streak</span>
            <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-primary" /> {userStats.points} pts</span>
          </div>
        </div>
      </div>
    </motion.div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Solve stats */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-sm mb-4">Problem Stats</h2>
        <div className="flex items-center justify-center mb-4">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(220 14% 14%)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="3"
                strokeDasharray={`${(userStats.easy.solved / userStats.easy.total) * 33.3} 100`} />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(38 92% 50%)" strokeWidth="3"
                strokeDasharray={`${(userStats.medium.solved / userStats.medium.total) * 33.3} 100`}
                strokeDashoffset={`-${(userStats.easy.solved / userStats.easy.total) * 33.3}`} />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(0 72% 51%)" strokeWidth="3"
                strokeDasharray={`${(userStats.hard.solved / userStats.hard.total) * 33.3} 100`}
                strokeDashoffset={`-${((userStats.easy.solved / userStats.easy.total) + (userStats.medium.solved / userStats.medium.total)) * 33.3}`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold">{userStats.solved}</span>
                <span className="text-xs text-muted-foreground block">solved</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-6 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-easy" /> Easy {userStats.easy.solved}/{userStats.easy.total}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-medium" /> Medium {userStats.medium.solved}/{userStats.medium.total}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-hard" /> Hard {userStats.hard.solved}/{userStats.hard.total}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" /> Badges
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div key={b.name} className={`p-3 rounded-lg border transition-colors ${b.earned ? "border-primary/30 bg-primary/5" : "border-border/30 bg-accent/30 opacity-50"}`}>
              <p className="text-xs font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Profile;
