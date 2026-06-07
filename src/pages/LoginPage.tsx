import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function enterDashboard() {
    const userLabel = email.trim() || 'Guest'
    window.localStorage.setItem('speakpilot-user', userLabel)
    navigate('/dashboard')
  }

  return (
    <Layout compact>
      <section className="login-shell">
        <div className="login-card">
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to SpeakPilot</h1>
          <label>
            Email
            <input onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
          </label>
          <label>
            Password
            <input onChange={(event) => setPassword(event.target.value)} placeholder="Your password" type="password" value={password} />
          </label>
          <Button disabled={!email || !password} onClick={enterDashboard}>
            Log in
          </Button>
          <Button onClick={enterDashboard} variant="secondary">
            Continue as Guest
          </Button>
        </div>
      </section>
    </Layout>
  )
}
