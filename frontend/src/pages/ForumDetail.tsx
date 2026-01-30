import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { ThumbsUp, MessageCircle, Bot, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockForumPosts } from "@/lib/mockData";
import { toast } from "sonner";

const ForumDetail = () => {
  const { id } = useParams();
  const post = mockForumPosts.find(p => p.id === id);
  const [comment, setComment] = useState("");
  const [upvoted, setUpvoted] = useState(false);

  if (!post) {
    return <div>Post not found</div>;
  }

  const mockComments = [
    {
      author: "John Smith",
      content: "Great question! I've been wondering about this too. In my experience, Redux Toolkit has been a game-changer for managing complex state.",
      timestamp: "1 hour ago",
      upvotes: 5,
    },
    {
      author: "Lisa Wang",
      content: "I'd recommend checking out Zustand as well. It's much simpler than Redux but still powerful enough for most use cases.",
      timestamp: "30 minutes ago",
      upvotes: 3,
    },
  ];

  const handleUpvote = () => {
    setUpvoted(!upvoted);
    toast.success(upvoted ? "Upvote removed" : "Post upvoted!");
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      toast.success("Comment added!");
      setComment("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card p-8">
                <div className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleUpvote}
                      className={`p-2 rounded-lg glass transition ${
                        upvoted ? "bg-primary/20 text-primary" : "hover:bg-primary/20"
                      }`}
                    >
                      <ThumbsUp className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-primary text-lg">
                      {post.upvotes + (upvoted ? 1 : 0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{post.author}</span>
                      </div>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments} comments</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="glass-card">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-foreground">{post.content}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Comments ({mockComments.length})
                </h2>

                {/* Add Comment */}
                <div className="mb-8">
                  <Textarea
                    placeholder="Add your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="glass-card mb-4"
                  />
                  <Button
                    onClick={handleAddComment}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {mockComments.map((comment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 rounded-lg"
                    >
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-foreground mb-3">{comment.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{comment.upvotes}</span>
                            </button>
                            <button className="text-sm text-muted-foreground hover:text-primary transition">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="h-5 w-5 text-secondary" />
                  <h3 className="font-bold">AI Summary</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This discussion explores different state management solutions in React, 
                  with community members sharing their experiences with Redux, Zustand, 
                  and other libraries.
                </p>
                <Button variant="outline" className="w-full glass-card" size="sm">
                  Generate Full Summary
                </Button>
              </Card>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card p-6">
                <h3 className="font-bold mb-4">Related Discussions</h3>
                <div className="space-y-3">
                  {mockForumPosts.filter(p => p.id !== id).slice(0, 3).map((relatedPost, idx) => (
                    <a
                      key={idx}
                      href={`/forum/${relatedPost.id}`}
                      className="block p-3 rounded-lg glass hover:bg-primary/10 transition"
                    >
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {relatedPost.comments} comments
                      </p>
                    </a>
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

export default ForumDetail;
