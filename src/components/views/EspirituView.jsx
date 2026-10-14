import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import EspirituList from '../lists/EspirituList';
import EspirituNewModal from '../EspirituNewModal';
import EspirituEditModal from '../EspirituEditModal';
import Swal from 'sweetalert2';

/* ── Estilos encapsulados ── */
const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' },
  modal: { background: 'var(--card-bg, #fff)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '580px', boxShadow: '0 24px 80px rgba(0,0,0,0.28)', animation: 'espScaleIn 0.22s ease' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border, #e5e7eb)' },
  modalTitle: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted, #6b7280)', padding: '0.2rem' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #e5e7eb)' },
  btnPrimary: { background: 'linear-gradient(135deg, var(--primary), #7b4fcf)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.4rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(106,67,201,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' },
  btnSecondary: { background: 'transparent', color: 'var(--text-color, #374151)', border: '1.5px solid var(--border, #e5e7eb)', borderRadius: '10px', padding: '0.65rem 1.3rem', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg, #fff)', border: '1.5px solid var(--border, #e5e7eb)', borderRadius: '10px', padding: '0.5rem 0.9rem', minWidth: '220px' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '0.92rem', color: 'var(--text-color, #111827)', width: '100%' },
};

const EspirituView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [espirituTab, setEspirituTab] = useState('oracion');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ titulo: '', contenido: '', tipo: 'oracion', categoria: '' });
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/espiritualidad');
      const resData = response.data;
      setData(resData.items || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching espiritualidad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = useMemo(() => {
    const filtered = Array.isArray(data) ? data : [];
    if (!searchTerm) return filtered;
    const normalize = (str) => typeof str === 'string' ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    const term = normalize(searchTerm).trim();
    return filtered.filter(item => {
      if (!item) return false;
      return normalize(`${item.titulo || ''} ${item.contenido || ''}`).includes(term);
    });
  }, [data, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/espiritualidad', { titulo: newItem.titulo, contenido: newItem.contenido, tipo: newItem.tipo || 'oracion', categoria: newItem.categoria || '' });
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', tipo: 'oracion', categoria: '' });
      fetchData();
      Swal.fire({ icon: 'success', title: '¡Creado!', text: 'Contenido añadido correctamente.', timer: 1800, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/espiritualidad/${selectedItem._id}`, { titulo: selectedItem.titulo, contenido: selectedItem.contenido, tipo: selectedItem.tipo || 'oracion', categoria: selectedItem.categoria || '' });
      setIsEditModalOpen(false);
      fetchData();
      Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1800, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar contenido?',
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
        await api.delete(`/espiritualidad/${id}`);
        fetchData();
        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    }
  };

  const openEditModal = (item) => { setSelectedItem(item); setIsEditModalOpen(true); };

  return (
    <div className="fade-in">
      <style>{`
        @keyframes espScaleIn { from { opacity:0; transform:scale(0.94) translateY(-10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .esp-btn-prim:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(106,67,201,0.45) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🕊️ Espiritualidad Franciscana
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={S.searchWrap}>
            <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar en Espíritu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={S.searchInput}
            />
          </div>
          <button className="esp-btn-prim" style={S.btnPrimary} onClick={() => setIsModalOpen(true)}>
            ➕ Añadir
          </button>
        </div>
      </div>

      {/* ── Lista ── */}
      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <EspirituList
          filteredData={filteredData}
          espirituTab={espirituTab}
          setEspirituTab={setEspirituTab}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
        />
      )}

      {/* ── MODAL NUEVO ── */}
      {isModalOpen && (
        <div style={S.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>🕊️ Añadir a Espíritu</h3>
              <button style={S.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <EspirituNewModal newItem={newItem} setNewItem={setNewItem} />
              <div style={S.modalFooter}>
                <button type="button" style={S.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="esp-btn-prim" style={S.btnPrimary}>💾 Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ── */}
      {isEditModalOpen && selectedItem && (
        <div style={S.overlay} onClick={() => setIsEditModalOpen(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>✏️ Editar Espíritu</h3>
              <button style={S.closeBtn} onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <EspirituEditModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
              <div style={S.modalFooter}>
                <button type="button" style={S.btnSecondary} onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="esp-btn-prim" style={S.btnPrimary}>💾 Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspirituView;

