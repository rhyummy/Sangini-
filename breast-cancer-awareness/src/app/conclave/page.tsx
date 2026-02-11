'use client';

import { useState } from 'react';
import { mockForumPosts } from '@/lib/mock-data';
import { ForumPost, ForumReply } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function ConclavePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>(mockForumPosts);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTopic, setNewTopic] = useState('Support & Coping');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Reply form
  const [replyText, setReplyText] = useState('');

  const topics = ['Support & Coping', 'Breast Self-Exam', 'Community Events', 'Screening & Tests', 'Ask a Doctor', 'General'];

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.topic === filter);

  function handleCreatePost() {
    if (!newTitle.trim() || !newContent.trim()) return;

    const post: ForumPost = {
      id: 'fp_' + Date.now(),
      authorName: isAnonymous ? 'Anonymous' : (user?.name || 'Guest'),
      authorRole: user?.role || 'patient',
      isAnonymous,
      topic: newTopic,
      title: newTitle,
      content: newContent,
      replies: [],
      createdAt: new Date().toISOString(),
      tags: [],
    };

    setPosts(prev => [post, ...prev]);
    setShowNewPost(false);
    setNewTitle('');
    setNewContent('');
  }

  function handleReply() {
    if (!replyText.trim() || !selectedPost) return;

    const reply: ForumReply = {
      id: 'fr_' + Date.now(),
      authorName: isAnonymous ? 'Anonymous' : (user?.name || 'Guest'),
      isAnonymous,
      content: replyText,
      createdAt: new Date().toISOString(),
    };

    const updated = posts.map(p =>
      p.id === selectedPost.id
        ? { ...p, replies: [...p.replies, reply] }
        : p
    );
    setPosts(updated);
    setSelectedPost({ ...selectedPost, replies: [...selectedPost.replies, reply] });
    setReplyText('');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤝 Smart Conclave</h1>
          <p className="text-gray-500 mt-1">Community discussions — patients, survivors, caregivers, and NGOs supporting each other.</p>
        </div>
        <button
          onClick={() => { setShowNewPost(!showNewPost); setSelectedPost(null); }}
          className="bg-pink-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-pink-700 transition-colors"
        >
          {showNewPost ? 'Cancel' : '+ New Post'}
        </button>
      </div>

      {/* Moderation notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
        <strong>Community Guidelines:</strong> Be respectful and supportive. No medical diagnosis or treatment advice.
        Anonymous posting is available. Posts are moderated by NGO volunteers.
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="bg-white rounded-2xl border-2 border-pink-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Post</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
              >
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                placeholder="Share your thoughts, questions, or experiences..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-pink-600"
              />
              <span className="text-sm text-gray-600">Post anonymously</span>
            </label>
            <button
              onClick={handleCreatePost}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="bg-pink-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Topic Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
          }`}
        >
          All Topics
        </button>
        {topics.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Post Detail */}
      {selectedPost ? (
        <div className="mb-6">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium mb-4"
          >
            ← Back to posts
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{selectedPost.topic}</span>
              {selectedPost.isAnonymous && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anonymous</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedPost.title}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{selectedPost.content}</p>
            <div className="text-xs text-gray-400">
              {selectedPost.authorName} · {new Date(selectedPost.createdAt).toLocaleDateString()}
            </div>

            {/* Replies */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                Replies ({selectedPost.replies.length})
              </h3>
              {selectedPost.replies.length === 0 ? (
                <p className="text-sm text-gray-400">No replies yet. Be the first to respond.</p>
              ) : (
                <div className="space-y-3">
                  {selectedPost.replies.map(reply => (
                    <div key={reply.id} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{reply.content}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        {reply.authorName} · {new Date(reply.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  placeholder="Write a supportive reply..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Post List */
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No posts in this topic yet. Be the first to start a discussion!
            </div>
          ) : (
            filteredPosts.map(post => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-pink-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{post.topic}</span>
                  {post.isAnonymous && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anonymous</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>By {post.authorName}</span>
                  <span>💬 {post.replies.length} replies</span>
                  {post.tags.length > 0 && (
                    <span className="flex gap-1">
                      {post.tags.map(tag => (
                        <span key={tag} className="bg-gray-50 px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
