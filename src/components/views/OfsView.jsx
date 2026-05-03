import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const OfsView = () => {
  const [config, setConfig] = useState({
    familiaTitulo: 'Fraternidad OFS Santa Isabel de Hungría',
    familiaDescripcion: 'Caminamos junto a nuestros hermanos mayores...',
    emailContacto: 'jufrapomalca@gmail.com',
    telefonoContacto: '+51 979 948 528',
    mapQuery: 'Pomalca'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/web-config');
        if (res.data.success) setConfig(res.data.data);
      } catch (err) {
        console.error('Error al cargar config:', err);
      }
    };
    fetchConfig();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page animate-fade">
      {/* Navegación */}
      <nav className="landing-nav">
        <Link to="/" className="logo">OFS CHICLAYO</Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '700' }}>Regresar a JUFRA</Link>
          <a href="#historia">Identidad</a>
          <a href="#pilares">Vida Seglar</a>
          <a href="#oracion">Oración</a>
          <a href="#contacto">Contacto</a>
        </div>
      </nav>

      {/* Hero Section OFS */}
      <header className="hero-section" style={{ backgroundImage: `url('/hero_ofs_background.png')` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{config.familiaTitulo}</h1>
          <p className="hero-subtitle">
            Orden Franciscana Seglar: Viviendo el Evangelio en medio del mundo.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
              Conocer la Regla
            </button>
            <a href="#historia" className="btn btn-ghost" style={{ padding: '1rem 3rem', fontSize: '1.1rem', textDecoration: 'none' }}>
              Nuestra Identidad
            </a>
          </div>
        </div>
      </header>

      {/* Sección Identidad */}
      <section id="historia" style={{ padding: '8rem 10%', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title">¿Quiénes somos?</h2>
          <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
            {config.familiaDescripcion}
          </p>
        </div>
      </section>

      {/* Pilares OFS */}
      <section id="pilares" className="features-grid" style={{ background: 'rgba(139, 69, 19, 0.02)' }}>
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

      {/* Nueva Sección: Oramos por ti */}
      <section id="oracion" style={{ padding: '6rem 10%', background: 'white' }}>
        <div className="glass-card animate-fade" style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          padding: '4rem 3rem', 
          background: 'linear-gradient(135deg, #FFF9F2 0%, #FFF 100%)',
          border: '1px solid #FFE0B2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
          boxShadow: '0 15px 35px rgba(139, 69, 19, 0.05)'
        }}>
          <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' }}>🙏</div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>Oramos por ti</h2>
          <p style={{ fontSize: '1.3rem', lineHeight: '1.8', color: 'var(--text-main)', maxWidth: '700px' }}>
            Si buscas oración, nosotros podemos ayudarte. Bríndanos tu petición y lo haremos por ti y te acompañaremos espiritualmente.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <a 
              href={`https://wa.me/51979948528?text=Paz%20y%20Bien.%20Quisiera%20pedirles%20una%20intenci%C3%B3n%20de%20oraci%C3%B3n.`}
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary zoom-hover"
              style={{ 
                textDecoration: 'none', 
                padding: '1.2rem 3rem', 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                background: '#25D366',
                border: 'none',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enviar Petición vía WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Cita OFS */}
      <section className="testimonial-section">
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

      {/* Footer OFS */}
      <footer id="contacto" className="landing-footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', textAlign: 'left' }}>
          <div>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>OFS Chiclayo</h3>
            <p style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Fraternidad Santa Isabel de Hungría. Orden Franciscana Seglar del Perú.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Ubicación</h4>
            <p style={{ opacity: 0.8 }}>Convento San Antonio de Padua<br/>Chiclayo, Perú</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Contacto</h4>
            <p style={{ opacity: 0.8 }}>📧 {config.emailContacto}<br/>📱 {config.telefonoContacto}</p>
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
