import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MessageSquare, Video, FileText, Bot, Send, Users, Hash, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockRooms, mockChatMessages } from "@/lib/mockData";
import { toast } from "sonner";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = mockRooms.find(r => r.id === id);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("# Study Notes\n\nAdd your collaborative notes here...");
  const [aiQuery, setAiQuery] = useState("");

  if (!room) {
    return <div>Room not found</div>;
  }

  const members = [
    { name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    { name: "Mike Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You" },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      toast.success("Message sent!");
      setMessage("");
    }
  };

  const handleLeaveRoom = () => {
    toast.success("Left the room");
    navigate("/rooms");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">{room.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <span>{room.code}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{room.members} members</span>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleLeaveRoom}
              className="glass-card"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </motion.div>

        {/* Members Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-card p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Members:</span>
              <div className="flex -space-x-2">
                {members.map((member, index) => (
                  <Avatar key={index} className="border-2 border-background">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">+{room.members - 3} more</span>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="glass-card">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-2">
                <Video className="h-4 w-4" />
                Video Call
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card className="glass-card p-6">
                <div className="space-y-4 mb-6 h-96 overflow-y-auto">
                  {mockChatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 ${msg.sender === "You" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`} />
                        <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${msg.sender === "You" ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div className={`inline-block p-3 rounded-lg ${
                          msg.sender === "You" 
                            ? "bg-primary/20 text-primary-foreground" 
                            : "glass-card"
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="glass-card"
                  />
                  <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="video">
              <Card className="glass-card p-6">
                <div className="aspect-video bg-muted/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Video Call Feature</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect with your study group via video
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 glow-primary">
                      Start Video Call
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Shared Notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-card min-h-96 font-mono"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" className="glass-card">
                    Export
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card className="glass-card p-6">
                <div className="space-y-4 mb-6 h-96 overflow-y-auto">
                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <p className="text-muted-foreground">
                      Hello! I'm here to help you with your studies. Ask me anything about {room.topic}!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask AI anything..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="glass-card"
                  />
                  <Button className="bg-secondary hover:bg-secondary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomDetail;
