import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SimulationApp() {
  // SIR Parameters
  const [params, setParams] = useState({
    populationSize: 200,
    duration: 300,
    transmissionRate: 0.2,
    recoveryRate: 0.05,
    movementSpeed: 3.0
  });

  const [loading, setLoading] = useState(false);
  // frames is now just the LATEST frame for canvas
  const [latestFrame, setLatestFrame] = useState(null); 
  // stats is a history array for the chart
  const [stats, setStats] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Sanitize URL
  const RAW_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  const BACKEND_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

  const stopSimulation = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsPlaying(false);
    setLoading(false);
  };

  const runSimulation = () => {
    stopSimulation(); // Ensure previous stream is closed
    setLoading(true);
    setStats([]); // Clear chart
    
    // Construct Query Params
    const queryParams = new URLSearchParams({
      populationSize: params.populationSize,
      transmissionRate: params.transmissionRate,
      recoveryRate: params.recoveryRate,
      movementSpeed: params.movementSpeed
    }).toString();

    const targetUrl = `${BACKEND_URL}/api/simulation/stream?${queryParams}`;
    console.log("Connecting to stream:", targetUrl);

    try {
      const evtSource = new EventSource(targetUrl);
      eventSourceRef.current = evtSource;

      evtSource.onopen = () => {
        setLoading(false);
        setIsPlaying(true);
      };

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // data contains { frame, stats }
          
          setLatestFrame(data.frame);
          
          setStats(prevStats => {
            // Keep last 100 points for smooth chart
            const newStats = [...prevStats, data.stats];
            if (newStats.length > 100) return newStats.slice(newStats.length - 100);
            return newStats;
          });

        } catch (e) {
          console.error("Error parsing stream data", e);
        }
      };

      evtSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        evtSource.close();
        setLoading(false);
        setIsPlaying(false);
        // alert("Connection to simulation stream lost."); 
      };

    } catch (err) {
      console.error(err);
      alert(`Failed to start stream: ${err.message}`);
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSimulation();
  }, []);

  // Canvas Rendering (Triggered whenever latestFrame changes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !latestFrame) return;
    
    try {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear
      ctx.fillStyle = '#f0f2f5';
      ctx.fillRect(0, 0, width, height);

      // Draw Agents
      if (latestFrame.agents) {
        latestFrame.agents.forEach(agent => {
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 4, 0, 2 * Math.PI);
          
          if (agent.status === 0) ctx.fillStyle = '#3498db';
          else if (agent.status === 1) ctx.fillStyle = '#e74c3c';
          else ctx.fillStyle = '#2ecc71';
          
          ctx.fill();
        });
      }

      // Info
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`Live Step: ${latestFrame.step}`, 10, 20);
    } catch (e) {
      console.error("Canvas Drawing Error:", e);
    }

  }, [latestFrame]);

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
         <h1 style={{ textAlign: 'center' }}>Real-Time SIR Stream</h1>
         <p style={{ textAlign: 'center', fontSize: '0.8em', color: '#888' }}>Stream: {BACKEND_URL}/api/simulation/stream</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        <div style={{ height: '250px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="s" stroke="#3498db" name="Susceptible" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="i" stroke="#e74c3c" name="Infected" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="r" stroke="#2ecc71" name="Recovered" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 'fit-content'
      }}>
        <h3>Live Controls</h3>
        
        {['populationSize', 'transmissionRate', 'recoveryRate', 'movementSpeed'].map(field => (
          <div key={field} style={{ marginBottom: '15px' }}>
             <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', textTransform: 'capitalize' }}>
               {field.replace(/([A-Z])/g, ' $1').trim()}
             </label>
             <input 
               type="number" 
               step={field.includes('Rate') ? "0.05" : "1"} 
               name={field} 
               value={params[field]} 
               onChange={handleParamChange} 
               style={{ width: '100%', padding: '8px' }} 
             />
          </div>
        ))}

        {!isPlaying ? (
          <button 
            onClick={runSimulation} 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#2c3e50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '1em',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Connecting...' : 'Start Live Stream'}
          </button>
        ) : (
          <button 
            onClick={stopSimulation} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '1em',
              cursor: 'pointer'
            }}
          >
            Stop Stream
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SimulationApp />
    </ErrorBoundary>
  );
}
