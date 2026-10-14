import React, { useState } from 'react';

const TABS = [
  { key: 'oracion', label: '?? Oraciones' },
  { key: 'carisma', label: '?? Carisma' },
];

const EspirituList = ({ filteredData, espirituTab, setEspirituTab, openEditModal, handleDelete }) => {
  const items = filteredData.filter(i => i.tipo === espirituTab);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="animate-fade">
      <style>{`
        .esp-tab-btn { transition: all 0.2s ease; }
        .esp-card { transition: transform 0.18s, box-shadow 0.18s; }
        .esp-card:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 32px rgba(0,0,0,0.11) !important; }
        .esp-action-btn { transition: background 0.15s; }
        .esp-action-btn:hover { background: rgba(106,67,201,0.12) !important; }
        .esp-del-btn:hover { background: rgba(239,68,68,0.1) !important; }
        .esp-accordion-row { transition: background 0.15s; }
        .esp-accordion-row:hover { background: rgba(106,67,201,0.04) !important; }
      `}</style>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem', background: 'var(--card-bg, #fff)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--border, #e5e7eb)', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {TABS.map(tab => {
          const active = espirituTab === tab.key;
          return (
            <button key={tab.key} className="esp-tab-btn" onClick={() => setEspirituTab(tab.key)} style={{ padding: '0.5rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem', background: active ? 'linear-gradient(135deg, var(--primary), #7b4fcf)' : 'transparent', color: active ? '#fff' : 'var(--text-muted, #6b7280)', boxShadow: active ? '0 3px 10px rgba(106,67,201,0.3)' : 'none' }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #6b7280)', background: 'var(--card-bg, #fff)', borderRadius: '16px', border: '2px dashed var(--border, #e5e7eb)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{espirituTab === 'oracion' ? '??' : '??'}</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No hay contenido en esta sección todavía.</p>
        </div>
      ) : espirituTab === 'oracion' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {items.map(item => (
            <div key={item._id} className="esp-card" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderTop: '3px solid var(--primary)', borderRadius: '16px', padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.categoria && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>{item.categoria}</span>}
                  <h3 style={{ margin: 0, color: 'var(--text-color, #1a1a2e)', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>{item.titulo}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button className="esp-action-btn" onClick={() => openEditModal(item)} title="Editar" style={{ background: 'rgba(106,67,201,0.06)', border: '1px solid var(--border,#e5e7eb)', cursor: 'pointer', fontSize: '0.95rem', padding: '6px 9px', borderRadius: '8px' }}>??</button>
                  <button className="esp-del-btn" onClick={() => handleDelete(item._id)} title="Eliminar" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid #fca5a5', cursor: 'pointer', fontSize: '0.95rem', padding: '6px 9px', borderRadius: '8px', color: '#ef4444' }}>???</button>
                </div>
              </div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-color, #374151)', textAlign: 'justify', whiteSpace: 'pre-line', margin: 0 }}>{item.contenido}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '900px' }}>
          {items.map(item => {
            const open = expandedId === item._id;
            return (
              <div key={item._id} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '14px', overflow: 'hidden', boxShadow: open ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 6px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}>
                <div className="esp-accordion-row" onClick={() => setExpandedId(open ? null : item._id)} style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: open ? '3px solid var(--primary)' : '3px solid transparent', transition: 'border 0.2s' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-color, #1a1a2e)', fontSize: '1.05rem', fontWeight: 700 }}>{item.titulo}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="esp-action-btn" onClick={e => { e.stopPropagation(); openEditModal(item); }} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '6px', borderRadius: '6px' }}>??</button>
                      <button className="esp-del-btn" onClick={e => { e.stopPropagation(); handleDelete(item._id); }} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '6px', borderRadius: '6px' }}>???</button>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', display: 'inline-block' }}>?</span>
                  </div>
                </div>
                {open && (
                  <div className="animate-fade" style={{ padding: '0 1.5rem 1.4rem 1.5rem', borderTop: '1px solid var(--border, #e5e7eb)' }}>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-color, #374151)', textAlign: 'justify', whiteSpace: 'pre-line', marginTop: '1.25rem', marginBottom: 0 }}>{item.contenido}</p>
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
