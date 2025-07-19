import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        // Fetch the admin with this username
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .single()

        if (error) {
            alert('Error fetching admin: ' + error.message)
            return
        }

        if (!data) {
            alert('Admin not found!')
            return
        }

        // For demo: directly compare passwords
        if (data.password === password) {
            alert('Admin login successful!')
            navigate('/admin') // go to admin dashboard
        } else {
            alert('Incorrect password')
        }
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Admin Login</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="border p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login as Admin</button>
            </form>
        </div>
    )
}
