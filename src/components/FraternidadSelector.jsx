import React from 'react';
import { useFraternidad } from '../context/FraternidadContext';

export default function FraternidadSelector({ user }) {
  const { fraternidades, selectedFraternidadId, changeFraternidad, activeFraternidad, isSuperAdmin } = useFraternidad();

  const fratName = activeFraternidad?.nombre 
    ? `${activeFraternidad.nombre} (${activeFraternidad.departamento || activeFraternidad.zona || 'Local'})`
    : (user?.fraternidadNombre || 'JUFRA Pomalca (Lambayeque)');

  // Si no es Super Admin, mostramos el distintivo elegante en pastilla oscura
  if (!isSuperAdmin) {
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '32px',
          backgroundColor: '#18130f',
          color: '#ffffff',
          padding: '0 12px',
          borderRadius: '9999px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: '0.8rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.9rem', color: '#fbbf24' }}>🌐</span>
        <span>{fratName}</span>
      </div>
    );
  }

  // Agrupar fraternidades por zona para el selector del Super Admin
  const zonasMap = {
    norte: 'Zona Norte',
    centro: 'Zona Centro',
    lima_callao_sur_medio: 'Lima, Callao y Sur Medio',
    sur_altiplano: 'Sur y Altiplano',
    otros: 'Otras Fraternidades'
  };

  const grouped = fraternidades.reduce((acc, f) => {
    const z = f.zona || 'otros';
    if (!acc[z]) acc[z] = [];
    acc[z].push(f);
    return acc;
  }, {});

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: '32px',
        backgroundColor: '#18130f',
        color: '#ffffff',
        padding: '0 12px',
        borderRadius: '9999px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.12)',
        position: 'relative',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box'
      }}
    >
      <span style={{ fontSize: '0.9rem', color: '#fbbf24' }}>🌐</span>
      <select
        value={selectedFraternidadId}
        onChange={(e) => changeFraternidad(e.target.value)}
        style={{
          background: 'transparent',
          color: '#ffffff',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          paddingRight: '14px',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
      >
        <option value="" style={{ color: '#000000' }}>
          JUFRA Pomalca (Lambayeque)
        </option>
        <option value="all-peru" style={{ color: '#000000' }}>
          🇵🇪 Todo el Perú (Consolidado Nacional)
        </option>
        {Object.entries(grouped).map(([zonaKey, items]) => (
          <optgroup key={zonaKey} label={`── ${zonasMap[zonaKey] || zonaKey} ──`} style={{ color: '#000000', fontWeight: 'bold' }}>
            {items.map((f) => (
              <option key={f.id} value={f.id} style={{ color: '#000000' }}>
                {f.nombre} ({f.departamento || f.zona})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span style={{ position: 'absolute', right: '10px', pointerEvents: 'none', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
        ▼
      </span>
    </div>
  );
}
