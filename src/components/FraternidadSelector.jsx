import React from 'react';
import { useFraternidad } from '../context/FraternidadContext';

export default function FraternidadSelector({ user, isSidebar = true }) {
  const { fraternidades, selectedFraternidadId, changeFraternidad, activeFraternidad, isSuperAdmin } = useFraternidad();
  const POMALCA_ID = '00000000-6a0f-b53a-d327-e42a6db2faf7';

  const currentFratId = selectedFraternidadId || POMALCA_ID;
  const currentFrat = fraternidades.find(f => f.id === currentFratId);
  const fratName = currentFrat?.nombre 
    ? `${currentFrat.nombre} (${currentFrat.departamento || currentFrat.zona || 'Local'})`
    : (user?.fraternidadNombre || 'JUFRA Pomalca (Lambayeque)');

  // Si no es Super Admin, mostramos la tarjeta informativa en la barra lateral
  if (!isSuperAdmin) {
    return (
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '10px',
          padding: '8px 12px',
          color: '#ffffff',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fbbf24', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🏛️</span>
          <span>Fraternidad Local</span>
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fef3c7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fratName}
        </div>
      </div>
    );
  }

  // Agrupar fraternidades por zona para el selector del Super Admin (excluyendo Pomalca para evitar duplicado)
  const zonasMap = {
    norte: 'Zona Norte',
    centro: 'Zona Centro',
    lima_callao_sur_medio: 'Lima, Callao y Sur Medio',
    sur_altiplano: 'Sur y Altiplano',
    otros: 'Otras Fraternidades'
  };

  const grouped = fraternidades.reduce((acc, f) => {
    // Excluir Pomalca de los grupos ya que tiene opción destacada fija arriba
    if (f.id === POMALCA_ID || (f.nombre && f.nombre.toUpperCase().includes('POMALCA'))) {
      return acc;
    }
    const z = f.zona || 'otros';
    if (!acc[z]) acc[z] = [];
    acc[z].push(f);
    return acc;
  }, {});

  return (
    <div 
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        padding: '8px 10px',
        color: '#ffffff',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🏛️</span> Fraternidad Activa
        </span>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
          Nacional
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <select
          value={currentFratId}
          onChange={(e) => changeFraternidad(e.target.value)}
          style={{
            width: '100%',
            background: '#231b15',
            color: '#fef3c7',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            padding: '7px 24px 7px 8px',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box'
          }}
        >
          <option value={POMALCA_ID} style={{ color: '#000000', fontWeight: 'bold' }}>
            📍 JUFRA Pomalca (Lambayeque)
          </option>
          <option value="all-peru" style={{ color: '#000000', fontWeight: 'bold' }}>
            🇵🇪 Todo el Perú (Consolidado Nacional)
          </option>
          {Object.entries(grouped).map(([zonaKey, items]) => (
            <optgroup key={zonaKey} label={`── ${zonasMap[zonaKey] || zonaKey} ──`} style={{ color: '#000000', fontWeight: 'bold' }}>
              {items.map((f) => (
                <option key={f.id} value={f.id} style={{ color: '#000000', fontWeight: 'normal' }}>
                  {f.nombre} ({f.departamento || f.zona || 'Local'})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.65rem', color: '#fbbf24' }}>
          ▼
        </span>
      </div>
    </div>
  );
}
