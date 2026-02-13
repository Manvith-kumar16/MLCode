import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Target, Award, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const headers = {
          'auth-token': token,
          'Content-Type': 'application/json'
        };

        // Fetch User Stats
        const userRes = await fetch('http://localhost:5001/api/auth/me', { headers });
        if (!userRes.ok) throw new Error("Failed to fetch user data");
        const userData = await userRes.json();
        setUser(userData);

        // Fetch Recent Submissions
        const subRes = await fetch(`http://localhost:5001/api/submissions/user/${userData._id}`, { headers });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData);
        }

        // Fetch Heatmap Stats
        const statsRes = await fetch(`http://localhost:5001/api/submissions/stats/${userData._id}`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // Transform statsData (array of { _id: date, count: num }) to array of last 365 days counts
          // For now, let's just create a simple array mapping
          // This is a simplified version; a real heatmap needs date mapping
          const map = new Map(statsData.map((s: any) => [s._id, s.count]));
          const days = [];
          for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (364 - i));
            const dateStr = d.toISOString().split('T')[0];
            days.push(map.get(dateStr) || 0);
          }
          // Normalize for color scale (0-4)
          const heatmapValues = days.map(count => {
            if (count === 0) return 0;
            if (count <= 2) return 1;
            if (count <= 5) return 2;
            if (count <= 10) return 3;
            return 4;
          });
          setHeatmapData(heatmapValues);
        }

      } catch (error) {
        console.error(error);
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const { rank = 0, points = 0, streak = { current: 0 }, problemsSolved = { easy: 0, medium: 0, hard: 0 } } = user;
  const totalSolved = problemsSolved.easy + problemsSolved.medium + problemsSolved.hard;
  // Hardcoded total problems for now, ideally fetch from backend
  const totalProblems = 150;

  const progressCards = [
    { label: "Problems Solved", value: totalSolved, total: totalProblems, icon: Target, color: "text-primary" },
    { label: "Current Streak", value: `${streak.current} days`, icon: Flame, color: "text-orange-500" }, // Changed color for visibility
    { label: "Total Points", value: points, icon: Award, color: "text-green-500" },
    { label: "Global Rank", value: `#${rank === 0 ? '-' : rank}`, icon: TrendingUp, color: "text-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
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
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(totalSolved / card.total) * 100}%` }} />
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
            { label: "Easy", solved: problemsSolved.easy, total: 50, color: "bg-green-500" },
            { label: "Medium", solved: problemsSolved.medium, total: 50, color: "bg-yellow-500" },
            { label: "Hard", solved: problemsSolved.hard, total: 50, color: "bg-red-500" },
          ].map((d) => (
            <div key={d.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="text-foreground font-medium">{d.solved}/{d.total}</span>
              </div>
              <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                <div className={`h-full ${d.color} rounded-full transition-all duration-1000`} style={{ width: `${(d.solved / d.total) * 100}%` }} />
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
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No submissions yet. Start solving!</p>
            ) : (
              submissions.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.problemTitle || s.problemId}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${s.status === "Accepted" ? "text-green-500" :
                        s.status === "Wrong Answer" ? "text-red-500" : "text-yellow-500"
                      }`}>
                      {s.status}
                    </p>
                    {/* Display execution time if available, or score if relevant */}
                    {s.executionTime !== undefined && <p className="text-xs text-muted-foreground">{s.executionTime}ms</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass-card p-5 mt-6">
        <h2 className="font-semibold text-sm mb-4">Activity Heatmap (Last 365 Days)</h2>
        <div className="flex flex-wrap gap-[3px]">
          {heatmapData.length > 0 ? heatmapData.map((v, i) => (
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
              title={`${v > 0 ? 'Submissions' : 'No submissions'}`}
            />
          )) : (
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
