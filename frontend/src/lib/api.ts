// api.ts - Frontend API Service for NeuroLearn
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // ❌ Prevent redirect loop if already on login page
    const isAuthPage = window.location.pathname.startsWith("/auth/");

    if (error.response?.status === 401 && !isAuthPage) {
      console.warn("Unauthorized access - Redirecting to login");
      localStorage.removeItem("token");
    }

    // ⛔ Handle 429 Too Many Requests gracefully
    if (error.response?.status === 429) {
      console.error("Rate limit hit - Please wait before trying again.");
      // We don't clear tokens or redirect on 429
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),

  refreshToken: (token: string) =>
    api.post('/auth/refresh-token', { token }),
};

// ==================== USER API ====================
export const userAPI = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: { name?: string; email?: string; location?: string; bio?: string }) =>
    api.put('/users/profile', data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/password', data),

  updateAvatar: (avatar: string) =>
    api.put('/users/avatar', { avatar }),

  getUserById: (id: string) => api.get(`/users/${id}`),

  getUserAchievements: (id: string) => api.get(`/users/${id}/achievements`),

  getUserActivity: (id: string) => api.get(`/users/${id}/activity`),

  getNotifications: () => api.get('/notifications'),

  markNotificationRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllNotificationsRead: () => api.put('/notifications/read-all'),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// ==================== ROOM API ====================
export const roomAPI = {
  getAllRooms: (params?: { topic?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/rooms', { params }),

  getMyRooms: () => api.get('/rooms/my-rooms'),

  getRoomById: (id: string) => api.get(`/rooms/${id}`),

  createRoom: (data: {
    name: string;
    topic: string;
    description?: string;
    isPrivate?: boolean;
    maxMembers?: number;
  }) => api.post('/rooms', data),

  updateRoom: (id: string, data: {
    name?: string;
    topic?: string;
    description?: string;
    isActive?: boolean;
  }) => api.put(`/rooms/${id}`, data),

  deleteRoom: (id: string) => api.delete(`/rooms/${id}`),

  joinRoomByCode: (code: string) => api.post('/rooms/join', { code }),

  joinRoom: (id: string) => api.post(`/rooms/${id}/join`),

  leaveRoom: (id: string, timeSpent?: number) => api.post(`/rooms/${id}/leave`, { timeSpent }),

  getRoomMembers: (id: string) => api.get(`/rooms/${id}/members`),

  updateSharedNotes: (id: string, notes: string) =>
    api.put(`/rooms/${id}/notes`, { notes }),

  getSharedNotes: (id: string) => api.get(`/rooms/${id}/notes`),

  // Chat
  getMessages: (roomId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/rooms/${roomId}/messages`, { params }),

  sendMessage: (roomId: string, message: string, messageType?: string) =>
    api.post(`/rooms/${roomId}/messages`, { message, messageType }),

  deleteMessage: (roomId: string, messageId: string) =>
    api.delete(`/rooms/${roomId}/messages/${messageId}`),
};

// ==================== QUIZ API ====================
export const quizAPI = {
  getAllQuizzes: (params?: { topic?: string; difficulty?: string; page?: number; limit?: number }) =>
    api.get('/quizzes', { params }),

  getMyQuizzes: () => api.get('/quizzes/my-quizzes'),

  getQuizById: (id: string) => api.get(`/quizzes/${id}`),

  generateQuizFromNotes: (data: {
    notes: string;
    title?: string;
    topic?: string;
    difficulty?: string;
    questionCount?: number;
  }) => api.post('/quizzes/generate', data),

  createQuiz: (data: {
    title: string;
    description?: string;
    topic: string;
    difficulty: string;
    questions: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
    isPublic?: boolean;
  }) => api.post('/quizzes', data),

  updateQuiz: (id: string, data: any) => api.put(`/quizzes/${id}`, data),

  deleteQuiz: (id: string) => api.delete(`/quizzes/${id}`),

  submitQuizAttempt: (id: string, data: {
    answers: Array<{ selectedOption: number }>;
    timeTaken?: number;
  }) => api.post(`/quizzes/${id}/attempt`, data),

  getQuizAttempts: (id: string) => api.get(`/quizzes/${id}/attempts`),

  getMyAttempts: () => api.get('/quizzes/attempts/my-attempts'),
};

// ==================== FORUM API ====================
export const forumAPI = {
  getAllPosts: (params?: { tag?: string; sort?: string; page?: number; limit?: number }) =>
    api.get('/forum/posts', { params }),

  searchPosts: (params: { q?: string; tags?: string }) =>
    api.get('/forum/posts/search', { params }),

  getPostById: (id: string) => api.get(`/forum/posts/${id}`),

  createPost: (data: { title: string; content: string; tags?: string[] }) =>
    api.post('/forum/posts', data),

  updatePost: (id: string, data: { title?: string; content?: string; tags?: string[] }) =>
    api.put(`/forum/posts/${id}`, data),

  deletePost: (id: string) => api.delete(`/forum/posts/${id}`),

  upvotePost: (id: string) => api.post(`/forum/posts/${id}/upvote`),

  downvotePost: (id: string) => api.post(`/forum/posts/${id}/downvote`),

  // Comments
  getComments: (postId: string) => api.get(`/forum/posts/${postId}/comments`),

  addComment: (postId: string, data: { content: string; parentComment?: string }) =>
    api.post(`/forum/posts/${postId}/comments`, data),

  updateComment: (id: string, content: string) =>
    api.put(`/forum/comments/${id}`, { content }),

  deleteComment: (id: string) => api.delete(`/forum/comments/${id}`),

  upvoteComment: (id: string) => api.post(`/forum/comments/${id}/upvote`),
};

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getMyAnalytics: () => api.get('/analytics'),

  getQuizPerformance: () => api.get('/analytics/quiz-performance'),

  getStudyTime: () => api.get('/analytics/study-time'),

  getTopicMastery: () => api.get('/analytics/topic-mastery'),

  logStudyTime: (hours: number, date?: string) =>
    api.post('/analytics/log-study-time', { hours, date }),

  getSummary: () => api.get('/analytics/summary'),
};

// ==================== LEADERBOARD API ====================
export const leaderboardAPI = {
  getLeaderboard: (params?: { sort?: string; page?: number; limit?: number }) =>
    api.get('/leaderboard', { params }),

  getTopUsers: (count: number = 10) => api.get(`/leaderboard/top/${count}`),

  getMyStreak: () => api.get('/leaderboard/streak'),

  getStreakHistory: () => api.get('/streak/history'),

  checkStreakStatus: () => api.get('/streak/check'),
};

// ==================== AI API ====================
export const aiAPI = {
  chat: (message: string, roomTopic?: string) =>
    api.post('/ai/chat', { message, roomTopic }),

  summarizePost: (postId: string) =>
    api.post('/ai/summarize', { postId }),

  generateAdaptiveMCQ: (data: {
    roomTopic: string;
    recentHistory: string;
    masteryPercentage: number;
    askedQuestions: string[];
  }) => api.post('/ai/adaptive-mcq', data),
};

// Export default api instance
export default api;

// ==================== TYPE DEFINITIONS ====================
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  location?: string;
  bio?: string;
  createdAt: string;
  streak?: {
    currentStreak: number;
    longestStreak: number;
    totalScore: number;
    totalQuizzesTaken: number;
  };
}

export interface StudyRoom {
  _id: string;
  name: string;
  code: string;
  topic: string;
  description?: string;
  creator: User;
  members: Array<{ user: User; role: string; joinedAt: string }>;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  isPrivate: boolean;
  sharedNotes: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  room: string;
  sender: User;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  createdAt: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  creator: User;
  sourceNotes: string;
  questions: QuizQuestion[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
  timesAttempted: number;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizAttempt {
  _id: string;
  user: User;
  quiz: Quiz;
  answers: Array<{
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken?: number;
  completedAt: string;
}

export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  views: number;
  commentCount: number;
  voteCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

export interface ForumComment {
  _id: string;
  post: string;
  author: User;
  content: string;
  parentComment?: string;
  upvotes: string[];
  createdAt: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string;
  totalQuizzesTaken: number;
  totalScore: number;
  rank: number;
  streakHistory: Array<{
    date: string;
    completed: boolean;
    quizzesTaken: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  userId: string;
  score: number;
  streak: number;
  quizzesTaken: number;
  badge: string;
  isCurrentUser: boolean;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'quiz' | 'room' | 'forum' | 'special';
  unlockedAt: string;
}

export interface UserAnalytics {
  quizPerformance: Array<{
    topic: string;
    averageScore: number;
    attempts: number;
  }>;
  studyTime: Array<{
    date: string;
    hours: number;
  }>;
  topicMastery: Array<{
    subject: string;
    masteryLevel: number;
  }>;
  totalStudyHours: number;
  peerInteractions: number;
}
