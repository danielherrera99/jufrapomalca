import React from 'react';

const ServiciosList = ({ filteredData, setReadItem, openEditModal, handleDelete, handleParticipar }) => {
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
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🤝</div>
        <p style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem', margin: 0 }}>
          No hay actividades de servicio programadas
        </p>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
          Haz clic en "+ Nuevo Servicio" para registrar un nuevo voluntariado o apostolado.
        </p>
      </div>
    );
  }

  let loggedUser = null;
  try {
    loggedUser = JSON.parse(localStorage.getItem('user'));
  } catch {
    loggedUser = null;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '20px'
    }}>
      <style>{`
        .servicio-card {
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
        .servicio-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .servicio-action-btn {
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
        .servicio-btn-edit {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }
        .servicio-btn-edit:hover {
          background: #ede9fe;
          color: #6d28d9;
        }
        .servicio-btn-del {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .servicio-btn-del:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>

      {filteredData.map((item) => {
        const estaInscrito = item.participantes?.some(p => p === loggedUser?._id || p._id === loggedUser?._id);
        const cupoLleno = item.cupoMaximo > 0 && (item.participantes?.length || 0) >= item.cupoMaximo;
        const fecha = new Date(item.fecha);
        const dia = isNaN(fecha.getTime()) ? '--' : fecha.getDate();
        const mes = isNaN(fecha.getTime()) ? '' : fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();

        return (
          <div key={item._id} className="servicio-card">
            {/* Header info */}
            <div style={{
              display: 'flex',
              padding: '16px 20px',
              gap: '14px',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'center'
            }}>
              {/* Date Box */}
              <div style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                padding: '8px 12px',
                borderRadius: '12px',
                textAlign: 'center',
                minWidth: '54px',
                border: '1px solid #ddd6fe',
                boxShadow: '0 2px 4px rgba(124,58,237,0.06)'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>
                  {dia}
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6d28d9', marginTop: '2px' }}>
                  {mes}
                </div>
              </div>

              {/* Title and Location */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.titulo}
                </h3>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  📍 {item.lugar || 'Sede Jufra'}
                </p>
              </div>

              {/* Delete quick button for admin */}
              {(loggedUser?.rol === 'admin' || loggedUser?.rol === 'consejo') && (
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}
                  title="Eliminar servicio"
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Image Banner if exists */}
            {item.imagen && (
              <div style={{
                width: '100%',
                height: '160px',
                overflow: 'hidden',
                background: '#f8fafc'
              }}>
                <img
                  src={item.imagen}
                  alt={item.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Description and Participants */}
            <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <p style={{
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: 1.55,
                margin: '0 0 16px 0',
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.descripcion}
              </p>

              {/* Progress & Join section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                marginTop: 'auto'
              }}>
                <div>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: cupoLleno ? '#dc2626' : '#1e293b',
                    background: cupoLleno ? '#fef2f2' : '#f8fafc',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: `1px solid ${cupoLleno ? '#fecaca' : '#e2e8f0'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    👥 {item.participantes?.length || 0} {item.cupoMaximo > 0 ? `/ ${item.cupoMaximo}` : ''} inscritos
                  </span>

                  {(loggedUser?.rol === 'admin' || loggedUser?.rol === 'consejo') && (
                    <button
                      onClick={() => setReadItem({ ...item, viewParticipants: true })}
                      style={{
                        display: 'block',
                        background: 'none',
                        border: 'none',
                        color: '#7c3aed',
                        fontWeight: 600,
                        fontSize: '0.76rem',
                        padding: 0,
                        cursor: 'pointer',
                        marginTop: '4px',
                        textDecoration: 'underline'
                      }}
                    >
                      Ver lista de inscritos
                    </button>
                  )}
                </div>

                {/* Participar CTA */}
                <button
                  onClick={() => handleParticipar(item._id)}
                  disabled={!estaInscrito && cupoLleno}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: (!estaInscrito && cupoLleno) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    background: estaInscrito
                      ? '#fff1f2'
                      : cupoLleno
                        ? '#e2e8f0'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: estaInscrito
                      ? '1px solid #fecdd3'
                      : 'none',
                    color: estaInscrito
                      ? '#e11d48'
                      : cupoLleno
                        ? '#94a3b8'
                        : 'white',
                    boxShadow: (!estaInscrito && !cupoLleno)
                      ? '0 3px 10px rgba(16,185,129,0.3)'
                      : 'none'
                  }}
                >
                  {estaInscrito ? 'Salir ✕' : (cupoLleno ? 'Cupo Lleno' : '🤝 Participar')}
                </button>
              </div>
            </div>

            {/* Footer with Edit for admin */}
            {(loggedUser?.rol === 'admin' || loggedUser?.rol === 'consejo') && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '10px 18px',
                borderTop: '1px solid #f1f5f9',
                background: '#fcfcfd'
              }}>
                <button
                  onClick={() => openEditModal(item)}
                  className="servicio-action-btn servicio-btn-edit"
                >
                  ✏️ Editar Servicio
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ServiciosList;
