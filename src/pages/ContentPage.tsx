import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, BookOpen, Lightbulb } from 'lucide-react';
import type { PageContent } from '@/data/siteData';

interface ContentPageProps {
  pages: PageContent[];
  basePath: string;
  category: string;
}

export default function ContentPage({ pages, basePath, category }: ContentPageProps) {
  const { id } = useParams<{ id: string }>();
  const pageId = parseInt(id || '1', 10);
  const page = pages[pageId - 1];

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800">页面未找到</h1>
        <Link to={basePath + '/1'} className="text-blue-600 mt-4 inline-block">
          返回第一页
        </Link>
      </div>
    );
  }

  const hasPrev = pageId > 1;
  const hasNext = pageId < pages.length;

  return (
    <div>
      {/* Hero Banner */}
      {page.image && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={page.image} alt={page.title} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <BookOpen className="w-4 h-4" />
                <Link to={basePath + '/1'} className="hover:underline">{category}</Link>
                <ChevronRight className="w-3 h-3" />
                <span>第 {pageId} 课</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{page.title}</h1>
              <p className="text-slate-500 mt-2">{page.subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {!page.image && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
              <BookOpen className="w-4 h-4" />
              <Link to={basePath + '/1'} className="hover:underline">{category}</Link>
              <ChevronRight className="w-3 h-3" />
              <span>第 {pageId} 课</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{page.title}</h1>
            <p className="text-slate-500 mt-2">{page.subtitle}</p>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-10">
          {page.sections.map((section, idx) => (
            <div key={idx} className="border-l-2 border-blue-500/30 pl-6">
              <h2 className="text-xl font-bold text-blue-600 mb-4">{section.heading}</h2>
              <div className="space-y-3">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-600 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        {page.tips && page.tips.length > 0 && (
          <div className="mt-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-600">实用提示</h3>
            </div>
            <ul className="space-y-2">
              {page.tips.map((tip, idx) => (
                <li key={idx} className="text-slate-500 text-sm flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12 pt-8 border-t border-blue-500/10 flex items-center justify-between">
          {hasPrev ? (
            <Link
              to={`${basePath}/${pageId - 1}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一课</span>
            </Link>
          ) : (
            <div />
          )}
          <span className="text-sm text-slate-400">
            第 {pageId} / {pages.length} 课
          </span>
          {hasNext ? (
            <Link
              to={`${basePath}/${pageId + 1}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors"
            >
              <span>下一课</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Page List */}
        <div className="mt-8 p-4 bg-white/50 border border-blue-500/10 rounded-lg">
          <h3 className="text-sm font-bold text-slate-500 mb-3">课程目录</h3>
          <div className="flex flex-wrap gap-2">
            {pages.map((p, idx) => (
              <Link
                key={idx}
                to={`${basePath}/${idx + 1}`}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  idx + 1 === pageId
                    ? 'bg-blue-500 text-white font-medium'
                    : 'bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-500/10'
                }`}
              >
                {idx + 1}. {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
