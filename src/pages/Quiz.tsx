import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockQuizQuestions } from "@/lib/mockData";
import { toast } from "sonner";

const Quiz = () => {
  const [stage, setStage] = useState<"input" | "quiz" | "result">("input");
  const [notes, setNotes] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const handleGenerate = () => {
    if (notes.trim()) {
      toast.success("Generating quiz from your notes...");
      setStage("quiz");
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (optionIndex === mockQuizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < mockQuizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    } else {
      setTimeout(() => setStage("result"), 500);
    }
  };

  const handleRetake = () => {
    setStage("input");
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setNotes("");
  };

  const progress = ((currentQuestion + 1) / mockQuizQuestions.length) * 100;
  const percentage = Math.round((score / mockQuizQuestions.length) * 100);

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
                <h1 className="text-4xl font-bold mb-2 gradient-text">AI Quiz Generator</h1>
                <p className="text-muted-foreground">
                  Paste your study notes and let AI generate a personalized quiz
                </p>
              </div>

              <Card className="glass-card p-8">
                <div className="space-y-6">
                  <div>
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
                    disabled={!notes.trim()}
                    className="w-full bg-primary hover:bg-primary/90 glow-primary"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate MCQ Quiz
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {stage === "quiz" && (
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
                    Question {currentQuestion + 1} of {mockQuizQuestions.length}
                  </span>
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-8">
                  {mockQuizQuestions[currentQuestion].question}
                </h2>

                <div className="grid gap-4">
                  {mockQuizQuestions[currentQuestion].options.map((option, index) => {
                    const isAnswered = answers.length > currentQuestion;
                    const isSelected = answers[currentQuestion] === index;
                    const isCorrect = index === mockQuizQuestions[currentQuestion].correct;
                    
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
                          {isAnswered && isSelected && (
                            isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )
                          )}
                          {isAnswered && !isSelected && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
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

                <h1 className="text-4xl font-bold mb-4 gradient-text">Quiz Complete!</h1>
                
                <div className="mb-8">
                  <div className="text-6xl font-bold gradient-text mb-2">
                    {percentage}%
                  </div>
                  <p className="text-xl text-muted-foreground">
                    You scored {score} out of {mockQuizQuestions.length}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="glass-card p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{score}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">
                      {mockQuizQuestions.length - score}
                    </div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {mockQuizQuestions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {percentage >= 70 ? (
                    <p className="text-lg text-green-500">
                      Excellent work! You have a strong understanding of the material.
                    </p>
                  ) : percentage >= 50 ? (
                    <p className="text-lg text-yellow-500">
                      Good effort! Review the material and try again for a better score.
                    </p>
                  ) : (
                    <p className="text-lg text-red-500">
                      Keep studying! Consider reviewing the material before retaking.
                    </p>
                  )}
                  
                  <Button
                    onClick={handleRetake}
                    className="bg-primary hover:bg-primary/90 glow-primary"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Take Another Quiz
                  </Button>
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
