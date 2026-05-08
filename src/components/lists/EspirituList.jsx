import React, { useState } from 'react';

const EspirituList = ({ filteredData, espirituTab, setEspirituTab, openEditModal, handleDelete }) => {
  const items = filteredData.filter(i => i.tipo === espirituTab);
  const [expandedId, setExpandedId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'var(--surface)', padding: '0.6rem', borderRadius: '15px', border: '1px solid var(--border)', width: 'fit-content' }}>
        <button onClick={() => setEspirituTab('oracion')} className={`btn ${espirituTab === 'oracion' ? 'btn-primary' : ''}`} style={{ background: espirituTab === 'oracion' ? '' : 'transparent', color: espirituTab === 'oracion' ? '' : 'var(--text-main)', border: 'none', borderRadius: '10px' }}>🙏 Oraciones</button>
        <button onClick={() => setEspirituTab('carisma')} className={`btn ${espirituTab === 'carisma' ? 'btn-primary' : ''}`} style={{ background: espirituTab === 'carisma' ? '' : 'transparent', color: espirituTab === 'carisma' ? '' : 'var(--text-main)', border: 'none', borderRadius: '10px' }}>🌿 Carisma</button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay contenido en esta sección todavía.</div>
      ) : espirituTab === 'oracion' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {items.map(item => (
            <div key={item._id} className="glass-card zoom-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                    {item.categoria && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.categoria}</span>}
                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.4rem' }}>{item.titulo}</h3>
                 </div>
                 <div style={{ display: 'flex', gap: '12px', paddingLeft: '1rem' }}>
                    <button onClick={() => openEditModal(item)} style={{ background: 'rgba(212, 165, 116, 0.1)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '8px', borderRadius: '8px', transition: '0.2s' }} title="Editar">✏️</button>
                    <button onClick={() => handleDelete(item._id, 'espiritualidad')} style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '8px', borderRadius: '8px', transition: '0.2s' }} title="Eliminar">🗑️</button>
                 </div>
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)', textAlign: 'justify', whiteSpace: 'pre-line', marginTop: '0.5rem' }}>{item.contenido}</p>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE CARISMA: ACORDEONES */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
          {items.map(item => (
            <div key={item._id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                onClick={() => toggleAccordion(item._id)}
                style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedId === item._id ? 'rgba(139, 90, 43, 0.03)' : 'transparent' }}
              >
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>{item.titulo}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id, 'espiritualidad'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                  </div>
                  <span style={{ fontSize: '1.2rem', transform: expandedId === item._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                </div>
              </div>
              {expandedId === item._id && (
                <div className="animate-fade" style={{ padding: '0 2rem 2rem 2rem', borderTop: '1px solid rgba(139, 90, 43, 0.05)' }}>
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)', textAlign: 'justify', whiteSpace: 'pre-line', marginTop: '1.5rem' }}>
                    {item.contenido}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EspirituList;
