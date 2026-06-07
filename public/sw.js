// Service Worker - 清理所有旧缓存并停用
const CACHE_KILL = 'mingli-kill-v2';

// 安装时：清理所有旧缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.skipWaiting())
  );
});

// 激活时：立即接管所有客户端
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 不再拦截任何请求 - 透传给网络
self.addEventListener('fetch', () => {
  // pass-through - 不缓存不拦截
});
