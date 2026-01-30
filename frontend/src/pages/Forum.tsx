import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockForumPosts } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const filteredPosts = mockForumPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreatePost = () => {
    if (postTitle && postContent) {
      toast.success("Post created successfully!");
      setPostTitle("");
      setPostContent("");
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
          <h1 className="text-4xl font-bold mb-2 gradient-text">Community Forum</h1>
          <p className="text-muted-foreground">
            Share knowledge, ask questions, and learn together
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card"
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 glow-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="What's your question or topic?"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="glass-card mt-2"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Provide details, context, or your thoughts..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="glass-card mt-2 min-h-32"
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <Input
                    placeholder="Add tags separated by commas"
                    className="glass-card mt-2"
                  />
                </div>
                <Button onClick={handleCreatePost} className="w-full bg-primary hover:bg-primary/90">
                  Create Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/forum/${post.id}`}>
                <Card className="glass-card p-6 hover-lift">
                  <div className="flex gap-4">
                    {/* Upvote Section */}
                    <div className="flex flex-col items-center gap-2">
                      <button className="p-2 rounded-lg glass hover:bg-primary/20 transition">
                        <ThumbsUp className="h-5 w-5" />
                      </button>
                      <span className="font-bold text-primary">{post.upvotes}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2 hover:text-primary transition">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.content}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="glass-card">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                          </Avatar>
                          <span>{post.author}</span>
                        </div>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or create a new post
            </p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Forum;
