import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertTriangle, FileCode, Search, Filter, Loader2, ArrowRight, Code2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Submission {
    _id: string;
    problemId: string;
    problemTitle: string;
    status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Compilation Error";
    language: string;
    executionTime?: number;
    memoryUsed?: number;
    createdAt: string;
    code?: string;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    "Accepted": { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    "Wrong Answer": { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    "Time Limit Exceeded": { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    "Runtime Error": { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    "Compilation Error": { icon: AlertTriangle, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};
const DEFAULT_STATUS = { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-white/5", border: "border-border/20" };

const ALL_STATUSES = ["All", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"];

const Submissions = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/signin"); return; }
            try {
                // Get current user ID first
                const userRes = await fetch("https://mlcode-snkb.onrender.com/api/auth/me", {
                    headers: { "auth-token": token }
                });
                if (!userRes.ok) throw new Error("Failed to get user");
                const userData = await userRes.json();

                const subRes = await fetch(`https://mlcode-snkb.onrender.com/api/submissions/user/${userData._id}`, {
                    headers: { "auth-token": token }
                });
                if (!subRes.ok) throw new Error("Failed to fetch submissions");
                const data = await subRes.json();
                setSubmissions(data);
            } catch (err) {
                toast.error("Failed to load submissions");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [navigate]);

    const filtered = submissions.filter((s) => {
        if (search && !(s.problemTitle || s.problemId || "").toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== "All" && s.status !== statusFilter) return false;
        return true;
    });

    const stats = {
        total: submissions.length,
        accepted: submissions.filter(s => s.status === "Accepted").length,
        acceptanceRate: submissions.length > 0
            ? Math.round((submissions.filter(s => s.status === "Accepted").length / submissions.length) * 100)
            : 0,
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading submissions...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0e1015] text-foreground">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-emerald-500/4 rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-40 w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-8">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
                                <Code2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black">My Submissions</h1>
                                <p className="text-xs text-muted-foreground">All your submission history across problems</p>
                            </div>
                        </div>
                        <Link to="/problems" className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity font-medium">
                            Browse Problems <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="grid grid-cols-3 gap-4 mb-7"
                >
                    {[
                        { label: "Total Submissions", value: stats.total, color: "from-primary/20 to-primary/5", border: "border-primary/20", text: "text-primary" },
                        { label: "Accepted", value: stats.accepted, color: "from-emerald-500/20 to-transparent", border: "border-emerald-500/20", text: "text-emerald-500" },
                        { label: "Acceptance Rate", value: `${stats.acceptanceRate}%`, color: "from-blue-500/20 to-transparent", border: "border-blue-500/20", text: "text-blue-400" },
                    ].map(({ label, value, color, border, text }) => (
                        <div key={label} className={`rounded-xl border ${border} bg-gradient-to-br ${color} px-5 py-4`}>
                            <div className={`text-2xl font-black ${text}`}>{value}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">{label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-3 mb-5 items-center"
                >
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            placeholder="Search by problem..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="flex flex-wrap gap-1.5">
                        {ALL_STATUSES.map(s => {
                            const cfg = s !== "All" ? (STATUS_CONFIG[s] || DEFAULT_STATUS) : null;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${statusFilter === s
                                        ? s === "All"
                                            ? "bg-white/10 border-white/20 text-foreground"
                                            : `${cfg?.bg} ${cfg?.border} ${cfg?.color}`
                                        : "bg-transparent border-border/15 text-muted-foreground hover:text-foreground hover:border-border/40"
                                        }`}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Submissions List */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="rounded-2xl border border-border/10 bg-[#1a1c23]/80 overflow-hidden backdrop-blur-sm"
                >
                    {/* Table header */}
                    <div className="grid grid-cols-[28px_1fr_160px_100px_80px_80px] px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/10 bg-white/[0.02]">
                        <span></span>
                        <span>Problem</span>
                        <span>Status</span>
                        <span className="hidden sm:block">Language</span>
                        <span className="hidden md:block text-right">Runtime</span>
                        <span className="text-right">Date</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <Code2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">{submissions.length === 0 ? "No submissions yet. Start solving!" : "No submissions match your filters."}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/5">
                            {filtered.map((sub, i) => {
                                const cfg = STATUS_CONFIG[sub.status] || DEFAULT_STATUS;
                                const Icon = cfg.icon;
                                const isExpanded = expandedId === sub._id;

                                return (
                                    <motion.div
                                        key={sub._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.02 * Math.min(i, 20) }}
                                    >
                                        {/* Row */}
                                        <div
                                            className={`grid grid-cols-[28px_1fr_160px_100px_80px_80px] items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? "bg-white/[0.02]" : ""}`}
                                            onClick={() => setExpandedId(isExpanded ? null : sub._id)}
                                        >
                                            {/* Icon */}
                                            <div className={`h-6 w-6 rounded-md flex items-center justify-center ${cfg.bg}`}>
                                                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                            </div>

                                            {/* Problem */}
                                            <div className="min-w-0 pr-3">
                                                <Link
                                                    to={`/problem/${sub.problemId}`}
                                                    onClick={e => e.stopPropagation()}
                                                    className="text-sm font-medium hover:text-primary transition-colors truncate block"
                                                >
                                                    {sub.problemTitle || sub.problemId}
                                                </Link>
                                            </div>

                                            {/* Status */}
                                            <div className={`text-xs font-semibold ${cfg.color}`}>{sub.status}</div>

                                            {/* Language */}
                                            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                                <FileCode className="h-3 w-3" />{sub.language || "Python"}
                                            </div>

                                            {/* Runtime */}
                                            <div className="hidden md:block text-right text-xs text-muted-foreground">
                                                {sub.executionTime != null ? `${sub.executionTime}ms` : "—"}
                                            </div>

                                            {/* Date */}
                                            <div className="text-right text-xs text-muted-foreground">
                                                {format(new Date(sub.createdAt), "MMM d")}
                                            </div>
                                        </div>

                                        {/* Expanded Code */}
                                        {isExpanded && sub.code && (
                                            <div className="px-5 pb-5 border-t border-border/5">
                                                <div className="mt-3 rounded-xl bg-[#0e1015] border border-border/10 overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-border/10">
                                                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                                                            <Code2 className="h-3 w-3" /> {sub.language || "Python"}
                                                        </span>
                                                        <span className={`text-[11px] font-semibold ${cfg.color}`}>{sub.status}</span>
                                                    </div>
                                                    <pre className="p-4 font-mono text-xs text-foreground/85 leading-relaxed overflow-x-auto max-h-72 whitespace-pre-wrap">
                                                        <code>{sub.code}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Footer */}
                {filtered.length > 0 && (
                    <p className="text-center text-xs text-muted-foreground mt-4 opacity-60">
                        Showing {filtered.length} of {submissions.length} submissions
                    </p>
                )}
            </div>
        </div>
    );
};

export default Submissions;
