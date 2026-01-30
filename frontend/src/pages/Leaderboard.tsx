import { motion } from "framer-motion";
import { Trophy, Flame, TrendingUp, Award, Zap, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockLeaderboard, mockUserStreak } from "@/lib/mockData";

const Leaderboard = () => {
  const currentUser = mockLeaderboard.find(user => user.isCurrentUser);

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
            <Trophy className="inline h-10 w-10 text-primary mr-2" />
            Quiz <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">Compete with peers and maintain your streak!</p>
        </motion.div>

        {/* Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Flame className="h-12 w-12 text-orange-500 animate-glow" />
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-500">{mockUserStreak.currentStreak} days</p>
                  <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Award className="h-12 w-12 text-primary" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-3xl font-bold text-primary">{mockUserStreak.longestStreak} days</p>
                  <p className="text-xs text-muted-foreground">Personal best!</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Zap className="h-12 w-12 text-secondary" />
                  <div className="absolute inset-0 bg-secondary/20 blur-xl" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-3xl font-bold text-secondary">#{currentUser?.rank}</p>
                  <p className="text-xs text-muted-foreground">Top performer!</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              7-Day Streak History
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {mockUserStreak.streakHistory.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="text-center"
                >
                  <div className={`aspect-square rounded-lg flex items-center justify-center ${
                    day.completed 
                      ? 'bg-orange-500/20 border-2 border-orange-500' 
                      : 'bg-muted border-2 border-border'
                  }`}>
                    {day.completed ? (
                      <Flame className="h-6 w-6 text-orange-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
              className="order-1"
            >
              <Card className="glass-card p-4 text-center hover-lift mt-8">
                <div className="text-4xl mb-2">{mockLeaderboard[1].badge}</div>
                <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-muted">
                  <AvatarImage src={mockLeaderboard[1].avatar} />
                  <AvatarFallback>{mockLeaderboard[1].name[0]}</AvatarFallback>
                </Avatar>
                <p className="font-bold">{mockLeaderboard[1].name}</p>
                <p className="text-2xl font-bold text-muted-foreground my-2">{mockLeaderboard[1].score}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-orange-500">
                  <Flame className="h-4 w-4" />
                  {mockLeaderboard[1].streak} days
                </div>
              </Card>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5 }}
              className="order-2"
            >
              <Card className="glass-card p-4 text-center hover-lift border-2 border-primary glow-primary">
                <div className="text-5xl mb-2">{mockLeaderboard[0].badge}</div>
                <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-primary">
                  <AvatarImage src={mockLeaderboard[0].avatar} />
                  <AvatarFallback>{mockLeaderboard[0].name[0]}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg">{mockLeaderboard[0].name}</p>
                <p className="text-3xl font-bold text-primary my-2">{mockLeaderboard[0].score}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-orange-500">
                  <Flame className="h-4 w-4" />
                  {mockLeaderboard[0].streak} days
                </div>
              </Card>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
              className="order-3"
            >
              <Card className="glass-card p-4 text-center hover-lift mt-8">
                <div className="text-4xl mb-2">{mockLeaderboard[2].badge}</div>
                <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-muted">
                  <AvatarImage src={mockLeaderboard[2].avatar} />
                  <AvatarFallback>{mockLeaderboard[2].name[0]}</AvatarFallback>
                </Avatar>
                <p className="font-bold">{mockLeaderboard[2].name}</p>
                <p className="text-2xl font-bold text-muted-foreground my-2">{mockLeaderboard[2].score}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-orange-500">
                  <Flame className="h-4 w-4" />
                  {mockLeaderboard[2].streak} days
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Full Rankings</h2>
            <div className="space-y-3">
              {mockLeaderboard.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg glass hover-lift ${
                    user.isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="text-2xl font-bold w-12 text-center text-muted-foreground">
                    #{user.rank}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{user.name}</p>
                      {user.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                      {user.rank <= 3 && (
                        <span className="text-lg">{user.badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.quizzesTaken} quizzes completed</p>
                  </div>

                  <div className="flex items-center gap-2 text-orange-500">
                    <Flame className="h-5 w-5" />
                    <span className="font-bold">{user.streak}</span>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{user.score}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>

                  {user.rank <= 3 && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Streak Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Streak Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <p className="font-semibold">Daily Commitment</p>
                  <p className="text-sm text-muted-foreground">Take at least one quiz every day to maintain your streak</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-semibold">Consistency Bonus</p>
                  <p className="text-sm text-muted-foreground">7-day streaks earn 2x points, 30-day streaks earn 3x points!</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <p className="font-semibold">Compete & Grow</p>
                  <p className="text-sm text-muted-foreground">Higher streaks improve your leaderboard ranking</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">📱</div>
                <div>
                  <p className="font-semibold">Set Reminders</p>
                  <p className="text-sm text-muted-foreground">Daily notifications help you never miss a day</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
