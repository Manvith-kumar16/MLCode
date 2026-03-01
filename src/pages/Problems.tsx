import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, CheckCircle2, Clock, Minus, Brain, Zap, Target, BarChart3, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { type Difficulty, type MLTopic, type ProblemStatus } from "@/data/problems";
import DifficultyBadge from "@/components/DifficultyBadge";

const topics: MLTopic[] = ["Classification", "Regression", "NLP", "Computer Vision", "Clustering", "Deep Learning", "Feature Engineering", "Time Series", "Recommender Systems", "Reinforcement Learning"];
const difficulties: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

interface ProblemData {
  _id: string;
  problemId: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  acceptance?: string;
  status?: ProblemStatus;
}

const diffColors: Record<string, string> = {
  All: "border-border/20 text-muted-foreground hover:border-border/60 hover:text-foreground",
  Easy: "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10",
  Medium: "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10",
  Hard: "border-red-500/30 text-red-500 hover:bg-red-500/10",
};
const diffActiveColors: Record<string, string> = {
  All: "bg-white/10 border-white/20 text-foreground",
  Easy: "bg-emerald-500/15 border-emerald-500/50 text-emerald-400",
  Medium: "bg-yellow-500/15 border-yellow-500/50 text-yellow-400",
  Hard: "bg-red-500/15 border-red-500/50 text-red-400",
};

const StatusIcon = ({ status }: { status: ProblemStatus }) => {
  if (status === "solved") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "attempted") return <Clock className="h-4 w-4 text-yellow-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground/20" />;
};

const Problems = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "All">("All");
  const [topicFilter, setTopicFilter] = useState<string>("All");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["auth-token"] = token;
      const res = await fetch("https://mlcode-snkb.onrender.com/api/problems", { headers });
      if (!res.ok) throw new Error("Failed to fetch problems");
      return res.json();
    }
  });

  const filtered = useMemo(() =>
    problems
      .filter((p: ProblemData) => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
        if (topicFilter !== "All" && p.category !== topicFilter) return false;
        return true;
      })
      .sort((a: ProblemData, b: ProblemData) => parseInt(a.problemId) - parseInt(b.problemId)),
    [search, diffFilter, topicFilter, problems]
  );

  const counts = useMemo(() => {
    const easy = problems.filter((p: ProblemData) => p.difficulty === "Easy").length;
    const medium = problems.filter((p: ProblemData) => p.difficulty === "Medium").length;
    const hard = problems.filter((p: ProblemData) => p.difficulty === "Hard").length;
    const solved = problems.filter((p: ProblemData) => p.status === "solved").length;
    return { easy, medium, hard, solved, total: problems.length };
  }, [problems]);

  return (
    <div className="min-h-screen bg-[#0e1015] text-foreground">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-48 w-[500px] h-[500px] bg-purple-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">ML Problems</h1>
              <p className="text-xs text-muted-foreground">Practice real-world machine learning challenges</p>
            </div>
          </div>
        </motion.div>

        {/* Summary stat pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7"
        >
          {[
            { label: "Total", value: counts.total, icon: Target, color: "from-primary/20 to-primary/5", border: "border-primary/20", text: "text-primary" },
            { label: "Easy", value: counts.easy, icon: Zap, color: "from-emerald-500/20 to-transparent", border: "border-emerald-500/20", text: "text-emerald-500" },
            { label: "Medium", value: counts.medium, icon: BarChart3, color: "from-yellow-500/20 to-transparent", border: "border-yellow-500/20", text: "text-yellow-500" },
            { label: "Hard", value: counts.hard, icon: Brain, color: "from-red-500/20 to-transparent", border: "border-red-500/20", text: "text-red-500" },
          ].map(({ label, value, icon: Icon, color, border, text }, i) => (
            <div key={label} className={`rounded-xl border ${border} bg-gradient-to-br ${color} px-4 py-3 flex items-center gap-3`}>
              <div className={`h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center ${text} shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className={`text-xl font-black ${text}`}>{value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters Row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-4 items-center"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-1.5">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${diffFilter === d ? diffActiveColors[d] : `bg-transparent ${diffColors[d]}`}`}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Topic tags */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-1.5 mb-6"
        >
          {["All", ...topics].map((t) => (
            <button
              key={t}
              onClick={() => setTopicFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${topicFilter === t
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-white/[0.03] border-border/15 text-muted-foreground hover:text-foreground hover:border-border/40"
                }`}
            >
              {t}
            </button>
          ))}
        </motion.div>

        {/* Problems Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 overflow-hidden backdrop-blur-sm"
        >
          {/* Table header */}
          <div className="grid grid-cols-[36px_1fr_140px_120px_100px] px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/10 bg-white/[0.02]">
            <span></span>
            <span>Title</span>
            <span className="hidden sm:block">Topic</span>
            <span>Difficulty</span>
            <span className="text-right hidden md:block">Acceptance</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading problems...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No problems match your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/5">
              {filtered.map((p: ProblemData, i: number) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * Math.min(i, 20) }}
                  className="grid grid-cols-[36px_1fr_140px_120px_100px] items-center px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <StatusIcon status={p.status || "unsolved"} />
                  </div>

                  {/* Title */}
                  <div className="min-w-0 pr-4">
                    <Link
                      to={`/problem/${p.problemId}`}
                      className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate block"
                    >
                      <span className="text-muted-foreground mr-1.5 text-xs">{p.problemId}.</span>
                      {p.title}
                    </Link>
                  </div>

                  {/* Category */}
                  <div className="hidden sm:block">
                    <span className="text-[11px] bg-white/5 border border-border/10 text-muted-foreground px-2 py-0.5 rounded-full">
                      {p.category || "General"}
                    </span>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </div>

                  {/* Acceptance */}
                  <div className="hidden md:block text-right">
                    <span className={`text-xs font-semibold ${parseFloat(p.acceptance || "0") >= 60 ? "text-emerald-500" :
                        parseFloat(p.acceptance || "0") >= 40 ? "text-yellow-500" : "text-red-400"
                      }`}>
                      {p.acceptance || "—"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer count */}
        {!isLoading && (
          <p className="text-center text-xs text-muted-foreground mt-4 opacity-60">
            Showing {filtered.length} of {problems.length} problems
          </p>
        )}
      </div>
    </div>
  );
};

export default Problems;
