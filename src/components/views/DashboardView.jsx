import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import api from '../../config/api';

export const resolveEtapa = (h) => {
  if (!h) return 'aspirante';

  // 1. Si tiene etapaFormacion o etapa_formacion explícita, normalizarla
  const rawEtapa = String(h.etapaFormacion || h.etapa_formacion || h.etapa || '').toLowerCase().trim();
  if (rawEtapa.includes('prome')) return 'promesado';
  if (rawEtapa.includes('formaci')) return 'en_formacion';
  if (rawEtapa.includes('inici')) return 'iniciado';
  if (rawEtapa.includes('aspir') || rawEtapa.includes('acogi')) return 'aspirante';

  // 2. Si tiene fecha de promesa registrada, es Promesado
  if (h.fechaPromesa || h.fecha_promesa) return 'promesado';

  // 3. Si tiene cargo en el consejo o es administrador
  const cargo = String(h.cargo || '').toLowerCase().trim();
  if (['coordinador', 'vice-coordinador', 'secretario', 'tesorero', 'formador'].includes(cargo)) {
    return 'promesado';
  }
  if (cargo === 'animador') {
    return 'en_formacion';
  }
  const rol = String(h.rol || '').toLowerCase().trim();
  if (['admin', 'consejo', 'superadmin', 'admin_nacional'].includes(rol)) {
    return 'promesado';
  }

  // 4. Si tiene fecha de ingreso o creación, deducir según tiempo en la fraternidad (Estatutos JUFRA)
  const fechaIngreso = h.fechaIngreso || h.fecha_ingreso || h.createdAt || h.created_at;
  if (fechaIngreso) {
    const meses = (new Date() - new Date(fechaIngreso)) / (1000 * 60 * 60 * 24 * 30.44);
    if (!isNaN(meses)) {
      if (meses >= 24) return 'promesado';
      if (meses >= 9) return 'en_formacion';
      if (meses >= 3) return 'iniciado';
      return 'aspirante';
    }
  }

  return 'aspirante';
};

const etapaBadgeMap = {
  'aspirante': { label: 'Aspirante', bg: '#F1F5F9', color: '#475569' },
  'iniciado': { label: 'Iniciado(a)', bg: '#E0F2FE', color: '#0369A1' },
  'en_formacion': { label: 'En Formación', bg: '#FEF3C7', color: '#B45309' },
  'promesado': { label: 'Promesado(a)', bg: '#DCFCE7', color: '#15803D' }
};

