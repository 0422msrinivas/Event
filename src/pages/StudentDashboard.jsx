import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function StudentDashboard() {
    const [events, setEvents] = useState([])
    const [studentId, setStudentId] = useState(null)
    const [allStudents, setAllStudents] = useState([])
    const [myRegistrations, setMyRegistrations] = useState([])
    const [teamMembers, setTeamMembers] = useState({}) // { eventId: [id, id, ...] }

    useEffect(() => {
        const fetchData = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const currentUserId = userData?.user?.id
            setStudentId(currentUserId)

            const { data: eventsData } = await supabase.from('events').select('*')
            setEvents(eventsData || [])

            const { data: studentsData } = await supabase.from('students').select('id, usn')
            setAllStudents(studentsData || [])

            const { data: regsData } = await supabase
                .from('registrations')
                .select('id, event_id, team_members')
                .eq('student_id', currentUserId)
            setMyRegistrations(regsData || [])
        }

        fetchData()
    }, [])

    const getRegistrationByEvent = (eventId) =>
        myRegistrations.find(r => r.event_id === eventId)

    const handleRegister = async (event) => {
        const isGroup = event.type === 'group'
        const selected = teamMembers[event.id] || []

        if (isGroup) {
            if (selected.length === 0) {
                alert('Select at least one team member')
                return
            }
            if (selected.length > event.max_team_size - 1) { // minus 1 because creator also part of team
                alert(`You can select maximum ${event.max_team_size - 1} team members`)
                return
            }
        }

        const { error } = await supabase.from('registrations').insert({
            student_id: studentId,
            event_id: event.id,
            team_members: isGroup ? selected : null
        })

        if (error) alert('Registration failed')
        else {
            alert('Registered!')
            refreshRegistrations()
        }
    }

    const handleDelete = async (registrationId) => {
        const { error } = await supabase.from('registrations').delete().eq('id', registrationId)
        if (error) alert('Delete failed')
        else {
            alert('Deleted!')
            refreshRegistrations()
        }
    }

    const handleEdit = async (registrationId, event) => {
        const updatedTeam = teamMembers[event.id] || []

        if (updatedTeam.length === 0) {
            alert('Select at least one team member')
            return
        }
        if (updatedTeam.length > event.max_team_size - 1) {
            alert(`You can select maximum ${event.max_team_size - 1} team members`)
            return
        }

        const { error } = await supabase
            .from('registrations')
            .update({ team_members: updatedTeam })
            .eq('id', registrationId)

        if (error) alert('Edit failed')
        else {
            alert('Updated!')
            refreshRegistrations()
        }
    }

    const refreshRegistrations = async () => {
        const { data } = await supabase
            .from('registrations')
            .select('id, event_id, team_members')
            .eq('student_id', studentId)
        setMyRegistrations(data || [])
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

            {events.map(event => {
                const reg = getRegistrationByEvent(event.id)
                const isGroup = event.type === 'group'
                const maxMembers = event.max_team_size - 1 // excluding the student himself

                return (
                    <div key={event.id} className="border p-4 rounded mb-4">
                        <h2 className="font-semibold text-lg">{event.name}</h2>
                        <p>{event.description}</p>
                        <p className="text-sm">Type: {event.type}</p>
                        {isGroup && (
                            <>
                                <label className="block mt-2 mb-1">Select Team Members (Max {maxMembers}):</label>
                                <select
                                    multiple
                                    className="border p-2 w-full"
                                    value={teamMembers[event.id] || []}
                                    onChange={e => {
                                        const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                                        if (selected.length <= maxMembers) {
                                            setTeamMembers(prev => ({ ...prev, [event.id]: selected }))
                                        } else {
                                            alert(`Max team members: ${maxMembers}`)
                                        }
                                    }}
                                >
                                    {allStudents
                                        .filter(s => s.id !== studentId)
                                        .map(s => (
                                            <option key={s.id} value={s.id}>{s.usn}</option>
                                        ))}
                                </select>
                                <p className="text-xs mt-1">Selected: {(teamMembers[event.id] || []).length}/{maxMembers}</p>
                            </>
                        )}

                        {reg ? (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleDelete(reg.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded"
                                >Delete</button>
                                {isGroup && (
                                    <button
                                        onClick={() => handleEdit(reg.id, event)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >Edit Team</button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => handleRegister(event)}
                                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                            >Register</button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
