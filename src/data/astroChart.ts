// 星盘（本命盘）计算 - 基于简化天文算法
// 使用VSOP87简化公式计算行星位置

export interface PlanetPosition {
  name: string;
  nameEn: string;
  symbol: string;
  longitude: number; // 黄道经度 0-360
  latitude: number;
  speed: number; // 每日速度
  house: number; // 所在宫位 1-12
  sign: string; // 所在星座
  signDegree: number; // 在星座内的度数
  retrograde: boolean; // 是否逆行
}

export interface HouseCusp {
  number: number;
  longitude: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string; // 合相/六分/四分/三分/对分
  angle: number;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
}

// 星座数据
const SIGNS = [
  { name: '白羊座', nameEn: 'Aries', symbol: '♈', element: '火', quality: '基本', ruler: '火星', start: 0 },
  { name: '金牛座', nameEn: 'Taurus', symbol: '♉', element: '土', quality: '固定', ruler: '金星', start: 30 },
  { name: '双子座', nameEn: 'Gemini', symbol: '♊', element: '风', quality: '变动', ruler: '水星', start: 60 },
  { name: '巨蟹座', nameEn: 'Cancer', symbol: '♋', element: '水', quality: '基本', ruler: '月亮', start: 90 },
  { name: '狮子座', nameEn: 'Leo', symbol: '♌', element: '火', quality: '固定', ruler: '太阳', start: 120 },
  { name: '处女座', nameEn: 'Virgo', symbol: '♍', element: '土', quality: '变动', ruler: '水星', start: 150 },
  { name: '天秤座', nameEn: 'Libra', symbol: '♎', element: '风', quality: '基本', ruler: '金星', start: 180 },
  { name: '天蝎座', nameEn: 'Scorpio', symbol: '♏', element: '水', quality: '固定', ruler: '冥王星', start: 210 },
  { name: '射手座', nameEn: 'Sagittarius', symbol: '♐', element: '火', quality: '变动', ruler: '木星', start: 240 },
  { name: '摩羯座', nameEn: 'Capricorn', symbol: '♑', element: '土', quality: '基本', ruler: '土星', start: 270 },
  { name: '水瓶座', nameEn: 'Aquarius', symbol: '♒', element: '风', quality: '固定', ruler: '天王星', start: 300 },
  { name: '双鱼座', nameEn: 'Pisces', symbol: '♓', element: '水', quality: '变动', ruler: '海王星', start: 330 },
];

// 获取星座
export function getSign(longitude: number) {
  const idx = Math.floor(longitude / 30) % 12;
  return SIGNS[idx];
}

// 简化的行星平均速度（度/日）
const PLANET_SPEEDS: Record<string, number> = {
  太阳: 0.9856, 月亮: 13.1764, 水星: 1.0, 金星: 0.6,
  火星: 0.524, 木星: 0.083, 土星: 0.034, 天王星: 0.012,
  海王星: 0.006, 冥王星: 0.004,
};

