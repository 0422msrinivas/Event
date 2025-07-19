import React from 'react'

import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Home() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*')
    if (error) console.error(error)
    else setEvents(data)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      <ul>
        {events.map(event => (
          <li key={event.id} className="border p-2 mb-2">
            <h2 className="font-semibold">{event.name} ({event.type})</h2>
            <p>{event.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
