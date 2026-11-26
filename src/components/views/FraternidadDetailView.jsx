import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { findFraternidadBySlug } from '../../utils/fraternidadHelper';

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFraternidad = async () => {
      try {
        const response = await api.get('/fraternidades');
        const frats = response.data?.data || [];
        const found = findFraternidadBySlug(frats, slug);
        setFraternidad(found);
      } catch (err) {
        console.error('Error fetching fraternidad detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFraternidad();
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #FAF6F0)',
        color: 'var(--text-main, #1C1917)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ fontWeight: 600, color: 'var(--text-muted, #78716C)' }}>Cargando página de la fraternidad...</p>
      </div>
    );
  }

  if (!fraternidad) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #FAF6F0)',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
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
            boxShadow: '0 4px 14px rgba(194, 65, 12, 0.25)'
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
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg, #FAF6F0)',
      color: 'var(--text-main, #1C1917)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Navegación pública estándar ── */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/jufra-peru" className="logo">
          JUFRA PERÚ
        </Link>

        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <Link to="/jufra-peru" className="active" onClick={() => setIsMenuOpen(false)}>Directorio</Link>
          {isPomalca && (
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Portal Pomalca</Link>
          )}
          <Link
            to="/jufra-peru"
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
              justifyContent: 'center',
              gap: '6px',
              marginLeft: '0.5rem'
            }}
          >
            <span>←</span>
            <span>Directorio Nacional</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <header style={{
        marginTop: '62px',
        position: 'relative',
        minHeight: '360px',
        backgroundColor: 'var(--hero-bg, #1A110B)',
        backgroundImage: `url('/hero_jufra_background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 24px',
        color: '#FFFFFF',
        overflow: 'hidden'
      }}>
        {/* Overlay cálido franciscano */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(26, 17, 11, 0.90) 0%, rgba(139, 90, 43, 0.72) 100%)',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(6px)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              📍 {zonaNombre}
            </span>
            <span style={{
              background: 'rgba(217, 119, 6, 0.25)',
              border: '1px solid rgba(217, 119, 6, 0.5)',
              color: '#FDE68A',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '20px',
            }}>
              🇵🇪 {fraternidad.departamento || 'Perú'}
            </span>
          </div>

          <h1 style={{
            margin: '0 0 16px 0',
            color: '#FFFFFF',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {fraternidad.nombre}
          </h1>

          <p style={{
            fontSize: '1.08rem',
            lineHeight: 1.6,
            maxWidth: '680px',
            color: 'rgba(255, 255, 255, 0.88)',
            margin: '0 0 24px 0',
            fontWeight: 400
          }}>
            {fraternidad.parroquia
              ? `Comunidad fraterna con sede en la Parroquia ${fraternidad.parroquia}. Jóvenes consagrados al Evangelio viviendo el carisma de San Francisco de Asís.`
              : `Fraternidad local de la Juventud Franciscana en ${fraternidad.departamento}, caminando juntos en fraternidad, oración y servicio.`}
          </p>

          {/* Quick CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {fraternidad.enlaceSocial && (
              <a
                href={fraternidad.enlaceSocial}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--surface, #FFFFFF)',
                  color: 'var(--text-main, #1C1917)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)'
                }}
              >
                📱 Redes Sociales Oficiales
              </a>
            )}

            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=Hola%20hermanos%20de%20${encodeURIComponent(fraternidad.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,211,102,0.35)'
                }}
              >
                💬 Contactar por WhatsApp
              </a>
            )}

            {isPomalca && (
              <Link
                to="/"
                style={{
                  background: 'var(--accent, #C2410C)',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(194,65,12,0.35)'
                }}
              >
                🌐 Visitar Web Completa de Pomalca ➔
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main style={{ padding: '48px 24px', flex: 1, background: 'var(--bg, #FAF6F0)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Notice for Pomalca */}
          {isPomalca && (
            <div
              className="glass-card"
              style={{
                border: '1.5px solid var(--accent, #C2410C)',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: 'var(--accent, #C2410C)', fontSize: '1.1rem', fontWeight: 800 }}>
                  🌟 Fraternidad con Plataforma Digital Integral
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted, #57534E)', fontSize: '0.9rem' }}>
                  JUFRA Pomalca cuenta con un portal institucional completo, panel administrativo, asistencias QR, cancionero y aplicación móvil.
                </p>
              </div>
              <Link
                to="/"
                style={{
                  background: 'var(--accent, #C2410C)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                Ir a la Página Principal ➔
              </Link>
            </div>
          )}

          {/* Grid de Tarjetas de Información */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '36px'
          }}>
            {/* Card 1: Datos de la Sede */}
            <div
              className="glass-card zoom-hover"
              style={{
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border, #E7E5E4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>⛪</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main, #1C1917)' }}>
                  Datos de la Sede
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Jurisdicción / Zona
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                    {zonaNombre}
                  </p>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Departamento
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                    📍 {fraternidad.departamento || 'Sin especificar'}
                  </p>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Parroquia / Convento
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                    ⛪ {fraternidad.parroquia || 'Sede Parroquial Local'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Contacto y Comunicación */}
            <div
              className="glass-card zoom-hover"
              style={{
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border, #E7E5E4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main, #1C1917)' }}>
                  Contacto y Comunicación
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Coordinador / Hermano de Contacto
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                    👤 {fraternidad.contacto || 'Consejo Fraterno Local'}
                  </p>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Teléfono / Celular
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-main, #1C1917)' }}>
                    📞 {fraternidad.telefono || 'Por consultar en sede'}
                  </p>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted, #78716C)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Página Social
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                    {fraternidad.enlaceSocial ? (
                      <a
                        href={fraternidad.enlaceSocial}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary, #8B5A2B)', textDecoration: 'none', fontWeight: 700 }}
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

          {/* Sección: Carisma y Vida Fraterna */}
          <div
            className="glass-card"
            style={{
              borderRadius: '20px',
              padding: '36px 32px',
              border: '1px solid var(--border, #E7E5E4)',
              marginBottom: '36px'
            }}
          >
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-main, #1C1917)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🕊️ Vida Fraterna y Carisma Franciscano
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-muted, #57534E)', marginBottom: '20px' }}>
              La <strong style={{ color: 'var(--text-main, #1C1917)' }}>Juventud Franciscana (JUFRA)</strong> es la comunidad de jóvenes que se sienten llamados por el Espíritu Santo a hacer la experiencia de la vida cristiana a la luz del mensaje de San Francisco de Asís, profundizando la propia vocación en el ámbito de la Orden Franciscana Seglar (OFS).
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
              marginTop: '24px'
            }}>
              <div style={{
                background: 'var(--bg, #FAF6F0)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border, #E7E5E4)'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🙏</div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #1C1917)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Oración y Liturgia
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted, #78716C)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Encuentros semanales de oración, reflexión del Evangelio y eucaristías fraternas.
                </p>
              </div>

              <div style={{
                background: 'var(--bg, #FAF6F0)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border, #E7E5E4)'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤝</div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #1C1917)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Apostolado y Servicio
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted, #78716C)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Compromiso social activo con los más necesitados, comedores populares y ancianatos.
                </p>
              </div>

              <div style={{
                background: 'var(--bg, #FAF6F0)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border, #E7E5E4)'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🌿</div>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #1C1917)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Cuidado de la Creación
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted, #78716C)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Inspirados en el Cántico de las Criaturas, promovemos la ecología integral y el respeto a la naturaleza.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--hero-bg, #1A110B) 0%, var(--primary, #8B5A2B) 100%)',
            borderRadius: '20px',
            padding: '36px 32px',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(26, 17, 11, 0.22)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
              ¿Deseas unirte a esta Fraternidad?
            </h2>
            <p style={{
              margin: '0 auto 24px',
              maxWidth: '560px',
              fontSize: '1.02rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.88)'
            }}>
              Si vives en {fraternidad.departamento || 'esta localidad'} o sus alrededores, las puertas de la fraternidad están abiertas para ti. ¡Ven y vive la alegría franciscana!
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=Hola%20hermanos%20de%20${encodeURIComponent(fraternidad.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#FFFFFF',
                    padding: '12px 26px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  💬 Enviar Mensaje por WhatsApp
                </a>
              )}
              <Link
                to="/jufra-peru"
                style={{
                  background: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                Explorar Otras Fraternidades
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer oscuro minimalista estándar ── */}
      <footer style={{ background: 'var(--hero-bg, #1A110B)', color: '#FFFFFF', padding: '1.25rem 1.5rem' }}>
        <div style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--secondary, #F59E0B)', fontWeight: 800, fontSize: '1rem' }}>✟</span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>JUFRA Perú</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
            © {new Date().getFullYear()} JUFRA Perú • {fraternidad.nombre}. ¡Paz y Bien!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FraternidadDetailView;
