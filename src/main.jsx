import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Global styles — порядок важен
import './styles/tokens.css'
import './styles/atoms.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
