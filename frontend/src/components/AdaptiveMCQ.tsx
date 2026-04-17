import React, { useState, useEffect } from "react";
import { aiAPI } from "@/lib/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdaptiveMCQProps {
  roomTopic: string;
}

const AdaptiveMCQ: React.FC<AdaptiveMCQProps> = ({ roomTopic }) => {
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [mastery, setMastery] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const startSession = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentIndex(0);
    setIsCompleted(false);
    setScore(0);
    setTotalAttempts(0);
    setHistory([]);

    try {
      const response = await aiAPI.generateAdaptiveMCQ({
        roomTopic,
        recentHistory: "New Session",
        masteryPercentage: mastery,
        askedQuestions: [],
      });
      console.log(response);
      if (response.data?.status === "success" && response.data?.data?.questions) {
        setQuestions(response.data.data.questions);
        setCurrentLevel(response.data.data.questions[0].level);
      } else {
        toast.error("Failed to generate quiz session");
      }
    } catch (error) {
      console.error("Error fetching AI questions:", error);
      toast.error("AI service error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (isCorrect !== null) return; // Prevent multiple answers

    setTotalAttempts((prev) => prev + 1);
    setSelectedOption(option);
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion && !loading && questions.length > 0) {
      return null;
    }
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setHistory((prev) => [...prev, "Correct"]);
      setMastery((prev) => Math.min(100, prev + 5));
      toast.success(currentQuestion.encouragement || "Great job!");
    } else {
      setHistory((prev) => [...prev, "Incorrect"]);
      setMastery((prev) => Math.max(0, prev - 2));
      toast.error("Keep trying! " + (currentQuestion.reasoning || ""));
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentLevel(questions[nextIdx].level); // ✅ sync level on each step
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion && !loading && questions.length > 0) {
    return null;
  }

  // Initial View
  if (questions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Antigravity AI Quiz</h3>
        <p className="text-muted-foreground max-w-sm">
          Master {roomTopic} with 9 adaptive challenges. Unlock Intermediate and
          Advanced levels as you prove your reasoning.
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs pt-4">
          <div className="flex flex-col items-center gap-1">
            <div className="h-2 w-full bg-green-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full" />
            </div>
            <span className="text-[10px] font-bold uppercase opacity-60">
              Beginner
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-2 w-full bg-orange-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-full" />
            </div>
            <span className="text-[10px] font-bold uppercase opacity-60">
              Inter.
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-2 w-full bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-full" />
            </div>
            <span className="text-[10px] font-bold uppercase opacity-60">
              Advanced
            </span>
          </div>
        </div>
        <Button onClick={startSession} className="w-full sm:w-auto mt-4 px-8">
          Start Session
        </Button>
      </div>
    );
  }

  // Results View
  if (isCompleted) {
    const accuracy = Math.round((score / totalAttempts) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center space-y-6"
      >
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold italic tracking-tight">
            SESSION COMPLETE
          </h3>
          <p className="text-muted-foreground">
            You've tackled the Antigravity challenges for {roomTopic}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="bg-muted/50 p-4 rounded-2xl">
            <span className="text-3xl font-black block">{score}/9</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Score
            </span>
          </div>
          <div className="bg-muted/50 p-4 rounded-2xl">
            <span className="text-3xl font-black block">{accuracy}%</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Accuracy
            </span>
          </div>
        </div>

        <Button onClick={startSession} className="w-full">
          Generate New Session
        </Button>
      </motion.div>
    );
  }
if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
                AI is generating your session...
            </p>
            <p className="text-xs text-muted-foreground opacity-60">
                5 questions across Beginner → Intermediate → Advanced
            </p>
        </div>
    );
}

// Guard — questions loaded but index is out of range
if (!currentQuestion) {
    return null; 
}

return (
    <Card className="p-6 glass-card overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Difficulty
                </span>
                <span className={`text-sm font-semibold ${
                    currentLevel === "Advanced" ? "text-red-500" :
                    currentLevel === "Intermediate" ? "text-orange-500" : "text-green-500"
                }`}>
                    {currentLevel}
                </span>
            </div>
            <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Question</span>
                <span className="text-sm font-semibold">{currentIndex + 1} / {questions.length}</span>
            </div>
            <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Mastery</span>
                <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${mastery}%` }} />
                </div>
            </div>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <h4 className="text-lg font-medium leading-tight">
                    {currentQuestion.question}
                </h4>

                <div className="grid gap-3">
                    {currentQuestion?.options?.map((option: string, index: number) => {
                        const isSelected = selectedOption === option;
                        const isCorrectOption = option === currentQuestion.correctAnswer;
                        let borderColor = "";
                        let bgColor = "";

                        if (isCorrect !== null) {
                            if (isCorrectOption) { borderColor = "border-green-500"; bgColor = "bg-green-500/10"; }
                            else if (isSelected && !isCorrect) { borderColor = "border-red-500"; bgColor = "bg-red-500/10"; }
                        } else if (isSelected) {
                            borderColor = "border-primary"; bgColor = "bg-primary/5";
                        }

                        return (
                            <button
                                key={index}
                                disabled={isCorrect !== null}
                                onClick={() => handleAnswer(option)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${borderColor || "border-border hover:border-primary/50"} ${bgColor}`}
                            >
                                <span>{option}</span>
                                {isCorrect !== null && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                                {isCorrect !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {isCorrect !== null && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${isCorrect ? "bg-green-500/5 text-green-700 dark:text-green-400" : "bg-red-500/5 text-red-700 dark:text-red-400"}`}>
                            {isCorrect ? <Trophy className="h-5 w-5 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                            <div className="space-y-1">
                                <p className="font-semibold text-sm">{isCorrect ? "Correct!" : "Incorrect"}</p>
                                <p className="text-sm opacity-90">{currentQuestion.explanation || currentQuestion.reasoning}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="flex-1" onClick={startSession}>Reset Session</Button>
                            <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={nextQuestion}>
                                {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    </Card>
);
};

export default AdaptiveMCQ;
