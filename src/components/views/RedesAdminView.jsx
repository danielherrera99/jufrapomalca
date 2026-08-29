import { getImageUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const RedesAdminView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [postsModal, setPostsModal] = useState({ isOpen: false, plataforma: null, data: [], loading: false });

  const formatSafeDate = (dateString, formatStr) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const openPostsModal = async (plataforma) => {
    setPostsModal({ isOpen: true, plataforma, data: [], loading: true });
    try {
      const res = await api.get(`/metricas-sociales/publicaciones/${plataforma}`);
      if (res.data.success) {
        setPostsModal({ isOpen: true, plataforma, data: res.data.data, loading: false });
      } else {
        setPostsModal(prev => ({ ...prev, loading: false }));
      }
    } catch (e) {
      console.error(e);
      setPostsModal(prev => ({ ...prev, loading: false }));
    }
  };
  
  const [formData, setFormData] = useState({
    red_social: 'facebook',
    author_name: '',
    author_icon: '',
    author_icon_file: null,
    date_text: '',
    content: '',
    image_url: '',
    imagen_file: null,
    likes: '',
    comments: '',
    link: ''
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const [postsRes, metricasRes] = await Promise.all([
        api.get('/redes'),
        api.get('/metricas-sociales').catch(() => ({ data: { data: {} } }))
      ]);
      setPosts(postsRes.data.posts || []);
      setMetricas(metricasRes?.data?.data || {});
    } catch (err) {
      console.error('Error fetching redes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        red_social: post.red_social || 'facebook',
        author_name: post.author_name || '',
        author_icon: post.author_icon || '',
        author_icon_file: null,
        date_text: post.date_text || '',
        content: post.content || '',
        image_url: post.image_url || '',
        imagen_file: null,
        likes: post.likes || '',
        comments: post.comments || '',
        link: post.link || ''
      });
    } else {
      setEditingPost(null);
      setFormData({
        red_social: 'facebook',
        author_name: '',
        author_icon: '',
        author_icon_file: null,
        date_text: '',
        content: '',
        image_url: '',
        imagen_file: null,
        likes: '',
        comments: '',
        link: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (editingPost) {
        await api.put(`/redes/${editingPost.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/redes', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert('Error guardando la publicación: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta publicación del carrusel?')) {
      try {
        await api.delete(`/redes/${id}`);
        fetchPosts();
      } catch (err) {
        alert('Error eliminando la publicación');
      }
    }
  };

  const handleToggleScrapedActivo = async (post, plataforma) => {
    try {
      const newState = post.activo === false ? 'true' : 'false';
      await api.put(`/metricas-sociales/publicaciones/${post.post_id}`, { activo: newState });
      // Update local state without closing modal
      setPostsModal(prev => ({
        ...prev,
        data: prev.data.map(p => p.post_id === post.post_id ? { ...p, activo: newState === 'true' } : p)
      }));
    } catch (err) {
      alert('Error cambiando el estado: ' + err.message);
    }
  };

  const handleToggleScrapedMostrarTodos = async (post, plataforma) => {
    try {
      const newState = post.mostrar_en_todos === true ? 'false' : 'true';
      await api.put(`/metricas-sociales/publicaciones/${post.post_id}`, { mostrar_en_todos: newState });
      // Update local state without closing modal
      setPostsModal(prev => ({
        ...prev,
        data: prev.data.map(p => p.post_id === post.post_id ? { ...p, mostrar_en_todos: newState === 'true' } : p)
      }));
    } catch (err) {
      alert('Error cambiando el estado Todos: ' + err.message);
    }
  };

  const handleToggleActivo = async (post) => {
    try {
      const data = new FormData();
      // If it is false, we make it true. If it is null/undefined, we treat it as true, so we make it false.
      const newState = post.activo === false ? 'true' : 'false';
      data.append('activo', newState);
      await api.put(`/redes/${post.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchPosts();
    } catch (err) {
      alert('Error cambiando el estado: ' + err.message);
    }
  };

  const handleToggleMostrarTodos = async (post) => {
    try {
      const data = new FormData();
      const newState = post.mostrar_en_todos === true ? 'false' : 'true';
      data.append('mostrarEnTodos', newState);
      await api.put(`/redes/${post.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchPosts();
    } catch (err) {
      alert('Error cambiando el estado Todos: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando publicaciones...</div>;

  return (
    <div className="animate-fade" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>Gestión de Redes Sociales</h2>
        <button className="btn btn-primary zoom-hover" onClick={() => handleOpenModal()}>
          + Añadir Publicación
        </button>
      </div>

      {/* Impacto Digital (Métricas Sociales) */}
      {metricas && Object.keys(metricas).length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌍 Nuestro Impacto Digital
          </h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {/* Tarjeta TikTok */}
            <div onClick={() => openPostsModal('tiktok')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', borderLeft: '5px solid #000000' }}>
               <div style={{ fontSize: '2.5rem' }}>🎵</div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TIKTOK (SEGUIDORES)</p>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#000000' }}>
                    {metricas.tiktok && metricas.tiktok.length > 0 ? metricas.tiktok[metricas.tiktok.length - 1].seguidores : 0}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ❤ {metricas.tiktok && metricas.tiktok.length > 0 ? metricas.tiktok[metricas.tiktok.length - 1].interacciones : 0} me gusta | 📹 {metricas.tiktok && metricas.tiktok.length > 0 ? metricas.tiktok[metricas.tiktok.length - 1].alcance : 0} videos
                  </p>
               </div>
            </div>
            {/* Tarjeta Instagram */}
            <div onClick={() => openPostsModal('instagram')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)', borderLeft: '5px solid #E1306C' }}>
               <div style={{ fontSize: '2.5rem' }}>📸</div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>INSTAGRAM (SEGUIDORES)</p>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#E1306C' }}>
                    {metricas.instagram && metricas.instagram.length > 0 ? metricas.instagram[metricas.instagram.length - 1].seguidores : 0}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    📷 {metricas.instagram && metricas.instagram.length > 0 ? metricas.instagram[metricas.instagram.length - 1].interacciones : 0} posts
                  </p>
               </div>
            </div>
            {/* Tarjeta YouTube */}
            <div onClick={() => openPostsModal('youtube')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', borderLeft: '5px solid #EF4444' }}>
               <div style={{ fontSize: '2.5rem' }}>🔴</div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>YOUTUBE (SUSCRIPTORES)</p>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#EF4444' }}>
                    {metricas.youtube && metricas.youtube.length > 0 ? metricas.youtube[metricas.youtube.length - 1].seguidores : 0}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    👁️ {metricas.youtube && metricas.youtube.length > 0 ? metricas.youtube[metricas.youtube.length - 1].alcance : 0} vistas | 📹 {metricas.youtube && metricas.youtube.length > 0 ? metricas.youtube[metricas.youtube.length - 1].interacciones : 0} videos
                  </p>
               </div>
            </div>
            {/* Tarjeta Facebook */}
            <div onClick={() => openPostsModal('facebook')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '5px solid #3B82F6' }}>
               <div style={{ fontSize: '2.5rem' }}>📘</div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>FACEBOOK (SEGUIDORES)</p>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#3B82F6' }}>
                    {metricas.facebook && metricas.facebook.length > 0 ? metricas.facebook[metricas.facebook.length - 1].seguidores : 0}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    📢 Alcance: {metricas.facebook && metricas.facebook.length > 0 ? metricas.facebook[metricas.facebook.length - 1].alcance : 0} | 💬 Int: {metricas.facebook && metricas.facebook.length > 0 ? metricas.facebook[metricas.facebook.length - 1].interacciones : 0}
                  </p>
               </div>
            </div>
            {/* Tarjeta Web */}
            <div className="glass-card zoom-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderLeft: '5px solid #22C55E' }}>
               <div style={{ fontSize: '2.5rem' }}>🌐</div>
               <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>VISITAS WEB (30 DÍAS)</p>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#22C55E' }}>
                    {metricas.web && metricas.web.length > 0 ? metricas.web[metricas.web.length - 1].alcance : 0}
                  </h3>
               </div>
            </div>
          </div>
        </div>
      )}
      
      <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🖼️ Carrusel de la Web Principal
      </h3>

      <div className="responsive-grid" style={{ '--grid-min': '300px' }}>
        {posts.map(post => (
          <div key={post.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {post.red_social === 'facebook' ? '📘' : 
                 post.red_social === 'instagram' ? '📸' : 
                 post.red_social === 'tiktok' ? '🎵' : '▶️'}
              </span>
              <strong>{post.author_name}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{post.date_text}</span>
            </div>
            {post.image_url && (
              <img src={getImageUrl(post.image_url)} alt="Thumbnail" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <p style={{ fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.content}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: 'auto', paddingTop: '10px' }}>
              <button 
                className="btn" 
                style={{ flex: '1 1 45%', padding: '0.4rem', fontSize: '0.75rem', background: post.activo === false ? '#9CA3AF' : '#10B981', color: 'white' }} 
                onClick={() => handleToggleActivo(post)}
              >
                {post.activo === false ? 'Mostrar Web' : 'Ocultar Web'}
              </button>
              <button 
                className="btn" 
                style={{ flex: '1 1 45%', padding: '0.4rem', fontSize: '0.75rem', background: post.mostrar_en_todos === true ? '#F59E0B' : '#9CA3AF', color: 'white' }} 
                onClick={() => handleToggleMostrarTodos(post)}
              >
                {post.mostrar_en_todos === true ? 'Quitar de Todos' : 'Mostrar en Todos'}
              </button>
              <button className="btn" style={{ flex: '1 1 45%', padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(post)}>Editar</button>
              <button className="btn btn-logout" style={{ flex: '1 1 45%', padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleDelete(post.id)}>Eliminar</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
            No hay publicaciones registradas. Haz clic en "Añadir Publicación".
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editingPost ? 'Editar Publicación' : 'Añadir Publicación'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              
              <div className="input-group">
                <label>Red Social</label>
                <select value={formData.red_social} onChange={e => setFormData({...formData, red_social: e.target.value})} required>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Nombre de Página/Autor</label>
                  <input type="text" value={formData.author_name} onChange={e => setFormData({...formData, author_name: e.target.value})} placeholder="Ej: JUFRA Pomalca" required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Logo/Avatar del Autor (Sube un archivo o pega URL)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({...formData, author_icon_file: e.target.files[0]});
                      }
                    }} 
                    style={{ marginBottom: '5px' }}
                  />
                  <input 
                    type="url" 
                    value={formData.author_icon} 
                    onChange={e => setFormData({...formData, author_icon: e.target.value})} 
                    placeholder="https://..." 
                    required={!formData.author_icon_file && !editingPost} 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Texto de Fecha / Tiempo</label>
                <input type="text" value={formData.date_text} onChange={e => setFormData({...formData, date_text: e.target.value})} placeholder="Ej: Hace 2 horas" required />
              </div>

              <div className="input-group">
                <label>Contenido / Texto (o Título para YT)</label>
                <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={3} placeholder="Texto de la publicación..." required />
              </div>

              <div className="input-group">
                <label>Subir Imagen (Opcional, reemplaza URL)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({...formData, imagen_file: e.target.files[0]});
                    }
                  }} 
                />
              </div>

              <div className="input-group">
                <label>Imagen / Miniatura (URL)</label>
                <input 
                  type="url" 
                  value={formData.image_url} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})} 
                  placeholder="https://..." 
                  required={!formData.imagen_file && !editingPost} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Cantidad de Likes / Vistas</label>
                  <input type="text" value={formData.likes} onChange={e => setFormData({...formData, likes: e.target.value})} placeholder="Ej: 120" />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Cantidad de Comentarios</label>
                  <input type="text" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Ej: 15" />
                </div>
              </div>

              <div className="input-group">
                <label>Enlace Directo (URL)</label>
                <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://facebook.com/..." required />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-logout" style={{ width: 'auto' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Publicaciones Sociales */}
      {postsModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, textTransform: 'capitalize', color: 'var(--primary)' }}>Publicaciones de {postsModal.plataforma}</h2>
              <button onClick={() => setPostsModal({ ...postsModal, isOpen: false })} className="btn" style={{ background: '#EF4444', color: 'white', padding: '5px 10px' }}>Cerrar</button>
            </div>
            
            {postsModal.loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando publicaciones...</div>
            ) : postsModal.data.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay publicaciones guardadas para esta plataforma.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {postsModal.data.map(post => (
                  <div key={post.post_id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {post.imagen_url && (
                      <div style={{ height: '140px', width: '100%', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                        <img src={post.imagen_url} alt="Miniatura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.titulo}
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatSafeDate(post.fecha_publicacion, 'dd MMM yyyy - HH:mm')}
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        <span title="Vistas">👁️ {post.vistas}</span>
                        <span title="Likes">👍 {post.likes}</span>
                        <span title="Comentarios">💬 {post.comentarios}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn" 
                            style={{ flex: 1, padding: '8px', fontSize: '0.75rem', background: post.activo === true ? '#10B981' : '#9CA3AF', color: 'white' }} 
                            onClick={() => handleToggleScrapedActivo(post, postsModal.plataforma)}
                          >
                            {post.activo === true ? 'Ocultar Web' : 'Mostrar Web'}
                          </button>
                          <a href={post.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: '0.75rem' }}>
                            Original
                          </a>
                        </div>
                        <button 
                          className="btn" 
                          style={{ width: '100%', padding: '8px', fontSize: '0.75rem', background: post.mostrar_en_todos === true ? '#F59E0B' : '#9CA3AF', color: 'white' }} 
                          onClick={() => handleToggleScrapedMostrarTodos(post, postsModal.plataforma)}
                        >
                          {post.mostrar_en_todos === true ? 'Quitar de "Todos"' : 'Mostrar en "Todos"'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RedesAdminView;