const DashboardView = ({ user, formatSafeDate, setActiveTab, ActivityIndicator, setIsModalOpen, handleApprove }) => {
  const esConsejo = ['admin', 'superadmin', 'admin_nacional', 'consejo'].includes(user?.rol);
  const [data, setData] = useState({ hermanos: [], anuncios: [], eventos: [], asistencias: [], peticiones: [], metricas: null });
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hermanosRes, anunciosRes, eventosRes, asisRes, peticionesRes, metricasRes] = await Promise.all([
          api.get('/hermanos?todos=true'),
          api.get('/anuncios'),
          api.get('/eventos?todos=true'),
          api.get('/asistencia'),
          api.get('/peticiones').catch(() => ({ data: { peticiones: [] } })),
          api.get('/metricas-sociales').catch(() => ({ data: { data: {} } }))
        ]);
        setData({
          hermanos: hermanosRes.data.hermanos || [],
          anuncios: anunciosRes.data.anuncios || [],
          eventos: eventosRes.data.eventos || [],
          asistencias: asisRes.data.asistencias || (Array.isArray(asisRes.data) ? asisRes.data : []),
          peticiones: peticionesRes.data?.peticiones || (Array.isArray(peticionesRes.data) ? peticionesRes.data : []),
          metricas: metricasRes?.data?.data || {}
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Procesamiento de Datos para Gráficos
  const chartData = useMemo(() => {
    if (!data) return { attendance: [], distribution: [], birthdays: [] };

    // 1. Procesar Asistencia (Tendencia)
    const attendanceMap = {};
    (data.asistencias || []).forEach(asis => {
      const date = formatSafeDate(asis.fecha, 'dd/MM');
      const count = asis.presentes?.length ?? (asis.presente || asis.estado === 'presente' ? 1 : 0);
      attendanceMap[date] = (attendanceMap[date] || 0) + count;
    });
    
    const attendance = Object.keys(attendanceMap).map(date => ({
      name: date,
      asistencia: attendanceMap[date]
    })).slice(-7);

    // 2. Procesar Etapas de Formación (Datos Reales y Deducidos)
    const stagesMap = {
      'aspirante': { name: 'Aspirantes', value: 0, color: '#94A3B8' },
      'iniciado': { name: 'Iniciados', value: 0, color: '#0EA5E9' },
      'en_formacion': { name: 'En Formación', value: 0, color: '#F59E0B' },
      'promesado': { name: 'Promesados', value: 0, color: '#16A34A' }
    };

    const birthdays = [];
    const todayStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

    (data.hermanos || []).forEach(h => {
      const etapa = resolveEtapa(h);
      if (stagesMap[etapa]) stagesMap[etapa].value++;

      if (h.fechaNacimiento || h.fecha_nacimiento) {
        const bdayStr = new Date(h.fechaNacimiento || h.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        if (bdayStr === todayStr) birthdays.push(h);
      }
    });

    const distribution = Object.values(stagesMap).filter(s => s.value > 0);

    return { attendance, distribution, birthdays };
  }, [data, formatSafeDate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}><ActivityIndicator /> Generando resumen del panel...</div>;
  
  const totalHermanos = data.hermanos?.length || 0;
  const activos = data.hermanos?.filter(h => h.activo)?.length || 0;
  const pendientes = totalHermanos - activos;
  const proxEvento = (data.eventos || [])
    .filter(e => new Date(e.fecha) >= new Date())
    .sort((a,b) => new Date(a.fecha) - new Date(b.fecha))[0];
  const ultimosAnuncios = (data.anuncios || []).slice(0, 3);

  return (
    <div className="animate-fade">
      <div className="flex-responsive" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>Paz y Bien, {user?.nombre || 'Hermano'} <span className="waving-hand">👋</span></h2>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Aquí tienes el resumen actual de la fraternidad.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Alertas Comunitarias (Cumpleaños) */}
      {chartData.birthdays.length > 0 && (
        <div className="glass-card animate-fade" style={{ background: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', border: '1px solid #FDA4AF', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2rem' }}>🎂</span>
          <div>
            <h4 style={{ margin: 0, color: '#BE123C' }}>¡Hoy tenemos fiesta en la fraternidad!</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#E11D48' }}>
              Cumpleaños de: {chartData.birthdays.map((h, i) => (
                <strong key={h._id}>{h.nombre} {h.apellido}{i < chartData.birthdays.length - 1 ? ', ' : ''}</strong>
              ))}
            </p>
          </div>
        </div>
      )}
      
      {/* ======================================================== */}
      {/* 1. VISTA EXCLUSIVA PARA HERMANOS MIEMBROS (!esConsejo)    */}
      {/* ======================================================== */}
      {!esConsejo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Tarjeta Personal: Mi Caminar Seráfico */}
          <div 
            className="glass-card zoom-hover"
            style={{
              background: 'linear-gradient(135deg, #2b1d14 0%, #17110c 100%)',
              color: '#fff',
              padding: '2rem',
              borderRadius: '20px',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Resplandor ámbar */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)',
                border: '2px solid rgba(254, 243, 199, 0.3)'
              }}>
                {user?.nombre?.charAt(0) || 'H'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', fontWeight: 800 }}>
                    {user?.nombre} {user?.apellido}
                  </h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: (etapaBadgeMap[resolveEtapa(user)] || etapaBadgeMap.aspirante).bg,
                    color: (etapaBadgeMap[resolveEtapa(user)] || etapaBadgeMap.aspirante).color
                  }}>
                    {(etapaBadgeMap[resolveEtapa(user)] || etapaBadgeMap.aspirante).label}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#fed7aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍 {user?.fraternidadNombre || 'JUFRA Pomalca'}</span>
                  <span>·</span>
                  <span>🕊️ Hermano en Cristo</span>
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#d6d3d1', fontStyle: 'italic', maxWidth: '520px' }}>
                  «Comienza haciendo lo que es necesario, después lo que es posible y de repente estarás haciendo lo imposible.» — San Francisco de Asís
                </p>
              </div>
            </div>

            {user?.codigoQR && (
              <button
                onClick={() => setShowQRModal(true)}
                className="zoom-hover"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#18110b',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                  zIndex: 1
                }}
              >
                <span>📱</span>
                <span>Mi Código QR</span>
              </button>
            )}
          </div>

          {/* Grid de 4 Atajos Fraternos */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {/* Próximo Encuentro */}
            <div 
              onClick={() => setActiveTab('Eventos')}
              className="glass-card zoom-hover"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderLeft: '5px solid #6366F1',
                background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.4rem' }}>📅</div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#4338CA', fontWeight: 700, letterSpacing: '0.5px' }}>PRÓXIMA CITA</p>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', color: '#1E1B4B', fontWeight: 800 }}>
                    {proxEvento ? formatSafeDate(proxEvento.fecha, 'dd MMM') : 'Encuentro Sabatino'}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#6366F1', fontWeight: 600 }}>Ver calendario →</p>
                </div>
              </div>
            </div>

            {/* Avisos Oficiales */}
            <div 
              onClick={() => setActiveTab('Anuncios')}
              className="glass-card zoom-hover"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderLeft: '5px solid #F59E0B',
                background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.4rem' }}>📢</div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#B45309', fontWeight: 700, letterSpacing: '0.5px' }}>AVISOS Y NOTICIAS</p>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', color: '#78350F', fontWeight: 800 }}>
                    {data.anuncios?.length || 0} comunicados
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Leer anuncios →</p>
                </div>
              </div>
            </div>

            {/* Peticiones de Oración */}
            <div 
              onClick={() => setActiveTab('Peticiones')}
              className="glass-card zoom-hover"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderLeft: '5px solid #EC4899',
                background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.4rem' }}>🙏</div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#BE185D', fontWeight: 700, letterSpacing: '0.5px' }}>ORACIÓN COMUNITARIA</p>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', color: '#831843', fontWeight: 800 }}>
                    {data.peticiones?.length || 0} intenciones
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#DB2777', fontWeight: 600 }}>Unirse en oración →</p>
                </div>
              </div>
            </div>

            {/* Cancionero Seráfico */}
            <div 
              onClick={() => setActiveTab('Cantos')}
              className="glass-card zoom-hover"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderLeft: '5px solid #10B981',
                background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.4rem' }}>🎵</div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#047857', fontWeight: 700, letterSpacing: '0.5px' }}>CANCIONERO SERÁFICO</p>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', color: '#064E3B', fontWeight: 800 }}>
                    Alabanzas y Cantos
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Ver letras y acordes →</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Central en 2 Columnas: Agenda Fraterna & Tablón de Anuncios */}
          <div className="responsive-grid" style={{ '--grid-min': '320px', gap: '1.5rem' }}>
            {/* Próximo Encuentro Destacado */}
            <div className="glass-card" style={{ padding: '2rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🗓️</span> Nuestra Próxima Cita
                </h3>
                <button onClick={() => setActiveTab('Eventos')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Ver Agenda →
                </button>
              </div>

              {proxEvento ? (
                <div>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '15px', textAlign: 'center', minWidth: '85px', boxShadow: '0 4px 12px rgba(139, 90, 43, 0.25)' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.85 }}>{formatSafeDate(proxEvento.fecha, 'MMM')}</p>
                      <h4 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>{formatSafeDate(proxEvento.fecha, 'dd')}</h4>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>{proxEvento.titulo}</h4>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {proxEvento.lugar || 'Salón Parroquial'}</p>
                      {proxEvento.hora && <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏰ {proxEvento.hora}</p>}
                    </div>
                  </div>
                  {proxEvento.descripcion && (
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '0.8rem', borderRadius: '10px' }}>
                      {proxEvento.descripcion}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>No hay reuniones programadas por ahora. ¡Disfruta tu semana en Paz y Bien! 🕊️</p>
                </div>
              )}
            </div>

            {/* Tablón de Anuncios Oficiales */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📢</span> Avisos de la Fraternidad
                </h3>
                <button onClick={() => setActiveTab('Anuncios')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Ver Todos →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ultimosAnuncios.length > 0 ? (
                  ultimosAnuncios.map(an => (
                    <div key={an._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.8rem' }}>
                      <div style={{ fontSize: '1.2rem', padding: '8px', background: '#FEF3C7', borderRadius: '10px' }}>📢</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{an.titulo}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {an.contenido}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatSafeDate(an.createdAt, 'dd MMM')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>No hay anuncios recientes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Oración Comunitaria */}
          {data.peticiones && data.peticiones.length > 0 && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🙏</span> Intenciones para nuestra Oración
                </h3>
                <button 
                  onClick={() => setActiveTab('Peticiones')} 
                  className="btn btn-primary zoom-hover"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                >
                  + Dejar mi Intención
                </button>
              </div>
              <div className="responsive-grid" style={{ '--grid-min': '280px', gap: '1rem' }}>
                {data.peticiones.slice(0, 3).map((p, idx) => (
                  <div key={p._id || idx} style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#9A3412', fontStyle: 'italic', lineHeight: 1.4 }}>
                      «{p.contenido}»
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#C2410C', fontWeight: 600 }}>
                      {p.anonimo ? '🕊️ Hermano en oración' : (p.hermano?.nombre || p.autor || 'Fraternidad')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* 2. VISTA ANALÍTICA EXISTENTE PARA EL CONSEJO (esConsejo) */
        /* ======================================================== */
        <>
          {/* Impacto Digital (Métricas Sociales) */}
          {data.metricas && Object.keys(data.metricas).length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🌍 Nuestro Impacto Digital
              </h3>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {/* Tarjeta TikTok */}
                <div onClick={() => setActiveTab('Redes')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', borderLeft: '5px solid #000000' }}>
                   <div style={{ fontSize: '2.5rem' }}>🎵</div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TIKTOK (SEGUIDORES)</p>
                      <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#000000' }}>
                        {data.metricas.tiktok && data.metricas.tiktok.length > 0 ? data.metricas.tiktok[data.metricas.tiktok.length - 1].seguidores : 0}
                      </h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ❤ {data.metricas.tiktok && data.metricas.tiktok.length > 0 ? data.metricas.tiktok[data.metricas.tiktok.length - 1].interacciones : 0} me gusta | 📹 {data.metricas.tiktok && data.metricas.tiktok.length > 0 ? data.metricas.tiktok[data.metricas.tiktok.length - 1].alcance : 0} videos
                      </p>
                   </div>
                </div>
                {/* Tarjeta Instagram */}
                <div onClick={() => setActiveTab('Redes')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)', borderLeft: '5px solid #E1306C' }}>
                   <div style={{ fontSize: '2.5rem' }}>📸</div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>INSTAGRAM (SEGUIDORES)</p>
                      <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#E1306C' }}>
                        {data.metricas.instagram && data.metricas.instagram.length > 0 ? data.metricas.instagram[data.metricas.instagram.length - 1].seguidores : 0}
                      </h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        📷 {data.metricas.instagram && data.metricas.instagram.length > 0 ? data.metricas.instagram[data.metricas.instagram.length - 1].interacciones : 0} posts
                      </p>
                   </div>
                </div>
                {/* Tarjeta YouTube */}
                <div onClick={() => setActiveTab('Redes')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', borderLeft: '5px solid #EF4444' }}>
                   <div style={{ fontSize: '2.5rem' }}>🔴</div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>YOUTUBE (SUSCRIPTORES)</p>
                      <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#EF4444' }}>
                        {data.metricas.youtube && data.metricas.youtube.length > 0 ? data.metricas.youtube[data.metricas.youtube.length - 1].seguidores : 0}
                      </h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        👁️ {data.metricas.youtube && data.metricas.youtube.length > 0 ? data.metricas.youtube[data.metricas.youtube.length - 1].alcance : 0} vistas | 📹 {data.metricas.youtube && data.metricas.youtube.length > 0 ? data.metricas.youtube[data.metricas.youtube.length - 1].interacciones : 0} videos
                      </p>
                   </div>
                </div>
                {/* Tarjeta Facebook */}
                <div onClick={() => setActiveTab('Redes')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '5px solid #3B82F6' }}>
                   <div style={{ fontSize: '2.5rem' }}>📘</div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>FACEBOOK (SEGUIDORES)</p>
                      <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#3B82F6' }}>
                        {data.metricas.facebook && data.metricas.facebook.length > 0 ? data.metricas.facebook[data.metricas.facebook.length - 1].seguidores : 0}
                      </h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        📢 Alcance: {data.metricas.facebook && data.metricas.facebook.length > 0 ? data.metricas.facebook[data.metricas.facebook.length - 1].alcance : 0} | 💬 Int: {data.metricas.facebook && data.metricas.facebook.length > 0 ? data.metricas.facebook[data.metricas.facebook.length - 1].interacciones : 0}
                      </p>
                   </div>
                </div>
                {/* Tarjeta Web */}
                <div onClick={() => setActiveTab('Redes')} className="glass-card zoom-hover" style={{ cursor: 'pointer', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderLeft: '5px solid #22C55E' }}>
                   <div style={{ fontSize: '2.5rem' }}>🌐</div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>VISITAS WEB (30 DÍAS)</p>
                      <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#22C55E' }}>
                        {data.metricas.web && data.metricas.web.length > 0 ? data.metricas.web[data.metricas.web.length - 1].alcance : 0}
                      </h3>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas Rápidas de Gestión */}
          <div className="stats-grid">
            {[
              { label: 'HERMANOS TOTALES', value: totalHermanos, icon: '👥', color: 'var(--text-main)', bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', tab: 'Hermanos' },
              { label: 'ACTIVOS', value: activos, icon: '✅', color: '#10B981', border: '#10B981', tab: 'Hermanos' },
              { label: 'PENDIENTES', value: pendientes, icon: '⏳', color: '#F59E0B', border: '#F59E0B', tab: 'Hermanos' },
              { label: 'EN CALENDARIO', value: data.eventos?.length || 0, icon: '📅', color: '#6366F1', border: '#6366F1', tab: 'Eventos' }
            ].map((stat, i) => (
              <div key={i} onClick={() => setActiveTab(stat.tab)} className="glass-card zoom-hover" style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                background: stat.bg || 'white',
                borderLeft: stat.border ? `5px solid ${stat.border}` : 'none',
                cursor: 'pointer'
              }}>
                 <div style={{ fontSize: '2.2rem' }}>{stat.icon}</div>
                 <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px' }}>{stat.label}</p>
                    <h3 style={{ margin: 0, fontSize: '1.8rem', color: stat.color }}>{stat.value}</h3>
                 </div>
              </div>
            ))}
          </div>

          {/* SECCIÓN DE GRÁFICOS */}
          <div className="charts-grid">
            {/* Gráfico de Tendencia de Asistencia */}
            <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📈 Tendencia de Asistencia
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="99%" height={250}>
                  <AreaChart data={chartData.attendance}>
                    <defs>
                      <linearGradient id="colorAsis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="asistencia" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAsis)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>Basado en los últimos 7 registros de asistencia.</p>
            </div>

            {/* Gráfico de Distribución por Etapas */}
            <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🍩 Distribución por Etapas
                </h3>
                <span style={{ fontSize: '0.8rem', background: 'rgba(194, 65, 12, 0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {totalHermanos} Hermanos
                </span>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="99%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} ${value === 1 ? 'hermano' : 'hermanos'} (${totalHermanos > 0 ? ((value / totalHermanos) * 100).toFixed(1) : 0}%)`,
                        name
                      ]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '0.85rem' }} 
                      formatter={(value) => {
                        const item = chartData.distribution.find(d => d.name === value);
                        return `${value} (${item ? item.value : 0})`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="responsive-grid" style={{ '--grid-min': '300px' }}>
             {/* Próximo Evento / Actividad */}
             <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(139, 90, 43, 0.1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>🗓️</div>
                <h3 style={{ marginTop: 0, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>Próxima Cita</h3>
                {proxEvento ? (
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                     <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '15px', textAlign: 'center', minWidth: '80px', boxShadow: '0 4px 12px rgba(139, 90, 43, 0.2)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>{formatSafeDate(proxEvento.fecha, 'MMM')}</p>
                        <h4 style={{ margin: 0, fontSize: '2.2rem' }}>{formatSafeDate(proxEvento.fecha, 'dd')}</h4>
                     </div>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}>{proxEvento.titulo}</h4>
                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {proxEvento.lugar}</p>
                        <button onClick={() => setActiveTab('Eventos')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginTop: '10px', fontSize: '0.9rem' }}>Ver detalles →</button>
                     </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No hay eventos programados próximamente. 💤</p>
                    <button 
                      onClick={() => { setActiveTab('Eventos'); setIsModalOpen && setIsModalOpen(true); }}
                      className="btn btn-primary zoom-hover"
                      style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
                    >
                      + Programar Reunión
                    </button>
                  </div>
                )}
             </div>

             {/* Últimos Anuncios */}
             <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginTop: 0, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>Anuncios Recientes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {ultimosAnuncios.length > 0 ? ultimosAnuncios.map(an => (
                     <div key={an._id} className="animate-fade" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: '1px solid #f9f9f9', paddingBottom: '0.8rem' }}>
                        <div style={{ fontSize: '1.2rem', padding: '8px', background: '#FEF3C7', borderRadius: '10px' }}>📢</div>
                        <div style={{ flex: 1 }}>
                           <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>{an.titulo}</p>
                           <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{an.contenido}</p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatSafeDate(an.createdAt, 'dd MMM')}</span>
                     </div>
                   )) : (
                     <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay anuncios recientes.</p>
                   )}
                   <button onClick={() => setActiveTab('Anuncios')} className="btn" style={{ width: '100%', marginTop: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.9rem' }}>Gestionar Anuncios ✅</button>
                </div>
             </div>
          </div>

          {/* Módulo de Aprobación Crítica para el Consejo */}
          {pendientes > 0 && (
            <div className="glass-card animate-fade" style={{ marginTop: '2.5rem', border: '2px solid #F59E0B', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#B45309', display: 'flex', alignItems: 'center', gap: '10px' }}>⚠️ {pendientes} Solicitudes Pendientes</h3>
                  <p style={{ color: '#D97706', fontSize: '0.85rem', margin: '5px 0 0 0' }}>Hermanos esperando aprobación para acceder a la App.</p>
                </div>
                <button onClick={() => setActiveTab('Hermanos')} style={{ background: '#B45309', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>Ver Todos</button>
              </div>
              <div className="responsive-grid" style={{ '--grid-min': '280px' }}>
                {data.hermanos.filter(h => !h.activo).slice(0, 4).map(h => (
                  <div key={h._id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{h.nombre} {h.apellido}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.email || `@${h.username}`}</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('Hermanos')} 
                      style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '0.8rem' }}
                      className="zoom-hover"
                    >
                      Revisar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Código QR Personal */}
      {showQRModal && user?.codigoQR && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div 
            className="modal-content animate-fade" 
            style={{ maxWidth: '360px', textAlign: 'center', padding: '2rem', borderRadius: '20px' }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🕊️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Mi Código QR Fraterno</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Presenta este código al llegar a los encuentros sabatinos para registrar tu asistencia.
            </p>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
              <img src={user.codigoQR} alt="QR de Asistencia" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>
            <h4 style={{ margin: '1rem 0 0.2rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{user.nombre} {user.apellido}</h4>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: (etapaBadgeMap[resolveEtapa(user)] || etapaBadgeMap.aspirante).bg,
              color: (etapaBadgeMap[resolveEtapa(user)] || etapaBadgeMap.aspirante).color
            }}>
              {(etapaBadgeMap[resolveEtapa(user)] || etapaBadgeMap.aspirante).label}
            </span>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.fraternidadNombre || 'JUFRA Pomalca'}</p>
            <button 
              onClick={() => setShowQRModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', fontWeight: 700 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
