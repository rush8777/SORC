import React from 'react'
import ReactDOM from 'react-dom/client'
import EditorPage from './app/page'
import './app/globals.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <EditorPage />
  </React.StrictMode>,
)
