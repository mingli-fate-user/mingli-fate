import { Star, User, MessageCircle, Copy } from 'lucide-react';
import { masterInfo } from '@/data/siteData';
import { copyAndOpen } from '@/utils/copyAndOpen';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

export default function About() {
  const { toast, showToast } = useToast();

  async function handleCopyQQ() {
    await copyAndOpen('qq', masterInfo.qq);
    showToast('QQ号已复制，正在唤起QQ...');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-blue-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">关于黄师傅</h1>
            <p className="text-slate-500 mt-2">传承命理文化，以术济人</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile */}
        <div className="acrylic rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-blue-300/50 shadow-lg shadow-blue-100 flex-shrink-0">
            <img src="./cat-avatar.jpg" alt={masterInfo.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{masterInfo.name}</h2>
            <p className="text-blue-600 mt-1 font-medium">{masterInfo.title}</p>
            <p className="text-slate-500 mt-4 leading-relaxed">
              {masterInfo.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {masterInfo.specialties.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fun Introduction */}
        <div className="acrylic rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            黄师傅的自我修养
          </h3>
          <div className="text-slate-600 leading-relaxed space-y-2 text-sm">
            <p>🛌🚶🚽</p>
            <p>✈️已飞0国｜06桂林留子｜男女混血</p>
            <p>📍｜Wild Chicken University｜中国留宿生｜座驾🛵</p>
            <p>💻加里敦offer｜华籍华人｜📱魅族（无SIM）🛍️PDD资深买手🥇｜桂林米粉一级品鉴师☕️｜0年国奖</p>
            <p>🆔国家级身份证持有者｜🚗驾驶证C1持有者｜英语四六级没考｜雅思托福没考｜恩格尔系数1.00｜诺贝尔奖觊觎者｜钓鱼空军专业者｜酒精特级摄入者</p>
            <p>🏄Internet冲浪达人｜熟练掌握🇨🇳语言</p>
            <p>个人存款💰0.0001百万｜花呗抖音月付</p>
            <p>💡德智体美：缺德·弱智·体弱·臭美</p>
          </div>
        </div>

        {/* Lineage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="acrylic rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">紫微斗数师承</h3>
            </div>
            <div className="text-slate-600 leading-relaxed text-sm space-y-2">
              <p>黄师傅的紫微斗数号称师承<span className="text-blue-600 font-medium">{masterInfo.ziweiSystem}</span>。</p>
              <p>实际上是在B站刷了300个紫微斗数视频，在豆瓣研究了50篇命理帖子，在贴吧跟人对线100回合后，自封的野生紫微大师。</p>
              <p>擅长把客户的命盘说得云山雾罩，让客户听完觉得自己既天命所归又需要破财消灾——简称「又贵又衰」分析法。</p>
              <p>核心技法：看到天机就说聪明，看到贪狼就说桃花，看到空宫就说「你潜力无限」——百试百灵，从无败绩。</p>
            </div>
          </div>
          <div className="acrylic rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">面相学师承</h3>
            </div>
            <div className="text-slate-600 leading-relaxed text-sm space-y-2">
              <p>黄师傅的面相学号称师承<span className="text-blue-600 font-medium">{masterInfo.faceSystem}</span>。</p>
              <p>真相是蹲了三年地铁口观察路人，看了两百集《峰生水起》电视节目，在抖音学了五百个面相短视频后，终于悟出了「相由心生，但主要靠P图」的终极奥义。</p>
              <p>独门绝技：看人说印堂发黑就推荐转运符，看到法令纹深就说客户有领导相，看到痘痘就说「最近有桃花运」——反正客人爱听什么说什么。</p>
              <p>面相学三大原则：额头宽是聪明（秃头除外）、鼻子大有财（鼻炎不算）、下巴圆有福（双下巴最佳）。</p>
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <div className="acrylic rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            命理理念
          </h3>
          <div className="space-y-3 text-slate-600 leading-relaxed">
            <p>
              "命理不是宿命论，而是了解自己的工具。"黄师傅始终坚持这一理念，
              认为学习命理的真正意义在于认识自己、改善自己，而不是消极地等待命运安排。
            </p>
            <p>
              面相学讲"相由心生"，一个人的内心状态会反映在外貌上；
              紫微斗数通过星盘展示人生的各种可能性；
              六爻和小六壬则能在具体事情上提供参考。
              这些术数工具的最终目的，都是帮助人们更好地认识自己、把握人生。
            </p>
            <p>
              黄师傅致力于用通俗易懂的方式科普传统命理文化，
              让更多人能够了解这门古老的智慧，从中受益。
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="acrylic rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <h3 className="text-xl font-bold text-slate-800 mb-6">如需咨询，欢迎联系</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleCopyQQ}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              QQ: {masterInfo.qq}
              <Copy className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
