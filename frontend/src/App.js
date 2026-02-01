import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [iterations, setIterations] = useState(10);
  const [factor, setFactor] = useState(5);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iterations: parseInt(iterations), growthFactor: parseFloat(factor) }),
      });
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error(err);
      alert('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Simulation Dashboard</h1>
      
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