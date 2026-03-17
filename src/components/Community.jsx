import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  ThumbsUp,
  Search,
  Plus,
  ChevronRight,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { useAuth } from "../AuthContext";

export function Community() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newComment, setNewComment] = useState("");
  const successTimerRef = useRef(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { posts: data = [] } = await api.get("/community");
      setPosts(data);
      return data;
    } catch {
      setPosts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const flashSuccess = (message) => {
    setPostSuccess(message);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = setTimeout(() => {
      setPostSuccess("");
    }, 2500);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.tags || []).join(" ").toLowerCase().includes(q),
    );
  }, [posts, search]);

  const createPost = async () => {
    const content = newBody.trim();
    const providedTitle = newTitle.trim();

    if (!content) {
      setPostError("Please write something before posting.");
      return;
    }

    const autoTitleBase = content.split(/\s+/).slice(0, 6).join(" ");
    const title =
      providedTitle ||
      `${autoTitleBase}${content.split(/\s+/).length > 6 ? "…" : ""}`;

    setPosting(true);
    setPostError("");
    setPostSuccess("");
    try {
      await api.post("/community", {
        title,
        content,
        tags: [],
      });
      setNewTitle("");
      setNewBody("");
      await loadPosts();
      flashSuccess("Post created successfully.");
    } catch (err) {
      setPostError(err?.message || "Unable to create post right now.");
    } finally {
      setPosting(false);
    }
  };

  const toggleUpvote = async (postId) => {
    await api.post(`/community/${postId}/upvote`, {});
    await loadPosts();
  };

  const addComment = async () => {
    if (!selectedPost?._id || !newComment.trim()) return;
    await api.post(`/community/${selectedPost._id}/comments`, {
      content: newComment,
    });
    setNewComment("");
    const refreshed = await loadPosts();
    const updated = refreshed.find((p) => p._id === selectedPost._id);
    if (updated) setSelectedPost(updated);
  };

  const canDeletePost = (post) => {
    if (!post?.user) return false;
    const postUserId = String(post.user._id || post.user.id || "");
    const currentUserId = String(user?.uid || profile?.uid || "");
    const isAdmin = (profile?.role || "") === "admin";
    return Boolean(
      isAdmin || (postUserId && currentUserId && postUserId === currentUserId),
    );
  };

  const handleDeletePost = async (postId) => {
    if (!postId || deleting) return;
    const ok = window.confirm("Delete this post permanently?");
    if (!ok) return;

    setDeleting(true);
    setPostError("");
    setPostSuccess("");
    try {
      await api.delete(`/community/${postId}`);
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }
      await loadPosts();
      flashSuccess("Post deleted.");
    } catch (err) {
      setPostError(err?.message || "Unable to delete this post.");
    } finally {
      setDeleting(false);
    }
  };

  if (selectedPost) {
    return (
      <div className="space-y-6 max-w-3xl">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
        >
          <ChevronRight size={16} className="rotate-180" /> Community
        </button>

        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
          <h1 className="text-2xl font-black text-white mb-2">
            {selectedPost.title}
          </h1>
          <p className="text-slate-300 leading-relaxed mb-4">
            {selectedPost.content}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleUpvote(selectedPost._id)}
              className="flex items-center gap-2 text-cyan-400 font-bold text-sm"
            >
              <ThumbsUp size={14} /> {selectedPost.upvotes?.length || 0} upvotes
            </button>
            {canDeletePost(selectedPost) && (
              <button
                onClick={() => handleDeletePost(selectedPost._id)}
                disabled={deleting}
                className="flex items-center gap-2 text-rose-400 font-bold text-sm hover:text-rose-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageCircle size={18} /> Comments
          </h2>

          <div className="flex gap-3">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={addComment}
              className="px-5 py-3 bg-cyan-500 text-slate-950 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all"
            >
              <Send size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {(selectedPost.comments || []).map((c) => (
              <div
                key={c._id}
                className="bg-slate-900/40 border border-white/5 rounded-2xl p-4"
              >
                <div className="text-cyan-400 font-black text-sm mb-2">
                  {c.user?.username || "User"}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
            <MessageCircle className="text-cyan-400" size={36} /> COMMUNITY
          </h1>
          <p className="text-slate-400">
            Discuss problems and share solutions.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Optional title (auto-generated if empty)"
          className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
        />
        <div className="flex gap-2">
          <input
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !posting) createPost();
            }}
            placeholder="Share your question or insight..."
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={createPost}
            disabled={posting}
            className="px-4 py-3 bg-cyan-500 text-slate-950 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {postError && (
        <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          {postError}
        </div>
      )}

      {postSuccess && (
        <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          {postSuccess}
        </div>
      )}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search discussions..."
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-600">Loading posts...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedPost(post)}
              className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-white/20 hover:bg-slate-900/60 transition-all"
            >
              <h3 className="text-white font-bold text-base mb-2">
                {post.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span>{post.user?.username || "User"}</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp size={11} /> {post.upvotes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={11} /> {(post.comments || []).length}
                </span>
                {canDeletePost(post) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post._id);
                    }}
                    disabled={deleting}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                )}
                <span className="ml-auto">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
          {!filtered.length && (
            <div className="text-center py-10 text-slate-600">
              No posts found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
