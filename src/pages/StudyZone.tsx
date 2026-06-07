import { Link } from 'react-router-dom';
import { BookOpen, Library, Scroll, Compass } from 'lucide-react';

export default function StudyZone() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          学习资料
        </h1>
        <p className="text-white/40">系统学习传统命理文化</p>
      </div>

      {/* Study Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bookshelf - 书架 */}
        <Link
          to="/bookshelf"
          className="group p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/15 hover:border-amber-400/30 transition-all hover:scale-[1.01]"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-400/20 group-hover:bg-amber-500/20 transition-colors">
              <Library className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-amber-300 mb-1 group-hover:text-amber-200 transition-colors">
                命理书库
              </h2>
              <p className="text-sm text-white/40 leading-relaxed">
                上传和管理PDF命理古籍，浏览器原生阅读。分类包括经典总论、面相、紫微斗数、八字命理、六爻占卜、风水理气等。
              </p>
            </div>
          </div>
        </Link>

        {/* Classic Texts - 经典文献 */}
        <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] opacity-50 cursor-not-allowed">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Scroll className="w-6 h-6 text-white/30" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white/50 mb-1">经典文献</h2>
              <p className="text-sm text-white/25 leading-relaxed">
                易经、易传、子平真诠、紫微斗数全书等经典原文。筹备中...
              </p>
            </div>
          </div>
        </div>

        {/* Learning Path - 学习路线 */}
        <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] opacity-50 cursor-not-allowed">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Compass className="w-6 h-6 text-white/30" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white/50 mb-1">学习路线</h2>
              <p className="text-sm text-white/25 leading-relaxed">
                从零开始系统学习命理知识的学习路径推荐。筹备中...
              </p>
            </div>
          </div>
        </div>

        {/* Video Lessons - 视频教程 */}
        <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] opacity-50 cursor-not-allowed">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <BookOpen className="w-6 h-6 text-white/30" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white/50 mb-1">视频教程</h2>
              <p className="text-sm text-white/25 leading-relaxed">
                精选命理教学视频，由浅入深讲解各门术数。筹备中...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
