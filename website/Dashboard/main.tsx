import React from 'react'
import ReactDOM from 'react-dom/client'
import DashboardPage from './app/page'
import './styles.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <DashboardPage />
  </React.StrictMode>,
)
