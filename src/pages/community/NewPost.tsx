import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addPost, CATEGORIES } from '@/api/community';

export default function NewPost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // 跳过"全部"
  const [authorName, setAuthorName] = useState(user?.nickname || user?.username || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.nickname || user?.username) setAuthorName(user.nickname || user.username);
  }, [user]);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const newPost = await addPost({
        title: title.trim(),
        content: content.trim(),
        category,
        authorName: authorName.trim() || '匿名用户',
        authorAvatar: user?.avatar || null,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      });
      navigate(`/community/post/${newPost.id}`);
    } catch (e) {
      alert('发帖失败，请重试');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/community')} className="p-2 rounded-md hover:bg-blue-500/10 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">发布新帖</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-500 mb-2">标题</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="给你的帖子起个标题" className="w-full px-4 py-3 bg-white/90 border border-blue-500/20 rounded-md text-slate-800 focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-2">分类</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-white/90 border border-blue-500/20 rounded-md text-slate-800 focus:outline-none focus:border-blue-500">
            {CATEGORIES.filter(c => c !== '全部').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-2">
            发布者 {user && <span className="text-xs text-blue-600">(已登录用户)</span>}
          </label>
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <input
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="输入你的昵称"
              disabled={!!user}
              className="flex-1 px-4 py-3 bg-white/90 border border-blue-500/20 rounded-md text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-500 mb-2">内容</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="分享你的命理心得、解卦经验..." rows={8} className="w-full px-4 py-3 bg-white/90 border border-blue-500/20 rounded-md text-slate-800 resize-none focus:outline-none focus:border-blue-500" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? '发布中...' : <><Send className="w-4 h-4" />发布</>}
        </button>
      </div>
    </div>
  );
}
