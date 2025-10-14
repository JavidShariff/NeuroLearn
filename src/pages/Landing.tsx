import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Users, MessageSquare, Sparkles, ArrowRight, Zap, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Quiz Generation",
      description: "Transform your notes into interactive quizzes powered by advanced AI",
    },
    {
      icon: Users,
      title: "Peer Study Rooms",
      description: "Collaborate in real-time with study groups and video conferencing",
    },
    {
      icon: MessageSquare,
      title: "Forums & Discussion",
      description: "Engage with a community of learners and share knowledge",
    },
    {
      icon: Zap,
      title: "Real-time Collaboration",
      description: "Edit notes together and get instant AI assistance",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Learners" },
    { icon: Target, value: "50K+", label: "Quizzes Generated" },
    { icon: Brain, value: "98%", label: "Success Rate" },
    { icon: Shield, value: "24/7", label: "AI Support" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm">Powered by Advanced AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Study Smarter. Together.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered collaborative learning platform for students & professionals.
              Transform how you learn with intelligent quizzes and peer collaboration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/rooms">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-primary group">
                  Join Study Room
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/quiz">
                <Button size="lg" variant="outline" className="glass-card hover-lift">
                  Take a Quiz
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-3xl opacity-30 animate-glow" />
              <div className="relative glass-card p-8 rounded-2xl border-2 border-primary/20">
                <Brain className="h-32 w-32 mx-auto text-primary animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold gradient-text mb-2">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to enhance your learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card p-6 hover-lift h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of learners already using NeuroLearn to achieve their goals
              </p>
              <Link to="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-primary">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
