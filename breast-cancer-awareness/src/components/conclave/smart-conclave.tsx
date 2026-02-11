"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const trendingTopics: Topic[] = [
  {
    id: "1",
    title: "How to prepare for your first mammogram screening?",
    author: "Dr. Sarah Chen",
    replies: 42,
    likes: 89,
    timestamp: "2h ago",
  },
  {
    id: "2",
    title: "Coping strategies during treatment: What worked for you?",
    author: "Maya R.",
    replies: 67,
    likes: 134,
    timestamp: "5h ago",
  },
  {
    id: "3",
    title: "Understanding BRCA gene testing results",
    author: "Dr. Priya Sharma",
    replies: 28,
    likes: 56,
    timestamp: "8h ago",
  },
  {
    id: "4",
    title: "Self-care tips for caregivers and family members",
    author: "Lisa M.",
    replies: 51,
    likes: 102,
    timestamp: "1d ago",
  },
  {
    id: "5",
    title: "Nutrition advice during recovery: Evidence-based guide",
    author: "Dr. Ankit Kumar",
    replies: 39,
    likes: 78,
    timestamp: "2d ago",
  },
];

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

export function SmartConclave() {
  const [question, setQuestion] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setShowSuccess(true);
    setQuestion("");

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

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
