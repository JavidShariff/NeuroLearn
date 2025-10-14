// Mock data for the application

export const mockUser = {
  name: "Alex Johnson",
  email: "alex@neurolearn.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
};

export const mockRooms = [
  {
    id: "1",
    name: "Advanced React Patterns",
    code: "REACT2024",
    members: 12,
    topic: "Web Development",
    isActive: true,
  },
  {
    id: "2",
    name: "Machine Learning Basics",
    code: "ML101",
    members: 8,
    topic: "AI/ML",
    isActive: true,
  },
  {
    id: "3",
    name: "Data Structures Deep Dive",
    code: "DS2024",
    members: 15,
    topic: "Computer Science",
    isActive: false,
  },
  {
    id: "4",
    name: "Python for Data Science",
    code: "PYDS",
    members: 20,
    topic: "Data Science",
    isActive: true,
  },
];

export const mockForumPosts = [
  {
    id: "1",
    title: "Best practices for React state management in 2024?",
    author: "Sarah Chen",
    content: "I'm working on a large-scale React application and wondering what the community thinks about state management solutions...",
    tags: ["React", "State Management", "Redux"],
    upvotes: 24,
    comments: 12,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "How to prepare for System Design interviews?",
    author: "Mike Wilson",
    content: "I have interviews coming up at FAANG companies. What resources would you recommend for system design preparation?",
    tags: ["Career", "Interviews", "System Design"],
    upvotes: 45,
    comments: 28,
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    title: "Understanding neural networks from scratch",
    author: "Emma Davis",
    content: "I created a tutorial series on building neural networks without using frameworks. Would love feedback!",
    tags: ["Machine Learning", "Tutorial", "Neural Networks"],
    upvotes: 67,
    comments: 19,
    timestamp: "1 day ago",
  },
];

export const mockQuizQuestions = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
  },
  {
    id: 2,
    question: "Which React hook is used for side effects?",
    options: ["useState", "useEffect", "useContext", "useMemo"],
    correct: 1,
  },
  {
    id: 3,
    question: "What does REST stand for?",
    options: [
      "Real Estate Transfer",
      "Representational State Transfer",
      "Remote Execution Service Tool",
      "Rapid Electronic System Testing",
    ],
    correct: 1,
  },
  {
    id: 4,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
    correct: 2,
  },
  {
    id: 5,
    question: "What is the purpose of Docker?",
    options: [
      "Database management",
      "Containerization",
      "Version control",
      "Code compilation",
    ],
    correct: 1,
  },
  {
    id: 6,
    question: "Which of these is NOT a JavaScript framework?",
    options: ["React", "Angular", "Django", "Vue"],
    correct: 2,
  },
  {
    id: 7,
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Question Logic",
      "System Queue List",
      "Standard Quality Loop",
    ],
    correct: 0,
  },
  {
    id: 8,
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correct: 1,
  },
  {
    id: 9,
    question: "What is the main purpose of Git?",
    options: [
      "Testing code",
      "Version control",
      "Deploying applications",
      "Database management",
    ],
    correct: 1,
  },
  {
    id: 10,
    question: "Which HTTP method is idempotent?",
    options: ["POST", "GET", "PATCH", "All of the above"],
    correct: 1,
  },
];

export const mockChatMessages = [
  { sender: "Emma", message: "Hey everyone! Ready to start?", timestamp: "10:30 AM" },
  { sender: "You", message: "Yes, let's begin!", timestamp: "10:31 AM" },
  { sender: "Mike", message: "Can someone explain React hooks?", timestamp: "10:32 AM" },
  { sender: "Emma", message: "Sure! Hooks let you use state and other React features without writing a class.", timestamp: "10:33 AM" },
];

export const mockAnalyticsData = {
  quizPerformance: [
    { topic: "JavaScript", score: 85 },
    { topic: "React", score: 92 },
    { topic: "Node.js", score: 78 },
    { topic: "Python", score: 88 },
    { topic: "Algorithms", score: 75 },
  ],
  studyTime: [
    { day: "Mon", hours: 3 },
    { day: "Tue", hours: 4 },
    { day: "Wed", hours: 2 },
    { day: "Thu", hours: 5 },
    { day: "Fri", hours: 3 },
    { day: "Sat", hours: 6 },
    { day: "Sun", hours: 4 },
  ],
  topicMastery: [
    { subject: "Web Dev", value: 85 },
    { subject: "Data Structures", value: 70 },
    { subject: "Databases", value: 90 },
    { subject: "AI/ML", value: 65 },
  ],
};

export const mockLeaderboard = [
  {
    rank: 1,
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    score: 2850,
    streak: 47,
    quizzesTaken: 156,
    badge: "🏆",
  },
  {
    rank: 2,
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    score: 2720,
    streak: 32,
    quizzesTaken: 142,
    badge: "🥈",
    isCurrentUser: true,
  },
  {
    rank: 3,
    name: "Mike Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    score: 2680,
    streak: 28,
    quizzesTaken: 138,
    badge: "🥉",
  },
  {
    rank: 4,
    name: "Emma Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    score: 2540,
    streak: 21,
    quizzesTaken: 129,
    badge: "⭐",
  },
  {
    rank: 5,
    name: "James Brown",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    score: 2420,
    streak: 19,
    quizzesTaken: 124,
    badge: "⭐",
  },
  {
    rank: 6,
    name: "Olivia Taylor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    score: 2310,
    streak: 15,
    quizzesTaken: 118,
    badge: "⭐",
  },
  {
    rank: 7,
    name: "Daniel Martinez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel",
    score: 2180,
    streak: 12,
    quizzesTaken: 112,
    badge: "⭐",
  },
  {
    rank: 8,
    name: "Sophia Anderson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    score: 2050,
    streak: 9,
    quizzesTaken: 105,
    badge: "⭐",
  },
  {
    rank: 9,
    name: "Liam Garcia",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    score: 1920,
    streak: 7,
    quizzesTaken: 98,
    badge: "⭐",
  },
  {
    rank: 10,
    name: "Ava Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava",
    score: 1850,
    streak: 5,
    quizzesTaken: 93,
    badge: "⭐",
  },
];

export const mockUserStreak = {
  currentStreak: 32,
  longestStreak: 47,
  lastQuizDate: new Date().toISOString(),
  streakHistory: [
    { date: "2024-01-07", completed: true },
    { date: "2024-01-06", completed: true },
    { date: "2024-01-05", completed: true },
    { date: "2024-01-04", completed: true },
    { date: "2024-01-03", completed: true },
    { date: "2024-01-02", completed: true },
    { date: "2024-01-01", completed: true },
  ],
};
