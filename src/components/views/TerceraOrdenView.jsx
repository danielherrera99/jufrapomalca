import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const TerceraOrdenView = () => {
  const [config, setConfig] = useState({
    familiaTitulo: 'Fraternidad OFS Santa Isabel de Hungría',
    familiaDescripcion: 'Caminamos junto a nuestros hermanos mayores...',
    emailContacto: 'jufrapomalca@gmail.com',
    telefonoContacto: '+51 979 948 528',
    mapQuery: 'Pomalca',
    ofsHeroTitle: 'Fraternidad OFS Santa Isabel de Hungría',
    ofsHeroSubtitle: 'Orden Franciscana Seglar: Viviendo el Evangelio en medio del mundo.',
    ofsMapQuery: 'Convento San Antonio de Padua, Chiclayo, Perú',
    quienesSomos: 'Caminamos junto a nuestros hermanos mayores de la Orden Franciscana Seglar...',
    footerDireccion: 'Convento San Antonio de Padua, Chiclayo, Perú',
    footerEmail: 'jufrapomalca@gmail.com',
    footerTelefono: '+51 979 948 528',
    bannerTitle: '',
    bannerDescription: '',
    bannerImage: '',
    bannerLink: '',
    bannerActive: false
  });

  const [fraternidades, setFraternidades] = useState([
    {
      id: 'chiclayo-fallback',
      nombre: 'Fraternidad OFS Chiclayo',
      patrono: 'Santa Isabel de Hungría',
      sede: 'Convento San Antonio de Padua',
      departamento: 'Lambayeque',
      ciudad: 'Chiclayo',
      zona: 'norte',
      horarios: '1er y 3er sábado de cada mes - 4:30 PM (Reunión formativa y oración)',
      contacto: 'Consejo Fraternidad OFS',
      telefono: '+51 979 948 528',
      enlaceWeb: '/ofs/chiclayo',
      activo: true
    }
  ]);

  const [loadingFraternidades, setLoadingFraternidades] = useState(true);
  const [selectedFraternidad, setSelectedFraternidad] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [webRes, ofsRes, fratRes] = await Promise.allSettled([
          api.get('/web-config'),
          api.get('/ofs-config'),
          api.get('/ofs-fraternidades')
        ]);
        
        let newConfig = { ...config };
        if (webRes.status === 'fulfilled' && webRes.value.data?.success) {
          newConfig = { ...newConfig, ...webRes.value.data.data };
        }
        if (ofsRes.status === 'fulfilled' && ofsRes.value.data?.success) {
          const ofsData = ofsRes.value.data.data;
          newConfig = {
              ...newConfig,
              ...ofsData,
              ofsHeroTitle: ofsData.heroTitle,
              ofsHeroSubtitle: ofsData.heroSubtitle,
              ofsMapQuery: ofsData.mapQuery,
              quienesSomos: ofsData.quienesSomos,
              footerDireccion: ofsData.footerDireccion,
              footerEmail: ofsData.footerEmail,
              footerTelefono: ofsData.footerTelefono
          };
        }
        setConfig(newConfig);

        if (fratRes.status === 'fulfilled' && fratRes.value.data?.data?.length > 0) {
          // Filtrar las activas
          const activeFrats = fratRes.value.data.data.filter(f => f.activo !== false);
          if (activeFrats.length > 0) {
            setFraternidades(activeFrats);
          }
        }
      } catch (err) {
        console.error('Error al cargar config u OFS:', err);
      } finally {
        setLoadingFraternidades(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  // WhatsApp directo
  const getWhatsAppLink = (tel, nombre) => {
    if (!tel) return '';
    const cleanNumber = tel.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 9 ? `51${cleanNumber}` : cleanNumber;
    const msg = `¡Paz y Bien! Deseo recibir información sobre las reuniones y vida fraterna de la Fraternidad ${nombre}. 🕊️`;
    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="landing-page animate-fade">
      {/* Navegación */}
      <nav className="landing-nav">
        <Link to="/" className="logo">ORDEN FRANCISCANA SEGLAR</Link>
        
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Regresar a JUFRA</Link>
          <a href="#historia" onClick={() => setIsMenuOpen(false)}>Historia</a>
          <a href="#regla" onClick={() => setIsMenuOpen(false)}>Nuestra Regla</a>
          <a href="#fraternidades" onClick={() => setIsMenuOpen(false)}>Fraternidades</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
        </div>
      </nav>

      {/* Hero Section OFS */}
      <header className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #3D2B1F 0%, #1A120B 100%)',
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        marginTop: '60px',
        position: 'relative'
      }}>
        <div className="hero-content" style={{ maxWidth: '850px', zIndex: 2 }}>
          <span style={{ 
            color: 'var(--secondary)', 
            fontWeight: 'bold', 
            letterSpacing: '3px', 
            textTransform: 'uppercase',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            display: 'inline-block'
          }}>
            Tercera Orden de San Francisco
          </span>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', color: '#FFF', fontFamily: 'var(--font-serif)' }}>
            Vivir el Evangelio en el Mundo
          </h1>
          <p className="hero-subtitle" style={{ color: '#E5DCC5', fontSize: '1.25rem', marginTop: '1.5rem', lineHeight: '1.6', opacity: 0.95 }}>
            Seglares, hombres y mujeres, solteros y casados, que inspirados por San Francisco de Asís nos comprometemos a llevar la luz de Cristo en nuestras familias, profesiones y sociedad.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#fraternidades" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '50px' }}>
              Encuentra tu Fraternidad
            </a>
            <a href="#historia" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', borderRadius: '50px', color: '#FFF', borderColor: 'rgba(255,255,255,0.4)' }}>
              Conoce Más
            </a>
          </div>
        </div>
      </header>

      {/* Historia e Identidad */}
      <section id="historia" className="section-padding" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--tertiary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nuestra Identidad</span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>¿Qué es la OFS?</h2>
          <div style={{ width: '60px', height: '3px', background: 'var(--primary)', margin: '0 auto' }}></div>
        </div>

        <div className="responsive-grid" style={{ gap: '3rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>
              Una vocación para laicos
            </h3>
            <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              La <strong>Orden Franciscana Seglar (OFS)</strong> fue fundada por el mismo <strong>San Francisco de Asís</strong> en 1221, inicialmente conocida como los <em>Hermanos y Hermanas de la Penitencia</em>. Nació para responder al deseo de tantas personas seglares que querían seguir su forma de vida sin dejar sus familias ni sus trabajos cotidianos.
            </p>
            <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
              Hoy somos una orden pública en la Iglesia Católica, con regla propia aprobada por la Santa Sede, comprometidos a construir un mundo más fraterno y justo desde la sencillez evangélica y la ecología integral.
            </p>
          </div>
          <div style={{ background: '#F5EBE1', padding: '2.5rem', borderRadius: '15px', borderLeft: '5px solid var(--secondary)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Nuestros Patronos</h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>👑 Santa Isabel de Hungría</strong>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Reina y modelo de caridad incansable hacia los pobres y enfermos.
              </p>
            </div>
            <div>
              <strong>👑 San Luis de Francia</strong>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Gobernante justo que testimonió el Evangelio en la política y el servicio social.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cita de la Regla */}
      <section id="regla" style={{ background: 'var(--surface)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div className="testimonial-card">
          <p className="testimonial-text">
            "Pasar del Evangelio a la vida y de la vida al Evangelio."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--secondary)' }}></div>
            <p style={{ fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
              — Regla de la OFS
            </p>
            <div style={{ width: '40px', height: '1px', background: 'var(--secondary)' }}></div>
          </div>
        </div>
      </section>

      {/* Fraternidades Locales OFS */}
      <section id="fraternidades" className="section-padding" style={{ background: '#FAF6F0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--tertiary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Presencia Local</span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Nuestras Fraternidades</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
            La Orden Franciscana Seglar está organizada en fraternidades locales. Encuentra la más cercana a ti y únete a nuestra familia.
          </p>
        </div>

        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '0 1rem'
        }}>
          {fraternidades.map((f) => {
            const fid = f.id || f._id;
            const hasWeb = Boolean(f.enlaceWeb || f.enlace_web);
            const webUrl = f.enlaceWeb || f.enlace_web;

            return (
              <div
                key={fid}
                className="feature-card"
                style={{
                  background: 'white',
                  textAlign: 'center',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(139, 90, 43, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                  
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#FDF6EC',
                    color: '#B45309',
                    marginBottom: '0.8rem',
                    textTransform: 'uppercase'
                  }}>
                    {f.ciudad ? `${f.ciudad} • ${f.departamento}` : f.departamento || 'OFS Perú'}
                  </span>

                  <h3 style={{ color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '1.35rem', fontWeight: 800 }}>
                    {f.nombre}
                  </h3>

                  {f.patrono && (
                    <div style={{ color: '#8B5A2B', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                      "{f.patrono}"
                    </div>
                  )}

                  {f.sede && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                      {f.sede}
                    </p>
                  )}

                  {f.horarios && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(139, 90, 43, 0.05)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text)',
                      marginBottom: '1.2rem',
                      textAlign: 'left'
                    }}>
                      <strong>🕒 Horarios:</strong> {f.horarios}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => setSelectedFraternidad(f)}
                    className="btn btn-primary"
                    style={{
                      padding: '0.8rem 1.5rem',
                      borderRadius: '50px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(139, 90, 43, 0.2)'
                    }}
                  >
                    Ver Información y Horarios ➔
                  </button>

                  {hasWeb && (
                    <Link
                      to={webUrl}
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--secondary, #8B5A2B)',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      🌐 Visitar micrositio web
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DETALLE DE FRATERNIDAD OFS */}
      {selectedFraternidad && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedFraternidad(null)}
          style={{
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
          }}
        >
          <div
            className="modal-content animate-scale"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              border: '1px solid #FFE0B2',
              position: 'relative',
              textAlign: 'left'
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedFraternidad(null)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: '#F3F4F6',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280'
              }}
            >
              ✕
            </button>

            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5A2B 0%, #5C3A21 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                color: 'white'
              }}>
                🕊️
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.4rem', fontWeight: 800 }}>
                  {selectedFraternidad.nombre}
                </h3>
                {selectedFraternidad.patrono && (
                  <div style={{ color: '#8B5A2B', fontWeight: 700, fontSize: '0.95rem' }}>
                    "{selectedFraternidad.patrono}"
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1.5rem',
              padding: '1.2rem',
              background: '#FAF6F0',
              borderRadius: '12px',
              fontSize: '0.95rem'
            }}>
              {selectedFraternidad.sede && (
                <div>
                  <strong>📍 Sede / Convento:</strong><br />
                  <span style={{ color: 'var(--text-muted)' }}>{selectedFraternidad.sede}</span>
                </div>
              )}

              <div>
                <strong>🏙️ Ubicación:</strong><br />
                <span style={{ color: 'var(--text-muted)' }}>
                  {selectedFraternidad.ciudad ? `${selectedFraternidad.ciudad}, ${selectedFraternidad.departamento}` : selectedFraternidad.departamento}
                </span>
              </div>

              {selectedFraternidad.horarios && (
                <div>
                  <strong>🕒 Horarios de Encuentro:</strong><br />
                  <span style={{ color: 'var(--text-muted)' }}>{selectedFraternidad.horarios}</span>
                </div>
              )}

              {(selectedFraternidad.contacto || selectedFraternidad.telefono) && (
                <div>
                  <strong>👤 Contacto / Ministro:</strong><br />
                  <span style={{ color: 'var(--text-muted)' }}>
                    {selectedFraternidad.contacto || 'Consejo Fraternidad'} {selectedFraternidad.telefono && `(${selectedFraternidad.telefono})`}
                  </span>
                </div>
              )}
            </div>

            {/* Botones de acción del modal */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
              {selectedFraternidad.telefono && (
                <a
                  href={getWhatsAppLink(selectedFraternidad.telefono, selectedFraternidad.nombre)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    flex: '1 1 200px',
                    padding: '0.8rem 1.2rem',
                    background: '#25D366',
                    color: 'white',
                    borderRadius: '50px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>💬</span> Escribir por WhatsApp
                </a>
              )}

              {(selectedFraternidad.enlaceWeb || selectedFraternidad.enlace_web) && (
                <Link
                  to={selectedFraternidad.enlaceWeb || selectedFraternidad.enlace_web}
                  className="btn btn-primary"
                  style={{
                    flex: '1 1 200px',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '50px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🌐</span> Visitar Micrositio ➔
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer General */}
      <footer id="contacto" className="landing-footer section-padding">
        <div className="responsive-grid" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Orden Franciscana Seglar</h3>
            <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Viviendo el Evangelio en familia, en el trabajo y en la sociedad.
            </p>
          </div>
        </div>
        
        <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', opacity: 0.5, fontSize: '0.85rem', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Orden Franciscana Seglar.
        </div>
      </footer>
    </div>
  );
};

export default TerceraOrdenView;
