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
        <Link to="/" className="logo">FAMILIA FRANCISCANA</Link>
        
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Regresar a JUFRA</Link>
          <a href="#ramas" onClick={() => setIsMenuOpen(false)}>Las Tres Ramas</a>
          <a href="#ofs" onClick={() => setIsMenuOpen(false)}>OFS (Tercera Orden)</a>
          <a href="#oracion" onClick={() => setIsMenuOpen(false)}>Oración</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
        </div>
      </nav>



      {/* Hero Section Familia Franciscana */}
      <header className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #4A3B2C 0%, #2C1E16 100%)',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        marginTop: '60px'
      }}>
        <div className="hero-content" style={{ maxWidth: '800px', zIndex: 2 }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#FFF' }}>La Familia Franciscana</h1>
          <p className="hero-subtitle" style={{ color: '#EAEAEA', fontSize: '1.2rem', marginTop: '1rem', opacity: 0.9 }}>
            Un árbol con tres grandes ramas, nacido de la inspiración de San Francisco de Asís para vivir el Santo Evangelio.
          </p>
        </div>
      </header>

      {/* Las Tres Ramas */}
      <section id="ramas" className="section-padding" style={{ background: '#FAF6F0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--tertiary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nuestra Historia</span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Las Tres Ramas</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
            San Francisco de Asís fundó tres órdenes para acoger a todas las personas llamadas a seguir a Cristo según su forma de vida, sin importar su estado civil o condición.
          </p>
        </div>

        <div className="features-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="feature-card" style={{ background: 'white' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🟤</div>
            <h3 style={{ color: 'var(--primary)' }}>Primera Orden</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Conformada por los hermanos religiosos. Se divide en Frailes Menores (OFM), Conventuales (OFMConv) y Capuchinos (OFMCap). Su vida está centrada en la fraternidad, la minoridad y la predicación.
            </p>
          </div>
          <div className="feature-card" style={{ background: 'white' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⛪</div>
            <h3 style={{ color: 'var(--primary)' }}>Segunda Orden</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Las Hermanas Clarisas, cofundadas con Santa Clara de Asís. Mujeres consagradas a Dios en la vida contemplativa, sosteniendo a la Iglesia y al mundo con su oración constante y pobreza.
            </p>
          </div>
          <div className="feature-card" style={{ background: 'white', border: '2px solid var(--secondary)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌍</div>
            <h3 style={{ color: 'var(--secondary)' }}>Tercera Orden</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Formada por la Tercera Orden Regular (TOR) y la <strong>Orden Franciscana Seglar (OFS)</strong>. La OFS está compuesta por hombres y mujeres que viven el carisma franciscano en su vida familiar y secular.
            </p>
            <Link to="/ofs" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '20px', textDecoration: 'none' }}>Conocer la OFS ➔</Link>
          </div>
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
