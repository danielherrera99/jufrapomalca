import React from 'react';

const getIconoEvento = (tipo) => {
  switch (tipo) {
    case 'reunion': return '🤝';
    case 'misa': return '⛪';
    case 'formacion': return '📖';
    case 'retiro': return '🔥';
    case 'fraternidad': return '🎉';
    default: return '📅';
  }
};

const getBadgeStyle = (tipo) => {
  switch (tipo) {
    case 'misa':
      return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    case 'formacion':
      return { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' };
    case 'retiro':
      return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' };
    case 'fraternidad':
      return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
    case 'reunion':
    default:
      return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
  }
};

const EventosList = ({ filteredData, setReadItem, openEditModal, handleDelete }) => {
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
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
        <p style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem', margin: 0 }}>
          No hay eventos programados
        </p>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
          No encontramos eventos para el filtro seleccionado. Haz clic en "+ Nuevo Evento" para agendar uno.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px'
    }}>
      <style>{`
        .evento-card {
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
        .evento-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .evento-action-btn {
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
        .evento-btn-view {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }
        .evento-btn-view:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .evento-btn-edit {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }
        .evento-btn-edit:hover {
          background: #ede9fe;
          color: #6d28d9;
        }
        .evento-btn-del {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .evento-btn-del:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>

      {filteredData.map((item) => {
        const badge = getBadgeStyle(item.tipo);
        const icon = getIconoEvento(item.tipo);

        let formattedDate = 'Sin fecha';
        if (item.fecha) {
          try {
            formattedDate = new Date(item.fecha).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
          } catch {
            formattedDate = String(item.fecha);
          }
        }

        return (
          <div key={item._id} className="evento-card">
            {/* Top Media Banner */}
            <div
              onClick={() => setReadItem(item)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {item.imagenUrl ? (
                <div style={{ height: '160px', overflow: 'hidden' }}>
                  <img
                    src={item.imagenUrl}
                    alt={item.titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '140px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                    {icon}
                  </span>
                </div>
              )}

              {/* Floating Category and Time Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {icon} {item.tipo || 'Evento'}
                </span>

                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#dc2626',
                  background: 'white',
                  border: '1px solid #fee2e2',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🕒 {item.hora || 'Todo el día'}
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div
              onClick={() => setReadItem(item)}
              style={{
                padding: '18px 20px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
            >
              <h3 style={{
                fontSize: '1.12rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: '0 0 8px 0',
                lineHeight: 1.35
              }}>
                {item.titulo}
              </h3>

              <p style={{
                fontSize: '0.86rem',
                color: '#64748b',
                fontWeight: 600,
                margin: '0 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                📍 {item.lugar || 'Sede Jufra'}
              </p>

              {item.descripcion && (
                <p style={{
                  fontSize: '0.86rem',
                  color: '#64748b',
                  lineHeight: 1.55,
                  margin: '0 0 14px 0',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.descripcion}
                </p>
              )}

              {/* Date Box */}
              <div style={{
                fontSize: '0.82rem',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '10px',
                color: '#475569',
                fontWeight: 700,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span>📅</span>
                <span>{formattedDate}</span>
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
                className="evento-action-btn evento-btn-view"
              >
                👁️ Ver Detalle
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(item);
                  }}
                  className="evento-action-btn evento-btn-edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="evento-action-btn evento-btn-del"
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

export default EventosList;
