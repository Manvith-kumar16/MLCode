import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, CheckCircle2, Clock, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { problems, type Difficulty, type MLTopic, type ProblemStatus } from "@/data/problems";
import DifficultyBadge from "@/components/DifficultyBadge";

const topics: MLTopic[] = ["Classification", "Regression", "NLP", "Computer Vision", "Clustering", "Deep Learning", "Feature Engineering", "Time Series", "Recommender Systems", "Reinforcement Learning"];
const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

const StatusIcon = ({ status }: { status: ProblemStatus }) => {
  if (status === "solved") return <CheckCircle2 className="h-4 w-4 text-easy" />;
  if (status === "attempted") return <Clock className="h-4 w-4 text-medium" />;
  return <Minus className="h-4 w-4 text-muted-foreground/30" />;
};

const Problems = () => {
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "All">("All");
  const [topicFilter, setTopicFilter] = useState<MLTopic | "All">("All");

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      if (topicFilter !== "All" && !p.topics.includes(topicFilter)) return false;
      return true;
    });
  }, [search, diffFilter, topicFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Problems</h1>
        <p className="text-sm text-muted-foreground">Practice ML challenges across all difficulty levels</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <div className="flex gap-1.5">
          {["All", ...difficulties].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${diffFilter === d ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Topic tags */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {["All", ...topics].map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t as any)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${topicFilter === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-3 w-10">Status</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden sm:table-cell">Topics</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3 hidden md:table-cell text-right">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-accent/50 transition-colors">
                <td className="px-4 py-3">
                  <StatusIcon status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <Link to={`/problem/${p.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                    {p.id}. {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {p.topics.map((t) => (
                      <span key={t} className="text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><DifficultyBadge difficulty={p.difficulty} /></td>
                <td className="px-4 py-3 hidden md:table-cell text-right text-sm text-muted-foreground">{p.acceptance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No problems match your filters.</div>
        )}
      </div>
    </div>
  );
};

export default Problems;
