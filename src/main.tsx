// 强制注销所有旧Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    regs.forEach(function(r) { r.unregister(); });
  });
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(n) { caches.delete(n); });
    });
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// 移除骨架屏
const skeleton = document.getElementById('skeleton-root')
if (skeleton) skeleton.remove()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
