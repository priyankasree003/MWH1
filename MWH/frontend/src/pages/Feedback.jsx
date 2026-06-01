import React, { useState } from 'react'
import axios from 'axios'
import FeedbackList from '../components/FeedbackList'

export default function Feedback({ token }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const analyze = async () => {
    try {
      const { data } = await axios.post('/api/sentiment', { text })
      setResult(data)
    } catch (err) { alert('Analysis error') }
  }

  const send = async () => {
    if (!result) return alert('Analyze first')
    setSaving(true)
    try {
      const { data } = await axios.post('/api/feedback', { token, text, sentiment: result?.sentiment, score: result?.score })
      alert('Saved: ' + data.id)
      setText('')
      setResult(null)
      // refresh list by recreating component (simple approach)
      window.dispatchEvent(new Event('feedback:refresh'))
    } catch (err) { alert('Save error') }
    setSaving(false)
  }

  return (
    <div>
      <h2>Share how you feel</h2>
      <textarea value={text} onChange={e=>setText(e.target.value)} />
      <div style={{marginTop:8}}>
        <button onClick={analyze}>Analyze Sentiment</button>
        <button onClick={send} disabled={!result || saving} style={{marginLeft:8}}>{saving? 'Saving...':'Save Feedback'}</button>
      </div>
      {result && <div style={{marginTop:8}}>
        <strong>Sentiment:</strong> {result.sentiment} <br />
        <strong>Score:</strong> {result.score}
      </div>}

      <hr />
      <h3>Recent feedback</h3>
      <FeedbackList />
    </div>
  )
}
