"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiquidButton, GlassButton } from "@/components/ui/liquid-glass-button";
import {
  Users,
  MessageCircle,
  Heart,
  TrendingUp,
  Send,
  Award,
  UserCircle,
  Stethoscope,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPosts, createPost } from "@/services/dataService";
import { useAuth } from "@/lib/auth-context";
import { ForumPost } from "@/types";

interface CommunitySpace {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  members: number;
  color: string;
}

interface Topic {
  id: string;
  title: string;
  author: string;
  replies: number;
  likes: number;
  timestamp: string;
}

interface Contributor {
  id: string;
  name: string;
  role: string;
  points: number;
  avatar?: string;
}

const communitySpaces: CommunitySpace[] = [
  {
    id: "patients",
    name: "Patient Circle",
    description: "Share experiences, ask questions, find support",
    icon: <Users className="h-6 w-6" />,
    members: 2847,
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "doctors",
    name: "Medical Professionals",
    description: "Clinical insights, best practices, Q&A",
    icon: <Stethoscope className="h-6 w-6" />,
    members: 324,
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "survivors",
    name: "Survivor Stories",
    description: "Hope, recovery journeys, inspiration",
    icon: <Sparkles className="h-6 w-6" />,
    members: 1203,
    color: "from-rose-400 to-pink-500",
  },
];

// trendingTopics is now generated dynamically from Supabase posts

const topContributors: Contributor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    role: "Oncologist",
    points: 2847,
  },
  {
    id: "2",
    name: "Maya Rodriguez",
    role: "Survivor Advocate",
    points: 2103,
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    role: "Radiologist",
    points: 1876,
  },
  {
    id: "4",
    name: "Lisa Martinez",
    role: "Support Coordinator",
    points: 1543,
  },
];

// Helper function for relative time
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function SmartConclave() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from dataService on mount
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Try to create post via dataService
    if (user?.id) {
      try {
        const newPost = await createPost({
          userId: user.id,
          title: question.length > 50 ? question.substring(0, 50) + '...' : question,
          content: question,
        });
        if (newPost) {
          setPosts(prev => [newPost, ...prev]);
        }
      } catch (err) {
        console.error('Error creating post:', err);
      }
    }

    setShowSuccess(true);
    setQuestion("");

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Convert posts to trending topics format
  const trendingTopics = posts.slice(0, 5).map(post => ({
    id: post.id,
    title: post.title,
    author: post.authorName,
    replies: post.replies?.length || 0,
    likes: Math.floor(Math.random() * 100) + 10, // Mock likes since not in schema
    timestamp: getRelativeTime(post.createdAt),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-pink-900 flex items-center justify-center gap-3">
          <MessageCircle className="h-10 w-10 text-pink-600" />
          Smart Conclave
        </h1>
        <p className="text-lg text-pink-600 max-w-2xl mx-auto">
          Connect, share, and learn from our supportive community
        </p>
      </div>

      {/* Ask the Community */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-pink-600" />
            Ask the Community
          </CardTitle>
          <CardDescription>
            Share your question or start a discussion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask or share?"
              className="h-12 text-base"
            />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {showSuccess && (
                  <p className="text-sm text-green-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                    Your question has been posted successfully
                  </p>
                )}
              </div>
              <LiquidButton
                type="submit"
                disabled={!question.trim()}
                className="min-w-[120px]"
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </LiquidButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Community Spaces */}
      <div>
        <h2 className="text-2xl font-semibold text-pink-900 mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-pink-600" />
          Community Spaces
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {communitySpaces.map((space) => (
            <Card
              key={space.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <CardHeader>
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform",
                    space.color
                  )}
                >
                  {space.icon}
                </div>
                <CardTitle className="text-lg">{space.name}</CardTitle>
                <CardDescription>{space.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-pink-600 font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {space.members.toLocaleString()} members
                  </span>
                  <GlassButton size="sm">Join</GlassButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trending Topics */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-pink-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-pink-600" />
            Trending Topics
          </h2>
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-2" />
                  <p className="text-pink-600">Loading discussions...</p>
                </div>
              ) : trendingTopics.length === 0 ? (
                <div className="p-8 text-center text-pink-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              ) : (
              <div className="divide-y divide-pink-100">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-5 hover:bg-pink-50/50 transition-colors cursor-pointer group"
                  >
                    <h3 className="font-semibold text-pink-900 mb-2 group-hover:text-pink-700 transition-colors">
                      {topic.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pink-600">{topic.author}</span>
                      <div className="flex items-center gap-4 text-pink-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {topic.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {topic.likes}
                        </span>
                        <span className="text-xs">{topic.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Contributors */}
        <div>
          <h2 className="text-2xl font-semibold text-pink-900 mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-pink-600" />
            Top Contributors
          </h2>
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="divide-y divide-pink-100">
                {topContributors.map((contributor, index) => (
                  <div
                    key={contributor.id}
                    className="p-4 hover:bg-pink-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contributor.avatar} />
                          <AvatarFallback>
                            {contributor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md",
                              index === 0 && "bg-gradient-to-br from-yellow-400 to-amber-500",
                              index === 1 && "bg-gradient-to-br from-gray-300 to-gray-400",
                              index === 2 && "bg-gradient-to-br from-orange-400 to-amber-600"
                            )}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-pink-900 truncate">
                          {contributor.name}
                        </p>
                        <p className="text-sm text-pink-600 truncate">
                          {contributor.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-pink-700">
                          {contributor.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-pink-500">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
