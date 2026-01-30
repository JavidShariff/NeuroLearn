import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Clock, Users, Target, TrendingUp, ArrowRight, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockUser, mockAnalyticsData, mockUserStreak } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const stats = [
    { icon: Trophy, label: "Total Quizzes", value: "24", color: "text-primary" },
    { icon: Target, label: "Average Score", value: "85%", color: "text-secondary" },
    { icon: Clock, label: "Study Hours", value: "127", color: "text-accent" },
    { icon: Users, label: "Peer Interactions", value: "48", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{mockUser.name}</span>! 👋
          </h1>
          <p className="text-muted-foreground">Here's your learning progress</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-primary/10`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </Card>
              </motion.div>
            );
          })}
          
          {/* Streak Card */}
          <Link to="/leaderboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card p-6 hover-lift cursor-pointer border-2 border-orange-500/50 bg-orange-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <Flame className="h-6 w-6 text-orange-500 animate-glow" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-orange-500">{mockUserStreak.currentStreak} 🔥</p>
              </Card>
            </motion.div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Performance Overview</h2>
                <Link to="/analytics">
                  <Button variant="ghost" size="sm" className="group">
                    View Full Report
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockAnalyticsData.quizPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { title: "React Basics Quiz", score: 92, time: "2 hours ago" },
                  { title: "Joined ML Study Room", time: "Yesterday" },
                  { title: "Algorithm Quiz", score: 85, time: "2 days ago" },
                  { title: "Forum Discussion", time: "3 days ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg glass hover-lift cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      {activity.score && (
                        <p className="text-sm text-primary">Score: {activity.score}%</p>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Learning Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Learning Goals</h2>
            <div className="space-y-6">
              {[
                { goal: "Complete 30 Quizzes", current: 24, total: 30 },
                { goal: "Join 5 Study Rooms", current: 3, total: 5 },
                { goal: "100 Hours Study Time", current: 127, total: 100 },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.goal}</span>
                    <span className="text-muted-foreground">
                      {item.current}/{item.total}
                    </span>
                  </div>
                  <Progress value={(item.current / item.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link to="/quiz" className="block">
            <Card className="glass-card p-6 hover-lift text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Take a Quiz</h3>
              <p className="text-sm text-muted-foreground">Test your knowledge</p>
            </Card>
          </Link>
          
          <Link to="/rooms" className="block">
            <Card className="glass-card p-6 hover-lift text-center">
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Join Study Room</h3>
              <p className="text-sm text-muted-foreground">Collaborate with peers</p>
            </Card>
          </Link>
          
          <Link to="/forum" className="block">
            <Card className="glass-card p-6 hover-lift text-center">
              <Target className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Browse Forum</h3>
              <p className="text-sm text-muted-foreground">Join discussions</p>
            </Card>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
