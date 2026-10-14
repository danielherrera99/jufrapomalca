import React from 'react';

const getBadgeStyle = (cat = 'otro') => {
  const c = cat.toLowerCase();
  switch (c) {
    case 'franciscano':
      return { bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe', icon: '🕊️' };
    case 'mariano':
      return { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd', icon: '🌹' };
    case 'entrada':
      return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '🚶' };
    case 'animacion':
      return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '🎸' };
    case 'adoracion':
      return { bg: '#faf5ff', color: '#9333ea', border: '#f3e8ff', icon: '🙏' };
    case 'comunion':
      return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: '🍞' };
    case 'ofertorio':
      return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', icon: '🍷' };
    case 'salida':
      return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✨' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: '🎵' };
  }
};

const CantosList = ({ filteredData, setReadItem, openEditModal, handleDelete }) => {
  if (filteredData.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '16px',
        border: '1px dashed #cbd5e1',
        color: '#64748b'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎵</div>
        <p style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem', margin: 0 }}>
          No hay cantos registrados
        </p>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
          No encontramos cantos para el filtro seleccionado. Haz clic en "+ Nuevo Canto" para agregar uno.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
      gap: '20px'
    }}>
      <style>{`
        .canto-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          position: relative;
        }
        .canto-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .canto-action-btn {
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid transparent;
        }
        .canto-btn-view {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }
        .canto-btn-view:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .canto-btn-edit {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }
        .canto-btn-edit:hover {
          background: #ede9fe;
          color: #6d28d9;
        }
        .canto-btn-del {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .canto-btn-del:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>

      {filteredData.map((item) => {
        const badge = getBadgeStyle(item.categoria);
        const autorNombre = typeof item.autor === 'object' && item.autor !== null
          ? `${item.autor.nombre || ''} ${item.autor.apellido || ''}`.trim()
          : (item.autor || item.artista || 'Desconocido');

        return (
          <div key={item._id} className="canto-card">
            {/* Main Clickable Area */}
            <div
              onClick={() => setReadItem(item)}
              style={{
                padding: '20px 22px 16px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
            >
              {/* Top Meta Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {badge.icon} {item.categoria || 'Otro'}
                </span>

                {item.archivoUrl && (
                  <span style={{
                    fontSize: '0.74rem',
                    color: '#0284c7',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📎 Adjunto
                  </span>
                )}
              </div>

              {/* Title & Author */}
              <h3 style={{
                fontSize: '1.18rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: '0 0 4px 0',
                lineHeight: 1.3
              }}>
                {item.titulo}
              </h3>

              <p style={{
                fontSize: '0.84rem',
                color: '#64748b',
                fontWeight: 600,
                margin: '0 0 12px 0'
              }}>
                👤 Autor: {autorNombre}
              </p>

              {/* Lyrics Snippet */}
              <div style={{
                fontSize: '0.88rem',
                color: '#334155',
                lineHeight: 1.6,
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: '10px',
                borderLeft: '3px solid #7c3aed',
                border: '1px solid #f1f5f9',
                borderLeftWidth: '3px',
                fontFamily: 'serif',
                fontStyle: 'italic',
                maxHeight: '100px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                flex: 1
              }}>
                {item.letra || item.contenido || 'Sin letra disponible.'}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid #f1f5f9',
              background: '#fcfcfd'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReadItem(item);
                }}
                className="canto-action-btn canto-btn-view"
              >
                📄 Ver Letra
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(item);
                  }}
                  className="canto-action-btn canto-btn-edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="canto-action-btn canto-btn-del"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CantosList;
