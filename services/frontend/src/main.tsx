import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { GrowthBookProvider } from '@growthbook/growthbook-react'
import { growthbook } from './lib/growthbook'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GrowthBookProvider growthbook={growthbook}>
      <App />
      <Toaster />
    </GrowthBookProvider>
  </StrictMode>
)
