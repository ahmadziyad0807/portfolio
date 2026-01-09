// Simple Map Test Component for debugging
import React, { useState } from 'react';

const MapTest: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState<string>('');

  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d208012.13056832216!2d-80.84312995!3d35.227085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88541fc4fc381a81%3A0x884650e6bf43d164!2sCharlotte%2C%20NC!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus";

  const handleMapLoad = () => {
    console.log('Map loaded successfully');
    setError('');
  };

  const handleMapError = (e: any) => {
    console.error('Map failed to load:', e);
    setError('Map failed to load. Check browser console for details.');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Map Integration Test</h2>
      <button 
        onClick={() => setShowMap(!showMap)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showMap ? 'Hide Map' : 'Show Map'}
      </button>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {showMap && (
        <div style={{
          width: '100%',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Charlotte, NC Map"
            onLoad={handleMapLoad}
            onError={handleMapError}
          />
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Debug Information:</h3>
        <p><strong>Map URL:</strong> {mapUrl}</p>
        <p><strong>Current Origin:</strong> {window.location.origin}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        
        <h4>Console Instructions:</h4>
        <ol>
          <li>Open browser Developer Tools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click "Show Map" button above</li>
          <li>Look for any error messages</li>
          <li>Check Network tab for failed requests</li>
        </ol>

        <h4>Common Issues:</h4>
        <ul>
          <li><strong>CSP Violation:</strong> Look for "Content Security Policy" errors</li>
          <li><strong>Network Error:</strong> Check if requests to google.com are blocked</li>
          <li><strong>CORS Error:</strong> Cross-origin request issues</li>
          <li><strong>Ad Blocker:</strong> Some ad blockers block Google Maps</li>
        </ul>
      </div>
    </div>
  );
};

export default MapTest;