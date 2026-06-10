import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  RotateCw, Trash2, Save, ArrowRight, Home, Move,
  Compass, RotateCcw, ChevronDown, ChevronUp, MapPin,
} from 'lucide-react';
import { ROOM_TYPES, GONG_NAMES, type RoomLayout, type HouseLayout } from '@/data/xuankong';
import { Link } from 'react-router-dom';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import SaveRecordButton from '@/components/SaveRecordButton';

// ============================================================
// 风水户型设计器 v3 - 修复方位+手机触摸+数据转录
// ============================================================

const CANVAS_SIZE = 520;
const GRID = 20;

const GONG_DIR: Record<number, string> = {
  1: '正北', 2: '西南', 3: '正东', 4: '东南',
  5: '中宫', 6: '西北', 7: '正西', 8: '东北', 9: '正南',
};

// 二十四山角度映射（从正北顺时针0-360）
const SHAN_ANGLES: Array<{ name: string; gong: number; centerAngle: number }> = [
  { name: '子', gong: 1, centerAngle: 0 },
  { name: '癸', gong: 1, centerAngle: 15 },
  { name: '丑', gong: 8, centerAngle: 30 },
  { name: '艮', gong: 8, centerAngle: 45 },
  { name: '寅', gong: 8, centerAngle: 60 },
  { name: '甲', gong: 3, centerAngle: 75 },
  { name: '卯', gong: 3, centerAngle: 90 },
  { name: '乙', gong: 3, centerAngle: 105 },
  { name: '辰', gong: 4, centerAngle: 120 },
  { name: '巽', gong: 4, centerAngle: 135 },
  { name: '巳', gong: 4, centerAngle: 150 },
  { name: '丙', gong: 9, centerAngle: 165 },
  { name: '午', gong: 9, centerAngle: 180 },
  { name: '丁', gong: 9, centerAngle: 195 },
  { name: '未', gong: 2, centerAngle: 210 },
  { name: '坤', gong: 2, centerAngle: 225 },
  { name: '申', gong: 2, centerAngle: 240 },
  { name: '庚', gong: 7, centerAngle: 255 },
  { name: '酉', gong: 7, centerAngle: 270 },
  { name: '辛', gong: 7, centerAngle: 285 },
  { name: '戌', gong: 6, centerAngle: 300 },
  { name: '乾', gong: 6, centerAngle: 315 },
  { name: '亥', gong: 6, centerAngle: 330 },
  { name: '壬', gong: 1, centerAngle: 345 },
];

/** 计算房间中心相对于画布中心的方位角度（从正北顺时针0-360） */
function calcAngleFromCenter(
  cx: number, cy: number,
  canvasCenter: number,
): number {
  const dx = cx - canvasCenter;
  const dy = cy - canvasCenter;
  // atan2(y,x) 在标准数学坐标系：右=0, 上=π/2, 左=π, 下=-π/2
  // 但canvas的y向下为正，需要翻转dy
  let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
  // 现在：右=0, 上=90, 左=180, 下=-90
  // 转为0-360，从正北顺时针
  angle = (90 - angle + 360) % 360;
  return angle;
}

/** 根据角度计算九宫 */
function angleToGong(angle: number, compassRotation: number): number {
  // 减去罗盘旋转
  const adjusted = (angle - compassRotation + 360) % 360;
  // 八宫划分（每个45°）
  if (adjusted >= 337.5 || adjusted < 22.5) return 1;  // 北(坎)
  if (adjusted >= 22.5 && adjusted < 67.5) return 8;   // 东北(艮)
  if (adjusted >= 67.5 && adjusted < 112.5) return 3;  // 东(震)
  if (adjusted >= 112.5 && adjusted < 157.5) return 4; // 东南(巽)
  if (adjusted >= 157.5 && adjusted < 202.5) return 9; // 南(离)
  if (adjusted >= 202.5 && adjusted < 247.5) return 2; // 西南(坤)
  if (adjusted >= 247.5 && adjusted < 292.5) return 7; // 西(兑)
  return 6; // 西北(乾)
}

