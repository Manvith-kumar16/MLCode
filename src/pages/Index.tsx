import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Code2, Trophy, TrendingUp, Zap, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";

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

      {/* Combined Hero */}
      <section className="relative overflow-hidden pt-4 pb-16 lg:pt-8 lg:pb-20">


        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(100%)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background" />

        {/* Ambient glow matching primary */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full opacity-50" />
          <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full opacity-50" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 min-h-[500px]">
            {/* Left side text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-10"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-lg shadow-primary/10">
                <Zap className="h-4 w-4" />
                The #1 Platform for ML Practice
              </div>

              <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60">
                Master <span className="text-primary">Machine Learning</span> <br /> Through Practice
              </h1>

              <p className="mb-10 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Solve real-world ML problems, get instant feedback with industry-standard metrics, and compete with practitioners worldwide. Drag the globe to explore.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link to="/problems" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 text-base font-semibold px-8 h-12 w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Start Practicing <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/leaderboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="gap-2 text-base border-border/50 hover:bg-accent/50 h-12 w-full sm:w-auto backdrop-blur-sm">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right side Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex-1 relative flex items-center justify-center w-full min-h-[400px] lg:min-h-[600px] z-10"
            >
              {/* Decorative Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border border-primary/10 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border border-primary/20 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

              <div className="absolute inset-0 flex items-center justify-center">
                <InteractiveGlobe size={600} className="!w-full !h-auto max-w-[600px] aspect-square" />
              </div>
            </motion.div>
          </div>
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
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Excel</h2>
          <p className="text-muted-foreground text-lg">A complete platform designed to take you from beginner to expert in machine learning.</p>
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
              <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="glass-card p-10 sm:p-14 text-center glow-border flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Level Up Your ML Skills?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">Join thousands of ML engineers who practice daily on MLCode.</p>
          <Link to="/problems">
            <Button size="lg" className="gap-2 font-semibold px-8 h-12 shadow-lg shadow-primary/20">
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
