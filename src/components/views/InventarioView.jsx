import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';

const CATEGORIAS = [
  { id: 'todos', label: 'Todas las Categorías', icon: '📦' },
  { id: 'musica', label: 'Música y Sonido', icon: '🎸' },
  { id: 'campamento', label: 'Campamento y Retiros', icon: '🏕️' },
  { id: 'biblioteca', label: 'Biblioteca Franciscana', icon: '📚' },
  { id: 'liturgia', label: 'Liturgia y Símbolos', icon: '✝️' },
  { id: 'otros', label: 'Otros Enseres', icon: '📦' }
];

const ESTADOS = [
  { id: 'todos', label: 'Todos' },
  { id: 'disponible', label: 'Disponibles' },
  { id: 'prestado', label: 'Prestados' },
  { id: 'mantenimiento', label: 'En Mantenimiento' }
];

const InventarioView = ({ ActivityIndicator, formatSafeDate }) => {
  const [articulos, setArticulos] = useState([]);
  const [stats, setStats] = useState({ total: 0, disponibles: 0, prestados: 0, mantenimiento: 0, atrasados: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articulos'); // 'articulos' | 'historial'

  // Filtros
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Hermanos para selector de préstamos
  const [hermanos, setHermanos] = useState([]);

  // Modales
  const [isArticuloModalOpen, setIsArticuloModalOpen] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState(null);
  const [articuloForm, setArticuloForm] = useState({
    nombre: '',
    categoria: 'musica',
    codigo: '',
    descripcion: '',
    ubicacion: '',
    foto: '',
    estado: 'disponible'
  });

  const [isPrestarModalOpen, setIsPrestarModalOpen] = useState(false);
  const [articuloAPrestar, setArticuloAPrestar] = useState(null);
  const [prestarForm, setPrestarForm] = useState({
    tipoDestinatario: 'hermano', // 'hermano' | 'externo'
    usuarioId: '',
    nombrePersona: '',
    telefonoContacto: '',
    fechaDevolucionEsperada: '',
    observacionesPrestamo: ''
  });

  const [isDevolverModalOpen, setIsDevolverModalOpen] = useState(false);
  const [articuloADevolver, setArticuloADevolver] = useState(null);
  const [observacionesDevolucion, setObservacionesDevolucion] = useState('');

  // Historial
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, herRes] = await Promise.all([
        api.get('/inventario'),
        api.get('/hermanos?todos=true')
      ]);
      setArticulos(invRes.data.articulos || []);
      setStats(invRes.data.stats || { total: 0, disponibles: 0, prestados: 0, mantenimiento: 0, atrasados: 0 });
      setHermanos(herRes.data.hermanos || []);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const res = await api.get('/inventario/prestamos/historial');
      setHistorial(res.data.prestamos || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchHistorial();
    }
  }, [activeTab]);

  // Filtrado en memoria
  const articulosFiltrados = useMemo(() => {
    return articulos.filter(art => {
      if (categoriaFilter !== 'todos' && art.categoria !== categoriaFilter) return false;
      if (estadoFilter !== 'todos' && art.estado !== estadoFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNombre = art.nombre?.toLowerCase().includes(term);
        const matchCodigo = art.codigo?.toLowerCase().includes(term);
        const matchUbicacion = art.ubicacion?.toLowerCase().includes(term);
        const matchPersona = art.prestamoActivo?.nombre_persona?.toLowerCase().includes(term);
        return matchNombre || matchCodigo || matchUbicacion || matchPersona;
      }
      return true;
    });
  }, [articulos, categoriaFilter, estadoFilter, searchTerm]);

  // Handlers Artículo
  const handleOpenArticuloModal = (art = null) => {
    if (art) {
      setEditingArticulo(art);
      setArticuloForm({
        nombre: art.nombre || '',
        categoria: art.categoria || 'musica',
        codigo: art.codigo || '',
        descripcion: art.descripcion || '',
        ubicacion: art.ubicacion || '',
        foto: art.foto || art.foto_url || '',
        estado: art.estado || 'disponible'
      });
    } else {
      setEditingArticulo(null);
      setArticuloForm({
        nombre: '',
        categoria: 'musica',
        codigo: '',
        descripcion: '',
        ubicacion: '',
        foto: '',
        estado: 'disponible'
      });
    }
    setIsArticuloModalOpen(true);
  };

  const handleSaveArticulo = async (e) => {
    e.preventDefault();
    try {
      if (editingArticulo) {
        await api.put(`/inventario/${editingArticulo.id || editingArticulo._id}`, articuloForm);
      } else {
        await api.post('/inventario', articuloForm);
      }
      setIsArticuloModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Error al guardar artículo: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteArticulo = async (art) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${art.nombre}" del inventario?`)) return;
    try {
      await api.delete(`/inventario/${art.id || art._id}`);
      fetchData();
    } catch (err) {
      alert(`Error al eliminar: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handlers Préstamo
  const handleOpenPrestarModal = (art) => {
    setArticuloAPrestar(art);
    // Calcular fecha esperada a 7 días por defecto
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const defaultDate = d.toISOString().split('T')[0];

    setPrestarForm({
      tipoDestinatario: 'hermano',
      usuarioId: '',
      nombrePersona: '',
      telefonoContacto: '',
      fechaDevolucionEsperada: defaultDate,
      observacionesPrestamo: ''
    });
    setIsPrestarModalOpen(true);
  };

  const handleSelectHermano = (e) => {
    const uId = e.target.value;
    const h = hermanos.find(item => (item.id === uId || item._id === uId));
    setPrestarForm(prev => ({
      ...prev,
      usuarioId: uId,
      nombrePersona: h ? `${h.nombre} ${h.apellido}` : '',
      telefonoContacto: h ? (h.telefono || h.contactoEmergencia || '') : ''
    }));
  };

  const handleSavePrestar = async (e) => {
    e.preventDefault();
    if (!articuloAPrestar) return;

    if (prestarForm.tipoDestinatario === 'hermano' && !prestarForm.usuarioId) {
      alert('Por favor selecciona un hermano de la lista.');
      return;
    }
    if (prestarForm.tipoDestinatario === 'externo' && !prestarForm.nombrePersona.trim()) {
      alert('Por favor indica el nombre de la persona que recibe el préstamo.');
      return;
    }

    try {
      await api.post(`/inventario/${articuloAPrestar.id || articuloAPrestar._id}/prestar`, prestarForm);
      setIsPrestarModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Error al registrar préstamo: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handlers Devolución
  const handleOpenDevolverModal = (art) => {
    setArticuloADevolver(art);
    setObservacionesDevolucion('');
    setIsDevolverModalOpen(true);
  };

  const handleSaveDevolver = async (e) => {
    e.preventDefault();
    if (!articuloADevolver) return;
    try {
      await api.post(`/inventario/${articuloADevolver.id || articuloADevolver._id}/devolver`, {
        observacionesDevolucion
      });
      setIsDevolverModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Error al registrar devolución: ${err.response?.data?.message || err.message}`);
    }
  };

  // Helper WhatsApp Recordatorio
  const handleSendWhatsAppReminder = (art) => {
    const prestamo = art.prestamoActivo;
    if (!prestamo) return;

    const nombre = prestamo.usuario?.nombre || prestamo.nombre_persona || 'hermano';
    const tel = (prestamo.usuario?.telefono || prestamo.telefono_contacto || '').replace(/\D/g, '');
    const fecha = prestamo.fecha_devolucion_esperada 
      ? new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString('es-ES')
      : 'pronto';

    const mensaje = `¡Paz y Bien, querido hermano ${nombre}! 🕊️📦\n\nTe saludamos con afecto desde la Fraternidad JUFRA Pomalca. Te escribimos para recordarte amablemente sobre la devolución de: *"${art.nombre}"* que tienes en préstamo (fecha estimada: ${fecha}).\n\n¡Muchas gracias por cuidarlo con espíritu franciscano! Que el Señor te bendiga.`;

    const url = tel 
      ? `https://wa.me/51${tel}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  };

  if (loading && articulos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        {ActivityIndicator ? <ActivityIndicator /> : <div className="spinner"></div>}
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando inventario fraterno...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div className="flex-responsive" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📦</span> Inventario Fraterno y Préstamos
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Control exclusivo de equipos, instrumentos, libros y bienes de la fraternidad.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleOpenArticuloModal()}
            className="btn btn-primary zoom-hover"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
          >
            <span>➕</span> Registrar Artículo
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total de Artículos</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {stats.total}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Disponibles</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {stats.disponibles}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>En Préstamo</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {stats.prestados}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Préstamos Vencidos</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stats.atrasados > 0 ? '#ef4444' : 'var(--text-muted)', marginTop: '4px' }}>
            {stats.atrasados}
          </div>
        </div>
      </div>

      {/* Selector de Pestaña Principal */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('articulos')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'articulos' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'articulos' ? 'var(--primary)' : 'var(--text-muted)',
            marginBottom: '-2px'
          }}
        >
          📦 Catálogo de Artículos ({articulosFiltrados.length})
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'historial' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'historial' ? 'var(--primary)' : 'var(--text-muted)',
            marginBottom: '-2px'
          }}
        >
          📋 Historial de Préstamos
        </button>
      </div>

      {activeTab === 'articulos' && (
        <>
          {/* Barra de Filtros y Búsqueda */}
          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flex: '1 1 280px', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, código o ubicación..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={categoriaFilter}
                onChange={e => setCategoriaFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>

              <select
                value={estadoFilter}
                onChange={e => setEstadoFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              >
                {ESTADOS.map(st => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grilla de Artículos */}
          {articulosFiltrados.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <span style={{ fontSize: '3rem', opacity: 0.4 }}>📦</span>
              <h3 style={{ color: 'var(--text-muted)', margin: '1rem 0 0.5rem' }}>No se encontraron artículos</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                Prueba ajustando los filtros o registra un nuevo artículo en el inventario.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {articulosFiltrados.map(art => {
                const esPrestado = art.estado === 'prestado';
                const esMantenimiento = art.estado === 'mantenimiento';
                const prestamo = art.prestamoActivo;

                // Verificar si está vencido
                const hoyStr = new Date().toISOString().split('T')[0];
                const estaAtrasado = esPrestado && prestamo?.fecha_devolucion_esperada && prestamo.fecha_devolucion_esperada < hoyStr;

                return (
                  <div
                    key={art.id || art._id}
                    className="glass-card zoom-hover animate-fade"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `5px solid ${estaAtrasado ? '#ef4444' : esPrestado ? '#f59e0b' : esMantenimiento ? '#9ca3af' : '#10b981'}`
                    }}
                  >
                    <div>
                      {/* Cabecera del artículo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: 'rgba(0,0,0,0.05)',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          {art.codigo || 'SIN CÓDIGO'}
                        </span>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '12px',
                          background: estaAtrasado ? '#fee2e2' : esPrestado ? '#fef3c7' : esMantenimiento ? '#f3f4f6' : '#dcfce7',
                          color: estaAtrasado ? '#b91c1c' : esPrestado ? '#b45309' : esMantenimiento ? '#4b5563' : '#15803d'
                        }}>
                          {estaAtrasado ? '⚠️ VENCIDO' : esPrestado ? '🤝 PRESTADO' : esMantenimiento ? '🛠️ MANTENIMIENTO' : '✅ DISPONIBLE'}
                        </span>
                      </div>

                      {/* Título y detalles */}
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--text-main)' }}>
                        {art.nombre}
                      </h3>

                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span>
                          <strong>Categoría:</strong> {CATEGORIAS.find(c => c.id === art.categoria)?.label || art.categoria}
                        </span>
                        {art.ubicacion && (
                          <span>
                            <strong>📍 Ubicación:</strong> {art.ubicacion}
                          </span>
                        )}
                        {art.descripcion && (
                          <p style={{ margin: '6px 0 0', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                            "{art.descripcion}"
                          </p>
                        )}
                      </div>

                      {/* Información de Préstamo Activo */}
                      {esPrestado && prestamo && (
                        <div style={{
                          background: estaAtrasado ? '#fff1f2' : '#fffbeb',
                          border: `1px solid ${estaAtrasado ? '#fecdd3' : '#fde68a'}`,
                          borderRadius: '8px',
                          padding: '10px 12px',
                          marginTop: '10px',
                          fontSize: '0.825rem'
                        }}>
                          <div style={{ fontWeight: 700, color: estaAtrasado ? '#9f1239' : '#92400e', marginBottom: '4px' }}>
                            En manos de: {prestamo.usuario ? `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}` : prestamo.nombre_persona}
                          </div>
                          <div style={{ color: '#78716c', fontSize: '0.78rem' }}>
                            Fecha entrega: {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES')}
                          </div>
                          {prestamo.fecha_devolucion_esperada && (
                            <div style={{ color: estaAtrasado ? '#e11d48' : '#b45309', fontWeight: 600, fontSize: '0.78rem' }}>
                              Devolver antes de: {new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString('es-ES')}
                            </div>
                          )}
                          {prestamo.observaciones_prestamo && (
                            <div style={{ fontStyle: 'italic', marginTop: '4px', fontSize: '0.75rem', color: '#78716c' }}>
                              Nota: {prestamo.observaciones_prestamo}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!esPrestado && (
                          <button
                            onClick={() => handleOpenPrestarModal(art)}
                            className="btn"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.825rem',
                              fontWeight: 700,
                              background: '#f59e0b',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            🤝 Prestar
                          </button>
                        )}

                        {esPrestado && (
                          <>
                            <button
                              onClick={() => handleOpenDevolverModal(art)}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              📥 Devolver
                            </button>

                            <button
                              onClick={() => handleSendWhatsAppReminder(art)}
                              className="btn"
                              title="Enviar recordatorio por WhatsApp"
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.825rem',
                                background: '#25D366',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              💬 WhatsApp
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenArticuloModal(art)}
                          className="btn"
                          title="Editar"
                          style={{ padding: '6px 8px', fontSize: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteArticulo(art)}
                          className="btn"
                          title="Eliminar"
                          style={{ padding: '6px 8px', fontSize: '0.8rem', background: '#fee2e2', border: '1px solid #fecdd3', color: '#b91c1c', borderRadius: '6px', cursor: 'pointer' }}
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
        </>
      )}

      {/* Pestaña: Historial de Préstamos */}
      {activeTab === 'historial' && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--primary)', fontSize: '1.15rem' }}>
            Registro Histórico de Préstamos y Devoluciones
          </h3>

          {loadingHistorial ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              No hay préstamos registrados aún.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 8px' }}>Artículo</th>
                  <th style={{ padding: '10px 8px' }}>Hermano / Solicitante</th>
                  <th style={{ padding: '10px 8px' }}>Fecha Salida</th>
                  <th style={{ padding: '10px 8px' }}>Fecha Prevista</th>
                  <th style={{ padding: '10px 8px' }}>Fecha Retorno</th>
                  <th style={{ padding: '10px 8px' }}>Estado</th>
                  <th style={{ padding: '10px 8px' }}>Registrado Por</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                      {item.articulo_nombre}
                      {item.articulo_codigo && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>[{item.articulo_codigo}]</span>}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.usuario_nombre ? `${item.usuario_nombre} ${item.usuario_apellido || ''}` : item.nombre_persona}
                      {item.telefono_contacto && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>📞 {item.telefono_contacto}</span>}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {new Date(item.fecha_prestamo).toLocaleDateString('es-ES')}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.fecha_devolucion_esperada ? new Date(item.fecha_devolucion_esperada).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {item.fecha_devolucion_real ? new Date(item.fecha_devolucion_real).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.estado === 'activo' ? '#fef3c7' : '#dcfce7',
                        color: item.estado === 'activo' ? '#b45309' : '#15803d'
                      }}>
                        {item.estado === 'activo' ? 'EN PRÉSTAMO' : 'DEVUELTO'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>
                      {item.registrador_nombre ? `${item.registrador_nombre} ${item.registrador_apellido || ''}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL 1: Registrar o Editar Artículo */}
      {isArticuloModalOpen && (
        <div className="modal-overlay" onClick={() => setIsArticuloModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '520px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.25rem', color: 'var(--primary)' }}>
              {editingArticulo ? '✏️ Editar Artículo' : '➕ Registrar Artículo en Inventario'}
            </h3>

            <form onSubmit={handleSaveArticulo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Nombre del Artículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Guitarra Yamaha acústica, Carpa 4 personas..."
                  value={articuloForm.nombre}
                  onChange={e => setArticuloForm({ ...articuloForm, nombre: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Categoría</label>
                  <select
                    value={articuloForm.categoria}
                    onChange={e => setArticuloForm({ ...articuloForm, categoria: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  >
                    {CATEGORIAS.filter(c => c.id !== 'todos').map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Código Interno</label>
                  <input
                    type="text"
                    placeholder="Ej: EQ-001, LIB-05"
                    value={articuloForm.codigo}
                    onChange={e => setArticuloForm({ ...articuloForm, codigo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Ubicación</label>
                  <input
                    type="text"
                    placeholder="Ej: Armario 1, Sacristía..."
                    value={articuloForm.ubicacion}
                    onChange={e => setArticuloForm({ ...articuloForm, ubicacion: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Estado</label>
                  <select
                    value={articuloForm.estado}
                    onChange={e => setArticuloForm({ ...articuloForm, estado: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  >
                    <option value="disponible">✅ Disponible</option>
                    <option value="prestado">🤝 Prestado</option>
                    <option value="mantenimiento">🛠️ En Mantenimiento</option>
                    <option value="baja">❌ Dado de baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Descripción / Observaciones</label>
                <textarea
                  rows="2"
                  placeholder="Detalles sobre el estado físico, accesorios o características..."
                  value={articuloForm.descripcion}
                  onChange={e => setArticuloForm({ ...articuloForm, descripcion: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsArticuloModalOpen(false)}
                  className="btn"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 'bold' }}>
                  {editingArticulo ? 'Guardar Cambios' : 'Registrar Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Registrar Préstamo */}
      {isPrestarModalOpen && articuloAPrestar && (
        <div className="modal-overlay" onClick={() => setIsPrestarModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', color: 'var(--primary)' }}>
              🤝 Registrar Préstamo
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1.25rem', fontSize: '0.875rem' }}>
              Artículo: <strong>{articuloAPrestar.nombre}</strong>
            </p>

            <form onSubmit={handleSavePrestar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  ¿A quién se le presta?
                </label>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tipoDest"
                      checked={prestarForm.tipoDestinatario === 'hermano'}
                      onChange={() => setPrestarForm({ ...prestarForm, tipoDestinatario: 'hermano' })}
                    />
                    Hermano de la JUFRA
                  </label>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tipoDest"
                      checked={prestarForm.tipoDestinatario === 'externo'}
                      onChange={() => setPrestarForm({ ...prestarForm, tipoDestinatario: 'externo', usuarioId: '' })}
                    />
                    Persona o Grupo Externo
                  </label>
                </div>

                {prestarForm.tipoDestinatario === 'hermano' ? (
                  <select
                    required
                    value={prestarForm.usuarioId}
                    onChange={handleSelectHermano}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  >
                    <option value="">-- Seleccionar hermano del directorio --</option>
                    {hermanos.filter(h => h.activo).map(h => (
                      <option key={h.id || h._id} value={h.id || h._id}>
                        {h.nombre} {h.apellido} {h.cargo && h.cargo !== 'ninguno' ? `(${h.cargo})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo de la persona o grupo responsable..."
                    value={prestarForm.nombrePersona}
                    onChange={e => setPrestarForm({ ...prestarForm, nombrePersona: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: 987654321"
                    value={prestarForm.telefonoContacto}
                    onChange={e => setPrestarForm({ ...prestarForm, telefonoContacto: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Devolver antes de *</label>
                  <input
                    type="date"
                    required
                    value={prestarForm.fechaDevolucionEsperada}
                    onChange={e => setPrestarForm({ ...prestarForm, fechaDevolucionEsperada: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Motivo / Observaciones del Préstamo</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Para el retiro de pascua, para la misa dominical..."
                  value={prestarForm.observacionesPrestamo}
                  onChange={e => setPrestarForm({ ...prestarForm, observacionesPrestamo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPrestarModalOpen(false)}
                  className="btn"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 'bold' }}>
                  Confirmar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Devolución */}
      {isDevolverModalOpen && articuloADevolver && (
        <div className="modal-overlay" onClick={() => setIsDevolverModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxWidth: '460px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', color: 'var(--primary)' }}>
              📥 Registrar Devolución
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1.25rem', fontSize: '0.875rem' }}>
              Artículo: <strong>{articuloADevolver.nombre}</strong>
            </p>

            <form onSubmit={handleSaveDevolver} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Estado de recepción / Observaciones
                </label>
                <textarea
                  rows="3"
                  placeholder="Ej: Devuelto en perfectas condiciones, con cable y funda completa..."
                  value={observacionesDevolucion}
                  onChange={e => setObservacionesDevolucion(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsDevolverModalOpen(false)}
                  className="btn"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none' }}
                >
                  Marcar como Devuelto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioView;
