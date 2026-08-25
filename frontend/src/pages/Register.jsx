import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PublicFooter from '../components/PublicFooter.jsx'
import { Header } from './Home.jsx'
import { api } from '../lib/api.js'

function Register({ onUserLogin }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')?.toString().trim()
    const email = formData.get('email')?.toString().trim()
    const phone = formData.get('phone')?.toString().trim()
    const password = formData.get('password')?.toString()

    if (!name || !email || !password) {
      setError('Please fill all fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter valid email')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const result = await api.post('/public/auth/register', { name, email, phone, password })
      onUserLogin(result.user)
      setError('')
      navigate('/')
    } catch (requestError) { setError(requestError.message) }
  }

  return (
    <div className="public-home">
    <Header />
    <section className="auth-page">
      <div className="register-panel">
        <div className="form-heading">
          <p className="eyebrow">
            Create Account
          </p>
          <h1>
            Register
          </h1>
          <p>
            Add your details once for faster enquiries across the website.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form compact-form">
          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Enter phone number" />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61C3.95 8.42 2 12 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                    <path d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-btn">
            Register
          </button>

          <p className="auth-switch">
            Already have account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
    <PublicFooter />
    </div>
  )
}

export default Register
