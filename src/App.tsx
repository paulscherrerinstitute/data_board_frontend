import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [counter, setCounter] = useState<number | null>(null);

  // Get the backend URL from the environment variable, default to 'localhost:8000'
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    // Fetch the current counter from the backend
    fetch(`${backendUrl}/counter`)
      .then(response => response.json())
      .then(data => setCounter(data.counter))
      .catch(error => console.error('Error fetching counter:', error));
  }, [backendUrl]);

  const incrementCounter = () => {
    fetch(`${backendUrl}/increment`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => setCounter(data.counter))
      .catch(error => console.error('Error incrementing counter:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Counter from Redis: {counter}</h1>
        <button onClick={incrementCounter}>Increment Counter</button>
      </header>
    </div>
  );
}

export default App;
