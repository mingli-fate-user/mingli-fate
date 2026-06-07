import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { Key, Check, AlertCircle, ExternalLink, ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApiKeyManage() {
  const { user, token } = useAuth();
  const [myKey, setMyKey] = useState<{ prefix: string; hasKey: boolean } | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const myKeyQuery = trpc.apiKey.myKey.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );

  const saveMutation = trpc.apiKey.save.useMutation();
  const testMutation = trpc.apiKey.test.useMutation();
  const deleteMutation = trpc.apiKey.delete.useMutation();

  useEffect(() => {
    if (myKeyQuery.data) {
      setMyKey(myKeyQuery.data);
    }
  }, [myKeyQuery.data]);

  async function handleTest() {
    if (!inputKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testMutation.mutateAsync({ key: inputKey.trim() });
      setTestResult(result);
    } catch {
      setTestResult({ valid: false, message: '测试失败' });
    }
    setTesting(false);
  }

  async function handleSave() {
    if (!inputKey.trim() || !token) return;
    setSaving(true);
    try {
      await saveMutation.mutateAsync({
        key: inputKey.trim(),
        provider: 'siliconflow',
        token,
      });
      setMyKey({ prefix: inputKey.trim().slice(0, 8) + '...' + inputKey.trim().slice(-4), hasKey: true });
      setTestResult(null);
      setInputKey('');
    } catch (e: any) {
      setTestResult({ valid: false, message: e.message || '保存失败' });
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!token) return;
    if (!confirm('确定删除已保存的API密钥吗？')) return;
    try {
      await deleteMutation.mutateAsync({ token });
      setMyKey(null);
    } catch {}
  }

  // 硅基流动注册指南步骤
  const guideSteps = [
    { num: 1, title: '访问硅基流动', desc: '打开 https://cloud.siliconflow.cn/i/MKk7VoRZ 注册账号' },
    { num: 2, title: '完成注册', desc: '用手机号注册并登录（新用户免费送2000万Tokens）' },
    { num: 3, title: '获取API密钥', desc: '登录后点击右上角头像 → API密钥 → 新建API密钥' },
    { num: 4, title: '复制密钥', desc: '复制生成的密钥（格式：sk-xxxxxxxx）' },
    { num: 5, title: '粘贴到下方', desc: '将密钥粘贴到下方输入框，点击保存即可' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </Link>
        <h1 className="text-2xl font-bold text-white">AI解析设置</h1>
      </div>

      {/* 已保存的密钥 */}
      {myKey?.hasKey && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-300">已配置个人API密钥</p>
                <p className="text-xs text-white/40">{myKey.prefix}</p>
              </div>
            </div>
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
              删除
            </button>
          </div>
        </div>
      )}

      {/* 模式一：使用自己的API密钥 */}
      <div className="mb-6 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">方法一：使用自己的API密钥</h2>
            <p className="text-xs text-white/40">免费、稳定、无限制，推荐长期使用</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 获取指南按钮 */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-400/20 text-left hover:bg-blue-500/15 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-300 font-medium">如何获取硅基流动API密钥？</span>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </div>
          </button>

          {/* 指南步骤 */}
          {showGuide && (
            <div className="p-4 rounded-lg bg-black/30 border border-white/10 space-y-3">
              {guideSteps.map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">{step.num}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{step.title}</p>
                    <p className="text-xs text-white/40">{step.desc}</p>
                  </div>
                </div>
              ))}
              <a
                href="https://cloud.siliconflow.cn/i/MKk7VoRZ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors mt-2"
              >
                <ExternalLink className="w-4 h-4" />
                前往硅基流动注册
              </a>
            </div>
          )}

          {/* 输入密钥 */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">API密钥</label>
            <input
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-blue-400/40 text-sm"
            />
          </div>

          {/* 测试和保存按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={!inputKey.trim() || testing}
              className="flex-1 py-2.5 border border-white/10 text-white/60 rounded-xl text-sm hover:border-blue-400/30 hover:text-blue-300 transition-colors disabled:opacity-30"
            >
              {testing ? '测试中...' : '测试密钥'}
            </button>
            <button
              onClick={handleSave}
              disabled={!inputKey.trim() || saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-30"
            >
              {saving ? '保存中...' : '保存密钥'}
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
      </div>

      {/* 模式二：使用黄师傅的密钥 */}
      <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/15 overflow-hidden">
        <div className="p-4 border-b border-amber-400/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-300">方法二：使用黄师傅的密钥</h2>
            <p className="text-xs text-white/40">卦不走空，随缘给卦金</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-400/10">
            <p className="text-sm text-white/70 leading-relaxed mb-3">
              黄师傅提供自己的API密钥供大家使用。命理讲究「卦不走空」，
              如果您觉得黄师傅的工具对您有帮助，欢迎随缘打赏，金额随意。
            </p>
            <p className="text-sm text-amber-300/70 leading-relaxed mb-3">
              也可以不给，但因果自己扛。
            </p>
            <p className="text-xs text-amber-400/50 italic">
              「你的支持是黄师傅最大的动力」
            </p>
          </div>

          {/* 赞赏码 */}
          <div className="text-center">
            <p className="text-sm text-white/60 mb-3">微信扫码赞赏</p>
            <img
              src="./reward-qrcode.png"
              alt="黄师傅赞赏码"
              className="w-48 h-48 mx-auto rounded-xl border border-amber-400/20"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* 使用黄师傅密钥按钮 */}
          <button
            onClick={async () => {
              if (!token) { alert('请先登录'); return; }
              try {
                await deleteMutation.mutateAsync({ token });
                setMyKey(null);
                alert('已切换为使用黄师傅的API密钥');
              } catch {}
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-medium hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            继续使用黄师傅的密钥
          </button>
        </div>
      </div>
    </div>
  );
}