// 简化VSOP87计算 - 使用周期公式
// 参考日期：J2000.0 (2000年1月1日12:00 TT)
function daysSinceJ2000(date: Date): number {
  const j2000 = new Date('2000-01-01T12:00:00Z');
  return (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
}

// 计算太阳黄经（简化版，误差<0.01度）
function calcSunLongitude(T: number): number {
  // T = 儒略世纪数
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
          + 0.000289 * Math.sin(3 * M * Math.PI / 180);
  let lon = L0 + C;
  lon = lon % 360;
  if (lon < 0) lon += 360;
  return lon;
}

// 计算月亮黄经（简化版）
function calcMoonLongitude(T: number): number {
  const d = T * 36525; // 从J2000起的天数
  let lon = 218.316 + 13.176396 * d;
  // 添加主要摄动项
  const D = 297.850 + 12.190749 * d;  // 日月平距角
  const Ms = 357.529 + 0.985600 * d;  // 太阳平近点角
  const Mm = 134.963 + 13.064993 * d; // 月亮平近点角
  lon += 6.289 * Math.sin(Mm * Math.PI / 180);
  lon += 1.274 * Math.sin((2 * D - Mm) * Math.PI / 180);
  lon += 0.658 * Math.sin(2 * D * Math.PI / 180);
  lon += 0.214 * Math.sin(2 * Mm * Math.PI / 180);
  lon -= 0.186 * Math.sin(Ms * Math.PI / 180);
  lon -= 0.114 * Math.sin((2 * D - 2 * Mm) * Math.PI / 180);
  lon = lon % 360;
  if (lon < 0) lon += 360;
  return lon;
}

// 计算行星黄经（简化平均轨道）
function calcPlanetLongitude(name: string, T: number): number {
  const d = T * 36525; // 从J2000起的天数
  const basePositions: Record<string, { base: number; speed: number; var: number[] }> = {
    水星: { base: 252.251, speed: 4.092338, var: [0.2, 0.005] },
    金星: { base: 181.979, speed: 1.602130, var: [0.003] },
    火星: { base: 355.433, speed: 0.524033, var: [0.3, 0.01] },
    木星: { base: 34.351, speed: 0.083091, var: [0.02] },
    土星: { base: 50.077, speed: 0.033444, var: [0.02] },
    天王星: { base: 314.055, speed: 0.011732, var: [0.01] },
    海王星: { base: 304.349, speed: 0.005981, var: [0.005] },
    冥王星: { base: 238.929, speed: 0.003975, var: [0.005] },
  };
  const p = basePositions[name];
  if (!p) return 0;
  let lon = p.base + p.speed * d;
  // 添加小的周期变化
  if (p.var) {
    p.var.forEach((v, i) => {
      lon += v * Math.sin((d / (10 + i * 5)) * Math.PI / 180);
    });
  }
  lon = lon % 360;
  if (lon < 0) lon += 360;
  return lon;
}

// 计算恒星时（简化版）
function calcSiderealTime(date: Date, longitude: number): number {
  const d = daysSinceJ2000(date);
  // 格林尼治恒星时
  let gmst = 280.46061837 + 360.98564736629 * d;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  // 加上经度
  let lst = gmst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;
  return lst;
}

// 计算上升点（简化版）
function calcAscendant(date: Date, latitude: number, longitude: number): number {
  const lst = calcSiderealTime(date, longitude);
  const latRad = latitude * Math.PI / 180;
  const lstRad = lst * Math.PI / 180;
  // 上升点 = atan2(cos(lst), -(sin(lst) * cos(lat) + tan(obliquity) * sin(lat)))
  const obliquity = 23.4367 * Math.PI / 180; // 黄赤交角
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(latRad) + Math.tan(obliquity) * Math.sin(latRad);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  asc = asc % 360;
  if (asc < 0) asc += 360;
  return asc;
}

// 计算宫位（普拉西德制简化版）
function calcHouses(asc: number, mc: number): number[] {
  const houses: number[] = new Array(12);
  const a = ((asc % 360) + 360) % 360;
  const m = ((mc % 360) + 360) % 360;

  houses[0] = a;   // 1宫 = ASC
  houses[9] = m;   // 10宫 = MC
  houses[6] = (a + 180) % 360;  // 7宫
  houses[3] = (m + 180) % 360;  // 4宫

  // 10宫到1宫的弧长（顺时针）
  let q1 = a - m;
  if (q1 < 0) q1 += 360;
  // 1宫到4宫的弧长（顺时针）
  let q2 = (m + 180) - a;
  if (q2 < 0) q2 += 360;

  houses[10] = (m + q1 / 3) % 360;       // 11宫
  houses[11] = (m + 2 * q1 / 3) % 360;   // 12宫
  houses[4] = (a + q2 / 3) % 360;        // 5宫
  houses[5] = (a + 2 * q2 / 3) % 360;    // 6宫

  // 对宫
  houses[7] = (houses[10] + 180) % 360;  // 8宫
  houses[8] = (houses[11] + 180) % 360;  // 9宫
  houses[1] = (houses[4] + 180) % 360;   // 2宫
  houses[2] = (houses[5] + 180) % 360;   // 3宫

  return houses;
}

// 计算天顶（MC）
function calcMC(date: Date, longitude: number): number {
  const lst = calcSiderealTime(date, longitude);
  const obliquity = 23.4367 * Math.PI / 180;
  // MC = atan2(tan(lst), cos(obliquity))
  const lstRad = lst * Math.PI / 180;
  const mc = Math.atan2(Math.tan(lstRad), Math.cos(obliquity)) * 180 / Math.PI;
  return (mc % 360 + 360) % 360;
}

// 计算本命盘
export function calculateNatalChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): { planets: PlanetPosition[]; houses: HouseCusp[]; aspects: Aspect[]; ascendant: PlanetPosition; mc: number } {
  const T = daysSinceJ2000(birthDate) / 36525;

  // 计算行星位置
  const planetData = [
    { name: '太阳', nameEn: 'Sun', symbol: '☉' },
    { name: '月亮', nameEn: 'Moon', symbol: '☽' },
    { name: '水星', nameEn: 'Mercury', symbol: '☿' },
    { name: '金星', nameEn: 'Venus', symbol: '♀' },
    { name: '火星', nameEn: 'Mars', symbol: '♂' },
    { name: '木星', nameEn: 'Jupiter', symbol: '♃' },
    { name: '土星', nameEn: 'Saturn', symbol: '♄' },
    { name: '天王星', nameEn: 'Uranus', symbol: '♅' },
    { name: '海王星', nameEn: 'Neptune', symbol: '♆' },
    { name: '冥王星', nameEn: 'Pluto', symbol: '♇' },
  ];

  const planets: PlanetPosition[] = planetData.map(p => {
    let lon: number;
    if (p.name === '太阳') lon = calcSunLongitude(T);
    else if (p.name === '月亮') lon = calcMoonLongitude(T);
    else lon = calcPlanetLongitude(p.name, T);

    const sign = getSign(lon);
    const speed = PLANET_SPEEDS[p.name] || 0;

    return {
      name: p.name,
      nameEn: p.nameEn,
      symbol: p.symbol,
      longitude: lon,
      latitude: 0,
      speed,
      house: 1, // 临时，后面更新
      sign: sign.name,
      signDegree: lon - sign.start,
      retrograde: false, // 简化，不计算逆行
    };
  });

  // 计算ASC和MC
  const ascLon = calcAscendant(birthDate, latitude, longitude);
  const mcLon = calcMC(birthDate, longitude);
  const ascSign = getSign(ascLon);
  const ascPlanet: PlanetPosition = {
    name: '上升点',
    nameEn: 'Ascendant',
    symbol: 'ASC',
    longitude: ascLon,
    latitude: 0,
    speed: 0,
    house: 1,
    sign: ascSign.name,
    signDegree: ascLon - ascSign.start,
    retrograde: false,
  };

  // 计算宫位
  const houseLongitudes = calcHouses(ascLon, mcLon);
  const houses: HouseCusp[] = houseLongitudes.map((lon, i) => {
    const sign = getSign(lon);
    return {
      number: i + 1,
      longitude: lon,
      sign: sign.name,
      degree: lon - sign.start,
    };
  });

  // 更新行星所在宫位
  planets.forEach(p => {
    for (let i = 0; i < 12; i++) {
      const nextHouse = (i + 1) % 12;
      const cusp1 = houses[i].longitude;
      const cusp2 = houses[nextHouse].longitude;
      if (cusp2 > cusp1) {
        if (p.longitude >= cusp1 && p.longitude < cusp2) {
          p.house = i + 1;
          break;
        }
      } else {
        if (p.longitude >= cusp1 || p.longitude < cusp2) {
          p.house = i + 1;
          break;
        }
      }
    }
  });
  ascPlanet.house = 1;

  // 计算相位
  const aspects = calcAspects([...planets, ascPlanet]);

  return { planets, houses, aspects, ascendant: ascPlanet, mc: mcLon };
}

// 计算相位
function calcAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectDefs = [
    { name: '合相', angle: 0, orb: 8, nature: 'neutral' as const },
    { name: '六分相', angle: 60, orb: 6, nature: 'harmonious' as const },
    { name: '四分相', angle: 90, orb: 7, nature: 'challenging' as const },
    { name: '三分相', angle: 120, orb: 8, nature: 'harmonious' as const },
    { name: '对分相', angle: 180, orb: 8, nature: 'challenging' as const },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      if (p1.name === p2.name) continue;

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const asp of aspectDefs) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: asp.name,
            angle: Math.round(diff * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            nature: asp.nature,
          });
          break; // 只取最接近的相位
        }
      }
    }
  }

  return aspects.sort((a) => (a.nature === 'challenging' ? -1 : 1));
}

// 导出星座数据
export { SIGNS };
