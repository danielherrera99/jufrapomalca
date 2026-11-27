import React from 'react';
import { useFraternidad } from '../context/FraternidadContext';

const NacionalCheckbox = ({ checked, onChange }) => {
  const { isSuperAdmin } = useFraternidad();

  if (!isSuperAdmin) return null;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '0.85rem 1rem',
        borderRadius: '10px',
        background: checked ? 'rgba(217, 119, 6, 0.10)' : 'rgba(139, 90, 43, 0.05)',
        border: checked ? '1.5px solid var(--secondary, #D97706)' : '1px solid var(--border, #E7E5E4)',
        transition: 'all 0.15s ease'
      }}
    >
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          cursor: 'pointer',
          margin: 0
        }}
      >
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            marginTop: '3px',
            width: '17px',
            height: '17px',
            accentColor: 'var(--secondary, #D97706)',
            cursor: 'pointer'
          }}
        />
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main, #1C1917)', display: 'block' }}>
            🌎 Publicar a nivel Nacional (Todo el Perú)
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #78716C)', display: 'block', marginTop: '2px' }}>
            Si marcas esta opción, todas las fraternidades del país podrán ver esta publicación en su panel.
          </span>
        </div>
      </label>
    </div>
  );
};

export default NacionalCheckbox;