/** 根据角度找最近二十四山 */
function angleToShan(angle: number, compassRotation: number): string {
  const adjusted = (angle - compassRotation + 360) % 360;
  let closest = SHAN_ANGLES[0];
  let minDiff = 360;
  for (const s of SHAN_ANGLES) {
    const diff = Math.min((adjusted - s.centerAngle + 360) % 360, (s.centerAngle - adjusted + 360) % 360);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }
  return closest.name;
}

/** 获取坐山（大门对宫） */
function getOppositeShan(shan: string): string {
  const map: Record<string, string> = {
    '子': '午', '午': '子', '卯': '酉', '酉': '卯',
    '艮': '坤', '坤': '艮', '乾': '巽', '巽': '乾',
    '壬': '丙', '丙': '壬', '癸': '丁', '丁': '癸',
    '甲': '庚', '庚': '甲', '乙': '辛', '辛': '乙',
    '丑': '未', '未': '丑', '寅': '申', '申': '寅',
    '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
  };
  return map[shan] || shan;
}

// ---- 户型转录数据结构 ----
export interface HouseDataTranscript {
  layoutName: string;
  doorDirection: string;  // 大门朝向（向）
  zuoShan: string;        // 坐山
  xiang: string;          // 向
  compassRotation: number;
  roomsByGong: Record<number, Array<{ name: string; type: string }>>;
  layoutId: string;
}

/** 从户型布局生成数据转录 */
function generateTranscript(layout: HouseLayout): HouseDataTranscript {
  const rooms = layout.rooms;
  // 找大门
  const door = rooms.find(r => r.type === 'door');
  let doorShan = '午'; // 默认朝南
  if (door) {
    const angle = calcAngleFromCenter(
      door.x + door.width / 2, door.y + door.height / 2,
      CANVAS_SIZE / 2,
    );
    doorShan = angleToShan(angle, layout.compassRotation);
  }
  const zuoShan = getOppositeShan(doorShan);

  // 按宫位分组房间
  const roomsByGong: Record<number, Array<{ name: string; type: string }>> = {};
  for (let g = 1; g <= 9; g++) roomsByGong[g] = [];

  for (const room of rooms) {
    const angle = calcAngleFromCenter(
      room.x + room.width / 2, room.y + room.height / 2,
      CANVAS_SIZE / 2,
    );
    const gong = angleToGong(angle, layout.compassRotation);
    roomsByGong[gong]?.push({ name: room.name, type: room.type });
  }

  return {
    layoutName: layout.name,
    doorDirection: doorShan,
    zuoShan,
    xiang: doorShan,
    compassRotation: layout.compassRotation,
    roomsByGong,
    layoutId: layout.id,
  };
}

