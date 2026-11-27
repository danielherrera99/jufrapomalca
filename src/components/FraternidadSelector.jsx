import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFraternidad, POMALCA_ID } from '../context/FraternidadContext';

export default function FraternidadSelector({ user, isSidebar = true }) {
  const { fraternidades, selectedFraternidadId, changeFraternidad, isSuperAdmin } = useFraternidad();
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef(null);

  const currentFratId = selectedFraternidadId || POMALCA_ID;
  const isAllPeru = currentFratId === 'all-peru';
  const currentFrat = isAllPeru 
    ? { nombre: 'Todo el Perú', departamento: 'Consolidado Nacional' } 
    : (fraternidades.find(f => f.id === currentFratId) || { nombre: 'JUFRA Pomalca', departamento: 'Lambayeque' });

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si no es Super Admin, tarjeta elegante y clara
  if (!isSuperAdmin) {
    return (
      <div 
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 10px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🏛️</span>
          <span>Fraternidad Local</span>
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentFrat.nombre}
        </div>
      </div>
    );
  }

  // Agrupación por zonas con JUFRA Pomalca integrada en la Zona Norte
  const zonasMap = {
    norte: 'Zona Norte',
    centro: 'Zona Centro',
    lima_callao_sur_medio: 'Lima, Callao y Sur Medio',
    sur_altiplano: 'Sur y Altiplano',
    otros: 'Otras Fraternidades'
  };

  const allFraternidadesWithPomalca = useMemo(() => {
    let list = [...fraternidades];
    const hasPomalca = list.some(f => f.id === POMALCA_ID || (f.nombre && f.nombre.toUpperCase().includes('POMALCA')));
    if (!hasPomalca) {
      list.unshift({
        id: POMALCA_ID,
        nombre: 'JUFRA Pomalca',
        departamento: 'Lambayeque',
        zona: 'norte'
      });
    } else {
      list = list.map(f => {
        if (f.id === POMALCA_ID || (f.nombre && f.nombre.toUpperCase().includes('POMALCA'))) {
          return {
            ...f,
            zona: 'norte',
            departamento: f.departamento || 'Lambayeque'
          };
        }
        return f;
      });
    }
    return list;
  }, [fraternidades]);

  const grouped = useMemo(() => {
    const res = allFraternidadesWithPomalca.reduce((acc, f) => {
      const z = f.zona || 'otros';
      if (!acc[z]) acc[z] = [];
      acc[z].push(f);
      return acc;
    }, {});

    // Asegurar que en Zona Norte, Pomalca aparezca primera
    if (res.norte) {
      res.norte.sort((a, b) => {
        const aIsPomalca = a.id === POMALCA_ID || (a.nombre && a.nombre.toUpperCase().includes('POMALCA'));
        const bIsPomalca = b.id === POMALCA_ID || (b.nombre && b.nombre.toUpperCase().includes('POMALCA'));
        if (aIsPomalca) return -1;
        if (bIsPomalca) return 1;
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
    }

    return res;
  }, [allFraternidadesWithPomalca]);

  const handleSelect = (id) => {
    changeFraternidad(id);
    setIsOpen(false);
    setFilterText('');
  };

  // Filtrado de fraternidades si el usuario busca
  const term = filterText.toLowerCase().trim();
  const filterList = (items) => {
    if (!term) return items;
    return items.filter(f => 
      f.nombre?.toLowerCase().includes(term) || 
      f.departamento?.toLowerCase().includes(term) ||
      f.zona?.toLowerCase().includes(term)
    );
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      {/* Etiqueta superior limpia (sin amarillo) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🏛️</span> Fraternidad Activa
        </span>
        <span style={{ fontSize: '0.62rem', color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
          Superadmin
        </span>
      </div>

      {/* Botón trigger claro, de alto contraste */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: '#ffffff',
          color: '#0f172a',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
      >
        <div style={{ overflow: 'hidden', paddingRight: '6px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isAllPeru ? '🇵🇪 Todo el Perú' : `📍 ${currentFrat.nombre}`}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
            {isAllPeru ? 'Consolidado Nacional' : (currentFrat.departamento || currentFrat.zona || 'Sede')}
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}>
          ▼
        </span>
      </button>

      {/* Menú desplegable claro, 100% legible sobre fondo blanco */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '260px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18), 0 4px 6px rgba(0,0,0,0.06)',
            zIndex: 9999,
            maxHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          {/* Buscador interno rápido */}
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <input 
              type="text" 
              placeholder="🔍 Buscar fraternidad..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '0.78rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Lista de opciones */}
          <div style={{ overflowY: 'auto', padding: '6px', flex: 1 }}>
            {/* 1. Principal Nacional Arriba */}
            {(!term || 'peru'.includes(term) || 'todo'.includes(term) || 'nacional'.includes(term)) && (
              <div 
                onClick={() => handleSelect('all-peru')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isAllPeru ? '#fff7ed' : 'transparent',
                  borderLeft: isAllPeru ? '3px solid #ea580c' : '3px solid transparent',
                  marginBottom: '6px',
                  transition: 'background 0.1s ease'
                }}
                onMouseEnter={(e) => { if (!isAllPeru) e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { if (!isAllPeru) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isAllPeru ? '#c2410c' : '#0f172a' }}>
                  🇵🇪 Todo el Perú
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Consolidado Nacional (Todas las fraternidades)
                </div>
              </div>
            )}

            {/* 2. Fraternidades Agrupadas por Región/Zona */}
            {Object.entries(grouped).map(([zonaKey, items]) => {
              const matchedItems = filterList(items);
              if (matchedItems.length === 0) return null;

              return (
                <div key={zonaKey} style={{ marginTop: '6px' }}>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    color: '#9a3412', 
                    background: '#fdf4ec', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '3px'
                  }}>
                    {zonasMap[zonaKey] || zonaKey}
                  </div>
                  {matchedItems.map((f) => {
                    const isSelected = currentFratId === f.id;
                    const isPomalcaItem = f.id === POMALCA_ID || (f.nombre && f.nombre.toUpperCase().includes('POMALCA'));
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleSelect(f.id)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isSelected ? '#fff7ed' : 'transparent',
                          borderLeft: isSelected ? '3px solid #ea580c' : '3px solid transparent',
                          marginBottom: '2px',
                          transition: 'background 0.1s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : (isPomalcaItem ? 600 : 500), color: isSelected ? '#c2410c' : '#1e293b' }}>
                          {isPomalcaItem ? `📍 ${f.nombre}` : f.nombre}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {f.departamento || f.zona || 'Local'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
