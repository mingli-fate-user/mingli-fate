import { useState } from 'react';
import { Save, Check, X } from 'lucide-react';
import { useSavedRecords } from '@/hooks/useSavedRecords';

interface SaveRecordButtonProps {
  type: string;
  typeLabel: string;
  data: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

export default function SaveRecordButton({ type, typeLabel, data, extra }: SaveRecordButtonProps) {
  const { addRecord } = useSavedRecords();
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  function openDialog() {
    const now = new Date();
    const defaultName = `${typeLabel}_${now.getMonth() + 1}月${now.getDate()}日_${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    setName(defaultName);
    setShowDialog(true);
  }

  function handleSave() {
    const saveData: Record<string, unknown> = { ...data };
    if (extra) saveData._extra = extra;

    addRecord({
      name: name || '未命名',
      type: type as any,
      typeLabel,
      data: saveData,
    });
    window.dispatchEvent(new CustomEvent('mingli_record_saved'));
    setShowDialog(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <button
        onClick={openDialog}
        disabled={saved}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
        style={{
          background: saved ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
          border: saved ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.06)',
          color: saved ? '#4ade80' : 'rgba(232,220,200,0.5)',
        }}
      >
        {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
        {saved ? '已保存' : '保存'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowDialog(false)}>
          <style>{`@keyframes fU{from{opacity:0;transform:translateY(20px)scale(0.95)}to{opacity:1;transform:translateY(0)scale(1)}}.aFU{animation:fU 0.3s ease forwards}`}</style>
          <div className="aFU w-full max-w-sm rounded-2xl border p-5 relative" style={{ background: 'linear-gradient(135deg, rgba(26,15,8,0.98), rgba(10,5,2,0.99))', borderColor: 'rgba(251,191,36,0.15)' }} onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }} />

            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold" style={{ fontFamily: "'Noto Serif SC','KaiTi',serif", color: '#fbbf24' }}>保存排盘记录</h4>
              <button onClick={() => setShowDialog(false)} className="p-1 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="输入备忘名称"
              className="w-full h-10 px-3 rounded-lg text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-amber-400/30 transition-all"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
              autoFocus
            />

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowDialog(false)} className="flex-1 h-9 rounded-lg text-xs transition-colors" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,220,200,0.4)' }}>
                取消
              </button>
              <button onClick={handleSave} className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                保存到本地
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
