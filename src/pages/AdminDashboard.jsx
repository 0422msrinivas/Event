import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function AdminDashboard() {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [type, setType] = useState('single')
  const [maxTeamSize, setMaxTeamSize] = useState(1)
  const [events, setEvents] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 5

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Error fetching events: ' + error.message)
    } else {
      setEvents((eventsData || []).map(e => ({ ...e, registrationsCount: 0 })))
    }
  }

  const addOrUpdateEvent = async () => {
    if (!name.trim()) {
      alert('Event name cannot be empty')
      return
    }
    if (type === 'group' && (!maxTeamSize || maxTeamSize < 2)) {
      alert('Group events must have a team size of at least 2')
      return
    }

    const data = { name, description: desc, type, max_team_size: type === 'single' ? 1 : maxTeamSize }

    if (editingId) {
      const { error } = await supabase.from('events').update(data).eq('id', editingId)
      if (error) alert('Failed to update event')
      else {
        alert('Event updated!')
        resetForm()
        fetchEvents()
      }
    } else {
      const { error } = await supabase.from('events').insert([data])
      if (error) alert('Failed to add event')
      else {
        alert('Event added!')
        resetForm()
        fetchEvents()
      }
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) alert('Failed to delete event')
    else {
      alert('Event deleted!')
      fetchEvents()
    }
  }

  const startEdit = (event) => {
    setName(event.name)
    setDesc(event.description)
    setType(event.type)
    setMaxTeamSize(event.max_team_size || 1)
    setEditingId(event.id)
  }

  const resetForm = () => {
    setName('')
    setDesc('')
    setType('single')
    setMaxTeamSize(1)
    setEditingId(null)
  }

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEvents.length / perPage)
  const paginatedEvents = filteredEvents.slice((page - 1) * perPage, page * perPage)

  const exportCSV = () => {
    const header = ['Name,Description,Type,Team Size,Registrations']
    const rows = events.map(e =>
      `"${e.name}","${e.description}","${e.type}",${e.max_team_size},${e.registrationsCount}`
    )
    const csvContent = header.concat(rows).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'events.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <input
        className="border p-2 mb-2 block w-full"
        placeholder="Search events..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
      />

      <input
        className="border p-2 mb-2 block w-full"
        placeholder="Event name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea
        className="border p-2 mb-2 block w-full"
        placeholder="Description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
      ></textarea>
      <select
        className="border p-2 mb-2 block w-full"
        value={type}
        onChange={e => {
          setType(e.target.value)
          if (e.target.value === 'single') setMaxTeamSize(1)
        }}
      >
        <option value="single">Single</option>
        <option value="group">Group</option>
      </select>

      {type === 'group' && (
        <input
          type="number"
          min="2"
          className="border p-2 mb-2 block w-full"
          placeholder="Max team size"
          value={maxTeamSize}
          onChange={e => setMaxTeamSize(parseInt(e.target.value))}
        />
      )}

      <button
        onClick={addOrUpdateEvent}
        className="bg-blue-500 text-white px-4 py-2 mb-2"
      >
        {editingId ? 'Update Event' : 'Add Event'}
      </button>
      {editingId && (
        <button
          onClick={resetForm}
          className="ml-2 bg-gray-500 text-white px-4 py-2 mb-2"
        >
          Cancel Edit
        </button>
      )}
      <button
        onClick={exportCSV}
        className="ml-2 bg-green-500 text-white px-4 py-2 mb-4"
      >
        Export to CSV
      </button>

      <h2 className="text-lg font-semibold mb-2">Events</h2>

      {paginatedEvents.length === 0 ? (
        <p className="text-gray-500">No events found</p>
      ) : (
        <ul className="space-y-2">
          {paginatedEvents.map(event => (
            <li key={event.id} className="border p-2 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-sm text-gray-600">{event.description}</div>
                  <div className="text-xs text-gray-500">Type: {event.type}</div>
                  {event.type === 'group' && (
                    <div className="text-xs text-purple-600">Max Team Size: {event.max_team_size}</div>
                  )}
                  <div className="text-xs text-green-600">Registrations: {event.registrationsCount}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(event)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
