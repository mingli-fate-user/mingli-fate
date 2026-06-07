import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { TRPCProvider } from '@/providers/trpc'
import './index.css'
import App from './App.tsx'

// 移除骨架屏
const skeleton = document.getElementById('skeleton-root')
if (skeleton) skeleton.remove()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TRPCProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </TRPCProvider>
  </StrictMode>,
)
