import React from 'react';
import { useFraternidad } from '../context/FraternidadContext';

export default function FraternidadSelector({ user }) {
  const { fraternidades, selectedFraternidadId, changeFraternidad, activeFraternidad, isSuperAdmin } = useFraternidad();

  // Si no es Super Admin, solo mostramos su Fraternidad asignada con un distintivo
  if (!isSuperAdmin) {
    const fratName = user?.fraternidadNombre || activeFraternidad?.nombre || 'JUFRA Pomalca';
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(180, 83, 9, 0.08)',
          border: '1px solid rgba(180, 83, 9, 0.25)',
          padding: '6px 14px',
          borderRadius: '20px',
          color: '#92400e',
          fontSize: '0.88rem',
          fontWeight: 700
        }}
      >
        <span>📍</span>
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
        gap: '10px',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: '#ffffff',
        padding: '6px 14px',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.15)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1.1rem' }}>👑</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#fbbf24' }}>
          Super Admin
        </span>
      </div>

      <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.9rem' }}>🌐</span>
        <select
          value={selectedFraternidadId}
          onChange={(e) => changeFraternidad(e.target.value)}
          style={{
            background: 'transparent',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            paddingRight: '6px'
          }}
        >
          <option value="" style={{ color: '#000000' }}>
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
      </div>
    </div>
  );
}
