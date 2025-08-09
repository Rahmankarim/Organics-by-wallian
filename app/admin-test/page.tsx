export default function AdminLogin() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'white', marginBottom: '16px' }}>Admin Test</h1>
        <p style={{ color: '#bfdbfe' }}>This works at different path...</p>
      </div>
    </div>
  )
}
