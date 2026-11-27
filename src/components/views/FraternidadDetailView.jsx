import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { findFraternidadBySlug } from '../../utils/fraternidadHelper';
import Swal from 'sweetalert2';

const ZONAS_LABEL = {
  norte: 'Zona Norte',
  centro: 'Zona Centro',
  lima_callao_sur_medio: 'Lima, Callao y Sur Medio',
  sur_altiplano: 'Sur y Altiplano',
};

const FraternidadDetailView = () => {
  const { slug } = useParams();
  const [fraternidad, setFraternidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Estados de edición del coordinador
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    parroquia: '',
    contacto: '',
    telefono: '',
    enlaceSocial: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Estados de postulación / unirse
  const [joinForm, setJoinForm] = useState({
    nombre: '',
    edad: '',
    telefono: '',
    mensaje: '',
  });
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Usuario autenticado en el navegador
  const currentUser = (() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const canManage = Boolean(
    currentUser &&
      (currentUser.isSuperAdmin ||
        currentUser.rol === 'admin' ||
        currentUser.rol === 'superadmin' ||
        currentUser.rol === 'admin_nacional' ||
        currentUser.rol === 'consejo' ||
        String(currentUser.fraternidadId || currentUser.fraternidad_id) ===
          String(fraternidad?.id || fraternidad?._id))
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFraternidad = async () => {
    try {
      const response = await api.get('/fraternidades');
      const frats = response.data?.data || [];
      const found = findFraternidadBySlug(frats, slug);
      setFraternidad(found);
      if (found) {
        setEditForm({
          parroquia: found.parroquia || '',
          contacto: found.contacto || '',
          telefono: found.telefono || '',
          enlaceSocial: found.enlaceSocial || '',
        });
      }
    } catch (err) {
      console.error('Error fetching fraternidad detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFraternidad();
  }, [slug]);

  // Manejo de actualización del portal por el coordinador
  const handleOpenEditModal = () => {
    if (fraternidad) {
      setEditForm({
        parroquia: fraternidad.parroquia || '',
        contacto: fraternidad.contacto || '',
        telefono: fraternidad.telefono || '',
        enlaceSocial: fraternidad.enlaceSocial || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!fraternidad?.id && !fraternidad?._id) return;
    setEditSubmitting(true);
    try {
      const targetId = fraternidad.id || fraternidad._id;
      const res = await api.put(`/fraternidades/${targetId}`, editForm);
      if (res.data?.success) {
        setFraternidad((prev) => ({ ...prev, ...editForm }));
        setIsEditModalOpen(false);
        Swal.fire({
          icon: 'success',
          title: '¡Portal Actualizado!',
          text: 'Los cambios de tu fraternidad ya son visibles para toda la comunidad.',
          confirmButtonColor: '#c2410c',
        });
      }
    } catch (err) {
      console.error('Error al actualizar fraternidad:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.response?.data?.message || 'No se pudieron guardar los cambios.',
        confirmButtonColor: '#c2410c',
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Manejo de postulación / unirse
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinForm.nombre || !joinForm.edad || !joinForm.telefono) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa tu nombre, edad y teléfono.',
        confirmButtonColor: '#c2410c',
      });
      return;
    }

    setJoinSubmitting(true);
    try {
      await api.post('/solicitudes', {
        nombre: joinForm.nombre.trim(),
        edad: parseInt(joinForm.edad, 10),
        telefono: joinForm.telefono.trim(),
        mensaje: joinForm.mensaje.trim()
          ? `[Postulación a ${fraternidad.nombre}]: ${joinForm.mensaje.trim()}`
          : `Postulación directa a JUFRA ${fraternidad.nombre}`,
        fraternidadId: fraternidad.id || fraternidad._id,
        fraternidadNombre: fraternidad.nombre,
      });

      setJoinSuccess(true);
      Swal.fire({
        icon: 'success',
        title: '¡Paz y Bien! Solicitud enviada',
        html: `Tu postulación para unirte a <strong>${fraternidad.nombre}</strong> ha sido recibida con alegría. El coordinador o consejo fraterno se comunicará contigo muy pronto.`,
        confirmButtonColor: '#c2410c',
      });
      setJoinForm({ nombre: '', edad: '', telefono: '', mensaje: '' });
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No pudimos registrar tu solicitud. Por favor intenta contactar directamente por WhatsApp.',
        confirmButtonColor: '#c2410c',
      });
    } finally {
      setJoinSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #FAF6F0)',
          color: 'var(--text-main, #1C1917)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ fontWeight: 600, color: 'var(--text-muted, #78716C)' }}>
          Cargando portal de la fraternidad...
        </p>
      </div>
    );
  }

  if (!fraternidad) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #FAF6F0)',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🕊️</div>
        <h1 style={{ color: 'var(--text-main, #1C1917)', fontSize: '2rem', marginBottom: '8px' }}>
          Fraternidad no encontrada
        </h1>
        <p style={{ color: 'var(--text-muted, #78716C)', maxWidth: '460px', marginBottom: '24px' }}>
          No pudimos localizar la fraternidad con el identificador solicitado o aún está en proceso de registro.
        </p>
        <Link
          to="/jufra-peru"
          style={{
            background: 'var(--accent, #C2410C)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(194, 65, 12, 0.25)',
          }}
        >
          ← Volver al Directorio JUFRA Perú
        </Link>
      </div>
    );
  }

  const isPomalca = (fraternidad.nombre || '').toUpperCase().includes('POMALCA');
  const zonaNombre = ZONAS_LABEL[fraternidad.zona] || 'JUFRA Perú';
  const cleanPhone = (fraternidad.telefono || '').replace(/[^\d+]/g, '');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg, #FAF6F0)',
        color: 'var(--text-main, #1C1917)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Barra de Navegación ── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/jufra-peru" className="logo">
          JUFRA PERÚ
        </Link>

        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio Nacional</Link>
          <Link to="/jufra-peru" className="active" onClick={() => setIsMenuOpen(false)}>Directorio</Link>
          <a href="#sede" onClick={() => setIsMenuOpen(false)}>Sede & Horarios</a>
          <a href="#unirme" onClick={() => setIsMenuOpen(false)}>¡Únete!</a>

          {/* Acceso a miembros / Dashboard */}
          {currentUser ? (
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              style={{
                background: 'rgba(217, 119, 6, 0.18)',
                color: '#d97706',
                border: '1px solid #d97706',
                padding: '0.45rem 1rem',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              📊 Mi Dashboard
            </Link>
          ) : (
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              style={{
                color: 'var(--text-main, #1C1917)',
                fontWeight: '600',
                fontSize: '0.88rem',
              }}
            >
              Acceso Hermanos
            </Link>
          )}

          <a
            href="#unirme"
            className="nav-btn-unete"
            onClick={() => setIsMenuOpen(false)}
            style={{
              backgroundColor: 'var(--accent, #c2410c)',
              color: '#ffffff',
              padding: '0.45rem 1.25rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(194,65,12,0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✨</span>
            <span>Postular Ahora</span>
          </a>
        </div>
      </nav>

      {/* ── Hero Banner de la Fraternidad ── */}
      <header
        style={{
          marginTop: '62px',
          position: 'relative',
          minHeight: '380px',
          backgroundColor: 'var(--hero-bg, #1A110B)',
          backgroundImage: `url('/hero_jufra_background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          padding: '60px 24px',
          color: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(26, 17, 11, 0.92) 0%, rgba(139, 90, 43, 0.76) 100%)',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '960px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Barra de Coordinador / Superadmin (si tiene permisos) */}
          {canManage && (
            <div
              style={{
                marginBottom: '18px',
                padding: '10px 18px',
                background: 'rgba(245, 158, 11, 0.22)',
                border: '1.5px solid #F59E0B',
                borderRadius: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FEF3C7' }}>
                🛡️ Eres Coordinador de esta Fraternidad
              </span>
              <button
                type="button"
                onClick={handleOpenEditModal}
                style={{
                  background: '#F59E0B',
                  color: '#1C1917',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                ✏️ Editar este Portal
              </button>
              <Link
                to="/dashboard"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                📊 Ir al Dashboard
              </Link>
            </div>
          )}

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              📍 {zonaNombre}
            </span>
            <span
              style={{
                background: 'rgba(217, 119, 6, 0.25)',
                border: '1px solid rgba(217, 119, 6, 0.5)',
                color: '#FDE68A',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              🇵🇪 {fraternidad.departamento || 'Perú'}
            </span>
            <span
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#BBF7D0',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              ✓ Portal Oficial JUFRA
            </span>
          </div>

          <h1
            style={{
              margin: '0 0 16px 0',
              color: '#FFFFFF',
              fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {fraternidad.nombre}
          </h1>

          <p
            style={{
              fontSize: '1.08rem',
              lineHeight: 1.6,
              maxWidth: '720px',
              color: 'rgba(255, 255, 255, 0.92)',
              margin: '0 0 24px 0',
              fontWeight: 400,
            }}
          >
            {fraternidad.parroquia
              ? `Comunidad fraterna con sede en la Parroquia ${fraternidad.parroquia}. Jóvenes caminando en fraternidad, oración y servicio tras las huellas de San Francisco y Santa Clara de Asís.`
              : `Fraternidad local de la Juventud Franciscana en ${fraternidad.departamento}, viviendo la alegría del Evangelio y el carisma franciscano.`}
          </p>

          {/* Quick CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="#unirme"
              style={{
                background: 'var(--accent, #C2410C)',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.94rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(194,65,12,0.4)',
              }}
            >
              ✨ Quiero ser parte de JUFRA
            </a>

            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=Paz%20y%20Bien,%20hermanos%20de%20${encodeURIComponent(fraternidad.nombre)},%20quisiera%20más%20información.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                }}
              >
                💬 WhatsApp Oficial
              </a>
            )}

            {fraternidad.enlaceSocial && (
              <a
                href={fraternidad.enlaceSocial}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--surface, #FFFFFF)',
                  color: 'var(--text-main, #1C1917)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                }}
              >
                📱 Redes Sociales
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main style={{ padding: '48px 24px', flex: 1, background: 'var(--bg, #FAF6F0)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Sede y Horarios */}
          <section id="sede" style={{ marginBottom: '36px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {/* Card 1: Datos de la Sede */}
              <div
                className="glass-card zoom-hover"
                style={{
                  borderRadius: '18px',
                  padding: '26px',
                  border: '1px solid var(--border, #E7E5E4)',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '1.6rem' }}>⛪</span>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main, #1C1917)' }}>
                    Sede y Encuentros
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Parroquia / Convento
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                      ⛪ {fraternidad.parroquia || 'Sede Parroquial Local'}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Departamento y Zona
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                      📍 {fraternidad.departamento || 'Perú'} • {zonaNombre}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Horarios de Asambleas
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#C2410C' }}>
                      ⏰ Fines de semana (Por confirmar en sede o WhatsApp)
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Contacto y Consejo */}
              <div
                className="glass-card zoom-hover"
                style={{
                  borderRadius: '18px',
                  padding: '26px',
                  border: '1px solid var(--border, #E7E5E4)',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '1.6rem' }}>👥</span>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main, #1C1917)' }}>
                    Contacto y Coordinación
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Hermano(a) Coordinador(a)
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                      👤 {fraternidad.contacto || 'Consejo Fraterno Local'}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Teléfono / WhatsApp
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                      📞 {fraternidad.telefono || 'Por consultar en sede'}
                    </p>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Página Social Oficial
                    </span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                      {fraternidad.enlaceSocial ? (
                        <a
                          href={fraternidad.enlaceSocial}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#C2410C', textDecoration: 'none', fontWeight: 700 }}
                        >
                          🔗 Ver Perfil de Facebook / Instagram ↗
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted, #A8A29E)' }}>No registrada aún</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Carisma y Vida Fraterna */}
          <section
            style={{
              borderRadius: '20px',
              padding: '36px 32px',
              border: '1px solid var(--border, #E7E5E4)',
              background: '#FFFFFF',
              marginBottom: '36px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <h2
              style={{
                margin: '0 0 16px 0',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-main, #1C1917)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              🕊️ ¿Qué vivimos en JUFRA?
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-muted, #57534E)', marginBottom: '20px' }}>
              La <strong style={{ color: 'var(--text-main, #1C1917)' }}>Juventud Franciscana (JUFRA)</strong> es la comunidad de jóvenes que se sienten llamados por el Espíritu Santo a hacer la experiencia de la vida cristiana a la luz del mensaje de San Francisco de Asís, viviendo en fraternidad activa, sencillez evangélica y servicio a los más necesitados.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '18px',
                marginTop: '24px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg, #FAF6F0)',
                  padding: '22px',
                  borderRadius: '14px',
                  border: '1px solid var(--border, #E7E5E4)',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🙏</div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #1C1917)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Oración y Liturgia
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted, #78716C)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Encuentros de oración, reflexión del Evangelio, vigilias y eucaristías fraternas.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg, #FAF6F0)',
                  padding: '22px',
                  borderRadius: '14px',
                  border: '1px solid var(--border, #E7E5E4)',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤝</div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #1C1917)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Apostolado y Servicio
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted, #78716C)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Compromiso social con personas vulnerables, asilos, niños y misiones rurales.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg, #FAF6F0)',
                  padding: '22px',
                  borderRadius: '14px',
                  border: '1px solid var(--border, #E7E5E4)',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🌿</div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #1C1917)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Cuidado de la Creación
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted, #78716C)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Inspirados en el Cántico de las Criaturas, vivimos la ecología integral y el amor a la naturaleza.
                </p>
              </div>
            </div>
          </section>

          {/* Sección de Postulación / Formulario "Quiero Unirme" */}
          <section
            id="unirme"
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '40px 32px',
              border: '2px solid #E7E5E4',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              marginBottom: '36px',
            }}
          >
            <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  background: 'rgba(194, 65, 12, 0.1)',
                  borderRadius: '20px',
                  color: '#C2410C',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '14px',
                }}
              >
                <span>✨</span>
                <span>Inscripción Abierta</span>
              </div>

              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main, #1C1917)' }}>
                ¿Deseas unirte a {fraternidad.nombre}?
              </h2>

              <p style={{ margin: '0 0 28px', color: 'var(--text-muted, #78716C)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Si tienes entre 14 y 30 años y vives en {fraternidad.departamento || 'esta zona'}, completa este formulario para ponerte en contacto directo con los hermanos de la coordinación:
              </p>

              {joinSuccess ? (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    padding: '24px',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                  <h3 style={{ margin: '0 0 8px', color: '#166534', fontWeight: 800, fontSize: '1.2rem' }}>
                    ¡Solicitud Enviada con Bendición!
                  </h3>
                  <p style={{ margin: 0, color: '#15803D', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    Hemos recibido tus datos con alegría. El equipo de coordinación de {fraternidad.nombre} se comunicará contigo vía WhatsApp o llamada para darte la bienvenida a tu primera asamblea.
                  </p>
                  <button
                    type="button"
                    onClick={() => setJoinSuccess(false)}
                    style={{
                      marginTop: '16px',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                      Tu Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Francisco Mendoza"
                      value={joinForm.nombre}
                      onChange={(e) => setJoinForm({ ...joinForm, nombre: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #D6D3D1',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                        Edad *
                      </label>
                      <input
                        type="number"
                        required
                        min="12"
                        max="35"
                        placeholder="Ej. 19"
                        value={joinForm.edad}
                        onChange={(e) => setJoinForm({ ...joinForm, edad: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1.5px solid #D6D3D1',
                          fontSize: '0.95rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                        Celular / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 987 654 321"
                        value={joinForm.telefono}
                        onChange={(e) => setJoinForm({ ...joinForm, telefono: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1.5px solid #D6D3D1',
                          fontSize: '0.95rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#44403C', marginBottom: '6px' }}>
                      Mensaje o motivación (Opcional)
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Cuéntanos brevemente de qué parroquia o zona vienes y qué te motiva a conocer la Juventud Franciscana..."
                      value={joinForm.mensaje}
                      onChange={(e) => setJoinForm({ ...joinForm, mensaje: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #D6D3D1',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={joinSubmitting}
                    style={{
                      background: 'var(--accent, #C2410C)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: joinSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(194,65,12,0.3)',
                      transition: 'all 0.2s ease',
                      marginTop: '6px',
                    }}
                  >
                    {joinSubmitting ? 'Enviando postulación...' : `🕊️ Enviar mi postulación a ${fraternidad.nombre}`}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Bottom Navigation */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link
              to="/jufra-peru"
              style={{
                color: 'var(--text-muted, #78716C)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.92rem',
              }}
            >
              ← Ver todas las demás Fraternidades en el Directorio Nacional JUFRA Perú
            </Link>
          </div>

        </div>
      </main>

      {/* ── Modal de Edición Rápida para el Coordinador ── */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1C1917' }}>
                  Editar Portal de Fraternidad
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#78716C' }}>
                  {fraternidad.nombre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: '#F5F5F4',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                  Parroquia o Convento Sede
                </label>
                <input
                  type="text"
                  placeholder="Ej. Parroquia San Francisco de Asís"
                  value={editForm.parroquia}
                  onChange={(e) => setEditForm({ ...editForm, parroquia: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D6D3D1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                  Hermano(a) Coordinador(a) / Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Hno. Jean Pierre Juárez"
                  value={editForm.contacto}
                  onChange={(e) => setEditForm({ ...editForm, contacto: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D6D3D1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                  Teléfono / WhatsApp de la Fraternidad
                </label>
                <input
                  type="text"
                  placeholder="Ej. 987654321"
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D6D3D1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#44403C', marginBottom: '4px' }}>
                  Enlace de Redes Sociales (Facebook / Instagram)
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/jufra.tufraternidad"
                  value={editForm.enlaceSocial}
                  onChange={(e) => setEditForm({ ...editForm, enlaceSocial: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D6D3D1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    background: '#F5F5F4',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  style={{
                    background: '#C2410C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: editSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--hero-bg, #1A110B)', color: '#FFFFFF', padding: '1.25rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--secondary, #F59E0B)', fontWeight: 800, fontSize: '1rem' }}>✟</span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>JUFRA Perú</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
            © {new Date().getFullYear()} JUFRA Perú • Portal de {fraternidad.nombre}. ¡Paz y Bien!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FraternidadDetailView;
