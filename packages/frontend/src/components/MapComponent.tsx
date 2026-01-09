// MapComponent - Secure Google Maps integration with CSP compliance
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import aiTheme from '../styles/aiTheme';

interface MapComponentProps {
  location: string;
  isVisible: boolean;
  onClose: () => void;
}

const MapOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const MapContainer = styled(motion.div)`
  background: ${aiTheme.colors.background};
  border: 1px solid ${aiTheme.colors.aiCyan}40;
  border-radius: ${aiTheme.borderRadius.xl};
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  height: 600px;
  position: relative;
  box-shadow: ${aiTheme.shadows.floating};
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MapTitle = styled.h3`
  color: ${aiTheme.colors.text};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${aiTheme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${aiTheme.colors.text};
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MapContent = styled.div`
  width: 100%;
  height: calc(100% - 80px);
  border-radius: ${aiTheme.borderRadius.lg};
  overflow: hidden;
  position: relative;
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: ${aiTheme.borderRadius.lg};
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${aiTheme.colors.textSecondary};
  text-align: center;
  gap: 1rem;
`;

const RetryButton = styled.button`
  background: ${aiTheme.gradients.neural};
  border: 1px solid ${aiTheme.colors.aiCyan}40;
  border-radius: ${aiTheme.borderRadius.md};
  padding: 0.75rem 1.5rem;
  color: ${aiTheme.colors.text};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${aiTheme.gradients.quantum};
    border-color: ${aiTheme.colors.aiCyan}60;
    transform: translateY(-2px);
  }
`;

const ExternalLinkButton = styled.a`
  background: ${aiTheme.gradients.cyber};
  border: 1px solid ${aiTheme.colors.aiBlue}40;
  border-radius: ${aiTheme.borderRadius.md};
  padding: 0.75rem 1.5rem;
  color: ${aiTheme.colors.text};
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${aiTheme.gradients.quantum};
    border-color: ${aiTheme.colors.aiBlue}60;
    transform: translateY(-2px);
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${aiTheme.colors.aiCyan}20;
  border-top: 3px solid ${aiTheme.colors.aiCyan};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MapComponent: React.FC<MapComponentProps> = ({ location, isVisible, onClose }) => {
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Generate Google Maps embed URL
  const generateMapUrl = (location: string): string => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/embed/v1/place?key=&q=${encodedLocation}&zoom=12`;
  };

  // Fallback Google Maps URL without API key (uses basic embed)
  const generateFallbackMapUrl = (location: string): string => {
    if (location.toLowerCase().includes('charlotte')) {
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d208012.13056832216!2d-80.84312995!3d35.227085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88541fc4fc381a81%3A0x884650e6bf43d164!2sCharlotte%2C%20NC!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus";
    }
    // Generic fallback
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.4!2d-77.036!3d38.895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodedLocation}!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus`;
  };

  // Generate external Google Maps link
  const generateExternalMapUrl = (location: string): string => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/${encodedLocation}`;
  };

  const mapUrl = generateFallbackMapUrl(location);
  const externalMapUrl = generateExternalMapUrl(location);

  const handleMapLoad = () => {
    setIsLoading(false);
    setMapError(false);
  };

  const handleMapError = () => {
    setIsLoading(false);
    setMapError(true);
    console.warn('Map failed to load, possibly due to CSP restrictions or network issues');
  };

  const handleRetry = () => {
    setMapError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      setMapError(false);
      setRetryCount(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <MapOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleOverlayClick}
    >
      <MapContainer
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <MapHeader>
          <MapTitle>📍 {location}</MapTitle>
          <CloseButton
            onClick={onClose}
            aria-label="Close map"
            title="Close map"
          >
            ✕
          </CloseButton>
        </MapHeader>
        
        <MapContent>
          {isLoading && !mapError && (
            <ErrorMessage>
              <LoadingSpinner />
              <div>Loading map...</div>
            </ErrorMessage>
          )}
          
          {mapError ? (
            <ErrorMessage>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Map temporarily unavailable
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                This might be due to security settings or network restrictions.
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {retryCount < 2 && (
                  <RetryButton onClick={handleRetry}>
                    🔄 Try Again
                  </RetryButton>
                )}
                <ExternalLinkButton
                  href={externalMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 Open in Google Maps
                </ExternalLinkButton>
              </div>
            </ErrorMessage>
          ) : (
            <MapFrame
              key={retryCount} // Force re-render on retry
              src={mapUrl}
              title={`${location} Location Map`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleMapLoad}
              onError={handleMapError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          )}
        </MapContent>
      </MapContainer>
    </MapOverlay>
  );
};

export default MapComponent;