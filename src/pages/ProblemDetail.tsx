import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Send, FileText, MessageSquare, Lightbulb, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { problems } from "@/data/problems";
import DifficultyBadge from "@/components/DifficultyBadge";
import Editor from "@monaco-editor/react";

const tabs = [
  { id: "description", label: "Description", icon: FileText },
  { id: "submissions", label: "Submissions", icon: History },
  { id: "discussion", label: "Discussion", icon: MessageSquare },
  { id: "hints", label: "Hints", icon: Lightbulb },
];

const ProblemDetail = () => {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === Number(id));
  const [activeTab, setActiveTab] = useState("description");
  const [code, setCode] = useState(problem?.starterCode || "");
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-muted-foreground">
        Problem not found. <Link to="/problems" className="text-primary ml-2">Go back</Link>
      </div>
    );
  }

  const handleRun = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setOutput("Running sample test...\n\n✓ Test case 1: Passed\n✓ Test case 2: Passed\n✗ Test case 3: Failed (expected 0.85, got 0.72)\n\nPassed: 2/3");
      setRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      const score = (Math.random() * 30 + 65).toFixed(1);
      setOutput(`Evaluating on hidden test set...\n\n${problem.metric}: ${score}%\n\nStatus: ${Number(score) > 75 ? "✓ Accepted" : "✗ Wrong Answer"}\nRuntime: ${(Math.random() * 2 + 0.5).toFixed(2)}s\nMemory: ${(Math.random() * 200 + 100).toFixed(0)}MB`);
      setRunning(false);
    }, 2500);
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="lg:w-[45%] border-r border-border/50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <Link to="/problems" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate">{problem.id}. {problem.title}</h1>
          </div>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id
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
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{problem.description}</div>

              <div className="glass-card p-4">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Dataset</h3>
                <p className="text-foreground/80 font-mono text-xs">{problem.dataset}</p>
              </div>

              <div className="glass-card p-4">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Evaluation Metric</h3>
                <p className="text-primary font-semibold">{problem.metric}</p>
              </div>

              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Constraints</h3>
                <ul className="space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="text-foreground/70 text-xs flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {problem.topics.map((t) => (
                  <span key={t} className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
          {activeTab === "submissions" && (
            <div className="text-sm text-muted-foreground text-center py-12">No submissions yet. Submit your solution to see results.</div>
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
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50">
          <span className="text-xs font-mono text-muted-foreground">Python 3</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRun} disabled={running} className="gap-1.5 text-xs border-border/50">
              <Play className="h-3 w-3" /> Run
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={running} className="gap-1.5 text-xs">
              <Send className="h-3 w-3" /> Submit
            </Button>
          </div>
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

        {/* Output */}
        {output !== null && (
          <div className="border-t border-border/50 bg-card/80 p-4 max-h-48 overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Output</div>
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;
