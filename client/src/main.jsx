import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add CSS variables for toast
const style = document.createElement('style');
style.textContent = `
  :root {
    --toast-bg: #ffffff;
    --toast-color: #1e293b;
  }
  .dark {
    --toast-bg: #1e293b;
    --toast-color: #f1f5f9;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
