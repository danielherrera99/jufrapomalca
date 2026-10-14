import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import api from '../../config/api';
import EventosList from '../lists/EventosList';
import EventosNewModal from '../EventosNewModal';
import EventosEditModal from '../EventosEditModal';
import ItemReadModal from '../ItemReadModal';
import MapPicker from '../MapPicker';

const FILTROS_EVENTOS = [
  { id: 'todos', label: 'Todos', icon: '📅' },
  { id: 'misa', label: 'Misas', icon: '⛪' },
  { id: 'reunion', label: 'Reuniones', icon: '🤝' },
  { id: 'formacion', label: 'Formación', icon: '📖' },
  { id: 'retiro', label: 'Retiros', icon: '🔥' },
  { id: 'fraternidad', label: 'Fraternidad', icon: '🎉' },
];

const EventosView = ({ formatSafeDate, SafeImage, ActivityIndicator }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    titulo: '',
    contenido: '',
    fecha: '',
    hora: '',
    lugar: '',
    tipo: 'reunion',
    lat: '',
    lng: '',
    imagenFile: null,
    previewImagen: '',
    publicar_web: false,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/eventos?todos=true');
      const resData = response.data;
      setData(resData.eventos || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = Array.isArray(data) ? data : [];

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter(item => (item.tipo || 'reunion') === tipoFilter);
    }

    if (!searchTerm) return filtered;

    const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    const term = normalize(searchTerm).trim();

    return filtered.filter(item => {
      if (!item) return false;
      const fallback = normalize(`${item.titulo || ''} ${item.descripcion || ''} ${item.lugar || ''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm, tipoFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', newItem.titulo || '');
      formData.append('descripcion', newItem.contenido || '');
      formData.append('fecha', newItem.fecha ? new Date(newItem.fecha + 'T12:00:00').toISOString() : new Date().toISOString());
      formData.append('hora', newItem.hora || '18:00');
      formData.append('lugar', newItem.lugar || 'Sede Jufra');
      formData.append('tipo', newItem.tipo || 'reunion');
      formData.append('visibilidad', newItem.visibilidad || 'todos');
      formData.append('lat', newItem.lat || -6.745);
      formData.append('lng', newItem.lng || -79.824);
      formData.append('publicar_web', newItem.publicar_web ? 'true' : 'false');
      if (newItem.imagenFile) formData.append('imagen', newItem.imagenFile);

      await api.post('/eventos', formData);
      setIsModalOpen(false);
      setNewItem({
        titulo: '',
        contenido: '',
        fecha: '',
        hora: '',
        lugar: '',
        tipo: 'reunion',
        lat: '',
        lng: '',
        imagenFile: null,
        previewImagen: '',
        publicar_web: false,
      });
      fetchData();

      Swal.fire({
        icon: 'success',
        title: '¡Evento creado!',
        text: 'El evento se ha programado exitosamente en el calendario.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear evento',
        text: error.response?.data?.message || error.message,
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', selectedItem.titulo || '');
      formData.append('descripcion', selectedItem.descripcion || selectedItem.contenido || '');
      if (selectedItem.fecha) formData.append('fecha', new Date(selectedItem.fecha).toISOString());
      formData.append('hora', selectedItem.hora || '');
      formData.append('lugar', selectedItem.lugar || '');
      formData.append('tipo', selectedItem.tipo || 'reunion');
      formData.append('visibilidad', selectedItem.visibilidad || 'todos');
      if (selectedItem.ubicacion?.lat) formData.append('lat', selectedItem.ubicacion.lat);
      if (selectedItem.ubicacion?.lng) formData.append('lng', selectedItem.ubicacion.lng);
      formData.append('publicar_web', selectedItem.publicar_web ? 'true' : 'false');
      if (selectedItem.nuevaImagenFile) formData.append('imagen', selectedItem.nuevaImagenFile);

      await api.put(`/eventos/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      fetchData();

      Swal.fire({
        icon: 'success',
        title: '¡Evento actualizado!',
        text: 'Los cambios han sido guardados con éxito.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error.response?.data?.message || error.message,
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar evento?',
      text: 'Esta acción no se puede deshacer y el evento se quitará del calendario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: '🗑️ Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/eventos/${id}`);
        fetchData();
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El evento ha sido eliminado.',
          timer: 1600,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: err.response?.data?.message || err.message,
          confirmButtonColor: '#7c3aed',
        });
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <div className="animate-fade">
      <style>{`
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .evento-pill {
          transition: all 0.2s ease;
        }
        .evento-pill.active {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25) !important;
        }
        .evento-btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.92rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
          transition: all 0.2s ease;
        }
        .evento-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
        }
        .evento-search-input:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15) !important;
        }
        .evento-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        .evento-modal-box {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '-0.02em',
          }}>
            📅 Calendario de Eventos
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Planifica y consulta las misas, retiros, reuniones y celebraciones de la fraternidad
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Integrated Search Input */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '2px 14px',
            minWidth: '240px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <span style={{ fontSize: '0.95rem', opacity: 0.5, marginRight: '8px' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar eventos o lugares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="evento-search-input"
              style={{
                border: 'none',
                outline: 'none',
                padding: '8px 0',
                width: '100%',
                fontSize: '0.88rem',
                color: '#1e293b',
                background: 'transparent',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            className="evento-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Nuevo Evento
          </button>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'white',
        padding: '6px',
        borderRadius: '14px',
        width: 'fit-content',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflowX: 'auto',
        maxWidth: '100%',
      }}>
        {FILTROS_EVENTOS.map(filtro => {
          const isActive = tipoFilter === filtro.id;
          const count = filtro.id === 'todos'
            ? data.length
            : data.filter(item => (item.tipo || 'reunion') === filtro.id).length;

          return (
            <button
              key={filtro.id}
              onClick={() => setTipoFilter(filtro.id)}
              className={`evento-pill ${isActive ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '9px',
                fontSize: '0.86rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? undefined : 'transparent',
                color: isActive ? undefined : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{filtro.icon}</span>
              <span>{filtro.label}</span>
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 6px',
                borderRadius: '8px',
                background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: isActive ? 'white' : '#64748b',
                fontWeight: 700,
                marginLeft: '2px',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main List ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '14px' }}>Cargando calendario...</p>
        </div>
      ) : (
        <EventosList
          filteredData={filteredData}
          setReadItem={setReadItem}
          openEditModal={openEditModal}
          handleDelete={(id) => handleDelete(id)}
        />
      )}

      {/* ── Create Modal ── */}
      {isModalOpen && (
        <div className="evento-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="evento-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>📅</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                  Crear Nuevo Evento
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '24px' }}>
              <EventosNewModal newItem={newItem} setNewItem={setNewItem} MapPicker={MapPicker} />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="evento-btn-primary"
                >
                  💾 Programar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditModalOpen && selectedItem && (
        <div className="evento-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="evento-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>✏️</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                  Editar Evento
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
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
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ padding: '24px' }}>
              <EventosEditModal
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                MapPicker={MapPicker}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="evento-btn-primary"
                >
                  💾 Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Read Detail Modal ── */}
      {readItem && (
        <ItemReadModal
          readItem={readItem}
          setReadItem={setReadItem}
          activeTab="Eventos"
          formatSafeDate={formatSafeDate}
          SafeImage={SafeImage}
        />
      )}
    </div>
  );
};

export default EventosView;