export default function FengShuiDesigner() {
  const [rooms, setRooms] = useState<RoomLayout[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compassRotation, setCompassRotation] = useState(0);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [houseName, setHouseName] = useState('我的户型');
  const [savedLayouts, setSavedLayouts] = useState<HouseLayout[]>(() => {
    try { const raw = localStorage.getItem('fengshui_layouts'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [showSaved, setShowSaved] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<HouseDataTranscript | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const center = CANVAS_SIZE / 2;

  // 计算房间方位（实时）
  const roomsWithGong = useMemo(() => {
    return rooms.map(room => {
      const angle = calcAngleFromCenter(
        room.x + room.width / 2, room.y + room.height / 2, center,
      );
      const gong = angleToGong(angle, compassRotation);
      const shan = angleToShan(angle, compassRotation);
      return { ...room, gong, shan, angle: Math.round(angle) };
    });
  }, [rooms, compassRotation, center]);

  // ---- 添加房间 ----
  const addRoom = useCallback((roomType: typeof ROOM_TYPES[number]) => {
    const newRoom: RoomLayout = {
      id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      type: roomType.id,
      name: roomType.name,
      x: center - 40,
      y: center - 30,
      width: 80,
      height: 60,
      rotation: 0,
    };
    setRooms(prev => [...prev, newRoom]);
    setSelectedId(newRoom.id);
  }, [center]);

  // ---- 获取画布坐标（鼠标+触摸通用） ----
  const getCanvasPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // ---- 移动处理 ----
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const { x, y } = getCanvasPos(e);

    if (dragging) {
      setRooms(prev => prev.map(room => {
        if (room.id !== dragging.id) return room;
        let nx = Math.round((Math.max(0, Math.min(CANVAS_SIZE - room.width, x - dragging.offsetX))) / GRID) * GRID;
        let ny = Math.round((Math.max(0, Math.min(CANVAS_SIZE - room.height, y - dragging.offsetY))) / GRID) * GRID;
        // 中宫吸附：房间中心靠近画布中心时自动吸附
        const SNAP_DIST = 35;
        const cx = nx + room.width / 2;
        const cy = ny + room.height / 2;
        const center = CANVAS_SIZE / 2;
        const dist = Math.sqrt((cx - center) ** 2 + (cy - center) ** 2);
        if (dist < SNAP_DIST) {
          nx = Math.round((center - room.width / 2) / GRID) * GRID;
          ny = Math.round((center - room.height / 2) / GRID) * GRID;
        }
        return { ...room, x: nx, y: ny };
      }));
    }

    if (resizing) {
      setRooms(prev => prev.map(room => {
        if (room.id !== resizing) return room;
        return {
          ...room,
          width: Math.max(40, Math.round((x - room.x) / GRID) * GRID),
          height: Math.max(30, Math.round((y - room.y) / GRID) * GRID),
          };
      }));
    }
  }, [dragging, resizing, getCanvasPos]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  // ---- 鼠标/触摸按下 ----
  const handleRoomPointerDown = useCallback((room: RoomLayout, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setSelectedId(room.id);
    const { x, y } = getCanvasPos(e);
    setDragging({
      id: room.id,
      offsetX: x - room.x,
      offsetY: y - room.y,
    });
  }, [getCanvasPos]);

  // ---- 删除 ----
  const deleteRoom = useCallback((id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  // ---- 旋转罗盘 ----
  const rotateCompass = useCallback((deg: number) => {
    setCompassRotation(prev => (prev + deg + 360) % 360);
  }, []);

  // ---- 保存户型 ----
  const saveLayout = useCallback(() => {
    const enrichedRooms = rooms.map(room => {
      const angle = calcAngleFromCenter(
        room.x + room.width / 2, room.y + room.height / 2, center,
      );
      const gong = angleToGong(angle, compassRotation);
      const shan = angleToShan(angle, compassRotation);
      return { ...room, gong, shan };
    });

    const layout: HouseLayout = {
      id: `layout_${Date.now()}`,
      name: houseName,
      rooms: enrichedRooms,
      compassRotation,
      createdAt: new Date().toISOString(),
    };

    const newLayouts = [layout, ...savedLayouts].slice(0, 20);
    setSavedLayouts(newLayouts);
    localStorage.setItem('fengshui_layouts', JSON.stringify(newLayouts));

    // 生成转录
    const t = generateTranscript(layout);
    setTranscript(t);
    setShowTranscript(true);
    localStorage.setItem('fengshui_transcript_' + layout.id, JSON.stringify(t));
  }, [rooms, compassRotation, houseName, savedLayouts, center]);

  // ---- 加载户型 ----
  const loadLayout = useCallback((layout: HouseLayout) => {
    setRooms(layout.rooms.map(r => ({ ...r })));
    setCompassRotation(layout.compassRotation);
    setHouseName(layout.name);
    setShowSaved(false);
    // 尝试加载转录
    const raw = localStorage.getItem('fengshui_transcript_' + layout.id);
    if (raw) {
      try { setTranscript(JSON.parse(raw)); } catch { setTranscript(null); }
    }
  }, []);

  const deleteSavedLayout = useCallback((id: string) => {
    const newLayouts = savedLayouts.filter(l => l.id !== id);
    setSavedLayouts(newLayouts);
    localStorage.setItem('fengshui_layouts', JSON.stringify(newLayouts));
    localStorage.removeItem('fengshui_transcript_' + id);
  }, [savedLayouts]);

  const clearCanvas = useCallback(() => {
    if (rooms.length > 0 && !confirm('确定要清空所有房间吗？')) return;
    setRooms([]); setSelectedId(null);
  }, [rooms.length]);

  const selectedRoom = rooms.find(r => r.id === selectedId);
  const selectedEnriched = roomsWithGong.find(r => r.id === selectedId);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative overflow-hidden py-10 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-sm">
            <Compass className="w-4 h-4" />理气风水 · 户型建模
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400" style={{ fontFamily: "'Noto Serif SC', 'KaiTi', serif" }}>
            风水户型设计器
          </h1>
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('fengshui')}/></div>
          <p className="text-emerald-200/60 text-base max-w-2xl mx-auto">
            点击模块添加 → 拖拽移动（支持手机） → 旋转罗盘调方位 → 保存自动转录数据 → 玄空/奇门排盘
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <input type="text" value={houseName} onChange={e => setHouseName(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-emerald-400/30 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="户型名称" />
          <div className="flex items-center gap-2 flex-wrap">
            {/* 罗盘 */}
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-400/20 rounded-lg px-2 py-1">
              <button onClick={() => rotateCompass(-45)} className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded" title="左转45"><RotateCw className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} /></button>
              <button onClick={() => rotateCompass(-15)} className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded" title="左转15"><RotateCw className="w-3.5 h-3.5" style={{ transform: 'scaleX(-1)' }} /></button>
              <span className="text-xs text-emerald-400/60 w-10 text-center font-mono">{compassRotation}°</span>
              <button onClick={() => rotateCompass(15)} className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded" title="右转15"><RotateCw className="w-3.5 h-3.5" /></button>
              <button onClick={() => rotateCompass(45)} className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded" title="右转45"><RotateCw className="w-4 h-4" /></button>
              <button onClick={() => setCompassRotation(0)} className="p-1.5 text-emerald-400/50 hover:text-emerald-300 hover:bg-emerald-500/20 rounded" title="重置"><RotateCcw className="w-3.5 h-3.5" /></button>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => setShowSaved(!showSaved)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/15 border border-blue-400/30 rounded-lg text-blue-300 text-sm hover:bg-blue-500/25"><Home className="w-4 h-4" />已存({savedLayouts.length})</button>
            <button onClick={clearCanvas} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/15 border border-red-400/30 rounded-lg text-red-300 text-sm hover:bg-red-500/25"><Trash2 className="w-4 h-4" />清空</button>
            <button onClick={saveLayout} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-sm font-medium hover:shadow-lg"><Save className="w-4 h-4" />保存并转录</button>
          </div>
        </div>

        {/* 数据转录面板 */}
        {showTranscript && transcript && (
          <div className="mb-4 bg-gradient-to-r from-amber-950/20 to-emerald-950/20 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2"><MapPin className="w-4 h-4" />户型数据转录</h3>
              <button onClick={() => setShowTranscript(false)} className="text-white/40 hover:text-white text-xs">收起</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="text-[11px] text-white/40">大门朝向（向）</div>
                <div className="text-lg font-bold text-emerald-300">{transcript.xiang}山</div>
                <div className="text-xs text-white/30">{GONG_NAMES[SHAN_ANGLES.find(s => s.name === transcript.xiang)?.gong || 5]?.direction}方</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="text-[11px] text-white/40">坐山</div>
                <div className="text-lg font-bold text-amber-300">{transcript.zuoShan}山</div>
                <div className="text-xs text-white/30">{GONG_NAMES[SHAN_ANGLES.find(s => s.name === transcript.zuoShan)?.gong || 5]?.direction}方</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="text-[11px] text-white/40">罗盘偏移</div>
                <div className="text-lg font-bold text-purple-300">{transcript.compassRotation}°</div>
                <div className="text-xs text-white/30">{transcript.layoutName}</div>
              </div>
            </div>
            {/* 转录后的宫位分布 */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[11px] text-white/40 mb-2">宫位分布</div>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                {[1,2,3,4,5,6,7,8,9].map(g => (
                  <div key={g} className="bg-black/20 rounded-lg p-1.5 border border-white/5">
                    <div className="text-[10px] text-white/30 text-center">{GONG_DIR[g]}</div>
                    <div className="text-[10px] text-emerald-300/70 text-center min-h-[16px]">
                      {transcript.roomsByGong[g]?.map(r => r.name).join('、') || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 排盘按钮 */}
            <div className="flex gap-3 mt-4 pt-3 border-t border-white/10">
              <Link to={`/tools/xuankong?layoutId=${transcript.layoutId}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/15 border border-amber-400/30 rounded-xl text-amber-300 text-sm font-medium hover:bg-amber-500/25 transition-all text-center">
                <ArrowRight className="w-4 h-4" />玄空飞星排盘
              </Link>
              <Link to={`/tools/qimendifa?layoutId=${transcript.layoutId}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/15 border border-purple-400/30 rounded-xl text-purple-300 text-sm font-medium hover:bg-purple-500/25 transition-all text-center">
                <ArrowRight className="w-4 h-4" />奇门地理排盘
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* 左侧模块 */}
          <div className="lg:w-52 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-xl border border-emerald-400/15 rounded-2xl p-3">
              <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2 px-1"><Move className="w-4 h-4" />房间模块</h3>
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5">
                {ROOM_TYPES.map(rt => (
                  <button key={rt.id} onClick={() => addRoom(rt)}
                    className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/15 hover:border-emerald-400/30 transition-all active:scale-95 touch-manipulation">
                    <span className="text-xl pointer-events-none select-none">{rt.icon}</span>
                    <span className="text-[11px] text-white/70 pointer-events-none select-none">{rt.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <h3 className="text-xs font-semibold text-emerald-400/60 px-1">排盘分析</h3>
                <Link to="/tools/xuankong" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs hover:bg-amber-500/20"><ArrowRight className="w-3.5 h-3.5" />玄空飞星排盘</Link>
                <Link to="/tools/qimendifa" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs hover:bg-purple-500/20"><ArrowRight className="w-3.5 h-3.5" />奇门地理排盘</Link>
              </div>
            </div>
          </div>

          {/* 画布 */}
          <div className="flex-1 flex flex-col items-center">
            <div ref={canvasRef}
              className="relative bg-gradient-to-br from-emerald-950/30 to-green-950/20 backdrop-blur-xl border-2 border-emerald-400/30 rounded-2xl overflow-hidden select-none shadow-2xl shadow-emerald-900/20"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, maxWidth: '100%', touchAction: 'none' }}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onClick={() => setSelectedId(null)}
            >
              {/* 网格 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }}>
                <defs><pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                </pattern></defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              {/* 九宫线 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-emerald-400/12" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-emerald-400/12" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-emerald-400/12" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-emerald-400/12" />
              </div>
              {/* 中心十字 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/20" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/20" />
              </div>
              {/* 罗盘（可旋转） */}
              <div className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${compassRotation}deg)`, transformOrigin: 'center' }}>
                <div className="absolute inset-4 border-2 border-dashed border-emerald-400/25 rounded-full" />
                <div className="absolute inset-8 border border-emerald-400/10 rounded-full" />
                {/* 四正 */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-base font-bold text-red-400 drop-shadow">北</div>
                  <div className="text-[9px] text-red-400/50">坎</div>
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-base font-bold text-red-400 drop-shadow">南</div>
                  <div className="text-[9px] text-red-400/50">离</div>
                </div>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-center">
                  <div className="text-base font-bold text-emerald-400 drop-shadow">东</div>
                  <div className="text-[9px] text-emerald-400/50">震</div>
                </div>
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-center">
                  <div className="text-base font-bold text-emerald-400 drop-shadow">西</div>
                  <div className="text-[9px] text-emerald-400/50">兑</div>
                </div>
                {/* 四隅 */}
                <div className="absolute top-[14%] right-[14%] text-center"><div className="text-[11px] font-medium text-amber-400/80">东北</div><div className="text-[8px] text-amber-400/40">艮</div></div>
                <div className="absolute bottom-[14%] right-[14%] text-center"><div className="text-[11px] font-medium text-amber-400/80">东南</div><div className="text-[8px] text-amber-400/40">巽</div></div>
                <div className="absolute bottom-[14%] left-[14%] text-center"><div className="text-[11px] font-medium text-amber-400/80">西南</div><div className="text-[8px] text-amber-400/40">坤</div></div>
                <div className="absolute top-[14%] left-[14%] text-center"><div className="text-[11px] font-medium text-amber-400/80">西北</div><div className="text-[8px] text-amber-400/40">乾</div></div>
              </div>
              {/* 中宫点 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white shadow-lg z-30" />
              {/* 房间 */}
              {roomsWithGong.map(room => {
                const rt = ROOM_TYPES.find(t => t.id === room.type);
                const isSel = room.id === selectedId;
                const gongLabel = GONG_DIR[room.gong || 5];
                return (
                  <div key={room.id} className={`absolute ${isSel ? 'z-20' : 'z-10'}`}
                    style={{ left: room.x, top: room.y, width: room.width, height: room.height, transform: `rotate(${room.rotation}deg)` }}
                    onMouseDown={e => handleRoomPointerDown(room, e)}
                    onTouchStart={e => handleRoomPointerDown(room, e)}
                    onClick={e => { e.stopPropagation(); setSelectedId(room.id); }}
                  >
                    <div className={`w-full h-full rounded-lg border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-move touch-manipulation ${isSel ? 'border-emerald-400 shadow-lg shadow-emerald-500/30' : 'border-white/20'}`}
                      style={{ backgroundColor: `${rt?.color || '#666'}22` }}>
                      <span className="text-lg select-none pointer-events-none">{rt?.icon}</span>
                      <span className="text-[10px] text-white/80 font-medium select-none pointer-events-none">{room.name}</span>
                      <span className="text-[9px] text-emerald-400/80 font-medium select-none pointer-events-none">{gongLabel}·{room.shan}</span>
                      {isSel && <>
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white cursor-nwse-resize shadow-md flex items-center justify-center"
                          onMouseDown={e => { e.stopPropagation(); setResizing(room.id); }}
                          onTouchStart={e => { e.stopPropagation(); setResizing(room.id); }}>
                          <ChevronDown className="w-2.5 h-2.5 text-white" />
                        </div>
                      </>}
                    </div>
                    {/* 删除按钮（外部） */}
                    {isSel && (
                      <button onClick={e => { e.stopPropagation(); deleteRoom(room.id); }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 active:bg-red-600 transition-colors shadow-md">
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
              <span>点击模块添加</span><span>·</span><span>拖拽/触摸移动</span><span>·</span><span>右下角拉大</span><span>·</span><span>罗盘调方位</span>
            </div>
          </div>

          {/* 右侧属性 */}
          <div className="lg:w-60 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-xl border border-emerald-400/15 rounded-2xl p-4">
              {selectedRoom && selectedEnriched ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-emerald-300">房间属性</h3>
                    <button onClick={() => deleteRoom(selectedRoom.id)}
                      className="px-2 py-1 bg-red-500/15 text-red-400 rounded text-[10px] hover:bg-red-500/25">删除</button>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-white/50">名称</label>
                      <input type="text" value={selectedRoom.name}
                        onChange={e => setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, name: e.target.value } : r))}
                        className="w-full mt-1 px-3 py-2 bg-black/40 border border-emerald-400/30 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-[11px] text-white/50">宽度</label>
                        <input type="number" value={Math.round(selectedRoom.width)}
                          onChange={e => setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, width: Math.max(40, Number(e.target.value)) } : r))}
                          className="w-full mt-1 px-3 py-2 bg-black/40 border border-emerald-400/30 rounded-lg text-white text-sm" /></div>
                      <div><label className="text-[11px] text-white/50">高度</label>
                        <input type="number" value={Math.round(selectedRoom.height)}
                          onChange={e => setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, height: Math.max(30, Number(e.target.value)) } : r))}
                          className="w-full mt-1 px-3 py-2 bg-black/40 border border-emerald-400/30 rounded-lg text-white text-sm" /></div>
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50">旋转 ({selectedRoom.rotation}°)</label>
                      <input type="range" min={0} max={360} step={15} value={selectedRoom.rotation}
                        onChange={e => setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, rotation: Number(e.target.value) } : r))}
                        className="w-full mt-1 accent-emerald-400" />
                    </div>
                    {/* 方位信息 */}
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                      <div className="text-[11px] text-emerald-400/60">当前方位</div>
                      <div className="text-lg font-bold text-emerald-300">{GONG_DIR[selectedEnriched.gong || 5]}</div>
                      <div className="text-[10px] text-white/40">{selectedEnriched.shan}山 · 第{selectedEnriched.gong}宫 · 角度{selectedEnriched.angle}°</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto"><Move className="w-5 h-5 text-white/20" /></div>
                  <p className="text-xs text-white/40">点击房间查看属性<br />或点击模块添加新房间</p>
                </div>
              )}
              {/* 概览 */}
              {roomsWithGong.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <h3 className="text-xs font-semibold text-emerald-400/60 mb-2">户型概览（{roomsWithGong.length}间）</h3>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {roomsWithGong.map(room => {
                      const rt = ROOM_TYPES.find(t => t.id === room.type);
                      const isSel = room.id === selectedId;
                      return (
                        <div key={room.id} onClick={() => setSelectedId(room.id)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isSel ? 'bg-emerald-500/20' : 'hover:bg-white/5'}`}>
                          <span className="text-sm">{rt?.icon}</span>
                          <span className="text-[11px] text-white/70 flex-1 truncate">{room.name}</span>
                          <span className="text-[10px] text-emerald-400/60 font-medium">{GONG_DIR[room.gong || 5]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 已保存户型 */}
        {showSaved && (
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-emerald-400/15 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-emerald-300 mb-4">已保存的户型</h3>
            {savedLayouts.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">暂无保存的户型</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedLayouts.map(layout => {
                  const tRaw = localStorage.getItem('fengshui_transcript_' + layout.id);
                  const hasTranscript = !!tRaw;
                  return (
                    <div key={layout.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-400/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white/80">{layout.name}</h4>
                        <button onClick={() => deleteSavedLayout(layout.id)} className="p-1 text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="text-xs text-white/40 mb-1">{layout.rooms.length} 个房间 · 罗盘{layout.compassRotation}°</p>
                      {hasTranscript && <p className="text-[10px] text-amber-400/60 mb-2">✓ 已转录数据</p>}
                      <p className="text-[10px] text-white/25 mb-3">{new Date(layout.createdAt).toLocaleString()}</p>
                      <div className="flex gap-2">
                        <button onClick={() => loadLayout(layout)} className="flex-1 px-3 py-1.5 bg-emerald-500/15 border border-emerald-400/30 rounded-lg text-emerald-300 text-xs hover:bg-emerald-500/25">加载</button>
                        {hasTranscript && (
                          <Link to={`/tools/xuankong?layoutId=${layout.id}`} className="flex-1 px-3 py-1.5 bg-amber-500/15 border border-amber-400/30 rounded-lg text-amber-300 text-xs hover:bg-amber-500/25 text-center">玄空飞星</Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 导出转录函数供外部使用
export { generateTranscript };
export type { HouseDataTranscript };
