import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { aiAPI, quizAPI, leaderboardAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Quiz = () => {
  const [stage, setStage] = useState<"input" | "quiz" | "result">("input");
  const [notes, setNotes] = useState("");
  const [topic, setTopic] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { user, checkAuth } = useAuth();

  const handleGenerate = async () => {
    if (notes.trim()) {
      setLoading(true);
      toast.info("Generating quiz from your notes...");
      try {
        console.log("Generating quiz with data:", {
          notes: notes.substring(0, 100) + "...",
          questionCount: 5,
        });
        const response = await quizAPI.generateQuizFromNotes({
          notes,
          title: "Generated Quiz",
          topic: topic.trim() || "General",
          questionCount: 5,
        });
        console.log("Quiz generated successfully:", response.data);
        setQuizData(response.data.data.quiz);
        setStage("quiz");
        setStartTime(Date.now());
        toast.success("Quiz generated!");
      } catch (error: any) {
        console.error("Quiz generation error:", error);
        console.error("Error response:", error.response?.data);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to generate quiz";
        toast.error("Quiz Error: " + errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (optionIndex === quizData.questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    } else {
      setTimeout(() => {
        setStage("result");
        submitQuizResults(newAnswers);
      }, 500);
    }
  };

  const submitQuizResults = async (finalAnswers: number[]) => {
    if (!user || !quizData) return;

    setSubmitting(true);
    try {
      const answersPayload = finalAnswers.map((selectedOption, index) => ({
        questionIndex: index,
        selectedOption,
        isCorrect: selectedOption === quizData.questions[index].correctIndex,
      }));

      // Submit to backend if quiz has an ID
      if (quizData._id) {
        const timeSpent = startTime
          ? (Date.now() - startTime) / (1000 * 60)
          : 0; // Time in minutes
        await quizAPI.submitQuizAttempt(quizData._id, {
          answers: answersPayload,
          timeTaken: parseFloat(timeSpent.toFixed(2)),
        });

        toast.success("Quiz results saved!");

        // Refresh global user state (includes points and streak)
        await checkAuth();
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to save results, but your score is still shown");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setStage("input");
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setNotes("");
    setQuizData(null);
  };

  const progress = quizData
    ? ((currentQuestion + 1) / quizData.questions.length) * 100
    : 0;
  const percentage = quizData
    ? Math.round((score / quizData.questions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {stage === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 gradient-text">
                  AI Quiz Generator
                </h1>
                <p className="text-muted-foreground">
                  Paste your study notes and let AI generate a personalized quiz
                </p>
              </div>

              <Card className="glass-card p-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Biology, History, React Basics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-3 rounded-lg bg-background/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all glass-card mb-4"
                    />

                    <label className="text-sm font-medium mb-2 block">
                      Your Study Notes
                    </label>
                    <Textarea
                      placeholder="Paste your notes here... (e.g., lecture notes, textbook excerpts, study material)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="glass-card min-h-64"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!notes.trim() || loading}
                    className="w-full bg-primary hover:bg-primary/90 glow-primary"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {loading ? "Generating..." : "Generate MCQ Quiz"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {stage === "quiz" && quizData && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of{" "}
                    {quizData.questions.length}
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-8">
                  {quizData.questions[currentQuestion].question}
                </h2>

                <div className="grid gap-4">
                  {quizData.questions[currentQuestion].options.map(
                    (option: string, index: number) => {
                      const isAnswered = answers.length > currentQuestion;
                      const isSelected = answers[currentQuestion] === index;
                      const isCorrect =
                        index ===
                        quizData.questions[currentQuestion].correctIndex;

                      return (
                        <motion.button
                          key={index}
                          whileHover={!isAnswered ? { scale: 1.02 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          onClick={() => !isAnswered && handleAnswer(index)}
                          disabled={isAnswered}
                          className={`p-4 rounded-lg text-left transition-all ${
                            isAnswered
                              ? isSelected
                                ? isCorrect
                                  ? "bg-green-500/20 border-2 border-green-500"
                                  : "bg-red-500/20 border-2 border-red-500"
                                : isCorrect
                                  ? "bg-green-500/20 border-2 border-green-500"
                                  : "glass-card opacity-50"
                              : "glass-card hover:bg-primary/10 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {isAnswered &&
                              isSelected &&
                              (isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              ))}
                            {isAnswered && !isSelected && isCorrect && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </motion.button>
                      );
                    },
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {stage === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="glass-card p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Trophy className="h-24 w-24 text-primary mx-auto mb-6 animate-glow" />
                </motion.div>

                <h1 className="text-4xl font-bold mb-4 gradient-text">
                  Quiz Complete!
                </h1>

                <div className="mb-8">
                  <div className="text-6xl font-bold gradient-text mb-2">
                    {percentage}%
                  </div>
                  <p className="text-xl text-muted-foreground">
                    You scored {score} out of {quizData?.questions.length}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="glass-card p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">
                      {score}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">
                      {quizData?.questions.length - score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Incorrect
                    </div>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {quizData?.questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {submitting && (
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Saving your results...
                    </p>
                  )}

                  {percentage >= 70 ? (
                    <p className="text-lg text-green-500">
                      Excellent work! You have a strong understanding of the
                      material.
                    </p>
                  ) : percentage >= 50 ? (
                    <p className="text-lg text-yellow-500">
                      Good effort! Review the material and try again for a
                      better score.
                    </p>
                  ) : (
                    <p className="text-lg text-red-500">
                      Keep studying! Consider reviewing the material before
                      retaking.
                    </p>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <p className="flex items-center gap-2 text-primary font-semibold text-lg">
                        ✨ Points earned: {score * 10}
                        {percentage === 100 && " + 20 bonus!"}
                      </p>
                      <p className="flex items-center gap-2 text-orange-500 font-semibold">
                        🔥 Current Streak:{" "}
                        {(user as any)?.streak?.currentStreak || 0} days
                      </p>
                      <p className="text-muted-foreground">
                        New Total:{" "}
                        <span className="text-foreground font-bold">
                          {(user as any)?.streak?.totalScore || 0} pts
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      onClick={handleRetake}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 glow-primary"
                      size="lg"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Take Another Quiz
                    </Button>

                    <Link to="/leaderboard" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full h-11 px-8 hover:bg-primary/5 group"
                      >
                        Check Rankings
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default Quiz;
