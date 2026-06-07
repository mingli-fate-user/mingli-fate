import { MessageCircle, MapPin, Clock, Copy } from 'lucide-react';
import { masterInfo } from '@/data/siteData';
import { copyAndOpen } from '@/utils/copyAndOpen';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

export default function Contact() {
  const { toast, showToast } = useToast();

  async function handleCopyQQ() {
    await copyAndOpen('qq', masterInfo.qq);
    showToast('QQ号已复制，正在唤起QQ...');
  }

  return (
    <div className="px-4 sm:px-6 py-10 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight" style={{ textShadow: '0 0 20px rgba(59,130,246,0.1)' }}>
          联系咨询
        </h1>
        <p className="text-[14px] text-slate-400">专业命理咨询，为您解答人生困惑</p>
      </div>

      {/* Avatar */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto ring-2 ring-blue-300/30 ring-offset-2 ring-offset-white">
          <img src={masterInfo.photo} alt={masterInfo.name} className="w-full h-full object-cover" />
        </div>
        <p className="text-[15px] font-medium text-slate-700 mt-3">{masterInfo.name}</p>
        <p className="text-[12px] text-slate-400">{masterInfo.title}</p>
      </div>

      {/* QQ Contact Card */}
      <div className="acrylic rounded-3xl p-8 text-center space-y-5 animate-blue-glow">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto ring-2 ring-blue-200/50">
          <MessageCircle className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">QQ咨询</h3>
          <p className="text-[13px] text-slate-400 mt-1">添加QQ好友，在线咨询命理问题</p>
        </div>
        <button onClick={handleCopyQQ} className="btn-primary inline-flex gap-2 px-6 py-3">
          <MessageCircle className="w-4 h-4" />
          {masterInfo.qq}
          <Copy className="w-3 h-3 opacity-50" />
        </button>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h2 className="text-[15px] font-semibold text-slate-800">咨询服务项目</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: '紫微斗数命盘分析', desc: '全面分析命盘格局，解读性格、事业、婚姻、财运' },
            { title: '六爻一事一测', desc: '针对具体问题起卦，精准判断吉凶成败' },
            { title: '面相分析', desc: '通过面部特征分析性格特点和运势走向' },
            { title: '江氏小六壬速测', desc: '快速占卜，适合日常小事的参考' },
          ].map(service => (
            <div key={service.title} className="acrylic p-5">
              <h3 className="text-[14px] font-medium text-blue-600 mb-1.5">{service.title}</h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="acrylic p-6 space-y-3">
        <h3 className="text-[14px] font-semibold text-blue-600">咨询须知</h3>
        <ul className="space-y-3">
          {[
            { icon: Clock, text: '咨询时间灵活，建议提前预约' },
            { icon: MapPin, text: '通过QQ进行远程咨询，方便快捷' },
            { icon: MessageCircle, text: '咨询时请提供准确的出生时间' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-[12px] text-slate-500 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
