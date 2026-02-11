import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flame, Target, Award, TrendingUp, ArrowRight } from "lucide-react";
import { userStats, problems } from "@/data/problems";
import DifficultyBadge from "@/components/DifficultyBadge";

const Dashboard = () => {
  const { easy, medium, hard, streak, points, rank, solved, total, recentSubmissions } = userStats;

  const progressCards = [
    { label: "Problems Solved", value: solved, total, icon: Target, color: "text-primary" },
    { label: "Current Streak", value: `${streak} days`, icon: Flame, color: "text-medium" },
    { label: "Total Points", value: points, icon: Award, color: "text-easy" },
    { label: "Global Rank", value: `#${rank}`, icon: TrendingUp, color: "text-info" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Track your ML learning progress</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {progressCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.total && (
              <div className="mt-2 h-1.5 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(solved / total) * 100}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Difficulty breakdown */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 text-sm">By Difficulty</h2>
          {[
            { label: "Easy", solved: easy.solved, total: easy.total, color: "bg-easy" },
            { label: "Medium", solved: medium.solved, total: medium.total, color: "bg-medium" },
            { label: "Hard", solved: hard.solved, total: hard.total, color: "bg-hard" },
          ].map((d) => (
            <div key={d.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="text-foreground font-medium">{d.solved}/{d.total}</span>
              </div>
              <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                <div className={`h-full ${d.color} rounded-full transition-all`} style={{ width: `${(d.solved / d.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent submissions */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Recent Submissions</h2>
            <Link to="/problems" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubmissions.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.problem}</p>
                  <p className="text-xs text-muted-foreground">{s.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${s.status === "Accepted" ? "text-easy" : s.status === "Wrong Answer" ? "text-hard" : "text-medium"}`}>
                    {s.status}
                  </p>
                  {s.score > 0 && <p className="text-xs text-muted-foreground">{s.score}%</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass-card p-5 mt-6">
        <h2 className="font-semibold text-sm mb-4">Activity Heatmap</h2>
        <div className="flex flex-wrap gap-[3px]">
          {userStats.heatmap.map((v, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-sm transition-colors"
              style={{
                backgroundColor:
                  v === 0 ? "hsl(220 14% 14%)" :
                  v === 1 ? "hsl(142 71% 45% / 0.25)" :
                  v === 2 ? "hsl(142 71% 45% / 0.5)" :
                  v === 3 ? "hsl(142 71% 45% / 0.75)" :
                  "hsl(142 71% 45%)",
              }}
              title={`${v} submissions`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
