import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, ThumbsUp, Clock, Plus, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPosts, CATEGORIES, formatTime } from '@/api/community';
import type { Post } from '@/api/community';

export default function CommunityHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 加载帖子
  useEffect(() => {
    loadPosts();
    // 首次访问社区且无身份时弹出引导
    const shown = localStorage.getItem('community_first_visit_shown');
    if (!shown && !user) {
      setShowIdentityModal(true);
      localStorage.setItem('community_first_visit_shown', 'true');
    }
  }, [user]);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = selectedCategory === '全部'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">命理社区</h1>
          <p className="text-slate-500">和易友们一起交流命理心得</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            className="p-2 rounded-lg border border-blue-500/20 text-blue-600 hover:bg-blue-500/10 transition-colors"
            title="刷新"
          >
            <Clock className="w-4 h-4" />
          </button>
          <Link
            to="/community/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            发帖
          </Link>
        </div>
      </div>

      {/* User identity card */}
      <div className="mb-6 p-4 border border-blue-500/10 rounded-lg bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <p className="text-slate-800 font-medium">{user?.nickname || user?.username || '访客'}</p>
            <p className="text-xs text-slate-400">{isAuthenticated ? '已登录' : '未登录'}</p>
          </div>
        </div>
        {isAuthenticated ? (
          <Link to="/me" className="text-sm text-blue-600 hover:underline">
            个人中心
          </Link>
        ) : (
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            去登录
          </Link>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white border-blue-500'
                : 'text-slate-500 border-blue-500/20 hover:border-blue-500/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">加载中...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 border border-blue-500/10 rounded-lg">
            <MessageSquare className="w-12 h-12 text-blue-600/20 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">暂无帖子</p>
            <Link to="/community/new" className="text-blue-600 hover:underline text-sm">来做第一个发帖的人吧</Link>
          </div>
        ) : (
          filteredPosts.map(post => (
            <Link key={post.id} to={`/community/post/${post.id}`}
              className="block p-5 border border-blue-500/10 rounded-lg bg-slate-50/30 hover:border-blue-500/30 transition-colors">
              <div className="flex items-start gap-4">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm font-bold">{post.authorName.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs rounded-full">{post.category}</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(post.createdAt)}</span>
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1 truncate">{post.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.viewCount}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{post.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{post.commentCount}</span>
                    <span>{post.authorName}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 首次访问引导弹窗 */}
      {showIdentityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border border-blue-500/20 rounded-xl bg-white shadow-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">欢迎来到命理社区</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              在这里你可以分享命理心得、交流解卦经验。<br />
              创建一个专属身份，让你的发言更有辨识度。
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
              <User className="w-3.5 h-3.5" />
              <span>上传头像 · 设置昵称 · 发帖评论</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowIdentityModal(false)}
                className="flex-1 px-4 py-2.5 border border-blue-500/20 text-slate-500 rounded-lg text-sm hover:border-blue-500/40 transition-colors"
              >
                稍后再说
              </button>
              <button
                onClick={() => { setShowIdentityModal(false); navigate('/login'); }}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                去登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
