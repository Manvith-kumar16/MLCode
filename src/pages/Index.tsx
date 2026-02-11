import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Code2, Trophy, TrendingUp, Zap, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";

const features = [
  { icon: Code2, title: "ML Problem Sets", desc: "150+ curated machine learning challenges across classification, regression, NLP, and computer vision" },
  { icon: Zap, title: "Instant Evaluation", desc: "Submit code and get scored against hidden test datasets with metrics like Accuracy, F1, RMSE" },
  { icon: Trophy, title: "Compete & Rank", desc: "Climb global leaderboards, earn badges, and maintain daily solving streaks" },
  { icon: TrendingUp, title: "Track Progress", desc: "Visualize your ML skill growth with detailed analytics and submission history" },
  { icon: Users, title: "Community", desc: "Discuss solutions, share insights, and learn from thousands of ML practitioners" },
  { icon: Brain, title: "Learn by Doing", desc: "Structured learning paths from basic regression to advanced deep learning architectures" },
];

const stats = [
  { value: "150+", label: "ML Problems" },
  { value: "50K+", label: "Submissions" },
  { value: "10K+", label: "Users" },
  { value: "95%", label: "Satisfaction" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              The #1 Platform for ML Practice
            </div>
            <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Master <span className="text-gradient">Machine Learning</span> Through Practice
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Solve real-world ML problems, get instant feedback with industry-standard metrics, and compete with practitioners worldwide.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/problems">
                <Button size="lg" className="gap-2 text-base font-semibold px-8">
                  Start Practicing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" size="lg" className="gap-2 text-base border-border/50 hover:bg-accent">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">Everything You Need to Excel in ML</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">A complete platform designed to take you from beginner to expert in machine learning.</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6 hover-lift group"
            >
              <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="glass-card p-10 text-center glow-border">
          <h2 className="text-3xl font-bold mb-3">Ready to Level Up Your ML Skills?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Join thousands of ML engineers who practice daily on MLCode.</p>
          <Link to="/problems">
            <Button size="lg" className="gap-2 font-semibold px-8">
              Browse Problems <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span>MLCode © 2026</span>
          </div>
          <div className="flex gap-4">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
