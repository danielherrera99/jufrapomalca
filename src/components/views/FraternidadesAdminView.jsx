import React, { useState, useMemo } from 'react';
import api from '../../config/api';

// Lista oficial de departamentos del Perú
const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 
  'Tumbes', 'Ucayali'
].sort();

const FraternidadesAdminView = ({ fraternidades = [], loading, fetchData }) => {
  const [updating, setUpdating] = useState(false);
  const [zonaFilter, setZonaFilter] = useState('todas');
  const [deptoFilter, setDeptoFilter] = useState('todos');

  // Control de Modales locales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = nuevo, id = editando

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    departamento: '',
    parroquia: '',
    zona: 'centro',
    contacto: '',
    telefono: '',
    enlaceSocial: ''
  });

  // Calcular estadísticas para los KPI
  const stats = useMemo(() => {
    return {
      total: fraternidades.length,
      norte: fraternidades.filter(f => f.zona === 'norte').length,
      centro: fraternidades.filter(f => f.zona === 'centro').length,
      lima_callao_sur_medio: fraternidades.filter(f => f.zona === 'lima_callao_sur_medio').length,
      sur_altiplano: fraternidades.filter(f => f.zona === 'sur_altiplano').length,
    };
  }, [fraternidades]);

  // Lista única de departamentos que realmente tienen fraternidades para el filtro rápido
  const departamentosActivos = useMemo(() => {
    const deptos = fraternidades.map(f => f.departamento).filter(Boolean);
    return [...new Set(deptos)].sort();
  }, [fraternidades]);

  // Filtrar fraternidades por zona y departamento (la barra de búsqueda ya viene pre-filtrada desde App.jsx)
  const displayedFraternidades = useMemo(() => {
    return fraternidades.filter(f => {
      if (zonaFilter !== 'todas' && f.zona !== zonaFilter) return false;
      if (deptoFilter !== 'todos' && f.departamento !== deptoFilter) return false;
      return true;
    });
  }, [fraternidades, zonaFilter, deptoFilter]);

  // Abrir modal para crear nuevo registro
  const handleOpenNewModal = () => {
    setEditingId(null);
    setForm({
      nombre: '',
      departamento: 'Lambayeque', // Valor por defecto amigable
      parroquia: '',
      zona: 'centro',
      contacto: '',
      telefono: '',
      enlaceSocial: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditModal = (fraternidad) => {
    setEditingId(fraternidad._id);
    setForm({
      nombre: fraternidad.nombre || '',
      departamento: fraternidad.departamento || '',
      parroquia: fraternidad.parroquia || '',
      zona: fraternidad.zona || 'centro',
      contacto: fraternidad.contacto || '',
      telefono: fraternidad.telefono || '',
      enlaceSocial: fraternidad.enlaceSocial || ''
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.departamento || !form.zona) {
      alert('Por favor, completa los campos requeridos: Nombre, Departamento y Zona.');
      return;
    }

    setUpdating(true);
    try {
      if (editingId) {
        // Editar
        await api.put(`/fraternidades/${editingId}`, form);
        alert('Fraternidad actualizada con éxito ✅');
      } else {
        // Crear
        await api.post('/fraternidades', form);
        alert('Fraternidad registrada con éxito ✅');
      }
      setIsModalOpen(false);
      fetchData(); // Recargar datos globales
    } catch (err) {
      console.error(err);
      alert('Error al guardar la fraternidad: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  // Eliminar fraternidad
  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás totalmente seguro de que deseas eliminar la fraternidad "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setUpdating(true);
    try {
      await api.delete(`/fraternidades/${id}`);
      alert('Fraternidad eliminada ✅');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la fraternidad.');
    } finally {
      setUpdating(false);
    }
  };

  // Generar link de WhatsApp seguro
  const getWhatsAppLink = (tel, nombre) => {
    if (!tel) return '';
    const cleanNumber = tel.replace(/\D/g, ''); // Solo dígitos
    const finalNumber = cleanNumber.length === 9 ? `51${cleanNumber}` : cleanNumber;
    const message = `¡Paz y Bien! Hermanos de la Fraternidad ${nombre}, les saludamos de la JUFRA Pomalca. 🕊️`;
    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
  };

  // Obtener colores por zona
  const getZonaStyles = (zona) => {
    switch (zona) {
      case 'norte':
        return {
          bg: 'rgba(139, 90, 43, 0.1)', // Marrón suave
          color: '#8B5A2B',
          border: 'rgba(139, 90, 43, 0.3)'
        };
      case 'centro':
        return {
          bg: 'rgba(217, 119, 6, 0.1)', // Ocre / Ámbar
          color: '#D97706',
          border: 'rgba(217, 119, 6, 0.3)'
        };
      case 'lima_callao_sur_medio':
        return {
          bg: 'rgba(26, 82, 118, 0.1)', // Ocean Blue
          color: '#1A5276',
          border: 'rgba(26, 82, 118, 0.3)'
        };
      case 'sur_altiplano':
        return {
          bg: 'rgba(108, 52, 131, 0.1)', // Purple Highland
          color: '#6C3483',
          border: 'rgba(108, 52, 131, 0.3)'
        };
      case 'sur':
        return {
          bg: 'rgba(21, 128, 61, 0.1)', // Verde Oliva (Fallback)
          color: '#15803D',
          border: 'rgba(21, 128, 61, 0.3)'
        };
      default:
        return {
          bg: 'rgba(107, 114, 128, 0.1)',
          color: '#6B7280',
          border: 'rgba(107, 114, 128, 0.3)'
        };
    }
  };

  if (loading && fraternidades.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="spinner" style={{ marginBottom: '1rem' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando fraternidades nacionales...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* 1. KPIs Section */}
      <div className="responsive-grid" style={{ '--grid-min': '180px', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* KPI Total */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid var(--primary)', cursor: 'pointer' }} onClick={() => { setZonaFilter('todas'); setDeptoFilter('todos'); }}>
          <span style={{ fontSize: '1.8rem' }}>🇵🇪</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Fraternidades</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.total}</span>
        </div>
        {/* KPI Norte */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #8B5A2B', cursor: 'pointer' }} onClick={() => setZonaFilter('norte')}>
          <span style={{ fontSize: '1.8rem' }}>🪵</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Región Norte</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8B5A2B' }}>{stats.norte}</span>
        </div>
        {/* KPI Centro */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #D97706', cursor: 'pointer' }} onClick={() => setZonaFilter('centro')}>
          <span style={{ fontSize: '1.8rem' }}>☀️</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Región Centro</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#D97706' }}>{stats.centro}</span>
        </div>
        {/* KPI Lima, Callao y Sur Medio */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #1A5276', cursor: 'pointer' }} onClick={() => setZonaFilter('lima_callao_sur_medio')}>
          <span style={{ fontSize: '1.8rem' }}>🌊</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Región Lima/Callao/SurM.</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1A5276' }}>{stats.lima_callao_sur_medio}</span>
        </div>
        {/* KPI Sur Altiplano */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #6C3483', cursor: 'pointer' }} onClick={() => setZonaFilter('sur_altiplano')}>
          <span style={{ fontSize: '1.8rem' }}>🏔️</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Región Sur Altiplano</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#6C3483' }}>{stats.sur_altiplano}</span>
        </div>
      </div>

      {/* 2. Toolbar & Filters */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Tabs selector de Zonas */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '12px', padding: '4px', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'todas', label: 'Todas', count: stats.total },
              { id: 'norte', label: '🪵 Norte', count: stats.norte },
              { id: 'centro', label: '☀️ Centro', count: stats.centro },
              { id: 'lima_callao_sur_medio', label: '🌊 Lima, Callao y Sur Medio', count: stats.lima_callao_sur_medio },
              { id: 'sur_altiplano', label: '🏔️ Sur Altiplano', count: stats.sur_altiplano },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setZonaFilter(tab.id)}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: zonaFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: zonaFilter === tab.id ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Acciones principales */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn zoom-hover btn-primary"
              onClick={handleOpenNewModal}
              style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', border: 'none', boxShadow: '0 4px 12px rgba(139, 90, 43, 0.3)' }}
            >
              ➕ Nueva Fraternidad
            </button>
          </div>
        </div>

        {/* Selector de Departamento */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Filtrar por Departamento:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              onClick={() => setDeptoFilter('todos')}
              style={{
                border: '1px solid var(--border)',
                background: deptoFilter === 'todos' ? 'var(--secondary)' : 'white',
                color: deptoFilter === 'todos' ? 'white' : 'var(--text-main)',
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              Todos ({stats.total})
            </button>
            {departamentosActivos.map(dep => {
              const count = fraternidades.filter(f => f.departamento === dep).length;
              return (
                <button
                  key={dep}
                  onClick={() => setDeptoFilter(dep)}
                  style={{
                    border: '1px solid var(--border)',
                    background: deptoFilter === dep ? 'var(--secondary)' : 'white',
                    color: deptoFilter === dep ? 'white' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  📍 {dep} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Cards Grid */}
      {displayedFraternidades.length === 0 ? (
        <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>🗺️</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No se encontraron fraternidades</h3>
          <p style={{ color: 'var(--text-muted)' }}>No hay registros que coincidan con la zona y filtros actuales.</p>
        </div>
      ) : (
        <div className="responsive-grid" style={{ '--grid-min': '320px', gap: '1.5rem' }}>
          {displayedFraternidades.map(frat => {
            const zStyle = getZonaStyles(frat.zona);
            return (
              <div 
                key={frat._id} 
                className="glass-card zoom-hover animate-fade" 
                style={{ 
                  position: 'relative', 
                  padding: '1.5rem', 
                  borderTop: `4px solid ${zStyle.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '270px'
                }}
              >
                {/* Card Header & Content */}
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 'bold', width: '100%' }}>
                      {frat.nombre}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        📍 {frat.departamento}
                      </span>
                      {/* Badge de Zona */}
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.62rem', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: zStyle.bg,
                        color: zStyle.color,
                        border: `1px solid ${zStyle.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {
                          frat.zona === 'lima_callao_sur_medio' ? '🌊 Lima, Callao y S.M.' :
                          frat.zona === 'sur_altiplano' ? '🏔️ Sur Altiplano' :
                          frat.zona === 'norte' ? '🪵 Norte' :
                          frat.zona === 'centro' ? '☀️ Centro' :
                          `Zona ${frat.zona}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div style={{ margin: '1rem 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-main)' }}>
                    {frat.parroquia && (
                      <p style={{ margin: 0 }}>
                        🏛️ <strong>Sede:</strong> {frat.parroquia}
                      </p>
                    )}
                    {frat.contacto && (
                      <p style={{ margin: 0 }}>
                        👤 <strong>Contacto:</strong> {frat.contacto}
                      </p>
                    )}
                    {frat.telefono && (
                      <p style={{ margin: 0 }}>
                        📞 <strong>Teléfono:</strong> <span style={{ fontFamily: 'var(--mono)', letterSpacing: '0.5px' }}>{frat.telefono}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons / Contact / Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  
                  {/* Botones de Contacto en Redes */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {frat.telefono && (
                      <a 
                        href={getWhatsAppLink(frat.telefono, frat.nombre)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn zoom-hover"
                        style={{ 
                          flex: 1,
                          backgroundColor: '#25D366', 
                          color: 'white', 
                          textDecoration: 'none', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold', 
                          padding: '0.5rem', 
                          borderRadius: '8px',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    {frat.enlaceSocial && (
                      <a 
                        href={frat.enlaceSocial} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn zoom-hover"
                        style={{ 
                          flex: 1,
                          backgroundColor: '#1877F2', 
                          color: 'white', 
                          textDecoration: 'none', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold', 
                          padding: '0.5rem', 
                          borderRadius: '8px',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        🌐 Red Social
                      </a>
                    )}
                  </div>

                  {/* Botones de Modificación Administrativa */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
                    <button 
                      onClick={() => handleOpenEditModal(frat)}
                      className="btn zoom-hover"
                      style={{ 
                        flex: 1, 
                        background: 'rgba(139, 90, 43, 0.1)', 
                        color: 'var(--primary)', 
                        border: '1px solid rgba(139, 90, 43, 0.2)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(frat._id, frat.nombre)}
                      className="btn zoom-hover"
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#EF4444', 
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '35px',
                        height: '32px'
                      }}
                      title="Eliminar Fraternidad"
                    >
                      🗑️
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL CRUD LOCAL (Premium Glassmorphic Design) */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
          <div className="glass-card animate-fade" style={{ maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.6rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {editingId ? '✏️ Editar Fraternidad' : '➕ Nueva Fraternidad Nacional'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="input-group">
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Nombre de la Fraternidad <span style={{ color: '#EF4444' }}>*</span></label>
                <input 
                  type="text" 
                  value={form.nombre} 
                  onChange={e => setForm({...form, nombre: e.target.value})} 
                  required 
                  placeholder="Ej: JUFRA Santa Rosa de Lima"
                  style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem' }}
                />
              </div>

              <div className="responsive-grid" style={{ '--grid-min': '200px', gap: '1rem' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Departamento <span style={{ color: '#EF4444' }}>*</span></label>
                  <select 
                    value={form.departamento} 
                    onChange={e => setForm({...form, departamento: e.target.value})}
                    required
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem', background: 'white' }}
                  >
                    <option value="" disabled>Selecciona un Departamento</option>
                    {DEPARTAMENTOS_PERU.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Zona Geográfica <span style={{ color: '#EF4444' }}>*</span></label>
                  <select 
                    value={form.zona} 
                    onChange={e => setForm({...form, zona: e.target.value})}
                    required
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem', background: 'white' }}
                  >
                    <option value="norte">🪵 Región Norte</option>
                    <option value="centro">☀️ Región Centro</option>
                    <option value="lima_callao_sur_medio">🌊 Región Lima, Callao y Sur Medio</option>
                    <option value="sur_altiplano">🏔️ Región Sur Altiplano</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Sede Parroquial / Templo (Opcional)</label>
                <input 
                  type="text" 
                  value={form.parroquia} 
                  onChange={e => setForm({...form, parroquia: e.target.value})} 
                  placeholder="Ej: Parroquia San Francisco de Asís"
                  style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem' }}
                />
              </div>

              <div className="responsive-grid" style={{ '--grid-min': '200px', gap: '1rem' }}>
                <div className="input-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Hermano de Contacto (Opcional)</label>
                  <input 
                    type="text" 
                    value={form.contacto} 
                    onChange={e => setForm({...form, contacto: e.target.value})} 
                    placeholder="Ej: Hno. Juan Pérez"
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem' }}
                  />
                </div>

                <div className="input-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Celular/Teléfono (Opcional)</label>
                  <input 
                    type="text" 
                    value={form.telefono} 
                    onChange={e => setForm({...form, telefono: e.target.value})} 
                    placeholder="Ej: 987654321"
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Enlace de Red Social (Facebook/Instagram) (Opcional)</label>
                <input 
                  type="url" 
                  value={form.enlaceSocial} 
                  onChange={e => setForm({...form, enlaceSocial: e.target.value})} 
                  placeholder="Ej: https://facebook.com/jufra.santarosa"
                  style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '0.6rem' }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-logout" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={updating}
                  style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={updating}
                  style={{ width: 'auto', padding: '0.6rem 2rem', border: 'none', background: 'var(--primary)', boxShadow: '0 4px 10px rgba(139, 90, 43, 0.3)' }}
                >
                  {updating ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Registrar')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraternidadesAdminView;
