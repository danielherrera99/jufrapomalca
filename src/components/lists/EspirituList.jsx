import React, { useState } from 'react';

const TABS = [
  { key: 'oracion', label: '🙏 Oraciones' },
  { key: 'carisma', label: '🌿 Carisma' },
];

const EspirituList = ({ filteredData, espirituTab, setEspirituTab, openEditModal, handleDelete }) => {
  const items = filteredData.filter(i => i.tipo === espirituTab);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="animate-fade">
      <style>{`
        .esp-tab-btn { transition: all 0.2s ease; }
        .esp-tab-btn.active {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(109,40,217,0.25);
        }
        .esp-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          transition: all 0.22s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          position: relative;
          overflow: hidden;
        }
        .esp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }
        .esp-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #ec4899);
        }
        .esp-btn-action {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .esp-btn-edit {
          background: #f5f3ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
        }
        .esp-btn-edit:hover {
          background: #ede9fe;
          color: #6d28d9;
        }
        .esp-btn-del {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .esp-btn-del:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'white',
        padding: '6px',
        borderRadius: '12px',
        width: 'fit-content',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setEspirituTab(tab.key)}
            className={`esp-tab-btn ${espirituTab === tab.key ? 'active' : ''}`}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: espirituTab === tab.key ? undefined : 'transparent',
              color: espirituTab === tab.key ? undefined : '#64748b',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
            {espirituTab === 'oracion' ? '🕊️' : '✨'}
          </div>
          <p style={{ fontWeight: 600, color: '#334155', fontSize: '1rem', margin: 0 }}>
            No hay {espirituTab === 'oracion' ? 'oraciones' : 'carismas'} registrados
          </p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
            Usa el botón "+ Nueva Oración / Carisma" para agregar uno.
          </p>
        </div>
      ) : espirituTab === 'oracion' ? (
        /* Grid de Oraciones */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {items.map(item => (
            <div key={item._id} className="esp-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="esp-card-accent" />
              <div style={{ padding: '22px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {item.titulo}
                  </h3>
                  {item.categoria && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}>
                      {item.categoria}
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  flex: 1,
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontStyle: 'italic',
                  border: '1px solid #f1f5f9',
                  marginBottom: '16px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {item.contenido}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <button
                    onClick={() => openEditModal(item)}
                    className="esp-btn-action esp-btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="esp-btn-action esp-btn-del"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Acordeón de Carisma */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => {
            const isExpanded = expandedId === item._id;
            return (
              <div
                key={item._id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: isExpanded ? '1px solid #c084fc' : '1px solid #e2e8f0',
                  boxShadow: isExpanded ? '0 4px 14px rgba(124,58,237,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? '#faf5ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🌿</span>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.98rem' }}>
                      {item.titulo}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.categoria && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#475569',
                      }}>
                        {item.categoria}
                      </span>
                    )}
                    <span style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#64748b',
                      fontSize: '0.8rem'
                    }}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    padding: '18px 20px',
                    borderTop: '1px solid #f3e8ff',
                    background: 'white'
                  }}>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#334155',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-line',
                      marginBottom: '16px'
                    }}>
                      {item.contenido}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="esp-btn-action esp-btn-edit"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="esp-btn-action esp-btn-del"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EspirituList;
