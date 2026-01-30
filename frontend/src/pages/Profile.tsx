import { motion } from "framer-motion";
import { useState } from "react";
import { Camera, Mail, User, MapPin, Calendar, Edit, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockUser, mockRooms } from "@/lib/mockData";
import { toast } from "sonner";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const achievements = [
    { title: "Early Adopter", description: "Joined in first month", icon: "🎖️" },
    { title: "Quiz Master", description: "Completed 20+ quizzes", icon: "🏆" },
    { title: "Team Player", description: "Joined 5+ study rooms", icon: "🤝" },
    { title: "Streak King", description: "7-day study streak", icon: "🔥" },
  ];

  const recentActivity = [
    { title: "React Basics Quiz", score: 92, date: "2024-01-15" },
    { title: "Algorithm Practice", score: 85, date: "2024-01-14" },
    { title: "ML Study Room", score: null, date: "2024-01-13" },
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
          <h1 className="text-4xl font-bold mb-2 gradient-text">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account and track your progress</p>
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
                      <AvatarImage src={mockUser.avatar} />
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
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined January 2024</span>
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
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg glass">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card p-6 text-center">
                  <p className="text-3xl font-bold gradient-text mb-1">24</p>
                  <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                </Card>
                <Card className="glass-card p-6 text-center">
                  <p className="text-3xl font-bold gradient-text mb-1">127</p>
                  <p className="text-sm text-muted-foreground">Study Hours</p>
                </Card>
                <Card className="glass-card p-6 text-center">
                  <p className="text-3xl font-bold gradient-text mb-1">85%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </Card>
              </div>
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
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg glass hover-lift"
                    >
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      {activity.score && (
                        <Badge className="bg-primary/20 text-primary">
                          Score: {activity.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
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
                  {mockRooms.slice(0, 4).map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-lg glass hover-lift cursor-pointer"
                    >
                      <h4 className="font-medium mb-1">{room.name}</h4>
                      <p className="text-sm text-muted-foreground">{room.topic}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="glass-card text-xs">
                          {room.members} members
                        </Badge>
                        {room.isActive && (
                          <Badge className="bg-green-500/20 text-green-500 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
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
