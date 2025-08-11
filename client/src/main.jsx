import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/theme.css'

const App = () => {
  return (
    <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '2rem' }}>
      <h1>Welcome to Arciumint</h1>
      <p>This is your starting point.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
