import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const CampaignsAdminView = ({ ActivityIndicator }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fechaHora: '',
        ubicacion: '',
        mapQuery: '',
        isActive: false,
        cronograma: [],
        reglas: []
    });

    const [newCronograma, setNewCronograma] = useState({ hora: '', actividad: '' });
    const [newRegla, setNewRegla] = useState({ texto: '', icono: '📌' });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/campaigns');
            setCampaigns(data);
        } catch (err) {
            setError('Error al cargar las campañas.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (campaign = null) => {
        if (campaign) {
            setEditingId(campaign.id);
            setFormData({
                titulo: campaign.titulo || '',
                descripcion: campaign.descripcion || '',
                fechaHora: campaign.fechaHora || '',
                ubicacion: campaign.ubicacion || '',
                mapQuery: campaign.mapQuery || '',
                isActive: campaign.isActive || false,
                cronograma: campaign.cronograma || [],
                reglas: campaign.reglas || []
            });
        } else {
            setEditingId(null);
            setFormData({
                titulo: '',
                descripcion: '',
                fechaHora: '',
                ubicacion: '',
                mapQuery: '',
                isActive: false,
                cronograma: [],
                reglas: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/campaigns/${editingId}`, formData);
            } else {
                await api.post('/campaigns', formData);
            }
            handleCloseModal();
            fetchCampaigns();
        } catch (err) {
            alert('Error al guardar la campaña');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta campaña?')) {
            try {
                await api.delete(`/campaigns/${id}`);
                fetchCampaigns();
            } catch (err) {
                alert('Error al eliminar la campaña');
            }
        }
    };

    // Agregar/quitar Cronograma
    const addCronograma = () => {
        if (!newCronograma.hora || !newCronograma.actividad) return;
        setFormData({ ...formData, cronograma: [...formData.cronograma, newCronograma] });
        setNewCronograma({ hora: '', actividad: '' });
    };
    const removeCronograma = (idx) => {
        const arr = [...formData.cronograma];
        arr.splice(idx, 1);
        setFormData({ ...formData, cronograma: arr });
    };

    // Agregar/quitar Reglas
    const addRegla = () => {
        if (!newRegla.texto) return;
        setFormData({ ...formData, reglas: [...formData.reglas, newRegla] });
        setNewRegla({ texto: '', icono: '📌' });
    };
    const removeRegla = (idx) => {
        const arr = [...formData.reglas];
        arr.splice(idx, 1);
        setFormData({ ...formData, reglas: arr });
    };

    if (loading) return <ActivityIndicator />;

    return (
        <div className="admin-container animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0 }}>Gestor de Campañas</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Nueva Campaña</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {campaigns.map(camp => (
                    <div key={camp.id} className="glass-card list-card" style={{ borderTop: camp.isActive ? '4px solid var(--primary)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)', fontSize: '1.2rem' }}>
                                {camp.titulo} {camp.isActive && <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', verticalAlign: 'middle', marginLeft: '5px' }}>Activa</span>}
                            </h3>
                            <div className="action-buttons">
                                <button className="btn-icon" onClick={() => handleOpenModal(camp)} title="Editar">✏️</button>
                                <button className="btn-icon delete" onClick={() => handleDelete(camp.id)} title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>📅 {camp.fechaHora}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>{camp.descripcion}</p>
                    </div>
                ))}
                {campaigns.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay campañas creadas.</p>}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card animate-scale" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}>{editingId ? 'Editar Campaña' : 'Nueva Campaña'}</h3>
                        <form onSubmit={handleSave}>
                            
                            <div className="input-group">
                                <label>Título de la Campaña</label>
                                <input type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ej: Bendición de Mascotas" />
                            </div>
                            
                            <div className="input-group">
                                <label>Descripción breve</label>
                                <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows={2} />
                            </div>

                            <div className="grid-2">
                                <div className="input-group">
                                    <label>Fecha y Hora General</label>
                                    <input type="text" value={formData.fechaHora} onChange={e => setFormData({...formData, fechaHora: e.target.value})} required placeholder="Ej: 11 de Octubre, 10:00 AM" />
                                </div>
                                <div className="input-group">
                                    <label>Ubicación (Texto)</label>
                                    <input type="text" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} placeholder="Ej: Parroquia San Francisco" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Mapa Interactivo (Iframe de Google Maps)</label>
                                <input type="text" value={formData.mapQuery} onChange={e => setFormData({...formData, mapQuery: e.target.value})} placeholder="URL del iframe o query para mapa" />
                                <small style={{ color: 'var(--text-muted)' }}>Pega aquí la URL src del iframe de Google Maps.</small>
                            </div>

                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                                <label htmlFor="isActive" style={{ margin: 0, fontWeight: 'bold' }}>⭐ Marcar como Campaña Activa / Destacada</label>
                            </div>

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            <div className="input-group">
                                <h4>Cronograma de Actividades</h4>
                                {formData.cronograma.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', minWidth: '80px' }}>{item.hora}</span>
                                        <span style={{ flex: 1 }}>{item.actividad}</span>
                                        <button type="button" className="btn-icon delete" onClick={() => removeCronograma(idx)}>❌</button>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input type="text" placeholder="Hora (ej. 10:00 AM)" value={newCronograma.hora} onChange={e => setNewCronograma({...newCronograma, hora: e.target.value})} style={{ flex: 1 }} />
                                    <input type="text" placeholder="Actividad" value={newCronograma.actividad} onChange={e => setNewCronograma({...newCronograma, actividad: e.target.value})} style={{ flex: 2 }} />
                                    <button type="button" className="btn btn-secondary" onClick={addCronograma}>Añadir</button>
                                </div>
                            </div>

                            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                            <div className="input-group">
                                <h4>Reglas / Indicaciones</h4>
                                {formData.reglas.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icono}</span>
                                        <span style={{ flex: 1 }}>{item.texto}</span>
                                        <button type="button" className="btn-icon delete" onClick={() => removeRegla(idx)}>❌</button>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input type="text" placeholder="Icono (ej. 🐕)" value={newRegla.icono} onChange={e => setNewRegla({...newRegla, icono: e.target.value})} style={{ width: '80px' }} />
                                    <input type="text" placeholder="Texto de la regla" value={newRegla.texto} onChange={e => setNewRegla({...newRegla, texto: e.target.value})} style={{ flex: 1 }} />
                                    <button type="button" className="btn btn-secondary" onClick={addRegla}>Añadir</button>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Campaña</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsAdminView;
