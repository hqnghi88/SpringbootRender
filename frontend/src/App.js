import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');
  // Replace with your Render URL after deployment
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

  useEffect(() => {
    fetch(BACKEND_URL)
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => {
        console.error(err);
        setMessage('Error connecting to backend');
      });
  }, [BACKEND_URL]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1>Frontend on Netlify</h1>
        <p>Message from Spring Boot:</p>
        <code style={{ 
          display: 'block', 
          padding: '1rem', 
          backgroundColor: '#eee', 
          borderRadius: '4px' 
        }}>
          {message}
        </code>
      </div>
    </div>
  );
}

export default App;
