import { getImageUrl } from './config/api';
import React, { useState } from 'react';

const SafeImage = ({ src, style, fallbackIcon }) => {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--surface), rgba(0,0,0,0.05))', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '3rem', opacity: 0.5 }}>{fallbackIcon || '🖼️'}</span>
      </div>
    );
  }
  return <img src={getImageUrl(src)} style={{ ...style, objectFit: 'cover', display: 'block' }} onError={() => setError(true)} alt="Imagen" />;
};

export default SafeImage;
