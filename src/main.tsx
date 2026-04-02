import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeApp } from './core/init'
import AppRoutes from './core/routes'
import './core/index.scss'

// Initialiser les services de base (intercepteurs Axios, vérification auth)
initializeApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
)
