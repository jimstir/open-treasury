import React from 'react';
import { useDataMode } from '../contexts/DataModeContext';

const DataModeSwitch: React.FC = () => {
  const { useLiveData, toggleDataMode } = useDataMode();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginRight: '16px',
      padding: '4px 8px',
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }}>
      <span style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#1e40af',
        opacity: 1.0
      }}>
        Mock
      </span>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '32px',
        height: '16px'
      }}>
        <input
          type="checkbox"
          checked={useLiveData}
          onChange={toggleDataMode}
          style={{
            opacity: 0,
            width: 0,
            height: 0
          }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: useLiveData ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
          transition: '0.3s',
          borderRadius: '16px'
        }}>
          <span style={{
            position: 'absolute',
            content: '""',
            height: '12px',
            width: '12px',
            left: useLiveData ? '18px' : '2px',
            bottom: '2px',
            backgroundColor: useLiveData ? '#007bff' : '#666',
            transition: '0.3s',
            borderRadius: '50%'
          }} />
        </span>
      </label>
      <span style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#1e40af',
        opacity: 1.0
      }}>
        Live
      </span>
    </div>
  );
};

export default DataModeSwitch;
