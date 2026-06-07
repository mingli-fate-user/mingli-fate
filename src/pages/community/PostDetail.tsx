import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, Clock, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPost, getComments, addComment, incrementView, likePost, formatTime } from '@/api/community';
import type { Post, Comment } from '@/api/community';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || '0');
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(user?.nickname || user?.username || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.nickname || user?.username) setAuthorName(user.nickname || user.username);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [postId]);

  async function loadData() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        getPost(postId),
        getComments(postId),
      ]);
      setPost(p);
      setComments(c);
      // 增加浏览量
      if (p) await incrementView(postId);
    } catch (e) {
      console.error('Failed to load post:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || !post) return;
    setSubmitting(true);
    try {
      await addComment({
        postId,
        content: newComment.trim(),
        authorName: authorName.trim() || '匿名用户',
        authorAvatar: user?.avatar || null,
      });
      setNewComment('');
      // 刷新评论
      const updatedComments = await getComments(postId);
      setComments(updatedComments);
      // 更新帖子评论数
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
    } catch (e) {
      alert('评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike() {
    if (!post) return;
    try {
      await likePost(postId);
      setPost(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null);
    } catch (e) {
      console.error('Like failed:', e);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400">加载中...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-400 mb-4">帖子不存在或已被删除</p>
        <Link to="/community" className="text-blue-600 hover:underline">返回社区</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/community" className="p-2 rounded-md hover:bg-blue-500/10 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs rounded-full">{post.category}</span>
      </div>

      {/* Post */}
      <div className="p-6 border border-blue-500/10 rounded-lg bg-slate-50/30 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">{post.authorName.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="text-slate-800 font-medium">{post.authorName}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(post.createdAt)}</p>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-4">{post.title}</h1>
        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">{post.content}</div>
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-600 transition-colors">
            <ThumbsUp className="w-4 h-4" />{post.likeCount}
          </button>
          <span className="flex items-center gap-1 text-sm text-slate-400"><Eye className="w-4 h-4" />{post.viewCount}</span>
          <span className="flex items-center gap-1 text-sm text-slate-400"><MessageSquare className="w-4 h-4" />{post.commentCount}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">评论 ({comments.length})</h2>

        {/* Comment input */}
        <div className="flex gap-3 mb-6">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-1" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 self-start mt-1">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="昵称"
              disabled={!!user}
              className="w-full sm:w-40 px-3 py-1.5 bg-white/90 border border-blue-500/20 rounded-md text-slate-800 text-sm disabled:opacity-60 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={2}
                className="flex-1 px-4 py-2 bg-white/90 border border-blue-500/20 rounded-md text-slate-800 text-sm resize-none focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 self-end hover:bg-blue-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {!user && (
              <p className="text-xs text-slate-400">
                <Link to="/login" className="text-blue-600 hover:underline">登录</Link> 后可发表评论
              </p>
            )}
          </div>
        </div>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 p-4 border border-blue-500/10 rounded-lg bg-slate-50/20">
              {c.authorAvatar ? (
                <img src={c.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">{c.authorName.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-800 text-sm font-medium">{c.authorName}</span>
                  <span className="text-slate-400 text-xs">{formatTime(c.createdAt)}</span>
                </div>
                <p className="text-slate-600 text-sm">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-slate-400 text-sm py-4">暂无评论，来做第一个评论的人吧</p>}
        </div>
      </div>
    </div>
  );
}
