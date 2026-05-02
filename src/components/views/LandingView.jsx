import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const LandingView = () => {
  const [config, setConfig] = useState({
    heroTitle: 'JUFRA Pomalca',
    heroSubtitle: 'Siguiendo los pasos de San Francisco de Asís y Santa Clara...',
    mision: 'Cargando misión...',
    vision: 'Cargando visión...',
    valores: 'Cargando valores...',
    fraseInspiradora: '...',
    autorFrase: '...',
    emailContacto: '...',
    telefonoContacto: '...'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/web-config');
        if (res.data.success) {
          setConfig(res.data.data);
        }
      } catch (err) {
        console.error('Error al cargar config web:', err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="landing-page animate-fade">
      {/* Navegación Pública */}
      <nav className="landing-nav">
        <Link to="/" className="logo">JUFRA POMALCA</Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#inicio" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '600' }}>Inicio</a>
          <a href="#mision" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '600' }}>Misión</a>
          <a href="#contacto" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '600' }}>Contacto</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="inicio" className="hero-section">
        <div className="tau-watermark">TAU</div>
        <h1 className="hero-title">{config.heroTitle}</h1>
        <p className="hero-subtitle">
          {config.heroSubtitle}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Únete a nuestra fraternidad
          </button>
          <button className="btn" style={{ background: 'white', border: '2px solid var(--primary)', color: 'var(--primary)', padding: '1rem 2.5rem' }}>
            Ver actividades
          </button>
        </div>
      </header>

      {/* Pilares Section */}
      <section id="mision" className="features-grid">
        <div className="feature-card zoom-hover">
          <span className="feature-icon">🔥</span>
          <h3>Espiritualidad</h3>
          <p>{config.mision}</p>
        </div>
        <div className="feature-card zoom-hover">
          <span className="feature-icon">📖</span>
          <h3>Formación</h3>
          <p>{config.vision}</p>
        </div>
        <div className="feature-card zoom-hover">
          <span className="feature-icon">🙏</span>
          <h3>Fraternidad</h3>
          <p>{config.valores}</p>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{ padding: '6rem 5%', textAlign: 'center', background: 'rgba(139, 69, 19, 0.03)' }}>
        <h2 style={{ fontStyle: 'italic', fontSize: '2.2rem', color: 'var(--primary)', maxWidth: '800px', margin: '0 auto' }}>
          {config.fraseInspiradora}
        </h2>
        <p style={{ marginTop: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>— {config.autorFrase}</p>
      </section>

      {/* Footer */}
      <footer id="contacto" className="landing-footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'left' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>JUFRA POMALCA</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Paz y Bien en nuestra fraternidad.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', opacity: 0.8, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>📧 {config.emailContacto}</li>
              <li>📱 {config.telefonoContacto}</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Redes Sociales</h4>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '1.5rem' }}>
              <span>🔵</span> <span>📸</span> <span>🐦</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', opacity: 0.6, fontSize: '0.8rem' }}>
          &copy; {new Date().getFullYear()} Juventud Franciscana del Perú. Todos los derechos reservados.
          <br />
          <Link to="/admin" className="admin-link">Acceso Interno (Consejo)</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
