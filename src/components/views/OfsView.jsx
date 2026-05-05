import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const OfsView = () => {
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
    bannerActive: false
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [webRes, ofsRes] = await Promise.all([
          api.get('/web-config'),
          api.get('/ofs-config')
        ]);
        
        let newConfig = { ...config };
        if (webRes.data.success) {
          newConfig = { ...newConfig, ...webRes.data.data };
        }
        if (ofsRes.data.success) {
          const ofsData = ofsRes.data.data;
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
      } catch (err) {
        console.error('Error al cargar config:', err);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page animate-fade">
      {/* Navegación */}
      <nav className="landing-nav">
        <Link to="/" className="logo">OFS CHICLAYO</Link>
        
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Regresar a JUFRA</Link>
          <a href="#historia" onClick={() => setIsMenuOpen(false)}>Identidad</a>
          <a href="#pilares" onClick={() => setIsMenuOpen(false)}>Vida Seglar</a>
          <a href="#oracion" onClick={() => setIsMenuOpen(false)}>Oración</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
        </div>
      </nav>

      {/* SECCIÓN IMPACTO INICIAL: ORAMOS POR TI */}
      <section id="oracion" style={{ 
        background: 'linear-gradient(to right, #8B4513, #A0522D)', 
        padding: '2rem 1rem',
        color: 'white',
        textAlign: 'center',
        borderBottom: '4px solid #CD853F'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeInDown 1s' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🙏</div>
          <h2 style={{ color: '#FFDAB9', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Oramos por ti</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            Si buscas consuelo o quieres que te acompañemos en oración, envíanos tu petición hoy mismo.
          </p>
          <a 
            href={`https://wa.me/51979948528?text=Paz%20y%20Bien.%20Quisiera%20pedirles%20una%20intenci%C3%B3n%20de%20oraci%C3%B3n.`}
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary zoom-hover"
            style={{ 
              textDecoration: 'none', 
              padding: '0.8rem 2rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px',
              background: '#25D366',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            Enviar Petición vía WhatsApp
          </a>
        </div>
      </section>

      {/* NUEVO BANNER ESPECIAL (DINÁMICO) */}
      {config.bannerActive && (
        <section style={{ padding: '3rem 1rem', background: '#FFF9F2' }}>
            <div 
              className="glass-card zoom-hover" 
              style={{ 
                maxWidth: '1100px', 
                margin: '0 auto', 
                padding: 0, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid #FFE0B2',
                cursor: config.bannerLink ? 'pointer' : 'default'
              }}
              onClick={() => config.bannerLink && window.open(config.bannerLink, '_blank')}
            >
                {config.bannerImage && (
                    <div style={{ flex: 1, minHeight: '300px' }}>
                        <img 
                            src={config.bannerImage} 
                            alt={config.bannerTitle} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}
                <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        📢 Anuncio Especial
                    </span>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>
                        {config.bannerTitle}
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '2rem' }}>
                        {config.bannerDescription}
                    </p>
                    <div style={{ width: '60px', height: '4px', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                </div>
            </div>
        </section>
      )}

      {/* Hero Section OFS */}
      <header className="hero-section" style={{ 
        backgroundImage: `url('/hero_ofs_san_damian.png')`,
        minHeight: '60vh'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{config.ofsHeroTitle || config.familiaTitulo}</h1>
          <p className="hero-subtitle">
            {config.ofsHeroSubtitle || 'Orden Franciscana Seglar: Viviendo el Evangelio en medio del mundo.'}
          </p>
          <div className="flex-responsive" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
              Conocer la Regla
            </button>
            <a href="#historia" className="btn btn-ghost" style={{ padding: '1rem 3rem', textDecoration: 'none' }}>
              Nuestra Identidad
            </a>
          </div>
        </div>
      </header>

      {/* Sección Identidad */}
      <section id="historia" className="section-padding" style={{ background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title">¿Quiénes somos?</h2>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', lineHeight: '1.8', color: 'var(--text-muted)' }}>
            {config.quienesSomos}
          </p>
        </div>
      </section>

      {/* Pilares OFS */}
      <section id="pilares" className="features-grid section-padding" style={{ background: 'rgba(139, 69, 19, 0.02)' }}>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <h3>Vida Secular</h3>
          <p>Llevamos el espíritu de San Francisco a nuestras familias, trabajos y vida cotidiana, siendo luz en medio del mundo.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3>Fraternidad</h3>
          <p>Nos reunimos como hermanos para apoyarnos en el camino espiritual y fortalecer nuestro compromiso cristiano.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h3>Misión</h3>
          <p>Somos instrumentos de paz, justicia y caridad, promoviendo los valores evangélicos en la sociedad actual.</p>
        </div>
      </section>

      {/* Cita OFS */}
      <section className="testimonial-section section-padding">
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

      {/* Sección Ubicación / Mapa OFS */}
      <section id="ubicacion" className="section-padding" style={{ textAlign: 'center', background: 'white', borderTop: '1px solid var(--border)' }}>
        <h2 className="section-title">Nuestra Sede</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          La fraternidad se reúne en el Convento San Antonio de Padua. ¡Te invitamos a conocernos!
        </p>
        <div className="map-container zoom-hover" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <iframe 
            src={`https://www.google.com/maps?q=${encodeURIComponent(config.ofsMapQuery || 'Convento San Antonio de Padua, Chiclayo')}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
            width="100%" 
            height="400" 
            style={{ border: 0, borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
            allowFullScreen="" 
            loading="lazy" 
          ></iframe>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <a 
            href={`https://www.google.com/maps/search/${encodeURIComponent(config.ofsMapQuery || 'Convento San Antonio de Padua, Chiclayo')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            <span>📍</span> Abrir en Google Maps
          </a>
        </div>
      </section>

      {/* Footer OFS */}
      <footer id="contacto" className="landing-footer section-padding">
        <div className="responsive-grid" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left', '--grid-min': '250px' }}>
          <div>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>OFS Chiclayo</h3>
            <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Fraternidad Santa Isabel de Hungría. Orden Franciscana Seglar del Perú.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Ubicación</h4>
            <p style={{ opacity: 0.8 }}>{config.footerDireccion}</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Contacto</h4>
            <p style={{ opacity: 0.8 }}>📧 {config.footerEmail}<br/>📱 {config.footerTelefono}</p>
          </div>
        </div>
        
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', opacity: 0.5, fontSize: '0.85rem', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Orden Franciscana Seglar - Fraternidad Santa Isabel de Hungría.
        </div>
      </footer>
    </div>
  );
};

export default OfsView;
