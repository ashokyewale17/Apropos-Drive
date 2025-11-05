// Simple socket test component
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Set up socket connection for real-time updates
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
    console.log('Attempting to connect to socket server...');
    
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
      setConnectionStatus('connected');
    });
    
    // Listen for employee check-in events
    socket.on('employeeCheckIn', (data) => {
      console.log('Employee checked in (real-time):', data);
      setEvents(prev => [...prev, { type: 'check-in', data, timestamp: new Date() }]);
    });
    
    // Listen for employee check-out events
    socket.on('employeeCheckOut', (data) => {
      console.log('Employee checked out (real-time):', data);
      setEvents(prev => [...prev, { type: 'check-out', data, timestamp: new Date() }]);
    });
    
    // Add connection error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    });
    
    // Clean up socket connection
    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Socket Connection Test</h2>
      <p>Connection Status: {connectionStatus}</p>
      
      <h3>Received Events:</h3>
      <div>
        {events.map((event, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <p><strong>Type:</strong> {event.type}</p>
            <p><strong>Time:</strong> {event.timestamp.toString()}</p>
            <pre>{JSON.stringify(event.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocketTest;