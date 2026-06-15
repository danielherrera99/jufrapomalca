import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const GaleriaWebAdminView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'todas',
    archivoUrl: '',
    imagen_file: null
  });

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/galeria-web');
      if (data.success) {
        setItems(data.galeria);
      }
    } catch (error) {
      console.error('Error fetching galeria web:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentId(item.id);
      setFormData({
        titulo: item.titulo || '',
        descripcion: item.descripcion || '',
        categoria: item.categoria || 'todas',
        archivoUrl: item.archivo_url || item.archivoUrl || '',
        imagen_file: null
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        titulo: '',
        descripcion: '',
        categoria: 'todas',
        archivoUrl: '',
        imagen_file: null
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

      if (isEditing) {
        await api.put(`/galeria-web/${currentId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/galeria-web', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error al guardar. Por favor, revisa los datos.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación de la galería?')) {
      try {
        await api.delete(`/galeria-web/${id}`);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Administración de Galería Web</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Nuevo Elemento</button>
        </div>
      </div>

      <div className="view-content" style={{ padding: '20px' }}>
        {loading ? (
          <p>Cargando galería...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {items.map(item => (
              <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                <img src={item.archivo_url || item.archivoUrl} alt={item.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{item.titulo}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>{item.descripcion}</p>
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ background: '#f0f0f0', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem' }}>
                      {item.categoria}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn" style={{ flex: 1, background: '#f0ad4e', color: 'white' }} onClick={() => handleOpenModal(item)}>Editar</button>
                    <button className="btn" style={{ flex: 1, background: '#d9534f', color: 'white' }} onClick={() => handleDelete(item.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <p>No hay elementos en la galería web aún.</p>}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '500px' }}>
            <h2>{isEditing ? 'Editar Elemento' : 'Nuevo Elemento'}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Título</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} required className="form-control" style={{ width: '100%', padding: '8px' }} />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-control" style={{ width: '100%', padding: '8px' }} />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleInputChange} className="form-control" style={{ width: '100%', padding: '8px' }}>
                  <option value="todas">Todas</option>
                  <option value="encuentros">Encuentros</option>
                  <option value="apostolado">Apostolado</option>
                  <option value="fraternidad">Fraternidad</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Subir Imagen/Video (Opcional, reemplaza URL)</label>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({...formData, imagen_file: e.target.files[0]});
                    }
                  }} 
                  className="form-control" 
                  style={{ width: '100%', padding: '8px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>URL de la Imagen/Archivo</label>
                <input 
                  type="text" 
                  name="archivoUrl" 
                  value={formData.archivoUrl} 
                  onChange={handleInputChange} 
                  required={!formData.imagen_file && !isEditing} 
                  className="form-control" 
                  style={{ width: '100%', padding: '8px' }} 
                />
                {formData.archivoUrl && <img src={formData.archivoUrl} alt="Preview" style={{ marginTop: '10px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
                <button type="button" className="btn" style={{ flex: 1, background: '#ccc' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaWebAdminView;
