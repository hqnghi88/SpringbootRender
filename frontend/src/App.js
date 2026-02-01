import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  // SIR Parameters
  const [params, setParams] = useState({
    populationSize: 200,
    duration: 300,
    transmissionRate: 0.2,
    recoveryRate: 0.05,
    movementSpeed: 3.0
  });

  const [loading, setLoading] = useState(false);
  const [frames, setFrames] = useState([]);
  const [stats, setStats] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Sanitize URL
  const RAW_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const BACKEND_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

  const runSimulation = async () => {
    setLoading(true);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    const targetUrl = `${BACKEND_URL}/api/simulation/run`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setFrames(result.frames);
      setStats(result.aggregateStats);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      alert(`Simulation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFrameIndex(prev => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 50); // 20 FPS
      return () => clearInterval(interval);
    }
  }, [isPlaying, frames]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, width, height);

    // Get current agents
    const agents = frames[currentFrameIndex].agents;

    // Draw Agents
    agents.forEach(agent => {
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, 4, 0, 2 * Math.PI);
      
      // Color Logic
      if (agent.status === 0) ctx.fillStyle = '#3498db'; // Susceptible (Blue)
      else if (agent.status === 1) ctx.fillStyle = '#e74c3c'; // Infected (Red)
      else ctx.fillStyle = '#2ecc71'; // Recovered (Green)
      
      ctx.fill();
    });

    // Draw Info Overlay
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Time Step: ${frames[currentFrameIndex].step}`, 10, 20);

  }, [currentFrameIndex, frames]);

  const handleParamChange = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: '20px'
    }}>
      <div style={{ gridColumn: '1 / -1' }}>
         <h1 style={{ textAlign: 'center' }}>SIR Epidemic Simulator</h1>
      </div>

      {/* Left Column: Visuals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Canvas Area */}
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: '#f0f2f5',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={500} 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Stats Chart */}
        <div style={{ height: '250px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="s" stroke="#3498db" name="Susceptible" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="i" stroke="#e74c3c" name="Infected" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="r" stroke="#2ecc71" name="Recovered" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Column: Controls */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 'fit-content'
      }}>
        <h3>Controls</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Population Size</label>
          <input type="number" name="populationSize" value={params.populationSize} onChange={handleParamChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Infection Rate (0-1)</label>
          <input type="number" step="0.05" name="transmissionRate" value={params.transmissionRate} onChange={handleParamChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Recovery Rate (0-1)</label>
          <input type="number" step="0.05" name="recoveryRate" value={params.recoveryRate} onChange={handleParamChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Duration (Steps)</label>
          <input type="number" name="duration" value={params.duration} onChange={handleParamChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <button 
          onClick={runSimulation} 
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#95a5a6' : '#2c3e50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '1em',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {isPlaying ? 
            <button onClick={() => setIsPlaying(false)} style={{ marginRight: '10px' }}>Pause</button> : 
            <button onClick={() => setIsPlaying(true)} disabled={frames.length === 0} style={{ marginRight: '10px' }}>Play</button>
          }
           <button onClick={() => setCurrentFrameIndex(0)} disabled={frames.length === 0}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
