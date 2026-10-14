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
        background: '#FAF6F0',
        color: '#1e293b',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p style={{ fontWeight: 600, color: '#64748b' }}>Cargando página de la fraternidad...</p>
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
        background: '#FAF6F0',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🕊️</div>
        <h1 style={{ color: '#1e293b', fontSize: '2rem', marginBottom: '8px' }}>
          Fraternidad no encontrada
        </h1>
        <p style={{ color: '#64748b', maxWidth: '460px', marginBottom: '24px' }}>
          No pudimos localizar la fraternidad con el identificador solicitado o aún está en proceso de registro.
        </p>
        <Link
          to="/jufra-peru"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)'
          }}
        >
          ⬅ Volver al Directorio JUFRA Perú
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
      background: '#FAF6F0',
      color: '#1e293b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Navigation ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/jufra-peru"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f1f5f9',
              transition: 'all 0.15s ease'
            }}
          >
            ⬅ Directorio Nacional
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#7c3aed', letterSpacing: '0.02em' }}>
            JUFRA PERÚ
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            Inicio
          </Link>
          {isPomalca && (
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(124,58,237,0.25)'
              }}
            >
              🌐 Portal Web Pomalca ➔
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <header style={{
        marginTop: '64px',
        position: 'relative',
        minHeight: '380px',
        backgroundImage: `url('/hero_jufra_background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 24px',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Dark warm overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(30, 20, 15, 0.88) 0%, rgba(88, 28, 135, 0.75) 100%)',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(6px)',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              📍 {zonaNombre}
            </span>
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '20px',
            }}>
              🇵🇪 {fraternidad.departamento || 'Perú'}
            </span>
          </div>

          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {fraternidad.nombre}
          </h1>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.6,
            maxWidth: '680px',
            opacity: 0.95,
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
                  background: 'white',
                  color: '#1e293b',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
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
                  color: 'white',
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
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: 'white',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.35)'
                }}
              >
                🌐 Visitar Web Completa de Pomalca ➔
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Body ── */}
      <main style={{ padding: '48px 24px', flex: 1 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          {/* Notice for Pomalca */}
          {isPomalca && (
            <div style={{
              background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
              border: '1px solid #c4b5fd',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#6d28d9', fontSize: '1.1rem', fontWeight: 800 }}>
                  🌟 Fraternidad con Plataforma Digital Integral
                </h3>
                <p style={{ margin: 0, color: '#5b21b6', fontSize: '0.9rem' }}>
                  JUFRA Pomalca cuenta con un portal institucional completo, panel administrativo, asistencias QR, cancionero y aplicación móvil.
                </p>
              </div>
              <Link
                to="/"
                style={{
                  background: '#7c3aed',
                  color: 'white',
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

          {/* Grid of Info Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* Card 1: Ficha de la Fraternidad */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>⛪</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
                  Datos de la Sede
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Jurisdicción / Zona
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b' }}>
                    {zonaNombre}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Departamento
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b' }}>
                    📍 {fraternidad.departamento || 'Sin especificar'}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Parroquia / Convento
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b' }}>
                    ⛪ {fraternidad.parroquia || 'Sede Parroquial Local'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Contacto y Enlace */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
                  Contacto y Comunicación
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Coordinador / Hermano de Contacto
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b' }}>
                    👤 {fraternidad.contacto || 'Consejo Fraterno Local'}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Teléfono / Celular
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#1e293b' }}>
                    📞 {fraternidad.telefono || 'Por consultar en sede'}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Página Social
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                    {fraternidad.enlaceSocial ? (
                      <a
                        href={fraternidad.enlaceSocial}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 700 }}
                      >
                        🔗 Ver Perfil de Facebook / Instagram
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No registrada aún</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Carisma y Vida Fraterna */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '36px 32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            marginBottom: '36px'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🕊️ Vida Fraterna y Carisma Franciscano
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#475569', marginBottom: '20px' }}>
              La <strong>Juventud Franciscana (JUFRA)</strong> es la comunidad de jóvenes que se sienten llamados por el Espíritu Santo a hacer la experiencia de la vida cristiana a la luz del mensaje de San Francisco de Asís, profundizando la propia vocación en el ámbito de la Orden Franciscana Seglar (OFS).
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
              marginTop: '24px'
            }}>
              <div style={{
                background: '#fafaf9',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🙏</div>
                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>
                  Oración y Liturgia
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Encuentros semanales de oración, reflexión del Evangelio y eucaristías fraternas.
                </p>
              </div>

              <div style={{
                background: '#fafaf9',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤝</div>
                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>
                  Apostolado y Servicio
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Compromiso social activo con los más necesitados, comedores populares y ancianatos.
                </p>
              </div>

              <div style={{
                background: '#fafaf9',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🌿</div>
                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>
                  Cuidado de la Creación
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Inspirados en el Cántico de las Criaturas, promovemos la ecología integral y el respeto a la naturaleza.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            borderRadius: '20px',
            padding: '36px 32px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(124,58,237,0.25)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: 800 }}>
              ¿Deseas unirte a esta Fraternidad?
            </h2>
            <p style={{
              margin: '0 auto 24px',
              maxWidth: '560px',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              opacity: 0.95
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
                    color: 'white',
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
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
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

      {/* ── Footer ── */}
      <footer style={{
        background: '#1e293b',
        color: '#94a3b8',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.88rem'
      }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} JUFRA Perú • {fraternidad.nombre}. ¡Paz y Bien!
        </p>
      </footer>
    </div>
  );
};

export default FraternidadDetailView;
