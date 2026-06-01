import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')

  const submit = async () => {
    const url = `/api/auth/${mode}`
    try {
      const { data } = await axios.post(url, { email, password })
      onLogin(data.token)
    } catch (err) { alert(err.response?.data?.error || 'Error') }
  }

  return (
    <div>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div>
        <button onClick={submit}>{mode === 'login' ? 'Login' : 'Register'}</button>
        <button onClick={()=>setMode(m=>m==='login'?'register':'login')}>Switch</button>
      </div>
    </div>
  )
}
