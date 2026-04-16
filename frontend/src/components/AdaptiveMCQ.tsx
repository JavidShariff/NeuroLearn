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
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [currentLevel, setCurrentLevel] = useState("Beginner");
    const [history, setHistory] = useState<string[]>([]);
    const [mastery, setMastery] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);

    const fetchQuestion = async () => {
        setLoading(true);
        setSelectedOption(null);
        setIsCorrect(null);
        try {
            const recentHistory = history.slice(-3).join(", ");
            const response = await aiAPI.generateAdaptiveMCQ({
                roomTopic,
                currentLevel,
                recentHistory: recentHistory || "New Student",
                masteryPercentage: mastery,
            });

            if (response.data.status === "success") {
                setQuestion(response.data.data);
                setCurrentLevel(response.data.data.newDifficulty);
            } else {
                toast.error("Failed to generate question");
            }
        } catch (error) {
            console.error("Error fetching AI question:", error);
            toast.error("AI service error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (option: string) => {
        if (isCorrect !== null) return; // Prevent multiple answers

        setSelectedOption(option);
        const correct = option === question.correctAnswer;
        setIsCorrect(correct);

        setHistory(prev => [...prev, correct ? "Correct" : "Incorrect"]);
        setQuestionsAnswered(prev => prev + 1);

        if (correct) {
            setMastery(prev => Math.min(100, prev + 5));
            toast.success(question.encouragement || "Great job!");
        } else {
            setMastery(prev => Math.max(0, prev - 2));
            toast.error("Keep trying! " + (question.explanation || ""));
        }
    };

    useEffect(() => {
        // Optionally fetch first question automatically
    }, []);

    if (!question && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Adaptive AI Quiz</h3>
                <p className="text-muted-foreground max-w-sm">
                    Challenge yourself with AI-generated questions that adapt to your knowledge level in {roomTopic}.
                </p>
                <Button onClick={fetchQuestion} className="w-full sm:w-auto">
                    Start Quiz Session
                </Button>
            </div>
        );
    }

    return (
        <Card className="p-6 glass-card overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</span>
                    <span className={`text-sm font-semibold ${currentLevel === "Advanced" ? "text-red-500" :
                            currentLevel === "Intermediate" ? "text-orange-500" : "text-green-500"
                        }`}>
                        {currentLevel}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Mastery</span>
                    <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${mastery}%` }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 space-y-4"
                    >
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">AI is crafting your next challenge...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h4 className="text-lg font-medium leading-tight">
                                {question.question}
                            </h4>
                        </div>

                        <div className="grid gap-3">
                            {question.options.map((option: string, index: number) => {
                                const isSelected = selectedOption === option;
                                const isCorrectOption = option === question.correctAnswer;

                                let variant = "outline";
                                let borderColor = "";
                                let bgColor = "";

                                if (isCorrect !== null) {
                                    if (isCorrectOption) {
                                        borderColor = "border-green-500";
                                        bgColor = "bg-green-500/10";
                                    } else if (isSelected && !isCorrect) {
                                        borderColor = "border-red-500";
                                        bgColor = "bg-red-500/10";
                                    }
                                } else if (isSelected) {
                                    borderColor = "border-primary";
                                    bgColor = "bg-primary/5";
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
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-2"
                            >
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${isCorrect ? "bg-green-500/5 text-green-700 dark:text-green-400" : "bg-red-500/5 text-red-700 dark:text-red-400"}`}>
                                    {isCorrect ? <Trophy className="h-5 w-5 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm">{isCorrect ? "Correct!" : "Incorrect"}</p>
                                        <p className="text-sm opacity-90">{question.explanation}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setQuestion(null);
                                            setHistory([]);
                                            setQuestionsAnswered(0);
                                            setMastery(0);
                                            setCurrentLevel("Beginner");
                                        }}
                                    >
                                        Reset Session
                                    </Button>
                                    <Button
                                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                                        onClick={fetchQuestion}
                                    >
                                        Next Question
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default AdaptiveMCQ;
