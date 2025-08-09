'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setError('')
    setSuccess('')
    setIsLoading(true)

    console.log('Admin login attempt...')

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    // Check credentials (hardcoded as requested)
    if (email !== 'rahmankarim2468@gmail.com' || password !== 'Admin12345') {
      setError('Invalid admin credentials')
      setIsLoading(false)
      return
    }

    try {
      // Call admin auth API
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store admin session data securely
        localStorage.setItem('adminAuth', JSON.stringify({
          email: email,
          role: 'admin',
          timestamp: Date.now(),
          sessionId: data.sessionId || Date.now().toString()
        }))

        // Set secure cookie for server-side verification
        document.cookie = `adminAuth=${data.token || 'authenticated'}; path=/; secure; samesite=strict; max-age=${30 * 60}` // 30 minutes

        setSuccess('✅ Login successful! Opening admin dashboard...')

        // Open admin dashboard in new tab with security headers
        const dashboardUrl = `${window.location.origin}/admin/dashboard`
        console.log('Opening dashboard URL:', dashboardUrl)
        
        const newTab = window.open(dashboardUrl, '_blank', 'noopener,noreferrer')
        
        if (newTab) {
          console.log('✅ Admin dashboard opened in new tab')
          
          // Clear form for security
          setEmail('')
          setPassword('')
          
          // Auto-logout setup (30 minutes)
          setTimeout(() => {
            localStorage.removeItem('adminAuth')
            document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          }, 30 * 60 * 1000) // 30 minutes
          
        } else {
          setError('❌ Popup blocked - please allow popups for admin access')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error - please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div style={{
        minHeight: 'calc(100vh - 160px)',
        background: '#F4EBD0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#355E3B',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <span style={{ fontSize: '32px' }}>🥜</span>
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#355E3B', 
              marginBottom: '8px',
              fontFamily: 'serif'
            }}>
              Admin Portal
            </h1>
            <p style={{ color: '#6b7280' }}>
              Organic Orchard Management System
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              color: '#065f46',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px' 
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#355E3B')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px' 
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#355E3B')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                required
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              style={{
                width: '100%',
                background: isLoading ? '#9ca3af' : '#355E3B',
                color: 'white',
                fontWeight: 'bold',
                padding: '14px',
                fontSize: '16px',
                borderRadius: '8px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.background = '#2A4A2F'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.background = '#355E3B'
                }
              }}
            >
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a 
              href="/" 
              style={{ 
                color: '#6b7280', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#355E3B'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#6b7280'
              }}
            >
              ← Return to Home
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
