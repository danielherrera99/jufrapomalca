import { getImageUrl } from '../config/api';
import React from 'react';
import api from '../config/api';
import DefaultSafeImage from './SafeImage';

const defaultGetTipoIcon = (tipo) => {
  switch (tipo) {
    case 'urgente': return '🚨';
    case 'evento': return '📅';
    case 'formacion': return '📖';
    case 'apostolado': return '🙏';
    default: return '📢';
  }
};

const defaultFormatSafeDate = (d) => {
  if (!d) return 'Sin fecha';
  try {
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
};

const ItemReadModal = ({ 
  readItem, 
  setReadItem, 
  activeTab, 
  formatSafeDate, 
  getTipoIcon, 
  SafeImage, 
  ActivityIndicator 
}) => {
  if (!readItem) return null;

  const safeGetTipoIcon = typeof getTipoIcon === 'function' ? getTipoIcon : defaultGetTipoIcon;
  const safeFormatDate = typeof formatSafeDate === 'function' ? formatSafeDate : defaultFormatSafeDate;
  const SafeImg = SafeImage || DefaultSafeImage;

  return (
    <div className="modal-overlay" onClick={() => setReadItem(null)}>
      <div 
        className="modal-content animate-fade" 
        style={{ 
          maxWidth: activeTab === 'Actas' ? '800px' : (activeTab === 'Eventos' ? '680px' : '600px'), 
          cursor: 'default', 
          padding: activeTab === 'Actas' ? '2.5rem' : '0', 
          overflow: 'hidden', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: 'white',
          border: '1px solid #e2e8f0'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {activeTab === 'Actas' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>📝</span>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.8rem' }}>{readItem.titulo || 'Acta sin título'}</h2>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Acta de Reunión de {(readItem.tipoReunion || 'General').toUpperCase()} | {safeFormatDate(readItem.fecha, 'dd MMMM yyyy')}
                  </span>
                </div>
              </div>
              <button className="btn" style={{ background: '#ECEFF1', color: 'var(--text-main)', padding: '0.5rem 1rem' }} onClick={() => window.print()}>🖨️ Imprimir</button>
            </div>
            
            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-line', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)', fontFamily: 'serif' }}>
                 {readItem.contenido || 'Sin contenido redactado.'}
              </div>

              {readItem.acuerdos && readItem.acuerdos.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>✅ Acuerdos Tomados</h3>
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    {readItem.acuerdos.map((acuerdo, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', color: acuerdo.completado ? '#4CAF50' : 'var(--text-main)', textDecoration: acuerdo.completado ? 'line-through' : 'none' }}>
                        {acuerdo.descripcion} 
                        {acuerdo.responsable && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '10px' }}>(Resp: {acuerdo.responsable.nombre})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
               <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setReadItem(null)}>Cerrar Acta</button>
            </div>
          </>
        ) : activeTab === 'Eventos' ? (
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 16px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              position: 'relative'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.25)'
                  }}>
                    📅 DETALLE DEL EVENTO
                  </span>
                  {readItem.tipo && (
                    <span style={{
                      fontSize: '0.75rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {readItem.tipo}
                    </span>
                  )}
                </div>

                <h2 style={{
                  margin: '0 0 12px 0',
                  color: '#1e293b',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em'
                }}>
                  {readItem.titulo}
                </h2>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#ef4444',
                    fontWeight: 700,
                    background: '#fef2f2',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #fee2e2'
                  }}>
                    🕒 {readItem.hora || 'Todo el día'}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    fontWeight: 600,
                    background: '#f8fafc',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    📍 {readItem.lugar || 'Sede Jufra'}
                  </span>
                  {readItem.fecha && (
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#7c3aed',
                      fontWeight: 600,
                      background: '#f5f3ff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #ddd6fe'
                    }}>
                      📅 {safeFormatDate(readItem.fecha)}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={() => setReadItem(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', flex: 1 }}>
              {readItem.imagenUrl && (
                <div style={{
                  width: '100%',
                  height: '240px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0'
                }}>
                  <img
                    src={readItem.imagenUrl}
                    alt={readItem.titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  margin: '0 0 10px 0',
                  color: '#7c3aed',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ℹ️ Acerca de este evento
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#334155',
                  lineHeight: '1.65',
                  whiteSpace: 'pre-line',
                  margin: 0
                }}>
                  {readItem.descripcion || 'Sin descripción detallada.'}
                </p>
              </div>

              {readItem.ubicacion && readItem.ubicacion.lat && (
                <div style={{
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#6d28d9', fontSize: '0.96rem', fontWeight: 700 }}>
                      📍 Ubicación en Mapa
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>
                      Coordenadas registradas para navegación
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${readItem.ubicacion.lat},${readItem.ubicacion.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(109,40,217,0.25)'
                    }}
                  >
                    🗺️ Abrir en Google Maps
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 28px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#fcfcfd'
            }}>
              <button
                onClick={() => setReadItem(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : activeTab === 'Formacion' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.8rem', background: '#673AB7', color: 'white', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>FORMACIÓN</span>
                <h2 style={{ margin: '0.5rem 0 0 0', color: 'var(--text-main)', fontSize: '2rem' }}>{readItem.titulo}</h2>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)' }}>Módulo redactado por: <b>{typeof readItem.autor === 'object' && readItem.autor !== null ? (readItem.autor.nombre + ' ' + readItem.autor.apellido) : 'Sistema / Admin'}</b></p>
              </div>
              <button className="btn" style={{ background: '#ECEFF1', color: 'var(--text-main)' }} onClick={() => window.print()}>🖨️ Imprimir</button>
            </div>
            
            <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, background: 'var(--surface)', borderRadius: '12px', fontFamily: 'serif', whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: '2.0', border: '1px solid var(--border)' }}>
               {readItem.contenido}
            </div>

            {readItem.archivoUrl && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn zoom-hover" style={{ background: '#673AB7', padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(103,58,183,0.4)', border: 'none', cursor: 'pointer' }} onClick={() => window.open(readItem.archivoUrl, '_blank')}>
                  📎 Abrir Documento Adjunto ({readItem.archivoNombre || 'Descargar'})
                </button>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
               {(readItem.etiquetas || []).map((etq, i) => (
                 <span key={i} style={{ background: '#ECEFF1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>#{etq}</span>
               ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
               <button className="btn btn-primary" style={{ width: 'auto', background: '#673AB7', borderColor: '#673AB7' }} onClick={() => setReadItem(null)}>Cerrar Tema</button>
            </div>
          </>
        ) : activeTab === 'Cantos' ? (
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{
              padding: '24px 28px 16px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    🎵 {(readItem.categoria || 'Otro').toUpperCase()}
                  </span>
                </div>
                <h2 style={{
                  margin: '0 0 4px 0',
                  color: '#1e293b',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  lineHeight: 1.25
                }}>
                  {readItem.titulo}
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                  Autor: <b>{typeof readItem.autor === 'object' && readItem.autor !== null ? (`${readItem.autor.nombre || ''} ${readItem.autor.apellido || ''}`).trim() : (readItem.autor || readItem.artista || 'Desconocido')}</b>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={() => setReadItem(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lyrics Content */}
            <div style={{ padding: '24px 28px', flex: 1 }}>
              <div style={{
                padding: '24px',
                background: '#fafaf9',
                borderRadius: '14px',
                fontFamily: 'serif',
                whiteSpace: 'pre-wrap',
                fontSize: '1.08rem',
                lineHeight: '2.1',
                border: '1px solid #e7e5e4',
                color: '#292524',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {readItem.letra || readItem.contenido || 'Sin letra registrada.'}
              </div>

              {readItem.archivoUrl && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  borderRadius: '14px',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>📎</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#6d28d9', fontSize: '0.92rem' }}>
                        Archivo de Audio / Acordes
                      </p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        {readItem.archivoNombre || 'Descargar material adjunto'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={readItem.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(109,40,217,0.25)'
                    }}
                  >
                    📥 Abrir / Descargar
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 28px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#fcfcfd'
            }}>
              <button
                onClick={() => setReadItem(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Cancionero
              </button>
            </div>
          </div>
        ) : activeTab === 'Documentos' ? (
          <>
            <div style={{ padding: '2rem', borderBottom: '2px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>BIBLIOTECA JUFRA</span>
              <h2 style={{ margin: '0.5rem 0 0', color: 'var(--text-main)', fontSize: '2rem' }}>{readItem.titulo}</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{readItem.descripcion || 'Sin descripción adicional.'}</p>
            </div>
            
            <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.8 }}>📂</div>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '2rem', maxWidth: '400px' }}>
                Este documento está listo para ser revisado o descargado para su uso en la fraternidad.
              </p>
              
              {readItem.archivoUrl && (
                <button 
                  className="btn zoom-hover" 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary)', color: 'white', padding: '1.2rem 2.5rem', fontSize: '1.2rem', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(139, 90, 43, 0.3)' }}
                  onClick={() => window.open(api.defaults.baseURL.replace('/api', '') + readItem.archivoUrl, '_blank')}
                >
                  📥 Descargar Documento
                </button>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
               <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setReadItem(null)}>Cerrar Biblioteca</button>
            </div>
          </>
        ) : activeTab === 'Galeria' ? (
          <>
            <div style={{ padding: '0', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', position: 'relative' }}>
              {readItem.tipoArchivo === 'video' ? (
                <video src={getImageUrl(readItem.archivoUrl)} controls autoPlay style={{ maxWidth: '100%', maxHeight: '70vh' }} />
              ) : (
                <img src={getImageUrl(readItem.archivoUrl)} alt={readItem.titulo} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
              )}
              <button 
                onClick={() => setReadItem(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1.5rem 2rem', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                 <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>{readItem.titulo}</h2>
                 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📅 {safeFormatDate(readItem.fecha)}</span>
              </div>
              {readItem.descripcion && (
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.5' }}>{readItem.descripcion}</p>
              )}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                 <a 
                  href={readItem.archivoUrl} 
                  download={readItem.titulo || 'archivo_jufra'} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn zoom-hover" 
                  style={{ padding: '0.6rem 1.2rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold' }}
                 >
                   📥 Descargar Archivo
                 </a>
                 <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setReadItem(null)}>Cerrar</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {readItem.imagen ? (
              <SafeImg src={readItem.imagen.replace('http://', 'https://')} style={{ width: '100%', minHeight: '220px', maxHeight: '220px' }} fallbackIcon="🖼️" />
            ) : (
               <div style={{ width: '100%', minHeight: '80px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}></div>
            )}
            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', background: readItem.prioridad === 'alta' ? '#F44336' : 'rgba(0,0,0,0.05)', color: readItem.prioridad === 'alta' ? 'white' : 'var(--text-main)', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                  {safeGetTipoIcon(readItem.tipo)} {readItem.tipo ? readItem.tipo.toUpperCase() : 'GENERAL'}
                </span>
                {readItem.destacado && <span style={{ fontSize: '1.2rem', color: '#ffb300', fontWeight: 'bold' }}>⭐ Destacado</span>}
              </div>
              
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1.2 }}>{readItem.titulo}</h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                 <span>De: <b>{readItem.autor ? `${readItem.autor.nombre}` : 'Administrador JUFRA'}</b></span>
                 <span>👁️ {readItem.vistas || 0} vistas</span>
              </div>
              
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line', maxHeight: '35vh', overflowY: 'auto', paddingRight: '1rem' }}>
                {readItem.contenido}
              </p>

              {readItem.ubicacion && readItem.ubicacion.lat && readItem.ubicacion.lng && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📍 Mapa de Ubicación</h4>
                  <iframe
                    width="100%"
                    height="200"
                    style={{ border: '1px solid var(--border)', borderRadius: '8px' }}
                    src={`https://maps.google.com/maps?q=${readItem.ubicacion.lat},${readItem.ubicacion.lng}&z=15&output=embed`}
                  ></iframe>
                </div>
              )}
              
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                 <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setReadItem(null)}>Entendido</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemReadModal;
