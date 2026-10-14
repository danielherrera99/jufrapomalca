import React from 'react';

const AnunciosList = ({ filteredData, setReadItem, getTipoIcon, SafeImage, openEditModal, handleDelete }) => {
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
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📢</div>
        <p style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem', margin: 0 }}>
          No se encontraron anuncios
        </p>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
          Intenta con otro filtro o haz clic en "+ Nuevo Anuncio" para publicar el primero.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
    }}>
      <style>{`
        .anuncio-card {
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
        .anuncio-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .anuncio-action-btn {
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
        .anuncio-btn-view {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }
        .anuncio-btn-view:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .anuncio-btn-edit {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }
        .anuncio-btn-edit:hover {
          background: #ede9fe;
          color: #6d28d9;
        }
        .anuncio-btn-del {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .anuncio-btn-del:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>

      {filteredData.map((item, index) => {
        const isUrgent = item.prioridad === 'alta' || item.tipo === 'urgente';

        return (
          <div key={item?._id || index} className="anuncio-card">
            {/* Top banner / image */}
            <div
              onClick={() => setReadItem(item)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {item.imagen ? (
                <div style={{ height: '160px', overflow: 'hidden' }}>
                  <SafeImage
                    src={item.imagen.replace('http://', 'https://')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    fallbackIcon={getTipoIcon(item.tipo)}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '140px',
                  background: isUrgent
                    ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                    {getTipoIcon(item.tipo)}
                  </span>
                </div>
              )}

              {/* Floating badges */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
              }}>
                {item.destacado && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    ⭐ Destacado
                  </span>
                )}
                {isUrgent && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: '#dc2626',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
                    letterSpacing: '0.02em',
                  }}>
                    🚨 URGENTE
                  </span>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div
              onClick={() => setReadItem(item)}
              style={{
                padding: '18px 20px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {getTipoIcon(item.tipo)} {item.tipo || 'GENERAL'}
                </span>
                {item.destinatarios && item.destinatarios !== 'todos' && (
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    background: '#faf5ff',
                    border: '1px solid #f3e8ff',
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}>
                    👥 {item.destinatarios}
                  </span>
                )}
              </div>

              <h3 style={{
                margin: '0 0 8px 0',
                color: '#1e293b',
                fontSize: '1.08rem',
                fontWeight: 700,
                lineHeight: 1.35,
              }}>
                {item.titulo}
              </h3>

              <p style={{
                fontSize: '0.86rem',
                color: '#64748b',
                lineHeight: 1.55,
                margin: 0,
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {item.contenido}
              </p>
            </div>

            {/* Card Actions Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid #f1f5f9',
              background: '#fcfcfd',
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReadItem(item);
                }}
                className="anuncio-action-btn anuncio-btn-view"
              >
                👁️ Ver Detalle
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(item);
                  }}
                  className="anuncio-action-btn anuncio-btn-edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="anuncio-action-btn anuncio-btn-del"
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

export default AnunciosList;
