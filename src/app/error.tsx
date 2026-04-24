'use client'

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body style={{ padding: '2rem', fontFamily: 'monospace', background: '#1a1a1a', color: '#ff6b6b' }}>
        <h2>Error</h2>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </body>
    </html>
  )
}
