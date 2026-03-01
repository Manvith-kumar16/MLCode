import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Flame, Target, Calendar, Award, Edit, MapPin, Link as LinkIcon, Github, Linkedin, Eye, MessageSquare, Star, CheckCircle2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SubmissionHeatmap from "@/components/SubmissionHeatmap";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  rank: number;
  points: number;
  problemsSolved: {
    easy: number;
    medium: number;
    hard: number;
  };
  badges: Array<{
    name: string;
    desc: string;
    earned: boolean;
  }>;
  socials: {
    github: string;
    linkedin: string;
    website: string;
  };
  streak: {
    current: number;
    lastActive: Date;
  };
  bio: string;
  location: string;
  createdAt: string;
}

const SYSTEM_BADGES = [
  { name: "First Blood", desc: "Solve your first problem", icon: Trophy },
  { name: "Streak Master", desc: "7-day streak", icon: Flame },
  { name: "Algorithm Guru", desc: "Solve 100 hard problems", icon: Brain },
];

import RecentSubmissions from "@/components/RecentSubmissions";

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
          headers: {
            "auth-token": token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          // Ensure nested objects exist
          data.socials = data.socials || {};
          data.streak = data.streak || { current: 0 };
          data.bio = data.bio || "";
          data.location = data.location || "";
          data.problemsSolved = data.problemsSolved || { easy: 0, medium: 0, hard: 0 };
          data.badges = data.badges || [];
          setUser(data);

          // Fetch submission stats using userId
          if (data._id) {
            const statsRes = await fetch(`http://localhost:5001/api/submissions/stats/${data._id}`, {
              headers: { "auth-token": token }
            });
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              setSubmissionStats(statsData.map((item: any) => ({ date: item._id, count: item.count })));
            }

            const subsRes = await fetch(`http://localhost:5001/api/submissions/user/${data._id}`, {
              headers: { "auth-token": token }
            });
            if (subsRes.ok) {
              const subsData = await subsRes.json();
              setRecentSubmissions(subsData);
            }

            // Fetch overall platform problem counts
            const probRes = await fetch("http://localhost:5001/api/problems", {
              headers: { "auth-token": token }
            });
            if (probRes.ok) {
              const probData = await probRes.json();
              const counts = { easy: 0, medium: 0, hard: 0, total: probData.length };
              probData.forEach((p: any) => {
                const diff = (p.difficulty || "easy").toLowerCase();
                if (counts[diff as keyof typeof counts] !== undefined) {
                  counts[diff as keyof typeof counts]++;
                }
              });
              setTotalProblems(counts);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">Please sign in to view your profile.</div>;

  const totalSolved = user.problemsSolved.easy + user.problemsSolved.medium + user.problemsSolved.hard;
  const totalQuestions = 3125; // Mock total questions on platform

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid lg:grid-cols-3 gap-8">
      {/* Left Column - User Info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 rounded-lg bg-primary/20 flex items-center justify-center text-5xl font-bold text-primary mb-4 relative group cursor-pointer overflow-hidden">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
            {user.bio && <p className="text-sm text-center mt-2 text-muted-foreground">{user.bio}</p>}

            <div className="w-full mt-6 space-y-4">
              <Button className="w-full" variant="outline" onClick={() => navigate("/edit-profile")}>Edit Profile</Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {user.location || "Add Location"}
              </div>
              {user.socials?.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LinkIcon className="h-4 w-4" /> <a href={user.socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">{user.socials.website}</a>
                </div>
              )}
              <div className="flex gap-4 mt-2">
                {user.socials?.github && (
                  <a href={user.socials.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </a>
                )}
                {user.socials?.linkedin && (
                  <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </a>
                )}
              </div>

              {/* Streak Display */}
              <div className="flex items-center justify-center gap-2 bg-accent/30 p-2 rounded-lg w-full mt-4">
                <Flame className={`h-5 w-5 ${user.streak.current > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`} />
                <span className="font-semibold">Streak: {user.streak.current} Days</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border/50 pt-6">
            <h3 className="font-semibold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /> Views</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4" /> Solutions</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /> Discuss</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4" /> Reputation</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column - Stats & Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Solved Problems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-6">Solved Problems</h3>
            <div className="flex items-center gap-8">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-muted/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin-slow" style={{ clipPath: `inset(0 0 0 0)` }}></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{totalSolved}</div>
                  <div className="text-xs text-muted-foreground">Solved</div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500">Easy</span>
                    <span className="text-muted-foreground">{user.problemsSolved.easy} / {totalProblems.easy || 1}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/20">
                    <div className="h-full rounded-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.min(100, (user.problemsSolved.easy / Math.max(1, totalProblems.easy)) * 100)}%` }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-500">Medium</span>
                    <span className="text-muted-foreground">{user.problemsSolved.medium} / {totalProblems.medium || 1}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/20">
                    <div className="h-full rounded-full bg-yellow-500 transition-all duration-1000" style={{ width: `${Math.min(100, (user.problemsSolved.medium / Math.max(1, totalProblems.medium)) * 100)}%` }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500">Hard</span>
                    <span className="text-muted-foreground">{user.problemsSolved.hard} / {totalProblems.hard || 1}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/20">
                    <div className="h-full rounded-full bg-red-500 transition-all duration-1000" style={{ width: `${Math.min(100, (user.problemsSolved.hard / Math.max(1, totalProblems.hard)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Badges</h3>
              <span className="text-xs text-muted-foreground">{user.badges.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {SYSTEM_BADGES.map((badge, index) => {
                const isEarned = user.badges.some(b => b.name === badge.name);
                const BIcon = badge.icon;
                return (
                  <div key={index} className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${isEarned ? "bg-primary/10 border-primary/50" : "bg-muted/10 border-transparent opacity-50 grayscale"}`}>
                    <BIcon className={`h-8 w-8 mb-2 ${isEarned ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-[10px] text-center font-medium">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Heatmap Section */}
        <div className="glass-card p-6 col-span-1 lg:col-span-3">
          <h3 className="font-semibold mb-4">{new Date().getFullYear()} Submissions</h3>
          <SubmissionHeatmap data={submissionStats} />
        </div>

        {/* Recent Submissions */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            <RecentSubmissions submissions={recentSubmissions} />
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Profile;
