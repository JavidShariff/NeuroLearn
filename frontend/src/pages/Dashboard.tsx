import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Trophy,
  Clock,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Flame,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { analyticsAPI, leaderboardAPI, userAPI } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const streak = user?.streak;
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [analyticsRes, activityRes] = await Promise.all([
          analyticsAPI.getMyAnalytics(),
          userAPI.getUserActivity(user!._id),
        ]);
        setAnalytics(analyticsRes.data.data.analytics);

        // Process and sort activity
        const activity = activityRes.data.data.activity;
        const recentQuizzes = activity.recentQuizzes.map((q: any) => ({
          type: "quiz",
          title: `Completed ${q.quiz?.title || "Quiz"}`,
          date: new Date(q.completedAt),
          score: q.score,
          id: q._id,
        }));

        const joinedRooms = activity.joinedRooms.map((r: any) => ({
          type: "room",
          title: `Joined ${r.name}`,
          date: new Date(r.joinedAt || r.createdAt),
          id: r._id,
        }));

        const studySessions =
          activity.studySessions?.map((s: any) => ({
            type: "study",
            title: `Studied in ${s.room?.name || "Room"}`,
            date: new Date(s.endTime),
            duration: Math.round(s.durationMinutes),
            id: s._id,
          })) || [];

        const forumPosts = activity.forumPosts.map((p: any) => ({
          type: "post",
          title: `Posted: ${p.title}`,
          date: new Date(p.createdAt),
          id: p._id,
        }));

        const forumComments = activity.forumComments.map((c: any) => ({
          type: "comment",
          title: `Commented on: ${c.post?.title || "Post"}`,
          date: new Date(c.createdAt),
          id: c._id,
        }));

        const sortedActivity = [
          ...recentQuizzes,
          ...joinedRooms,
          ...studySessions,
          ...forumPosts,
          ...forumComments,
        ]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);

        setRecentActivity(sortedActivity);
      } catch (error) {
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setDataLoading(false);
    }
  }, [user?._id, authLoading, location.pathname]); // Removed dependency on whole user object to avoid loops

  const stats = [
    {
      icon: Trophy,
      label: "Total Quizzes",
      value: streak?.totalQuizzesTaken ?? 0,
      color: "text-primary",
    },
    {
      icon: Target,
      label: "Total Points",
      value: streak?.totalScore ?? 0,
      color: "text-secondary",
    },
    {
      icon: Clock,
      label: "Study Hours",
      value: analytics?.totalStudyHours
        ? Math.round(analytics.totalStudyHours * 10) / 10
        : 0,
      color: "text-accent",
    },
    {
      icon: Users,
      label: "Peer Interactions",
      value: analytics?.peerInteractions ?? 0,
      color: "text-primary",
    },
  ];

  if (authLoading || (dataLoading && user)) {
    return <DashboardSkeleton />;
  }

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
            Welcome back, <span className="gradient-text">{user?.name}</span>!👋
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
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
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
                <p className="text-sm text-muted-foreground mb-1">
                  Current Streak
                </p>
                <p className="text-3xl font-bold text-orange-500">
                  {streak?.currentStreak || 0} 🔥
                </p>
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
                <BarChart data={analytics?.quizPerformance || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="topic"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="averageScore"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
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
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${activity.type === "quiz"
                              ? "bg-primary/20 text-primary"
                              : activity.type === "room"
                                ? "bg-secondary/20 text-secondary"
                                : activity.type === "study"
                                  ? "bg-purple-500/20 text-purple-500"
                                  : "bg-accent/20 text-accent"
                            }`}
                        >
                          {activity.type === "quiz" && (
                            <Trophy className="h-4 w-4" />
                          )}
                          {activity.type === "room" && (
                            <Users className="h-4 w-4" />
                          )}
                          {activity.type === "study" && (
                            <Clock className="h-4 w-4" />
                          )}
                          {(activity.type === "post" ||
                            activity.type === "comment") && (
                              <MessageSquare className="h-4 w-4" />
                            )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {activity.score !== undefined && (
                        <div className="text-right">
                          <span className="font-bold text-primary">
                            {activity.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

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
              <p className="text-sm text-muted-foreground">
                Test your knowledge
              </p>
            </Card>
          </Link>

          <Link to="/rooms" className="block">
            <Card className="glass-card p-6 hover-lift text-center">
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Join Study Room</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate with peers
              </p>
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
