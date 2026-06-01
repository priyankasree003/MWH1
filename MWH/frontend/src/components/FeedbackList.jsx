import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function FeedbackList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await axios.get('/api/feedback')
      setItems(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div>Loading feedback…</div>
  if (!items.length) return <div>No feedback yet.</div>

  return (
    <div className="feedback-list">
      {items.map(f => (
        <div className="feedback-item" key={f.id}>
          <div className="meta">{new Date(f.created_at).toLocaleString()} • {f.sentiment || 'unknown'}</div>
          <div className="text">{f.text}</div>
        </div>
      ))}
    </div>
  )
}
