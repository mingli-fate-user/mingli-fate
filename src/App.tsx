import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';

import Home from '@/pages/Home';
import { facePages, ziweiPages, liuyaoPages, xiaoliurenPages } from '@/data/siteData';
import ContentPage from '@/pages/ContentPage';

// Lazy load all non-home pages
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Culture = lazy(() => import('@/pages/Culture'));
const Tools = lazy(() => import('@/pages/Tools'));
const StudyZone = lazy(() => import('@/pages/StudyZone'));
const Bookshelf = lazy(() => import('@/pages/Bookshelf'));
const PersonalPage = lazy(() => import('@/pages/PersonalPage'));
const BaZiTool = lazy(() => import('@/pages/tools/BaZiTool'));
const ZiWeiTool = lazy(() => import('@/pages/tools/ZiWeiTool'));
const MeiHuaTool = lazy(() => import('@/pages/tools/MeiHuaTool'));
const LiuYaoTool = lazy(() => import('@/pages/tools/LiuYaoTool'));
const XiaoLiuRenTool = lazy(() => import('@/pages/tools/XiaoLiuRenTool'));
const QiMenTool = lazy(() => import('@/pages/tools/QiMenTool'));
const ChengGuTool = lazy(() => import('@/pages/tools/ChengGuTool'));
const JinQianGuaTool = lazy(() => import('@/pages/tools/JinQianGuaTool'));
const MianXiangTool = lazy(() => import('@/pages/tools/MianXiangTool'));
const TarotTool = lazy(() => import('@/pages/tools/TarotTool'));
const AstroTool = lazy(() => import('@/pages/tools/AstroTool'));
const TaiYiTool = lazy(() => import('@/pages/tools/TaiYiTool'));
const FengShuiDesigner = lazy(() => import('@/pages/tools/FengShuiDesigner'));
const XuanKongTool = lazy(() => import('@/pages/tools/XuanKongTool'));
const QiMenDiLiTool = lazy(() => import('@/pages/tools/QiMenDiLiTool'));
const DaLiuRenTool = lazy(() => import('@/pages/tools/DaLiuRenTool'));
const CommunityHome = lazy(() => import('@/pages/community/CommunityHome'));
const PostDetail = lazy(() => import('@/pages/community/PostDetail'));
const NewPost = lazy(() => import('@/pages/community/NewPost'));
const UserProfile = lazy(() => import('@/pages/community/UserProfile'));
const PersonalCenter = lazy(() => import('@/pages/PersonalCenter'));
const Games = lazy(() => import('@/pages/Games'));
const LifeSimTool = lazy(() => import('@/pages/tools/LifeSimTool'));
const MasterGameTool = lazy(() => import('@/pages/tools/MasterGameTool'));
const CeZiTool = lazy(() => import('@/pages/tools/CeZiTool'));
const DialecticsTool = lazy(() => import('@/pages/tools/DialecticsTool'));
import TongSheng from '@/pages/TongSheng';
const HuangJiTool = lazy(() => import('@/pages/tools/HuangJiTool'));
const JieMengTool = lazy(() => import('@/pages/tools/JieMengTool'));
const LingQiJingTool = lazy(() => import('@/pages/tools/LingQiJingTool'));
const QiZhengTool = lazy(() => import('@/pages/tools/QiZhengTool'));

function FacePages() {
  return <ContentPage pages={facePages} basePath="/face" category="面相篇" />;
}
function ZiweiPages() {
  return <ContentPage pages={ziweiPages} basePath="/ziwei" category="紫微斗数" />;
}
function LiuyaoPages() {
  return <ContentPage pages={liuyaoPages} basePath="/liuyao" category="六爻解卦" />;
}
function XiaoliurenPages() {
  return <ContentPage pages={xiaoliurenPages} basePath="/xiaoliuren" category="江氏小六壬" />;
}

// Loading fallback
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 text-sm">加载中...</p>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Face Reading - 8 pages */}
          <Route path="/face/:id" element={<FacePages />} />
          <Route path="/face" element={<Navigate to="/face/1" replace />} />

          {/* Ziwei - 8 pages */}
          <Route path="/ziwei/:id" element={<ZiweiPages />} />
          <Route path="/ziwei" element={<Navigate to="/ziwei/1" replace />} />

          {/* Liuyao - 8 pages */}
          <Route path="/liuyao/:id" element={<LiuyaoPages />} />
          <Route path="/liuyao" element={<Navigate to="/liuyao/1" replace />} />

          {/* Xiaoliuren - 8 pages */}
          <Route path="/xiaoliuren/:id" element={<XiaoliurenPages />} />
          <Route path="/xiaoliuren" element={<Navigate to="/xiaoliuren/1" replace />} />

          {/* Culture - 1 page */}
          <Route path="/culture/:id" element={<Culture />} />
          <Route path="/culture" element={<Navigate to="/culture/1" replace />} />

          {/* Study Zone */}
          <Route path="/study" element={<StudyZone />} />
          <Route path="/bookshelf" element={<Bookshelf />} />

          {/* API Key 管理 - 需要登录 */}
          <Route path="/me" element={<PersonalCenter />} />

          {/* Personal Page - 需要登录 */}
          <Route path="/me" element={<PersonalPage />} />

          {/* Tools - 列表可浏览，具体工具需登录 */}
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/bazi" element={<BaZiTool />} />
          <Route path="/tools/ziwei" element={<ZiWeiTool />} />
          <Route path="/tools/meihua" element={<MeiHuaTool />} />
          <Route path="/tools/liuyao" element={<LiuYaoTool />} />
          <Route path="/tools/xiaoliuren" element={<XiaoLiuRenTool />} />
          <Route path="/tools/qimen" element={<QiMenTool />} />
          <Route path="/tools/chenggu" element={<ChengGuTool />} />
          <Route path="/tools/jinqiangua" element={<JinQianGuaTool />} />
          <Route path="/tools/mianxiang" element={<MianXiangTool />} />
          <Route path="/tools/tarot" element={<TarotTool />} />
          <Route path="/tools/astro" element={<AstroTool />} />
          <Route path="/tools/taiyi" element={<TaiYiTool />} />
          <Route path="/tools/fengshui" element={<FengShuiDesigner />} />
          <Route path="/tools/xuankong" element={<XuanKongTool />} />
          <Route path="/tools/daliuren" element={<DaLiuRenTool />} />
          <Route path="/tools/qimendifa" element={<QiMenDiLiTool />} />
          <Route path="/tools/cezi" element={<CeZiTool />} />
          <Route path="/tools/dialectics" element={<DialecticsTool />} />
          <Route path="/tongsheng" element={<TongSheng />} />
          <Route path="/tools/huangji" element={<HuangJiTool />} />
          <Route path="/tools/jiemeng" element={<JieMengTool />} />
          <Route path="/tools/lingqijing" element={<LingQiJingTool />} />
          <Route path="/tools/qizheng" element={<QiZhengTool />} />

          {/* Community - 浏览不需要登录，发帖/管理需要 */}
          <Route path="/community" element={<CommunityHome />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="/community/new" element={<NewPost />} />
          <Route path="/community/profile" element={<UserProfile />} />

          {/* About & Contact */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Games */}
          <Route path="/games" element={<Games />} />
          <Route path="/games/lifesim" element={<LifeSimTool />} />
          <Route path="/games/master" element={<MasterGameTool />} />

          {/* Auth */}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}