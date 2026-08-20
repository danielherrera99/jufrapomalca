import { getImageUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const QuienesSomosView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Categorías de filtro
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    categoria: 'Consejo Local', // 'Consejo Local' o 'Hermanos'
    orden: 0,
    fotoUrl: '',
    foto_file: null
  });

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/quienes-somos');
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching quienes somos:', error);
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
        nombre: item.nombre || '',
        rol: item.rol || '',
        categoria: item.categoria || 'Consejo Local',
        orden: item.orden || 0,
        fotoUrl: item.foto_url || item.fotoUrl || '',
        foto_file: null
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        nombre: '',
        rol: '',
        categoria: 'Consejo Local',
        orden: 0,
        fotoUrl: '',
        foto_file: null
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
        await api.put(`/quienes-somos/${currentId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/quienes-somos', data, {
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
    if (window.confirm('¿Estás seguro de que quieres eliminar a este miembro?')) {
      try {
        await api.delete(`/quienes-somos/${id}`);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const filteredItems = filtroCategoria === 'Todas' 
    ? items 
    : items.filter(item => item.categoria === filtroCategoria);

  return (
    <div className="view-container" style={{ padding: '20px' }}>
      <div className="view-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Gestión de "Quiénes Somos"</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Agregar Miembro</button>
        </div>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por categoría:</label>
        <select 
          value={filtroCategoria} 
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value="Todas">Todas</option>
          <option value="Consejo Local">Consejo Local</option>
          <option value="Hermanos">Hermanos</option>
        </select>
      </div>

      <div className="view-content">
        {loading ? (
          <p>Cargando miembros...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredItems.map(item => (
              <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', paddingBottom: '15px' }}>
                <div style={{ background: '#f8f9fa', padding: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.foto_url || item.fotoUrl ? (
                            <img src={getImageUrl(item.foto_url || item.fotoUrl)} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '40px', color: '#999' }}>👤</span>
                        )}
                    </div>
                </div>
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{item.nombre}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#8b5a2b', fontWeight: '500' }}>{item.rol}</p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ background: item.categoria === 'Consejo Local' ? '#e3f2fd' : '#fce4ec', color: item.categoria === 'Consejo Local' ? '#1976d2' : '#c2185b', padding: '5px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {item.categoria}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '15px' }}>Orden: {item.orden}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', padding: '0 15px' }}>
                    <button className="btn" style={{ flex: 1, background: '#f0ad4e', color: 'white', padding: '8px' }} onClick={() => handleOpenModal(item)}>Editar</button>
                    <button className="btn" style={{ flex: 1, background: '#d9534f', color: 'white', padding: '8px' }} onClick={() => handleDelete(item.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>No se encontraron miembros en esta categoría.</p>}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{isEditing ? 'Editar Miembro' : 'Nuevo Miembro'}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Ej: Fray Ejemplo" />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rol / Cargo / Etapa</label>
                <input type="text" name="rol" value={formData.rol} onChange={handleInputChange} className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Ej: Ministro o Etapa de Iniciación" />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Categoría</label>
                <select name="categoria" value={formData.categoria} onChange={handleInputChange} required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="Consejo Local">Consejo Local</option>
                  <option value="Hermanos">Hermanos</option>
                </select>
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Define en qué sección de la página se mostrará.</small>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Orden (Prioridad)</label>
                <input type="number" name="orden" value={formData.orden} onChange={handleInputChange} className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Menor número = se muestra primero (ej: Ministro = 1, Viceministro = 2).</small>
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Foto (Opcional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFormData(prev => ({ ...prev, foto: e.target.files[0] }))}
                  className="form-control" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                {isEditing && (formData.fotoUrl || formData.foto_url) && (
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Deja vacío para mantener la imagen actual.</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f5f5f5', color: '#333', border: 'none' }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', background: '#8b5a2b', color: 'white', border: 'none' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuienesSomosView;
