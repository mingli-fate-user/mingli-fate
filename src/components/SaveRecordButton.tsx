import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useSavedRecords } from '@/hooks/useSavedRecords';

interface SaveRecordButtonProps {
  type: 'bazi' | 'ziwei' | 'meihua' | 'liuyao' | 'xiaoliuren' | 'qimen' | 'chenggu' | 'jinqiangua' | 'mianxiang' | 'tarot' | 'astro' | 'taiyi' | 'fengshui' | 'xuankong' | 'qimendifa' | 'daliuren';
  typeLabel: string;
  data: Record<string, unknown>;
}

export default function SaveRecordButton({ type: _type, typeLabel, data }: SaveRecordButtonProps) {
  const { addRecord } = useSavedRecords();
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  function openDialog() {
    const now = new Date();
    const defaultName = `${typeLabel}_${now.getMonth() + 1}月${now.getDate()}日`;
    setName(defaultName);
    setShowDialog(true);
  }

  function handleSave() {
    addRecord({
      name: name || '未命名',
      type: _type,
      typeLabel,
      data,
    });
    // 触发自定义事件通知个人页刷新
    window.dispatchEvent(new CustomEvent('mingli_record_saved'));
    setShowDialog(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="flex items-center gap-2 px-4 py-2 border border-blue-500/30 text-blue-600 rounded-lg text-sm hover:bg-blue-500/10 transition-colors"
      >
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? '已保存' : '保存记录'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-sm mx-4 p-6 border border-blue-500/20 rounded-xl bg-white" onClick={e => e.stopPropagation()}>
            <h4 className="text-lg font-bold text-slate-800 mb-4">保存排盘记录</h4>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入备忘名称"
              className="w-full px-4 py-3 bg-black/50 border border-blue-500/20 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
              className="flex-1 px-4 py-2.5 border border-blue-500/20 text-slate-500 rounded-lg hover:border-blue-500/40 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
