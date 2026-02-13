import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Camera,
  Mail,
  User,
  MapPin,
  Calendar,
  Edit,
  Save,
  Trophy,
  Flame,
  Target,
  Award,
  Star,
  Users,
  MessageSquare,
  Clock 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { userAPI, roomAPI, leaderboardAPI } from "@/lib/api";
import { ProfileSkeleton } from "@/components/ui/LoadingSkeleton";

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const streak = user?.streak;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      fetchUserData(user._id);
    }
  }, [user?._id]); // Only re-run when user ID changes

  const fetchUserData = async (userId: string) => {
    try {
      const [activityRes, achievementsRes, roomsRes] = await Promise.all([
        userAPI.getUserActivity(userId),
        userAPI.getUserAchievements(userId),
        roomAPI.getMyRooms(),
      ]);
      // Transform activity data
      const {
        recentQuizzes = [],
        joinedRooms = [],
        studySessions = [],
        forumPosts = [],
        forumComments = [],
      } = activityRes.data.data.activity || {};

      const quizActivity = recentQuizzes.map((q: any) => ({
        action: "Completed Quiz",
        details: `${q.quiz?.title || "Unknown Quiz"} (${q.percentage}%)`,
        timestamp: q.completedAt,
        type: "quiz",
      }));

      const roomActivity = joinedRooms.map((r: any) => ({
        action: "Joined Room",
        details: r.name,
        timestamp: r.joinedAt || r.createdAt,
        type: "room",
      }));

      const studyActivity = studySessions.map((s: any) => ({
        action: "Study Session",
        details: `Studied in ${s.room?.name || "Room"} (${Math.round(s.durationMinutes)}m)`,
        timestamp: s.endTime,
        type: "study",
      }));

      const postActivity = forumPosts.map((p: any) => ({
        action: "Posted in Forum",
        details: p.title,
        timestamp: p.createdAt,
        type: "post",
      }));

      const commentActivity = forumComments.map((c: any) => ({
        action: "Commented",
        details: `On: ${c.post?.title || "Post"}`,
        timestamp: c.createdAt,
        type: "comment",
      }));

      // Combine and sort by timestamp desc
      const allActivity = [
        ...quizActivity,
        ...roomActivity,
        ...studyActivity,
        ...postActivity,
        ...commentActivity,
      ]
        .sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 10);

      setActivity(allActivity);
      setAchievements(achievementsRes.data.data.achievements || []);
      setMyRooms(roomsRes.data.data.rooms || []);

      // Points and streak are already in the `user` object from AuthContext
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch user data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await userAPI.updateProfile({ name, email });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      checkAuth(); // Update global user context
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    }
  };

  if (!user || loading) return <ProfileSkeleton />;

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
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and track your progress
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="glass-card p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary hover:bg-primary/90 transition">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="glass-card mt-2"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="glass-card mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="flex-1 glass-card"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-1">{name}</h2>
                      <p className="text-muted-foreground mb-4">{email}</p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="w-full glass-card"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location || "Location not set"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card p-6">
                <h3 className="font-bold mb-4">Achievements</h3>
                <div className="space-y-3">
                  {achievements.length > 0 ? (
                    achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg glass"
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {achievement.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No achievements yet. Keep learning!
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Your Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 rounded-lg glass text-center border-2 border-primary/20 bg-primary/5">
                    <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-primary">
                      {streak?.totalScore || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Points
                    </p>
                  </div>
                  <div className="p-4 rounded-lg glass text-center">
                    <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-500">
                      {streak?.currentStreak || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current Streak
                    </p>
                  </div>
                  <div className="p-4 rounded-lg glass text-center">
                    <Award className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-secondary">
                      {streak?.longestStreak || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Longest Streak
                    </p>
                  </div>
                  <div className="p-4 rounded-lg glass text-center">
                    <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-accent">
                      {streak?.totalQuizzesTaken || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Quizzes
                    </p>
                  </div>
                  <div className="p-4 rounded-lg glass text-center">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-500">
                      #{streak?.rank || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">Your Rank</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {activity.length > 0 ? (
                    activity.map((act, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg glass hover-lift"
                      >
                        <div
                          className={`p-2 rounded-full ${
                            act.type === "quiz"
                              ? "bg-primary/20 text-primary"
                              : act.type === "room"
                                ? "bg-secondary/20 text-secondary"
                                : act.type === "study"
                                  ? "bg-accent/20 text-accent"
                                  : "bg-orange-500/20 text-orange-500"
                          }`}
                        >
                          {act.type === "quiz" && (
                            <Trophy className="h-4 w-4" />
                          )}
                          {act.type === "room" && <Users className="h-4 w-4" />}
                          {act.type === "study" && (
                            <Clock className="h-4 w-4" />
                          )}
                          {act.type === "post" && (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          {act.type === "comment" && (
                            <MessageSquare className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{act.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {act.details}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(act.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Joined Rooms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Joined Study Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRooms.map((room) => (
                    <div
                      key={room._id}
                      className="p-4 rounded-lg glass hover-lift cursor-pointer"
                    >
                      <h4 className="font-medium mb-1">{room.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {room.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className="glass-card text-xs"
                        >
                          {room.memberCount || room.members.length} members
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {myRooms.length === 0 && (
                    <p className="text-muted-foreground">
                      You haven't joined any rooms yet.
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
