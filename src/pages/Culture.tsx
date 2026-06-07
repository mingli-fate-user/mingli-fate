import { culturePage } from '@/data/siteData';
import ContentPage from './ContentPage';

export default function Culture() {
  return <ContentPage pages={[culturePage]} basePath="/culture" category="术数文化" />;
}
