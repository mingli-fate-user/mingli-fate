// Service Worker - 完全禁用，只清理缓存
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.map(function(n){ return caches.delete(n); }));
  }));
});
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});
// 不拦截任何请求
