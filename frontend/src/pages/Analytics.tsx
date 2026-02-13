import { motion } from "framer-motion";
import { TrendingUp, Clock, Target, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { analyticsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Analytics = () => {
  const { checkAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const fetchData = async () => {
      try {
        const response = await analyticsAPI.getMyAnalytics();
        setData(response.data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      icon: Award,
      label: "Total Score",
      value: data?.streak?.totalScore ?? 0,
      trend: "+0%",
    },
    {
      icon: Target,
      label: "Quizzes Completed",
      value: data?.streak?.totalQuizzesTaken ?? 0,
      trend: "+0%",
    },
    {
      icon: Clock,
      label: "Study Hours",
      value: data?.analytics?.totalStudyHours
        ? Math.round(data.analytics.totalStudyHours * 10) / 10
        : 0,
      trend: "+0%",
    },
    {
      icon: TrendingUp,
      label: "Avg. Performance",
      value: `${(() => {
        if (!data?.analytics?.quizPerformance?.length) return 0;
        const total = data.analytics.quizPerformance.reduce(
          (acc: number, curr: any) => acc + (curr.averageScore || 0),
          0,
        );
        return Math.round(total / data.analytics.quizPerformance.length);
      })()}%`,
      trend: "+0%",
    },
  ];

  const masteryData = (() => {
    const tm = data?.analytics?.topicMastery || [];
    if (Array.isArray(tm) && tm.length > 0) return tm;
    const qp = data?.analytics?.quizPerformance || [];
    return qp.map((p: any) => ({
      subject: p.topic,
      masteryLevel: p.averageScore,
      quizzesTaken: p.totalAttempts || p.attempts || 0,
    }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
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
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Learning Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your progress and identify areas for improvement
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm text-green-500 font-medium">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quiz Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Quiz Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.analytics?.quizPerformance || []}>
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

          {/* Study Time */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Weekly Study Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.analytics?.studyTime || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--secondary))", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Topic Mastery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Topic Mastery</h2>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={masteryData}
                >
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      if (name === "masteryLevel") {
                        return [`${value}%`, "Mastery"];
                      }
                      return [value, name];
                    }}
                  />
                  <Radar
                    name="Mastery"
                    dataKey="masteryLevel"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.5}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Performance Insights - Placeholder or derived from data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Insights content can be dynamic based on data if available */}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
