import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Users, Plus, Hash, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockRooms } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const filteredRooms = mockRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinByCode = () => {
    if (roomCode) {
      toast.success("Joining room...");
      setRoomCode("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 gradient-text">Study Rooms</h1>
          <p className="text-muted-foreground">Join or create study sessions with peers</p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms by name or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card"
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="glass-card">
                <Hash className="h-4 w-4 mr-2" />
                Join via Code
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Join Room via Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Room Code</Label>
                  <Input
                    placeholder="Enter room code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="glass-card mt-2"
                  />
                </div>
                <Button onClick={handleJoinByCode} className="w-full bg-primary hover:bg-primary/90">
                  Join Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button className="bg-primary hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">{room.topic}</p>
                    </div>
                  </div>
                  {room.isActive && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>{room.code}</span>
                  </div>
                </div>

                <Link to={`/rooms/${room.id}`}>
                  <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary">
                    Join Room
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or create a new room</p>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create New Room
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Rooms;
