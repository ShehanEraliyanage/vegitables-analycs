import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import ToastNotification from './components/ToastNotification'
import './App.css'

function App() {
  return (
    <div className="App">
      <ToastNotification />
      <Dashboard />
    </div>
  )
}

export default App

