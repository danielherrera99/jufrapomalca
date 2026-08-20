import { getImageUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const MensajesAdminView = ({ ActivityIndicator, formatSafeDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readItem, setReadItem] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mensajes/admin/todas');
      setData(response.data.conversaciones || (Array.isArray(response.data) ? response.data : []));
    } catch (err) {
      console.error('Error fetching admin messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openChatAdmin = async (conv) => {
    setReadItem({ ...conv, type: 'chat' });
    setChatLoading(true);
    try {
      const response = await api.get(`/mensajes/admin/chat/${conv.usuario1._id}/${conv.usuario2._id}`);
      if (response.data.success) {
        setChatMessages(response.data.mensajes);
      }
    } catch (error) {
       console.error("Error al cargar chat", error);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="animate-fade" style={{ textAlign: 'center', padding: '3rem' }}><ActivityIndicator /> Cargando conversaciones...</div>;
  if (!data || data.length === 0) return <div className="glass-card animate-fade" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se han iniciado conversaciones en la plataforma todavía. 💬</div>;

  return (
    <div className="animate-fade">
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>🔍 Monitoreo administrativo de conversaciones entre hermanos.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
        {data.map((conv, idx) => (
          <div 
            key={idx} 
            className="glass-card zoom-hover" 
            style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderLeft: '4px solid var(--secondary)' }}
            onClick={() => openChatAdmin(conv)}
          >
            <div style={{ display: 'flex', position: 'relative', width: '80px', height: '50px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', position: 'absolute', left: 0, zIndex: 2, border: '2px solid white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {conv.usuario1?.foto ? <img src={getImageUrl(conv.usuario1.foto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User 1" /> : <span style={{ color: 'white', fontWeight: 'bold' }}>{conv.usuario1?.nombre?.charAt(0)}</span>}
               </div>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', position: 'absolute', right: 0, zIndex: 1, border: '2px solid white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {conv.usuario2?.foto ? <img src={getImageUrl(conv.usuario2.foto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User 2" /> : <span style={{ color: 'white', fontWeight: 'bold' }}>{conv.usuario2?.nombre?.charAt(0)}</span>}
               </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
               <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', gap: '5px' }}>
                  <b>{conv.usuario1?.nombre}</b> y <b>{conv.usuario2?.nombre}</b>
               </h3>
               <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  🗨️ {conv.ultimoMensaje?.contenido}
               </p>
            </div>
            <div style={{ textAlign: 'right', minWidth: '80px' }}>
               <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{conv.count} msgs</p>
               <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatSafeDate(conv.ultimoMensaje?.createdAt, 'HH:mm')}</p>
            </div>
          </div>
        ))}
      </div>

      {readItem && readItem.type === 'chat' && (
        <div className="modal-overlay" onClick={() => { setReadItem(null); setChatMessages([]); }}>
          <div 
            className="modal-content animate-fade" 
            style={{ maxWidth: '500px', cursor: 'default', padding: '0', overflow: 'hidden', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
               <div style={{ background: 'var(--primary)', color: 'white', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '1.5rem' }}>💬</div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Chat entre {readItem.usuario1?.nombre} y {readItem.usuario2?.nombre}</h2>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Modo Supervisión</span>
                  </div>
                  <button onClick={() => { setReadItem(null); setChatMessages([]); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
               </div>

               <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {chatLoading ? <div style={{ textAlign: 'center', marginTop: '2rem' }}><ActivityIndicator /></div> : (
                    chatMessages.map(msg => {
                      const isFromUser1 = msg.remitente?._id === readItem.usuario1?._id;
                      return (
                        <div key={msg._id} style={{ alignSelf: isFromUser1 ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                           <p style={{ margin: '0 0 4px 6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{msg.remitente?.nombre}</p>
                           <div style={{ 
                              background: isFromUser1 ? 'white' : 'var(--secondary)', 
                              color: isFromUser1 ? 'var(--text-main)' : 'white', 
                              padding: '0.8rem 1rem', 
                              borderRadius: '15px', 
                              borderTopLeftRadius: isFromUser1 ? '0' : '15px',
                              borderTopRightRadius: isFromUser1 ? '15px' : '0',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                           }}>
                              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.4 }}>{msg.contenido}</p>
                              <p style={{ margin: '4px 0 0', fontSize: '0.65rem', textAlign: 'right', opacity: 0.7 }}>{formatSafeDate(msg.createdAt, 'HH:mm')}</p>
                           </div>
                        </div>
                      );
                    })
                  )}
               </div>
               <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>⚠️ Los administradores no pueden intervenir en chats privados por seguridad.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MensajesAdminView;
