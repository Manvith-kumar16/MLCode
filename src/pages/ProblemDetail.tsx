import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Send, FileText, MessageSquare, Lightbulb, History, CheckCircle2, XCircle, Code2, LayoutGrid, ChevronLeft, ChevronRight, Shuffle, Layout, Settings, Flame, Timer, UserPlus, Bug, CloudUpload, Copy, Sparkles, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import DifficultyBadge from "@/components/DifficultyBadge";
import Editor from "@monaco-editor/react";

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
      const res = await fetch(`http://localhost:5001/api/problems/${id}`);
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
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:5001/api/auth/me", {
          headers: { "auth-token": token },
        });
        const data = await response.json();
        if (response.ok) {
          if (data.streak) setStreak(data.streak.current || 0);
          setAvatar(data.avatar || "");
          setName(data.name || "U");
        }
      } catch (error) {
        console.error("Failed to fetch user data");
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode || "# Write your solution here\n");
    }
  }, [problem]);

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
      const res = await fetch(`http://localhost:5001/api/execute/${id}`, {
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
      const res = await fetch(`http://localhost:5001/api/submissions/submit`, {
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
          <Link to="/" className="flex h-7 w-7 items-center justify-center rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors">
            <Code2 className="size-4" />
          </Link>
          <div className="w-px h-5 bg-border/20 mx-2" />
          <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer text-muted-foreground transition-colors">
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm font-semibold text-foreground">{problem.category || "Problem"}</span>
          </div>
          <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded cursor-pointer transition-colors ml-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded cursor-pointer transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded cursor-pointer transition-colors ml-2">
            <Shuffle className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Execution Center */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 rounded-md text-yellow-500">
            <Bug className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleRun} disabled={running} className="h-8.5 px-4 font-semibold gap-2 bg-white/5 hover:bg-white/10 text-foreground border-none shadow-sm rounded-md transition-all">
            <Play className="h-3.5 w-3.5 fill-foreground/80" /> Run
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={running} className="h-8.5 px-4 font-semibold gap-2 bg-green-500/10 text-emerald-500 hover:bg-green-500/20 hover:text-emerald-400 border border-green-500/20 rounded-md transition-all">
            <CloudUpload className="h-4 w-4" /> Submit
          </Button>
        </div>

        {/* Right Tools & Global Profile */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white/5 px-2 py-1 rounded-lg border border-border/5 space-x-1">
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
              <Timer className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
              <Layout className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-border/20 mx-2" />

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
              <div className="space-y-5 text-sm">
                <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-sans">{problem.description || "No description provided."}</div>

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
                {!submissionResult ? (
                  <div className="text-sm text-muted-foreground text-center py-12">
                    No submissions yet. Submit your solution to see results.
                  </div>
                ) : (
                  <div className="flex flex-col font-sans p-6 text-foreground/90 w-full min-h-full">

                    {/* Header */}
                    <div className="flex flex-col gap-2 mb-8">
                      <h2 className={`text-3xl font-bold tracking-tight ${submissionResult.status === "Accepted" ? "text-emerald-500" : "text-destructive"}`}>
                        {submissionResult.status}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">{problem.testCases?.length || 0} / {problem.testCases?.length || 0} testcases passed</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="bg-muted px-2 py-1 rounded-md text-foreground/80 flex items-center gap-1">
                          <History className="h-3 w-3" /> Submitted at {new Date(submissionResult.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Tiles */}
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
                        <div className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                          Beats 56.48% <span>🚀</span>
                        </div>
                      </div>

                      {/* Memory */}
                      <div className="flex-1 bg-[#1a1c23] border border-border/10 rounded-xl p-5 relative overflow-hidden group">
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <History className="h-4 w-4" />
                          <span className="font-semibold text-sm">Memory</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-foreground">{(submissionResult.memoryUsed / 1024).toFixed(2)} <span className="text-lg font-medium text-muted-foreground">MB</span></span>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          Beats 45.53%
                        </div>
                      </div>
                    </div>

                    {/* Mocked Histogram */}
                    <div className="w-full h-40 flex items-end justify-center gap-1.5 mb-12 px-6 py-6 bg-[#0e1015] rounded-xl border border-border/10">
                      {[
                        8, 14, 10, 18, 22, 14, 22, 10, 85, 12,
                        10, 14, 20, 16, 12, 14, 10, 8, 16, 22,
                        24, 20, 16, 20, 24, 26, 18, 14, 22, 24,
                        16, 10, 14, 10, 18, 14, 10, 14, 20, 12
                      ].map((height, i) => (
                        <div
                          key={i}
                          className={`w-3.5 rounded-t-[4px] transition-all duration-300 ${i === 8 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-[#272a33] hover:bg-[#343844] cursor-pointer'}`}
                          style={{ height: `${height}%` }}
                          title={i === 8 ? "Your Runtime" : `Runtime: ${Math.floor(Math.random() * 50) + 20}ms`}
                        />
                      ))}
                    </div>

                    {/* Submitted Code Readonly */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span className="text-foreground">Code</span> | Python
                      </div>
                      <div className="bg-[#0e1015] border border-border/20 rounded-xl p-4 overflow-x-auto font-mono text-sm text-foreground/80 leading-relaxed">
                        <pre><code>{submissionResult.code}</code></pre>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
            {activeTab === "discussion" && (
              <div className="text-sm text-muted-foreground text-center py-12">No discussions yet. Be the first to start one!</div>
            )}
            {activeTab === "hints" && (
              <div className="space-y-3">
                <div className="glass-card p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                  <p className="text-sm text-muted-foreground">💡 Click to reveal Hint 1</p>
                </div>
                <div className="glass-card p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                  <p className="text-sm text-muted-foreground">💡 Click to reveal Hint 2</p>
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
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
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

          {/* Output / Test Cases Panel */}
          <div className="border-t border-border/50 bg-[#0e1015] min-h-64 max-h-80 flex flex-col flex-shrink-0">
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
