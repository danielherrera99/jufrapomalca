import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import MapPicker from '../MapPicker';
import Swal from 'sweetalert2';

/* ─────────────────────────────────────────────────────────
   Estilos inline encapsulados (sin afectar otros módulos)
───────────────────────────────────────────────────────── */
const S = {
    page: { padding: '0', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
    title: { fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    btnPrimary: { background: 'linear-gradient(135deg, var(--primary), #7b4fcf)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.4rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(106,67,201,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' },
    card: { background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '16px', padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.18s, box-shadow 0.18s', position: 'relative', overflow: 'hidden' },
    cardActiveBorder: { borderTop: '3px solid var(--primary)' },
    cardTitle: { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color, #1a1a2e)' },
    badge: { display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, background: 'linear-gradient(135deg,var(--primary),#a478f0)', color: '#fff', padding: '2px 10px', borderRadius: '20px', marginLeft: '6px', verticalAlign: 'middle', letterSpacing: '0.04em', textTransform: 'uppercase' },
    cardMeta: { fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    cardDesc: { fontSize: '0.88rem', color: 'var(--text-color, #374151)', margin: 0, lineHeight: 1.5 },
    cardActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
    iconBtn: { background: 'transparent', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px', padding: '0.35rem 0.7rem', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.15s' },
    iconBtnDanger: { borderColor: '#fca5a5', color: '#ef4444' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' },
    modal: { background: 'var(--card-bg, #fff)', borderRadius: '20px', padding: '2rem 2rem 1.5rem', width: '100%', maxWidth: '640px', boxShadow: '0 24px 80px rgba(0,0,0,0.28)', animation: 'scaleIn 0.22s ease', position: 'relative' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border, #e5e7eb)' },
    modalTitle: { margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted, #6b7280)', lineHeight: 1, padding: '0.2rem' },
    fieldGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted, #6b7280)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid var(--border, #e5e7eb)', borderRadius: '9px', fontSize: '0.95rem', background: 'var(--input-bg, #f9fafb)', color: 'var(--text-color, #111827)', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid var(--border, #e5e7eb)', borderRadius: '9px', fontSize: '0.95rem', background: 'var(--input-bg, #f9fafb)', color: 'var(--text-color, #111827)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    divider: { border: 'none', borderTop: '1px solid var(--border, #e5e7eb)', margin: '1.4rem 0' },
    sectionTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-color, #111827)', margin: '0 0 0.75rem' },
    rowItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.7rem', background: 'var(--input-bg, #f3f4f6)', borderRadius: '8px', marginBottom: '6px' },
    addRow: { display: 'flex', gap: '0.5rem', marginTop: '0.6rem' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(106,67,201,0.07)', borderRadius: '10px', marginBottom: '1rem' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #e5e7eb)' },
    btnSecondary: { background: 'transparent', color: 'var(--text-color, #374151)', border: '1.5px solid var(--border, #e5e7eb)', borderRadius: '10px', padding: '0.65rem 1.3rem', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer', transition: 'background 0.15s' },
};

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
        ubicacionTexto: '',
        latitud: '',
        longitud: '',
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
                ubicacionTexto: campaign.ubicacionTexto || '',
                latitud: campaign.latitud || '',
                longitud: campaign.longitud || '',
                isActive: campaign.isActive || false,
                cronograma: Array.isArray(campaign.cronograma) ? campaign.cronograma : [],
                reglas: Array.isArray(campaign.reglas) ? campaign.reglas : []
            });
        } else {
            setEditingId(null);
            setFormData({
                titulo: '',
                descripcion: '',
                fechaHora: '',
                ubicacionTexto: '',
                latitud: '',
                longitud: '',
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

    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/campaigns/${editingId}`, formData);
            } else {
                await api.post('/campaigns', formData);
            }
            handleCloseModal();
            fetchCampaigns();
            Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Campaña guardada correctamente.', timer: 1800, showConfirmButton: false });
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la campaña.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar campaña?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/campaigns/${id}`);
                fetchCampaigns();
                Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1500, showConfirmButton: false });
            } catch {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
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
        <div style={S.page}>
            {/* Keyframes animation */}
            <style>{`
                @keyframes scaleIn { from { opacity:0; transform:scale(0.94) translateY(-10px); } to { opacity:1; transform:scale(1) translateY(0); } }
                .camp-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; }
                .camp-btn-edit:hover { background: rgba(106,67,201,0.1) !important; }
                .camp-btn-del:hover  { background: rgba(239,68,68,0.1) !important; }
                .camp-btn-prim:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(106,67,201,0.45) !important; }
                .camp-input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(106,67,201,0.12) !important; }
            `}</style>

            {/* Header */}
            <div style={S.header}>
                <h2 style={S.title}><span>⛪</span> Gestor de Campañas</h2>
                <button className="camp-btn-prim" style={S.btnPrimary} onClick={() => handleOpenModal()}>
                    + Nueva Campaña
                </button>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Cards */}
            <div style={S.grid}>
                {campaigns.map(camp => (
                    <div key={camp.id} className="camp-card" style={{ ...S.card, ...(camp.isActive ? S.cardActiveBorder : {}) }}>
                        {camp.isActive && (
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle at top right, rgba(106,67,201,0.12), transparent 70%)', borderRadius: '0 16px 0 0' }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <h3 style={S.cardTitle}>
                                {camp.titulo}
                                {camp.isActive && <span style={S.badge}>Activa</span>}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                <button className="camp-btn-edit" style={S.iconBtn} onClick={() => handleOpenModal(camp)} title="Editar">✏️</button>
                                <button className="camp-btn-del" style={{ ...S.iconBtn, ...S.iconBtnDanger }} onClick={() => handleDelete(camp.id)} title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        <div style={S.cardMeta}><span>📅</span><span>{camp.fechaHora}</span></div>
                        {camp.ubicacionTexto && <div style={S.cardMeta}><span>📍</span><span>{camp.ubicacionTexto}</span></div>}
                        {camp.descripcion && <p style={S.cardDesc}>{camp.descripcion}</p>}
                        {Array.isArray(camp.cronograma) && camp.cronograma.length > 0 && (
                            <div style={{ ...S.cardMeta, marginTop: '0.25rem' }}><span>🕐</span><span>{camp.cronograma.length} actividad{camp.cronograma.length !== 1 ? 'es' : ''}</span></div>
                        )}
                    </div>
                ))}
                {campaigns.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted, #6b7280)', background: 'var(--card-bg, #fff)', borderRadius: '16px', border: '2px dashed var(--border, #e5e7eb)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⛪</div>
                        <p style={{ margin: 0, fontWeight: 600 }}>No hay campañas creadas</p>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem' }}>Haz clic en «+ Nueva Campaña» para comenzar.</p>
                    </div>
                )}
            </div>

            {/* ─── MODAL ─── */}
            {isModalOpen && (
                <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) handleCloseModal(); }}>
                    <div style={S.modal}>
                        {/* Modal Header */}
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>{editingId ? '✏️ Editar Campaña' : '🆕 Nueva Campaña'}</h3>
                            <button style={S.closeBtn} onClick={handleCloseModal} title="Cerrar">✕</button>
                        </div>

                        <form onSubmit={handleSave}>
                            {/* Título */}
                            <div style={S.fieldGroup}>
                                <label style={S.label}>Título de la Campaña</label>
                                <input className="camp-input" style={S.input} type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ej: Bendición de Mascotas" />
                            </div>

                            {/* Descripción */}
                            <div style={S.fieldGroup}>
                                <label style={S.label}>Descripción breve</label>
                                <textarea className="camp-input" style={S.textarea} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows={3} placeholder="Describe brevemente la campaña..." />
                            </div>

                            {/* Fecha + Ubicación */}
                            <div style={S.grid2}>
                                <div style={S.fieldGroup}>
                                    <label style={S.label}>Fecha y Hora</label>
                                    <input className="camp-input" style={S.input} type="text" value={formData.fechaHora} onChange={e => setFormData({...formData, fechaHora: e.target.value})} required placeholder="Ej: 11 de Oct, 10:00 AM" />
                                </div>
                                <div style={S.fieldGroup}>
                                    <label style={S.label}>Ubicación (texto)</label>
                                    <input className="camp-input" style={S.input} type="text" value={formData.ubicacionTexto} onChange={e => setFormData({...formData, ubicacionTexto: e.target.value})} placeholder="Ej: Parroquia San Francisco" />
                                </div>
                            </div>

                            {/* Mapa */}
                            <div style={S.fieldGroup}>
                                <label style={S.label}>📍 Ubicación en el Mapa (Opcional)</label>
                                <MapPicker lat={formData.latitud} lng={formData.longitud} onChange={(lat, lng) => setFormData({...formData, latitud: lat, longitud: lng})} />
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>Haz clic en el mapa para establecer la ubicación exacta.</small>
                            </div>

                            {/* Activa */}
                            <div style={S.checkboxRow}>
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                <label htmlFor="isActive" style={{ margin: 0, fontWeight: 600, cursor: 'pointer', color: 'var(--text-color)' }}>⭐ Marcar como Campaña Activa / Destacada</label>
                            </div>

                            <hr style={S.divider} />

                            {/* Cronograma */}
                            <div style={S.fieldGroup}>
                                <p style={S.sectionTitle}>🕐 Cronograma de Actividades</p>
                                {(Array.isArray(formData.cronograma) ? formData.cronograma : []).map((item, idx) => (
                                    <div key={idx} style={S.rowItem}>
                                        <span style={{ fontWeight: 700, minWidth: '75px', fontSize: '0.88rem', color: 'var(--primary)' }}>{item.hora}</span>
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.actividad}</span>
                                        <button type="button" style={{ ...S.iconBtn, ...S.iconBtnDanger, padding: '2px 6px', fontSize: '0.8rem' }} onClick={() => removeCronograma(idx)}>✕</button>
                                    </div>
                                ))}
                                <div style={S.addRow}>
                                    <input className="camp-input" style={{ ...S.input, flex: '0 0 110px' }} type="text" placeholder="Hora" value={newCronograma.hora} onChange={e => setNewCronograma({...newCronograma, hora: e.target.value})} />
                                    <input className="camp-input" style={{ ...S.input, flex: 1 }} type="text" placeholder="Actividad" value={newCronograma.actividad} onChange={e => setNewCronograma({...newCronograma, actividad: e.target.value})} />
                                    <button type="button" style={{ ...S.btnSecondary, whiteSpace: 'nowrap' }} onClick={addCronograma}>+ Añadir</button>
                                </div>
                            </div>

                            <hr style={S.divider} />

                            {/* Reglas */}
                            <div style={S.fieldGroup}>
                                <p style={S.sectionTitle}>📋 Reglas / Indicaciones</p>
                                {(Array.isArray(formData.reglas) ? formData.reglas : []).map((item, idx) => (
                                    <div key={idx} style={S.rowItem}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icono}</span>
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.texto}</span>
                                        <button type="button" style={{ ...S.iconBtn, ...S.iconBtnDanger, padding: '2px 6px', fontSize: '0.8rem' }} onClick={() => removeRegla(idx)}>✕</button>
                                    </div>
                                ))}
                                <div style={S.addRow}>
                                    <input className="camp-input" style={{ ...S.input, flex: '0 0 70px', textAlign: 'center', fontSize: '1.2rem' }} type="text" placeholder="🐕" value={newRegla.icono} onChange={e => setNewRegla({...newRegla, icono: e.target.value})} />
                                    <input className="camp-input" style={{ ...S.input, flex: 1 }} type="text" placeholder="Texto de la regla" value={newRegla.texto} onChange={e => setNewRegla({...newRegla, texto: e.target.value})} />
                                    <button type="button" style={{ ...S.btnSecondary, whiteSpace: 'nowrap' }} onClick={addRegla}>+ Añadir</button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary} onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className="camp-btn-prim" style={{ ...S.btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                                    {saving ? '⏳ Guardando...' : '💾 Guardar Campaña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsAdminView;
