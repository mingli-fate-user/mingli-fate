import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApiKey } from '@/hooks/useApiKey';
import {
  X, Key, Heart, Sparkles, Check, AlertCircle,
  ExternalLink, Gift, ChevronRight
} from 'lucide-react';

type Step = 'choice' | 'reward' | 'input';

export default function ApiKeyPrompt() {
  const { isAuthenticated } = useAuth();
  const { hasMadeChoice, markChoiceMade, saveKey, testKey, deleteKey } = useApiKey();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step>('choice');
  const [inputKey, setInputKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || hasMadeChoice) return;

    // 登录且未做选择 → 延迟弹出
    const timer = setTimeout(() => {
      setShow(true);
      setClosing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, hasMadeChoice]);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      setStep('choice');
      setInputKey('');
      setTestResult(null);
    }, 200);
  }

  // 选择黄师傅的密钥 → 显示赞赏码
  function handleChooseDefault() {
    setStep('reward');
  }

  // 赞赏码页面 → 完成
  function handleRewardDone() {
    deleteKey(); // 确保使用默认密钥
    markChoiceMade();
    handleClose();
  }

  // 选择自己的密钥 → 显示输入框
  function handleChooseCustom() {
    setStep('input');
  }

  async function handleTest() {
    if (!inputKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    const result = await testKey(inputKey.trim());
    setTestResult(result);
    setTesting(false);
  }

  function handleSave() {
    if (!inputKey.trim()) return;
    saveKey(inputKey.trim());
    markChoiceMade();
    setTestResult({ valid: true, message: "API密钥已保存" });
    setTimeout(() => {
      handleClose();
    }, 800);
  }

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`w-full max-w-md transition-all duration-200 ${closing ? 'scale-95 translate-y-2' : 'scale-100 translate-y-0'}`}>

        {/* ========== Step 1: 选择 ========== */}
        {step === 'choice' && (
          <div className="bg-[#1a1c24] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-blue-400/20 flex items-center justify-center mx-auto mb-4 ring-1 ring-white/10">
                <Sparkles className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">选择AI解析方式</h3>
              <p className="text-sm text-white/40">
                AI解析需要调用大模型API，请选择您倾向的方式
              </p>
            </div>

            {/* 选项1：黄师傅 */}
            <button
              onClick={handleChooseDefault}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/20 text-left hover:border-amber-400/40 hover:from-amber-500/15 hover:to-yellow-500/15 transition-all mb-3 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                  <Heart className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-300">使用黄师傅的密钥</p>
                  <p className="text-xs text-white/40 mt-0.5">卦不走空，随缘给卦金</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* 选项2：自己的 */}
            <button
              onClick={handleChooseCustom}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/20 text-left hover:border-blue-400/40 hover:from-blue-500/15 hover:to-indigo-500/15 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <Key className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-300">使用自己的API密钥</p>
                  <p className="text-xs text-white/40 mt-0.5">免费注册硅基流动，2000万Tokens赠送</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            <p className="text-center text-[10px] text-white/20 mt-4">
              之后可在"我的"页面随时更改此设置
            </p>
          </div>
        )}

        {/* ========== Step 2: 赞赏码 ========== */}
        {step === 'reward' && (
          <div className="bg-[#1a1c24] border border-amber-400/20 rounded-2xl p-6 shadow-2xl relative">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-4 ring-1 ring-amber-400/20">
                <Gift className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-amber-300 mb-1.5">感谢支持黄师傅</h3>
              <p className="text-xs text-white/40">
                您的每一份支持都是黄师傅继续前行的动力
              </p>
            </div>

            {/* 想说的话 */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-400/10 mb-5 space-y-3">
              <p className="text-sm text-white/70 leading-relaxed">
                命理讲究<span className="text-amber-400 font-medium">「卦不走空」</span>，每一卦都承载着天机与因果。黄师傅搭建这个平台，是希望能将古老的术数智慧与现代科技相结合，让更多人能够以更便捷的方式了解自己的命运轨迹。
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                API调用是有成本的，如果您觉得这些工具对您有帮助，<span className="text-amber-400 font-medium">欢迎随缘打赏</span>，金额随意，一元不嫌少，百元不嫌多。
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                当然，也可以不给，但因果自己扛。不给的话，黄师傅依然为您提供服务，只是天机不可轻泄，<span className="text-amber-400 font-medium">您的支持是对这份事业最大的尊重</span>。
              </p>
              <p className="text-xs text-amber-400/50 italic text-center pt-1">
                「道不轻传，法不空施，卦不走空」
              </p>
            </div>

            {/* 赞赏码 */}
            <div className="text-center mb-5">
              <p className="text-sm text-white/50 mb-3 flex items-center justify-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                微信扫码，随缘打赏
              </p>
              <div className="inline-block p-2 rounded-2xl bg-white border border-amber-400/20">
                <img
                  src="./reward-qrcode.png"
                  alt="黄师傅赞赏码"
                  className="w-44 h-44 rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<p class="text-sm text-white/40">赞赏码加载失败</p>';
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleRewardDone}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-medium hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              继续排盘
            </button>
          </div>
        )}

        {/* ========== Step 3: 输入密钥 ========== */}
        {step === 'input' && (
          <div className="bg-[#1a1c24] border border-blue-400/20 rounded-2xl p-6 shadow-2xl relative">
            {/* Back */}
            <button
              onClick={() => { setStep('choice'); setTestResult(null); }}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              返回
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5 pt-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto mb-4 ring-1 ring-blue-400/20">
                <Key className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-300 mb-1.5">设置您的API密钥</h3>
              <p className="text-xs text-white/40">
                使用自己的密钥，免费且稳定
              </p>
            </div>

            {/* 教程链接 */}
            <a
              href="https://cloud.siliconflow.cn/i/MKk7VoRZ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full p-3 rounded-lg bg-blue-500/10 border border-blue-400/20 text-sm text-blue-300 hover:bg-blue-500/15 transition-colors mb-4"
            >
              <ExternalLink className="w-4 h-4" />
              <span>还没有密钥？点击注册硅基流动（送2000万Tokens）</span>
            </a>

            {/* 输入框 */}
            <div className="mb-4">
              <label className="block text-xs text-white/40 mb-1.5">API密钥</label>
              <input
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-blue-400/40 text-sm"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleTest}
                disabled={!inputKey.trim() || testing}
                className="flex-1 py-2.5 border border-white/10 text-white/60 rounded-xl text-sm hover:border-blue-400/30 hover:text-blue-300 transition-colors disabled:opacity-30"
              >
                {testing ? '测试中...' : '测试密钥'}
              </button>
              <button
                onClick={handleSave}
                disabled={!inputKey.trim()}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-30"
              >
                保存并使用
              </button>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${testResult.valid ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                {testResult.valid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {testResult.message}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
