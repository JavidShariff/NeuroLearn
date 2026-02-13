import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ThumbsUp, MessageCircle, Bot, Send, ThumbsDown, Loader2, CornerDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { forumAPI, aiAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Recursive Comment Component
const CommentNode = ({ 
  comment, 
  user, 
  onUpvote, 
  replyingTo, 
  setReplyingTo, 
  replyContent, 
  setReplyContent, 
  onSubmitReply 
}: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${comment.parentComment ? "ml-8 mt-4 pl-4 border-l-2 border-primary/10" : "mb-6"}`}
    >
      <div className="flex gap-4">
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="glass-card p-4 rounded-lg rounded-tl-none">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm md:text-base">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-foreground text-sm md:text-base mb-3 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onUpvote(comment._id)}
                className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-primary transition"
              >
                <ThumbsUp className="h-3 w-3 md:h-4 md:w-4" />
                <span>{comment.upvotes.length}</span>
              </button>
              <button
                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-primary transition"
              >
                <CornerDownRight className="h-3 w-3 md:h-4 md:w-4" />
                Reply
              </button>
            </div>
          </div>

          {/* Reply Input */}
          {replyingTo === comment._id && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 flex gap-2 items-start"
            >
              <Input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Replying to ${comment.author.name}...`}
                className="glass-card text-sm"
                autoFocus
              />
              <Button size="sm" onClick={() => onSubmitReply(comment._id)}>
                <Send className="h-3 w-3" />
              </Button>
            </motion.div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply: any) => (
                <CommentNode
                  key={reply._id}
                  comment={reply}
                  user={user}
                  onUpvote={onUpvote}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ForumDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (id) {
      fetchPostData();
    }
  }, [id]);

  // Build comment tree
  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];
    
    // Initialize map with all comments (add replies array)
    comments.forEach(c => {
      map.set(c._id, { ...c, replies: [] });
    });
    
    // Build hierarchy
    comments.forEach(c => {
      const node = map.get(c._id);
      const parentId = typeof c.parentComment === 'object' ? c.parentComment?._id : c.parentComment;
      
      if (parentId && map.has(parentId)) {
        map.get(parentId).replies.push(node);
      } else {
        roots.push(node);
      }
    });
    
    return roots;
  }, [comments]);

  const fetchPostData = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        forumAPI.getPostById(id!),
        forumAPI.getComments(id!)
      ]);
      setPost(postRes.data.data.post);
      setComments(commentsRes.data.data.comments);
    } catch (error) {
      console.error("Failed to fetch post data:", error);
      navigate("/forum");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }
    try {
      await forumAPI.upvotePost(id!);
      // Optimistic update or refresh
      fetchPostData();
    } catch (error) {
      toast.error("Failed to upvote");
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (comment.trim()) {
      try {
        await forumAPI.addComment(id!, { content: comment });
        toast.success("Comment added!");
        setComment("");
        // Refresh comments
        const commentsRes = await forumAPI.getComments(id!);
        setComments(commentsRes.data.data.comments);
      } catch (error) {
        toast.error("Failed to add comment");
      }
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      await forumAPI.addComment(id!, {
        content: replyContent,
        parentComment: commentId
      });
      toast.success("Reply added!");
      setReplyContent("");
      setReplyingTo(null);

      const commentsRes = await forumAPI.getComments(id!);
      setComments(commentsRes.data.data.comments);
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleCommentUpvote = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to upvote");
      return;
    }

    try {
      await forumAPI.upvoteComment(commentId);
      toast.success("Upvoted!");

      // Refresh comments to show updated count
      const commentsRes = await forumAPI.getComments(id!);
      setComments(commentsRes.data.data.comments);
    } catch (error) {
      toast.error("Failed to upvote comment");
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await aiAPI.summarizePost(id!);
      setAiSummary(res.data.data.summary);
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading || !post) {
    return <div>Loading...</div>;
  }

  const isUpvoted = user && post.upvotes.includes(user._id);

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
                      className={`p-2 rounded-lg glass transition ${isUpvoted ? "bg-primary/20 text-primary" : "hover:bg-primary/20"
                        }`}
                    >
                      <ThumbsUp className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-primary text-lg">
                      {post.voteCount}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{post.author.name}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{comments.length} comments</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag: string, idx: number) => (
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
                  Comments ({comments.length})
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
                  {commentTree.length > 0 ? (
                    commentTree.map((comment: any) => (
                      <CommentNode
                        key={comment._id}
                        comment={comment}
                        user={user}
                        onUpvote={handleCommentUpvote}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        onSubmitReply={handleReply}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
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
                {aiSummary ? (
                  <p className="text-sm text-muted-foreground mb-4">
                    {aiSummary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a quick summary of this discussion using AI.
                  </p>
                )}

                <Button
                  onClick={handleGenerateSummary}
                  disabled={loadingAi || !!aiSummary}
                  variant="outline"
                  className="w-full glass-card"
                  size="sm"
                >
                  {loadingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Full Summary"}
                </Button>
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