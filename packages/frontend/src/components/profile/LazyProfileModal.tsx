// Lazy-loaded ProfileModal wrapper for code splitting optimization
import React, { Suspense } from 'react';
import { ProfileModalProps } from '../../types/profile';
import { LazyProfileModal } from '../../utils/codeSplitting';

// Loading fallback component for modal
const ModalLoadingFallback: React.FC = () => {
  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }
  }, React.createElement('div', {
    style: {
      background: 'white',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '400px',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    }
  }, [
    React.createElement('div', {
      key: 'loading-content',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }
    }, [
      React.createElement('div', {
        key: 'spinner',
        style: {
          width: '24px',
          height: '24px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '0.75rem'
        }
      }),
      React.createElement('span', {
        key: 'text',
        style: { color: '#374151', fontWeight: '500' }
      }, 'Loading Profile Details')
    ]),
    React.createElement('div', {
      key: 'message',
      style: { fontSize: '0.875rem', color: '#6b7280' }
    }, 'Please wait while we load your detailed information...'),
    React.createElement('style', {
      key: 'styles'
    }, `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `)
  ]));
};

// Wrapper component that handles lazy loading
const LazyProfileModalWrapper: React.FC<ProfileModalProps> = (props) => {
  return React.createElement(Suspense, { fallback: React.createElement(ModalLoadingFallback) },
    React.createElement(LazyProfileModal.Component, props)
  );
};

export default LazyProfileModalWrapper;
export { LazyProfileModal };