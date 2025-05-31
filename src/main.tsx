import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AIDataProvider from './states/products/providers/aIDataProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AIDataProvider>
      <App />
    </AIDataProvider>
  </StrictMode>,
)
