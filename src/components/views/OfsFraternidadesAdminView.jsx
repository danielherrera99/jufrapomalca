import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import Swal from 'sweetalert2';

// Lista oficial de departamentos del Perú
const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 
  'Tumbes', 'Ucayali'
].sort();

const ZONAS_OFS = [
  { id: 'norte', label: 'Zona Norte' },
  { id: 'centro', label: 'Zona Centro' },
  { id: 'sur', label: 'Zona Sur / Altiplano' },
  { id: 'lima_callao', label: 'Lima y Callao' },
  { id: 'oriente', label: 'Zona Oriente / Selva' }
];

const OfsFraternidadesAdminView = ({ ActivityIndicator }) => {
  const [fraternidades, setFraternidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [zonaFilter, setZonaFilter] = useState('todas');
  const [deptoFilter, setDeptoFilter] = useState('todos');

  // Control de Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = nuevo

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    patrono: '',
    sede: '',
    departamento: 'Lambayeque',
    ciudad: 'Chiclayo',
    zona: 'norte',
    horarios: '',
    contacto: '',
    telefono: '',
    enlaceWeb: '',
    enlaceSocial: '',
    activo: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ofs-fraternidades');
      setFraternidades(response.data.data || []);
    } catch (error) {
      console.error('Error fetching fraternidades OFS:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudieron cargar las fraternidades OFS.',
        confirmButtonColor: '#8B5A2B'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Estadísticas KPI
  const stats = useMemo(() => {
    return {
      total: fraternidades.length,
      norte: fraternidades.filter(f => f.zona === 'norte').length,
      centro: fraternidades.filter(f => f.zona === 'centro').length,
      sur: fraternidades.filter(f => f.zona === 'sur' || f.zona === 'sur_altiplano').length,
      activas: fraternidades.filter(f => f.activo !== false).length
    };
  }, [fraternidades]);

  // Departamentos activos
  const departamentosActivos = useMemo(() => {
    const deptos = fraternidades.map(f => f.departamento).filter(Boolean);
    return [...new Set(deptos)].sort();
  }, [fraternidades]);

  // Filtrado
  const displayedFraternidades = useMemo(() => {
    return fraternidades.filter(f => {
      if (zonaFilter !== 'todas' && f.zona !== zonaFilter) return false;
      if (deptoFilter !== 'todos' && f.departamento !== deptoFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const n = (f.nombre || '').toLowerCase();
        const p = (f.patrono || '').toLowerCase();
        const s = (f.sede || '').toLowerCase();
        const c = (f.ciudad || '').toLowerCase();
        const d = (f.departamento || '').toLowerCase();
        return n.includes(q) || p.includes(q) || s.includes(q) || c.includes(q) || d.includes(q);
      }
      return true;
    });
  }, [fraternidades, zonaFilter, deptoFilter, searchTerm]);

  // Abrir modal nuevo
  const handleOpenNewModal = () => {
    setEditingId(null);
    setForm({
      nombre: '',
      patrono: '',
      sede: '',
      departamento: 'Lambayeque',
      ciudad: '',
      zona: 'norte',
      horarios: '',
      contacto: '',
      telefono: '',
      enlaceWeb: '',
      enlaceSocial: '',
      activo: true
    });
    setIsModalOpen(true);
  };

  // Abrir modal editar
  const handleOpenEditModal = (f) => {
    setEditingId(f.id || f._id);
    setForm({
      nombre: f.nombre || '',
      patrono: f.patrono || '',
      sede: f.sede || '',
      departamento: f.departamento || 'Lambayeque',
      ciudad: f.ciudad || '',
      zona: f.zona || 'norte',
      horarios: f.horarios || '',
      contacto: f.contacto || '',
      telefono: f.telefono || '',
      enlaceWeb: f.enlaceWeb || f.enlace_web || '',
      enlaceSocial: f.enlaceSocial || f.enlace_social || '',
      activo: f.activo !== false
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'Por favor ingresa el nombre de la fraternidad OFS.',
        confirmButtonColor: '#8B5A2B'
      });
      return;
    }

    setUpdating(true);
    try {
      if (editingId) {
        await api.put(`/ofs-fraternidades/${editingId}`, form);
        Swal.fire({
          icon: 'success',
          title: '¡Actualizada!',
          text: `La fraternidad "${form.nombre}" se actualizó con éxito.`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post('/ofs-fraternidades', form);
        Swal.fire({
          icon: 'success',
          title: '¡Creada con éxito!',
          text: `La fraternidad "${form.nombre}" fue agregada a la OFS.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#8B5A2B'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Eliminar fraternidad
  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Eliminar Fraternidad OFS?',
      html: `¿Estás seguro de que deseas eliminar <b>"${nombre}"</b>?<br/><span style="font-size:0.85rem;color:#e74c3c;">Esta acción no se puede deshacer.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#8B5A2B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setUpdating(true);
    try {
      await api.delete(`/ofs-fraternidades/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Eliminada',
        text: 'La fraternidad ha sido removida del directorio OFS.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la fraternidad.',
        confirmButtonColor: '#8B5A2B'
      });
    } finally {
      setUpdating(false);
    }
  };

  // WhatsApp directo
  const getWhatsAppLink = (tel, nombre) => {
    if (!tel) return '';
    const cleanNumber = tel.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 9 ? `51${cleanNumber}` : cleanNumber;
    const msg = `¡Paz y Bien! Hermanos de la Fraternidad ${nombre}, les saludamos de la Orden Franciscana Seglar. 🕊️`;
    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Badge de zona
  const getZonaBadge = (zona) => {
    switch (zona) {
      case 'norte':
        return { label: 'Zona Norte', bg: '#FDF6EC', color: '#B45309', border: '#FDE68A' };
      case 'centro':
        return { label: 'Zona Centro', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'sur':
      case 'sur_altiplano':
        return { label: 'Zona Sur', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
      case 'lima_callao':
        return { label: 'Lima y Callao', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' };
      default:
        return { label: zona || 'OFS Perú', bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
    }
  };

  return (
    <div className="animate-fade" style={{ padding: '0.5rem 0' }}>
      {/* HEADER DE LA SECCIÓN */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(139, 90, 43, 0.08) 0%, rgba(205, 133, 63, 0.04) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(139, 90, 43, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #8B5A2B 0%, #5C3A21 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: 'white',
            boxShadow: '0 8px 16px rgba(139, 90, 43, 0.25)'
          }}>
            🕊️
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary)', fontWeight: 800 }}>
              Fraternidades OFS (Orden Franciscana Seglar)
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Gestiona las fraternidades seglares locales de la OFS en el Perú, sus sedes, horarios y contactos.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.8rem 1.4rem',
            borderRadius: '10px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(139, 90, 43, 0.3)',
            cursor: 'pointer'
          }}
        >
          <span>➕</span> Nueva Fraternidad OFS
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS KPI */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center', borderTop: '4px solid #8B5A2B' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total OFS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5A2B', marginTop: '0.3rem' }}>{stats.total}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center', borderTop: '4px solid #B45309' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Zona Norte</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B45309', marginTop: '0.3rem' }}>{stats.norte}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center', borderTop: '4px solid #1D4ED8' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Zona Centro</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1D4ED8', marginTop: '0.3rem' }}>{stats.centro}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', textAlign: 'center', borderTop: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Activas en Web</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', marginTop: '0.3rem' }}>{stats.activas}</div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="glass-card" style={{
        padding: '1.2rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar por nombre, patrono, sede o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <select
            className="form-control"
            value={zonaFilter}
            onChange={(e) => setZonaFilter(e.target.value)}
            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
          >
            <option value="todas">Todas las Zonas</option>
            {ZONAS_OFS.map(z => (
              <option key={z.id} value={z.id}>{z.label}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <select
            className="form-control"
            value={deptoFilter}
            onChange={(e) => setDeptoFilter(e.target.value)}
            style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
          >
            <option value="todos">Todos los Deptos</option>
            {departamentosActivos.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {(searchTerm || zonaFilter !== 'todas' || deptoFilter !== 'todos') && (
          <button
            onClick={() => { setSearchTerm(''); setZonaFilter('todas'); setDeptoFilter('todos'); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#8B5A2B',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '0.5rem'
            }}
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* CONTENIDO: LISTA DE FRATERNIDADES OFS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          {ActivityIndicator ? <ActivityIndicator /> : <div className="spinner"></div>}
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando directorio de fraternidades OFS...</p>
        </div>
      ) : displayedFraternidades.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🕊️</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No se encontraron fraternidades OFS</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
            {searchTerm || zonaFilter !== 'todas' || deptoFilter !== 'todos'
              ? 'Prueba modificando tus términos de búsqueda o filtros.'
              : 'Aún no hay fraternidades registradas. ¡Sé el primero en registrar una!'}
          </p>
          <button onClick={handleOpenNewModal} className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.7rem 1.5rem' }}>
            ➕ Registrar Primera Fraternidad OFS
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {displayedFraternidades.map((f) => {
            const fid = f.id || f._id;
            const badge = getZonaBadge(f.zona);
            const waLink = getWhatsAppLink(f.telefono, f.nombre);

            return (
              <div
                key={fid}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* BADGES HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}>
                      📍 {badge.label}
                    </span>

                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: f.activo !== false ? '#10B981' : '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: f.activo !== false ? '#10B981' : '#9CA3AF'
                      }}></span>
                      {f.activo !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  {/* TÍTULO Y PATRONO */}
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {f.nombre}
                  </h3>

                  {f.patrono && (
                    <div style={{
                      color: '#8B5A2B',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      fontStyle: 'italic',
                      marginBottom: '0.8rem'
                    }}>
                      "{f.patrono}"
                    </div>
                  )}

                  {/* DETALLES DE UBICACIÓN Y SEDE */}
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    {f.sede && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span>⛪</span>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{f.sede}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏙️</span>
                      <span>{f.ciudad ? `${f.ciudad}, ${f.departamento}` : f.departamento}</span>
                    </div>

                    {f.horarios && (
                      <div style={{
                        marginTop: '0.3rem',
                        padding: '8px 10px',
                        background: 'rgba(139, 90, 43, 0.05)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #8B5A2B',
                        fontSize: '0.85rem',
                        color: 'var(--text)'
                      }}>
                        <strong>🕒 Horarios:</strong> {f.horarios}
                      </div>
                    )}

                    {(f.contacto || f.telefono) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.3rem' }}>
                        <span>👤</span>
                        <span>{f.contacto || 'Contacto'}: <strong>{f.telefono || 'Sin teléfono'}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACCIONES Y BOTONES */}
                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  {/* ENLACES RÁPIDOS */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{
                          flex: 1,
                          fontSize: '0.85rem',
                          padding: '0.45rem 0.8rem',
                          background: '#25D366',
                          color: 'white',
                          borderRadius: '8px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    )}

                    {(f.enlaceWeb || f.enlace_web) && (
                      <a
                        href={f.enlaceWeb || f.enlace_web}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{
                          flex: 1,
                          fontSize: '0.85rem',
                          padding: '0.45rem 0.8rem',
                          background: '#8B5A2B',
                          color: 'white',
                          borderRadius: '8px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>🌐</span> Ver Web
                      </a>
                    )}
                  </div>

                  {/* BOTONES DE GESTIÓN */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEditModal(f)}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>✏️</span> Editar
                    </button>

                    <button
                      onClick={() => handleDelete(fid, f.nombre)}
                      className="btn"
                      style={{
                        padding: '0.5rem 0.8rem',
                        fontSize: '0.85rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                      title="Eliminar Fraternidad"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR / EDITAR FRATERNIDAD OFS */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="modal-content animate-scale" style={{
            background: 'var(--surface, #FFF)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{editingId ? '✏️' : '➕'}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {editingId ? 'Editar Fraternidad OFS' : 'Nueva Fraternidad OFS'}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Completa la información oficial para el directorio nacional de la OFS.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* NOMBRE Y PATRONO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Nombre de la Fraternidad *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Ej. Fraternidad OFS Chiclayo"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Patrono / Advocación
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Santa Isabel de Hungría"
                    value={form.patrono}
                    onChange={(e) => setForm({ ...form, patrono: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* SEDE Y CIUDAD */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Convento / Parroquia / Sede
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Convento San Antonio de Padua"
                    value={form.sede}
                    onChange={(e) => setForm({ ...form, sede: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Ciudad o Localidad
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Chiclayo"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* DEPARTAMENTO Y ZONA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Departamento *
                  </label>
                  <select
                    className="form-control"
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  >
                    {DEPARTAMENTOS_PERU.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Zona OFS *
                  </label>
                  <select
                    className="form-control"
                    value={form.zona}
                    onChange={(e) => setForm({ ...form, zona: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  >
                    {ZONAS_OFS.map(z => (
                      <option key={z.id} value={z.id}>{z.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HORARIOS DE REUNIÓN */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  🕒 Horarios y Días de Reunión
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ej. 1er y 3er sábado de cada mes - 4:30 PM (Reunión formativa y oración comunitaria)"
                  value={form.horarios}
                  onChange={(e) => setForm({ ...form, horarios: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'vertical' }}
                />
              </div>

              {/* CONTACTO Y TELÉFONO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Ministro / Persona de Contacto
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Hno. Carlos Mendoza"
                    value={form.contacto}
                    onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. +51 979 948 528"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* ENLACES WEB Y SOCIAL */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Enlace Web Personalizado
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. /ofs/chiclayo o https://..."
                    value={form.enlaceWeb}
                    onChange={(e) => setForm({ ...form, enlaceWeb: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Redes Sociales (Facebook / Web)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. https://facebook.com/..."
                    value={form.enlaceSocial}
                    onChange={(e) => setForm({ ...form, enlaceSocial: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* ACTIVO EN WEB */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="activoCheckbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="activoCheckbox" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Visible en la página pública de la OFS (/ofs)
                </label>
              </div>

              {/* BOTONES MODAL */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.7rem 1.4rem', borderRadius: '8px' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary"
                  style={{
                    padding: '0.7rem 1.8rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {updating ? 'Guardando...' : (editingId ? '💾 Actualizar' : '➕ Crear Fraternidad')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfsFraternidadesAdminView;
