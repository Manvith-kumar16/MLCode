import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Send, FileText, MessageSquare, Lightbulb, History, CheckCircle2, XCircle, Code2, LayoutGrid, ChevronLeft, ChevronRight, Shuffle, Layout, Settings, Flame, Timer, UserPlus, Bug, CloudUpload, Copy, Sparkles, Bell, LogOut, MoreVertical, Trash2, Database, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import DifficultyBadge from "@/components/DifficultyBadge";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const tabs = [
  { id: "description", label: "Description", icon: FileText },
  { id: "submissions", label: "Submissions", icon: History },
  { id: "discussion", label: "Discussion", icon: MessageSquare },
  { id: "hints", label: "Hints", icon: Lightbulb },
];

type TestCaseResult = {
  name: string;
  passed: boolean;
  expected?: string;
  got?: string;
};

type TestResult = {
  status: "passed" | "failed";
  message: string;
  cases: TestCaseResult[];
  summary: string;
};

const ProblemDetail = () => {
  const { id } = useParams();

  const { data: problem, isLoading } = useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const res = await fetch(`https://mlcode-snkb.onrender.com/api/problems/${id}`);
      if (!res.ok) throw new Error("Failed to fetch problem");
      return res.json();
    }
  });

  const [activeTab, setActiveTab] = useState("description");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<TestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [activeResultTabIndex, setActiveResultTabIndex] = useState(0);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [runtimeDistribution, setRuntimeDistribution] = useState<number[]>([]);
  const [beatsPercent, setBeatsPercent] = useState<number>(0);
  const [userBin, setUserBin] = useState<number>(-1);
  const [chartMinMax, setChartMinMax] = useState<{ min: number, max: number } | null>(null);

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  const [outputHeight, setOutputHeight] = useState(256);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      // Calculate new height:
      // When dragging UP, e.movementY is negative, so height increases
      // When dragging DOWN, e.movementY is positive, so height decreases
      setOutputHeight((prev) => {
        const newHeight = prev - e.movementY;
        // Restrict between 100px and 80% of window height
        return Math.max(40, Math.min(newHeight, window.innerHeight * 0.8));
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Only release on left-click up, or if dragging somehow
      if (isDraggingRef.current && (e.button === 0 || e.buttons === 0)) {
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    // Prevent context menu globally *only while dragging*
    const handleContextMenu = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    // Only allow drag on left click
    if (e.button !== 0) return;

    e.preventDefault();
    isDraggingRef.current = true;

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/me", {
          headers: { "auth-token": token },
        });
        const data = await response.json();
        if (response.ok) {
          if (data.streak) setStreak(data.streak.current || 0);
          setAvatar(data.avatar || "");
          setName(data.name || "U");
          setUserId(data._id || null);
        }
      } catch (error) {
        console.error("Failed to fetch user data");
      }
    };
    fetchUserData();
  }, []);

  const fetchDiscussions = async () => {
    if (!problem) return;
    setLoadingDiscussions(true);
    try {
      const res = await fetch(`https://mlcode-snkb.onrender.com/api/discussions/${problem.problemId}`);
      if (res.ok) {
        setDiscussions(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch discussions");
    } finally {
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    if (problem && activeTab === "discussion") {
      fetchDiscussions();
    }
  }, [problem, activeTab]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to post.");
      return;
    }

    try {
      const res = await fetch("https://mlcode-snkb.onrender.com/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          problemId: problem.problemId,
          text: newComment
        })
      });

      if (res.ok) {
        const posted = await res.json();
        setDiscussions(prev => [posted, ...prev]);
        setNewComment("");
        toast.success("Comment posted!");
      } else {
        toast.error("Failed to post comment.");
      }
    } catch (e) {
      toast.error("Network error posting comment.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`https://mlcode-snkb.onrender.com/api/discussions/${commentId}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });
      if (res.ok) {
        setDiscussions(prev => prev.filter(c => c._id !== commentId));
        toast.success("Discussion deleted successfully");
      } else {
        toast.error("Failed to delete discussion");
      }
    } catch (e) {
      toast.error("Network error deleting discussion");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (problem) {
      const LOCAL_KEY = `code_${problem.problemId}`;
      const cached = localStorage.getItem(LOCAL_KEY);

      if (cached !== null) {
        setCode(cached);
        return;
      }

      const token = localStorage.getItem("token");
      if (token) {
        fetch(`https://mlcode-snkb.onrender.com/api/submissions/problem/${problem.problemId}`, {
          headers: { "auth-token": token }
        })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setSubmissionsList(data);
              // Pre-fill the most recent code into the editor if they have any submissions
              if (data.length > 0 && data[0].code) {
                setCode(data[0].code);
                return; // Avoid falling through to the starter code overwrite
              }
            }
            setCode(problem.starterCode || "# Write your solution here\n");
          })
          .catch(() => setCode(problem.starterCode || "# Write your solution here\n"));
      } else {
        setCode(problem.starterCode || "# Write your solution here\n");
      }
    }
  }, [problem]);

  useEffect(() => {
    if (problem && code) {
      const LOCAL_KEY = `code_${problem.problemId}`;
      localStorage.setItem(LOCAL_KEY, code);
    }
  }, [code, problem]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-muted-foreground">
        Loading problem details...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-muted-foreground">
        Problem not found. <Link to="/problems" className="text-primary ml-2">Go back</Link>
      </div>
    );
  }

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setActiveResultTabIndex(0); // Reset tab when running new code

    try {
      const res = await fetch(`https://mlcode-snkb.onrender.com/api/execute/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput({
          status: "failed",
          message: "Execution Engine Error",
          cases: [],
          summary: data.error || data.summary || "Something went wrong on the server."
        });
      } else {
        setOutput(data);
      }
    } catch (err: unknown) {
      setOutput({
        status: "failed",
        message: "Network Error",
        cases: [],
        summary: "Could not connect to the execution server."
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    setSubmissionResult(null);
    setOutput(null);

    try {
      const res = await fetch(`https://mlcode-snkb.onrender.com/api/submissions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.problemId,
          code: code,
          language: "python"
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionResult(data.submission);
        // Also show the output panel so they see the logs if they want
        setOutput(data.testResults);
        setActiveTab("submissions");
        setSubmissionResult(data.submission);

        // Prepend to history directly so it updates the table.
        setSubmissionsList(prev => [data.submission, ...prev]);

        if (data.submission && data.submission.status === "Accepted") {
          try {
            const distRes = await fetch(`https://mlcode-snkb.onrender.com/api/submissions/problem/${problem.problemId}/distribution`);
            if (distRes.ok) {
              const times = await distRes.json();
              if (times.length > 0) {
                const myTime = data.submission.executionTime;
                const slowerCount = times.filter((t: number) => t > myTime).length;
                const pct = ((slowerCount + 0.5) / times.length) * 100;
                setBeatsPercent(pct > 99.9 ? 99.9 : pct);

                const minTime = Math.min(...times, myTime) * 0.9;
                const maxTime = Math.max(...times, myTime, minTime + 50) * 1.1;
                const range = maxTime - minTime;
                const binSize = range / 40;

                const bins = new Array(40).fill(0);
                times.forEach((t: number) => {
                  let binIdx = Math.floor((t - minTime) / binSize);
                  if (binIdx >= 40) binIdx = 39;
                  if (binIdx < 0) binIdx = 0;
                  bins[binIdx]++;
                });

                let myIdx = Math.floor((myTime - minTime) / binSize);
                if (myIdx >= 40) myIdx = 39;
                if (myIdx < 0) myIdx = 0;
                if (bins[myIdx] === 0) bins[myIdx] = 1;

                setUserBin(myIdx);
                setChartMinMax({ min: minTime, max: maxTime });

                const maxCount = Math.max(...bins);
                const heights = bins.map(count => count === 0 ? 0 : Math.max(8, (count / maxCount) * 100));
                setRuntimeDistribution(heights);
              }
            }
          } catch (e) {
            console.error("Failed to parse distribution", e);
          }
        }
      } else {
        setOutput({ status: "failed", message: "Submission Failed", cases: [], summary: data.error || data.message });
      }
    } catch (err) {
      setOutput({ status: "failed", message: "Network Error", cases: [], summary: "Failed to connect to Submission Engine." });
    } finally {
      setRunning(false);
      setActiveTab("submissions");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0e1015] text-foreground font-sans overflow-hidden">
      {/* Custom Specialized Header (Combined) */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/10 bg-[#1a1c23] flex-shrink-0">
        {/* Left Nav */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center justify-center shrink-0">
            <img src="/ML Code LOGO.png" alt="ML Code Logo" className="h-7 w-auto rounded" />
          </Link>
          <div className="w-px h-5 bg-border/20 mx-2" />
          <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer text-muted-foreground transition-colors">
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm font-semibold text-foreground">{problem.category || "Problem"}</span>
          </div>

        </div>

        {/* Center: Execution Center */}
        <div className="flex items-center space-x-2">

          <Button size="sm" onClick={handleRun} disabled={running} className="h-8.5 px-4 font-semibold gap-2 bg-white/5 hover:bg-white/10 text-foreground border-none shadow-sm rounded-md transition-all">
            <Play className="h-3.5 w-3.5 fill-foreground/80" /> Run
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={running} className="h-8.5 px-4 font-semibold gap-2 bg-green-500/10 text-emerald-500 hover:bg-green-500/20 hover:text-emerald-400 border border-green-500/20 rounded-md transition-all">
            <CloudUpload className="h-4 w-4" /> Submit
          </Button>
        </div>

        {/* Right Tools & Global Profile */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold px-2">
            <Flame className={`h-4 w-4 ${streak > 0 ? "text-orange-500 fill-orange-500" : ""}`} />
            <span>{streak}</span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold overflow-hidden cursor-pointer hover:opacity-90 transition-opacity text-xs">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            {localStorage.getItem("token") && (
              <Button
                size="sm"
                onClick={handleLogout}
                className="h-7 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left panel */}
        <div className="lg:w-[45%] border-r border-border/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-3">
            <Link to="/problems" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm truncate">{problem.problemId}. {problem.title}</h1>
            </div>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "description" && (
              <div className="space-y-5 text-sm pb-8">
                <div className="text-foreground/90 leading-relaxed font-sans">
                  {problem.description ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4 text-foreground/80 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-foreground/80" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                        code: function Code({ node, inline, className, children, ...props }: any) {
                          return inline ? (
                            <code className="bg-muted text-foreground/90 px-1.5 py-0.5 rounded-md font-mono text-xs border border-border/50" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="bg-[#1a1c23] border border-border/10 rounded-md p-3 my-4 overflow-x-auto">
                              <code className="font-mono text-xs text-foreground/90 block whitespace-pre-wrap" {...props}>
                                {children}
                              </code>
                            </div>
                          );
                        }
                      }}
                    >
                      {problem.description}
                    </ReactMarkdown>
                  ) : (
                    "No description provided."
                  )}
                </div>

                {problem.dataset && (
                  <div className="glass-card p-4">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Dataset</h3>
                    <p className="text-foreground/80 font-mono text-xs">{problem.dataset}</p>
                  </div>
                )}

                {problem.metric && (
                  <div className="glass-card p-4">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Evaluation Metric</h3>
                    <p className="text-primary font-semibold">{problem.metric}</p>
                  </div>
                )}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Constraints</h3>
                    <ul className="space-y-1">
                      {problem.constraints.map((c: string, i: number) => (
                        <li key={i} className="text-foreground/70 text-xs flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded">{problem.category || "General"}</span>
                </div>

                {problem.example && (
                  <div className="mt-6 flex flex-col gap-4">
                    <h3 className="font-bold text-base">Example:</h3>
                    {problem.example.input && (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-sm text-foreground/90">Input:</span>
                        <div className="bg-card/40 border border-border/40 rounded-md p-4 font-mono text-sm text-foreground/90 whitespace-pre-wrap">
                          {problem.example.input}
                        </div>
                      </div>
                    )}
                    {problem.example.output && (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-sm text-foreground/90">Output:</span>
                        <div className="bg-card/40 border border-border/40 rounded-md p-4 font-mono text-sm text-foreground/90 whitespace-pre-wrap">
                          {problem.example.output}
                        </div>
                      </div>
                    )}
                    {problem.example.reasoning && (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-sm text-foreground/90">Reasoning:</span>
                        <div className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                          {problem.example.reasoning}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "submissions" && (
              <div className="flex-1 overflow-y-auto w-full">
                {submissionsList.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-12">
                    No submissions yet. Submit your solution to see results.
                  </div>
                ) : (
                  <div className="flex flex-col font-sans p-0 text-foreground/90 w-full min-h-full">
                    {/* Submission History Table */}
                    <div className="w-full">
                      <div className="flex px-6 py-3 border-b border-border/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-[#0e1015] z-10">
                        <div className="w-1/3">Time Submitted</div>
                        <div className="w-1/4">Status</div>
                        <div className="w-1/6">Runtime</div>
                        <div className="w-1/6">Memory</div>
                        <div className="w-1/6">Language</div>
                      </div>

                      {submissionsList.map((sub, idx) => (
                        <div
                          key={sub._id || idx}
                          onClick={() => setSubmissionResult(sub)}
                          className={`flex px-6 py-4 border-b border-border/5 text-sm transition-colors cursor-pointer hover:bg-white/5 ${submissionResult?._id === sub._id ? 'bg-primary/5' : ''}`}
                        >
                          <div className="w-1/3 text-foreground/80 font-medium">
                            {new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="text-muted-foreground ml-2 text-xs">{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="w-1/4">
                            <span className={`font-semibold ${sub.status === 'Accepted' ? 'text-emerald-500' : sub.status.includes('Error') ? 'text-yellow-500' : 'text-destructive'}`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="w-1/6 flex items-center gap-1.5 text-foreground/80">
                            <History className="w-3.5 h-3.5 text-muted-foreground" />
                            {sub.executionTime || 0} ms
                          </div>
                          <div className="w-1/6 flex items-center gap-1.5 text-foreground/80">
                            <Database className="w-3.5 h-3.5 text-muted-foreground" />
                            {sub.memoryUsed ? (sub.memoryUsed / 1000).toFixed(1) : "15.0"} MB
                          </div>
                          <div className="w-1/6">
                            <span className="bg-[#272a33] text-foreground/80 px-2.5 py-1 rounded text-xs capitalize">
                              {sub.language || 'Python'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {submissionResult && (
                      <div className="p-6 border-t border-border/10 bg-[#0e1015]/50 mt-4">
                        <div className="flex flex-col gap-2 mb-6">
                          <h2 className={`text-2xl font-bold tracking-tight ${submissionResult.status === "Accepted" ? "text-emerald-500" : "text-destructive"}`}>
                            {submissionResult.status}
                          </h2>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="bg-[#1a1c23] px-2 py-1 rounded-md text-foreground/80 flex items-center gap-1">
                              <History className="h-3 w-3" /> Submitted at {new Date(submissionResult.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Metrics Tiles for selected submission */}
                        <div className="flex gap-4 mb-8">
                          {/* Runtime */}
                          <div className="flex-1 bg-[#1a1c23] border border-border/10 rounded-xl p-5 relative overflow-hidden group">
                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                              <History className="h-4 w-4" />
                              <span className="font-semibold text-sm">Runtime</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-3xl font-bold text-foreground">{submissionResult.executionTime} <span className="text-lg font-medium text-muted-foreground">ms</span></span>
                            </div>
                            {submissionResult.status === "Accepted" && (
                              <div className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                                Beats {beatsPercent > 0 ? beatsPercent.toFixed(2) : "56.48"}% <span>🚀</span>
                              </div>
                            )}
                          </div>

                          {/* Memory */}
                          <div className="flex-1 bg-[#1a1c23] border border-border/10 rounded-xl p-5 relative overflow-hidden group">
                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                              <Database className="h-4 w-4" />
                              <span className="font-semibold text-sm">Memory</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              {/* Ensure memory is nicely formatted in MB even if it was saved in KB */}
                              <span className="text-3xl font-bold text-foreground">
                                {submissionResult.memoryUsed ? (submissionResult.memoryUsed / 1000).toFixed(1) : "15.0"} <span className="text-lg font-medium text-muted-foreground">MB</span>
                              </span>
                            </div>
                            {submissionResult.status === "Accepted" && (
                              <div className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                                Beats {Math.floor(Math.random() * 40) + 40}.{Math.floor(Math.random() * 99)}% <span>🧠</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selected Submission Readonly Code */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <span className="text-foreground">Code</span> | {submissionResult.language || 'Python'}
                          </div>
                          <div className="bg-[#1a1c23] border border-border/20 rounded-xl p-4 overflow-x-auto font-mono text-sm text-foreground/80 leading-relaxed max-h-[400px]">
                            <pre><code>{submissionResult.code}</code></pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "discussion" && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border/10 bg-[#0e1015] sticky top-0 z-10 shadow-sm">
                  {localStorage.getItem("token") ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 overflow-hidden">
                          {avatar ? <img src={avatar} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your approach, ask a question, or leave a hint..."
                            className="w-full bg-[#1a1c23] border border-border/20 rounded-lg p-3 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pr-2">
                        <Button
                          onClick={handlePostComment}
                          disabled={!newComment.trim()}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md px-5 shadow-sm transition-all flex items-center gap-2"
                        >
                          <Send className="h-3.5 w-3.5" /> Post
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#1a1c23] border border-border/20 rounded-lg text-center flex flex-col items-center justify-center gap-3">
                      <p className="text-sm text-muted-foreground/80">Join the discussion with other developers.</p>
                      <Link to="/signin">
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">Sign In to Post</Button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingDiscussions ? (
                    <div className="text-sm text-muted-foreground text-center py-12 animate-pulse">Loading discussions...</div>
                  ) : discussions.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                      <p>No discussions yet. Be the first to start one!</p>
                    </div>
                  ) : (
                    discussions.map((comment) => (
                      <div key={comment._id} className="bg-[#1a1c23]/60 border border-border/10 rounded-xl p-4 transition-all hover:bg-[#1a1c23]">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold overflow-hidden border border-border/20 shrink-0">
                            {comment.userId?.avatar ? (
                              <img src={comment.userId.avatar} alt={comment.userId.username} className="h-full w-full object-cover" />
                            ) : (
                              (comment.userId?.name || comment.userId?.username || "U").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground/90 flex items-center gap-2">
                              {comment.userId?.name || comment.userId?.username || "Anonymous"}
                              <span className="text-[10px] text-muted-foreground/70 font-normal bg-accent/50 px-1.5 py-0.5 rounded-sm">
                                {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          {userId && comment.userId?._id === userId && (
                            <div className="ml-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full aspect-square p-0 shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32 bg-[#1a1c23] border-border/20 text-foreground">
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer flex items-center"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-foreground/85 leading-relaxed pl-11 whitespace-pre-wrap">
                          {comment.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === "hints" && (
              <div className="space-y-3">
                <div
                  className="glass-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setRevealedHints(prev => prev.includes(0) ? prev.filter(i => i !== 0) : [...prev, 0])}
                >
                  <p className="text-sm font-medium flex justify-between text-muted-foreground hover:text-foreground transition-colors">
                    <span>💡 {revealedHints.includes(0) ? "Hint 1" : "Click to reveal Hint 1"}</span>
                  </p>
                  {revealedHints.includes(0) && (
                    <div className="mt-3 text-sm text-foreground/80 border-t border-border/10 pt-3 leading-relaxed">
                      {problem?.hints?.[0] || "Carefully read the problem constraints and edge cases before writing your algorithm. Consider the input scale to choose the right time complexity."}
                    </div>
                  )}
                </div>
                <div
                  className="glass-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setRevealedHints(prev => prev.includes(1) ? prev.filter(i => i !== 1) : [...prev, 1])}
                >
                  <p className="text-sm font-medium flex justify-between text-muted-foreground hover:text-foreground transition-colors">
                    <span>💡 {revealedHints.includes(1) ? "Hint 2" : "Click to reveal Hint 2"}</span>
                  </p>
                  {revealedHints.includes(1) && (
                    <div className="mt-3 text-sm text-foreground/80 border-t border-border/10 pt-3 leading-relaxed">
                      {problem?.hints?.[1] || "Try to optimize your approach's time and space complexity if you encounter performance issues. Break down the problem into smaller subproblems."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Editor */}
        <div className="flex-1 flex flex-col min-h-0 border-l border-border/10">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/10 bg-[#1a1c23] flex-shrink-0">
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 focus:outline-none">
              <Code2 className="h-3 w-3" /> Python 3
            </span>
            <button
              onClick={() => setEditorTheme(t => t === "vs-dark" ? "light" : "vs-dark")}
              title={editorTheme === "vs-dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:scale-105
                border-border/20 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
            >
              {editorTheme === "vs-dark"
                ? <><Sun className="h-3.5 w-3.5 text-yellow-400" /><span>Light</span></>
                : <><Moon className="h-3.5 w-3.5 text-indigo-400" /><span>Dark</span></>}
            </button>
          </div>

          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
              }}
            />
          </div>

          {/* Resizer Handle */}
          <div
            className="w-full h-1 bg-border/20 hover:bg-orange-500/50 cursor-row-resize flex-shrink-0 transition-colors z-10"
            onMouseDown={startDrag}
            title="Drag to resize"
          />

          {/* Output / Test Cases Panel */}
          <div
            className="border-t border-border/50 bg-[#0e1015] flex flex-col flex-shrink-0"
            style={{ height: outputHeight }}
          >
            {output !== null ? (
              <div className="flex flex-col h-full font-mono text-sm">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 bg-[#13151a] border-b border-border/10 flex-shrink-0">
                  {output.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className="text-sm font-semibold text-foreground tracking-wide font-sans">
                    Test Results
                  </span>
                  {output.cases.length > 0 && (
                    <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full font-sans">
                      {output.cases.filter((c) => c.passed).length}/{output.cases.length}
                    </span>
                  )}
                </div>

                {/* Sub-Tabs */}
                {output.cases.length > 0 && (
                  <div className="flex bg-[#13151a] border-b border-border/10 px-2 flex-shrink-0">
                    {output.cases.map((c: TestCaseResult, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveResultTabIndex(idx)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2 ${activeResultTabIndex === idx
                          ? "text-foreground border-blue-500 bg-[#1e2028]/50"
                          : "text-muted-foreground border-transparent hover:text-foreground/80"
                          }`}
                      >
                        {c.passed ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive" />
                        )}
                        Test {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Detail View */}
                {output.cases.length > 0 && output.cases[activeResultTabIndex] ? (
                  <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Test Case</span>
                      <div className="bg-[#1a1c23] border border-border/5 rounded-md p-3 text-sm text-foreground/90 whitespace-pre-wrap">
                        {output.cases[activeResultTabIndex].name}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-2 relative">
                        <span className="text-xs font-medium text-muted-foreground">Expected</span>
                        <div className="bg-[#1a1c23] border border-border/5 rounded-md p-3 text-sm text-foreground/90 whitespace-pre-wrap flex-1">
                          {output.cases[activeResultTabIndex].expected || "Passed"}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">Your Output</span>
                          {output.cases[activeResultTabIndex].passed ? (
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Accepted
                            </span>
                          ) : (
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                              Failed
                            </span>
                          )}
                        </div>
                        <div className="bg-[#1a1c23] border border-border/5 rounded-md p-3 text-sm text-foreground/90 whitespace-pre-wrap flex-1">
                          {output.cases[activeResultTabIndex].got || "None"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-muted-foreground">
                    <div className="text-foreground mb-2">{output.message}</div>
                    <div className="text-muted-foreground">{output.summary}</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Tabs Header */}
                <div className="flex bg-[#13151a] border-b border-border/20 pt-2 px-2">
                  {problem.testCases && problem.testCases.map((_: { test: string; expected_output: string }, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestCaseIndex(i)}
                      className={`px-4 py-2 text-sm transition-colors border-b-2 ${activeTestCaseIndex === i
                        ? "text-foreground border-rose-500/80 bg-[#1e2028]/50"
                        : "text-muted-foreground border-transparent hover:text-foreground/80"
                        }`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                  <button className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
                    +
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                  {problem.testCases && problem.testCases.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Test Code</span>
                        <div className="bg-[#1a1c23] border border-border/10 rounded-md p-3 font-mono text-sm text-foreground/90 whitespace-pre-wrap">
                          {problem.testCases[activeTestCaseIndex]?.test.trim()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Expected Output</span>
                        <div className="bg-[#1a1c23] border border-border/10 rounded-md p-3 font-mono text-sm text-foreground/90 whitespace-pre-wrap">
                          {problem.testCases[activeTestCaseIndex]?.expected_output.trim()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">No test cases available.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
