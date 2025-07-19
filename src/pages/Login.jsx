import React from 'react'

import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      alert('Login successful!')
      navigate('/StudentDashboard')
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) alert(error.message)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} className="border p-2" required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} className="border p-2" required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
      </form>
      <button onClick={handleGoogleLogin} className="mt-2 bg-red-500 text-white px-4 py-2">Login with Google</button>
      <p className="mt-2">Don't have an account? <Link to="/register" className="text-blue-500">Register here</Link></p>
    </div>
  )
}
