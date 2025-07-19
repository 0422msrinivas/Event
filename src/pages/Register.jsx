import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [semester, setSemester] = useState('')
    const [usn, setUsn] = useState('')
    const [section, setSection] = useState('')
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            alert(error.message)
            return
        }

        const userId = data.user?.id
        if (!userId) {
            alert("Signup succeeded, but failed to get user ID.")
            return
        }

        const { error: insertError } = await supabase.from('students').insert({
            id: userId,
            email,
            password,   // storing password as requested
            semester,
            usn,
            section
        })

        if (insertError) {
            console.error(insertError)
            alert("Signup succeeded, but failed to save student details.")
        } else {
            alert("Registration successful! Check your email for verification link.")
            navigate('/login')
        }
    }

    // validate: all fields filled + usn contains "ai"
    const isFormValid = (
        email.trim() !== '' &&
        password.trim() !== '' &&
        semester.trim() !== '' &&
        section.trim() !== '' &&
        usn.toLowerCase().includes('ai')
    )

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Register</h1>
            <form onSubmit={handleRegister} className="flex flex-col gap-2">
                <input type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="border p-2" required />
                <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="border p-2" required />
                <input type="text" placeholder="USN" value={usn}
                    onChange={(e) => setUsn(e.target.value)} className="border p-2" required />
                <input type="text" placeholder="Semester" value={semester}
                    onChange={(e) => setSemester(e.target.value)} className="border p-2" required />
                <input type="text" placeholder="Section" value={section}
                    onChange={(e) => setSection(e.target.value)} className="border p-2" required />
                <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 disabled:opacity-50"
                    disabled={!isFormValid}
                >
                    Register
                </button>
            </form>
        </div>
    )
}
