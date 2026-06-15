import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const RedesAdminView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
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
      const { data } = await api.get('/redes');
      setPosts(data.posts || []);
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando publicaciones...</div>;

  return (
    <div className="animate-fade" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>Gestión de Redes Sociales</h2>
        <button className="btn btn-primary zoom-hover" onClick={() => handleOpenModal()}>
          + Añadir Publicación
        </button>
      </div>

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
              <img src={post.image_url} alt="Thumbnail" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
            )}
            <p style={{ fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.content}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleOpenModal(post)}>Editar</button>
              <button className="btn btn-logout" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(post.id)}>Eliminar</button>
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
    </div>
  );
};

export default RedesAdminView;
