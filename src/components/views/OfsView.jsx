import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const OfsView = () => {
  const [config, setConfig] = useState({
    familiaTitulo: 'Fraternidad OFS Santa Isabel de Hungría',
    familiaDescripcion: 'Caminamos junto a nuestros hermanos mayores...',
    emailContacto: 'jufrapomalca@gmail.com',
    telefonoContacto: '+51 981 574 685',
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
