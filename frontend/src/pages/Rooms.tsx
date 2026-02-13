import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, Plus, Hash, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { toast } from "sonner";
import { roomAPI } from "@/lib/api";
import { CardGridSkeleton } from "@/components/ui/LoadingSkeleton";

const Rooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(true);

  // New Room State
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAllRooms();
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to load study rooms");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinByCode = async () => {
    if (roomCode) {
      try {
        await roomAPI.joinRoomByCode(roomCode);
        toast.success("Joined room successfully!");
        setRoomCode("");
        fetchRooms(); // Refresh list or navigate
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to join room");
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName || !newRoomTopic) {
      toast.error("Name and Topic are required");
      return;
    }
    try {
      await roomAPI.createRoom({
        name: newRoomName,
        topic: newRoomTopic,
        description: newRoomDesc,
        isPrivate: false,
        maxMembers: 50
      });
      toast.success("Room created successfully!");
      setNewRoomName("");
      setNewRoomTopic("");
      setNewRoomDesc("");
      fetchRooms();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create room");
    }
  };

  if (loading) {
    return <CardGridSkeleton />;
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

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 glow-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create New Study Room</DialogTitle>
                <DialogDescription>
                  Enter the details for your new study room. You can invite others after creating it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Room Name</Label>
                  <Input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. Advanced Calculus"
                    className="glass-card mt-2"
                  />
                </div>
                <div>
                  <Label>Topic</Label>
                  <Input
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                    placeholder="e.g. Math"
                    className="glass-card mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    placeholder="What's this room about?"
                    className="glass-card mt-2"
                  />
                </div>
                <Button onClick={handleCreateRoom} className="w-full bg-primary">Create Room</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room._id}
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
                  {/* Active status logic if needed */}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.members?.length || 0} members</span>
                  </div>
                  {/* Code only visible to members usually, but here public for now */}
                </div>

                <Link to={`/rooms/${room._id}`}>
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
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Rooms;
