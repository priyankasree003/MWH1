import React, { useState, useEffect } from 'react'
import Feedback from './pages/Feedback'
import Login from './pages/Login'
import DarkToggle from './components/DarkToggle'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  return (
    <div className="app">
      <header>
        <h1>Mental Health & Wellness</h1>
        <DarkToggle />
      </header>
      <main>
        {!token ? <Login onLogin={(t) => { setToken(t); localStorage.setItem('token', t); }} /> : <Feedback token={token} />}
      </main>
    </div>
  )
}
