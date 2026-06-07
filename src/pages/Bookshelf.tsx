import { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  category: string;
  file: string;
  cover?: string;
  size: string;
  pages?: number;
}

interface BookCategory {
  id: string;
  name: string;
}

interface BookData {
  categories: BookCategory[];
  books: BookItem[];
}

const CAT_STYLE: Record<string, string> = {
  '经典总论': 'text-amber-300 bg-amber-500/10 border-amber-400/20',
  '面相类': 'text-rose-300 bg-rose-500/10 border-rose-400/20',
  '紫微斗数': 'text-purple-300 bg-purple-500/10 border-purple-400/20',
  '八字命理': 'text-blue-300 bg-blue-500/10 border-blue-400/20',
  '六爻占卜': 'text-cyan-300 bg-cyan-500/10 border-cyan-400/20',
  '风水理气': 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
  '奇门遁甲': 'text-orange-300 bg-orange-500/10 border-orange-400/20',
  '其他术数': 'text-slate-300 bg-slate-500/10 border-slate-400/20',
};

export default function Bookshelf() {
  const [data, setData] = useState<BookData>({ categories: [], books: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('全部');

  useEffect(() => {
    fetch('./books/books.json')
      .then(r => r.json())
      .then((d: BookData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('加载书单失败');
        setLoading(false);
      });
  }, []);

  const cats = ['全部', ...data.categories.map(c => c.name)];

  const filtered = data.books.filter(b => {
    const mCat = activeCat === '全部' || b.category === activeCat;
    const mSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    return mCat && mSearch;
  });

  function openBook(file: string) {
    window.open('./books/' + file, '_blank');
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm">正在整理书库...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          命理书库
        </h1>
        <p className="text-white/40">
          {data.books.length > 0
            ? `共收录 ${data.books.length} 本古籍 · 点击即可阅读`
            : '书库筹备中，古籍即将上架'}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索书名..."
          className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/40 text-sm"
        />
      </div>

      {/* Category Tabs */}
      {data.books.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {cats.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCat === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
              {cat !== '全部' && (
                <span className="ml-1 text-white/30">
                  ({data.books.filter(b => b.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {data.books.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/5 flex items-center justify-center mx-auto border border-amber-400/10 mb-4">
            <BookOpen className="w-10 h-10 text-amber-400/30" />
          </div>
          <h2 className="text-lg font-medium text-white/60 mb-2">书库筹备中</h2>
          <p className="text-sm text-white/30 max-w-sm mx-auto">
            古籍正在整理上架，敬请期待...
          </p>
        </div>
      )}

      {/* Book Grid - with cover */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(book => {
            const catStyle = CAT_STYLE[book.category] || CAT_STYLE['其他术数'];
            return (
              <button
                key={book.id}
                onClick={() => openBook(book.file)}
                className="group text-left rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/30 hover:bg-white/[0.06] transition-all overflow-hidden"
              >
                {/* Cover Image */}
                <div className="relative aspect-[3/4] bg-black/40 overflow-hidden">
                  {book.cover ? (
                    <img
                      src={'./books/' + book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-white/0 group-hover:text-white/80 transition-all scale-75 group-hover:scale-100" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white/90 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${catStyle}`}>
                      {book.category}
                    </span>
                    <span className="text-[10px] text-white/30">{book.size}</span>
                    {book.pages && (
                      <span className="text-[10px] text-white/20">{book.pages}页</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Search No Result */}
      {filtered.length === 0 && data.books.length > 0 && (
        <div className="text-center py-16">
          <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">未找到匹配的书籍</p>
        </div>
      )}
    </div>
  );
}
