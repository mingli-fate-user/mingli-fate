import { Calendar } from 'lucide-react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}

export default function DateInput({ label, value, onChange, placeholder, hint }: DateInputProps) {
  return (
    <div>
      <label className="block text-sm text-slate-500 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-4 h-4 text-blue-600/40" />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-black/50 border border-blue-500/15 rounded-lg text-slate-800 text-sm
            placeholder:text-slate-400/60
            focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-[#c9a84c]/10
            transition-all duration-200"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400 mt-1.5 ml-1">{hint}</p>}
    </div>
  );
}
