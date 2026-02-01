import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [iterations, setIterations] = useState(10);
  const [factor, setFactor] = useState(5);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sanitize URL: remove trailing slash if present
  const RAW_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const BACKEND_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

  const runSimulation = async () => {
    setLoading(true);
    const targetUrl = `${BACKEND_URL}/api/simulation/run`;
    
    try {
      console.log(`Attempting to fetch: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iterations: parseInt(iterations), growthFactor: parseFloat(factor) }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${errorText.substring(0, 100)}`);
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error(err);
      alert(`Failed to fetch from:\n${targetUrl}\n\nError:\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Simulation Dashboard</h1>
      <p style={{ fontSize: '0.8em', color: '#666' }}>Backend: {BACKEND_URL}</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Iterations:
          <input 
            type="number" 
            value={iterations} 
            onChange={(e) => setIterations(e.target.value)} 
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label>
          Growth Factor:
          <input 
            type="number" 
            value={factor} 
            onChange={(e) => setFactor(e.target.value)} 
            style={{ marginLeft: '5px' }}
          />
        </label>
        <button onClick={runSimulation} disabled={loading} style={{ padding: '5px 15px', cursor: 'pointer' }}>
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      {data.length > 0 && (
        <div style={{ width: '100%', height: 400, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" label={{ value: 'Step', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;