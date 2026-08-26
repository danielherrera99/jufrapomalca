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
          <Link to="/familia" onClick={() => setIsMenuOpen(false)}>Familia Franciscana</Link>
          <a href="#historia" onClick={() => setIsMenuOpen(false)}>Identidad</a>
          <a href="#pilares" onClick={() => setIsMenuOpen(false)}>Vida Seglar</a>
          <a href="#oracion" onClick={() => setIsMenuOpen(false)}>Oración</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
        </div>
      </nav>





      {/* Hero Section OFS */}
      <header className="hero-section" style={{ 
        backgroundImage: `url('/hero_ofs_san_damian.png')`,
        minHeight: '60vh'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Orden Franciscana Seglar</h1>
          <p className="hero-subtitle">
            Laicos comprometidos a vivir el Evangelio en medio del mundo, en familia y en fraternidad.
          </p>
          <div className="flex-responsive" style={{ justifyContent: 'center' }}>
            <a href="#fraternidades" className="btn btn-primary" style={{ padding: '1rem 3rem', textDecoration: 'none' }}>
              Encuentra tu Fraternidad
            </a>
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

      {/* Fraternidades Locales */}
      <section id="fraternidades" className="section-padding" style={{ background: '#FAF6F0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--tertiary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Presencia Local</span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Nuestras Fraternidades</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
            La Orden Franciscana Seglar está organizada en fraternidades locales. Encuentra la más cercana a ti y únete a nuestra familia.
          </p>
        </div>

        <div className="features-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="feature-card" style={{ background: 'white', textAlign: 'center', padding: '3rem 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '15px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Fraternidad OFS Chiclayo</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <strong>"Santa Isabel de Hungría"</strong><br/>
              Convento San Antonio de Padua
            </p>
            <Link to="/ofs/chiclayo" className="btn btn-primary" style={{ padding: '0.8rem 2rem', textDecoration: 'none', borderRadius: '50px' }}>
              Ver Información y Horarios ➔
            </Link>
          </div>
        </div>
      </section>

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
