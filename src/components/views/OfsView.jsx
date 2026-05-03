import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const OfsView = () => {
  const [config, setConfig] = useState({
    familiaTitulo: 'Fraternidad OFS Santa Isabel de Hungría',
    familiaDescripcion: '...'
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
    window.scrollTo(0, 0); // Empezar desde arriba
  }, []);

  return (
    <div className="landing-page animate-fade">
      {/* Navegación Simple */}
      <nav className="landing-nav">
        <Link to="/" className="logo">JUFRA POMALCA</Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '700' }}>← Volver al Inicio</Link>
      </nav>

      {/* Hero de la OFS */}
      <header className="hero-section" style={{ background: 'var(--primary)', padding: '8rem 5% 6rem', color: 'white' }}>
        <div className="hero-content">
          <h1 className="hero-title" style={{ color: 'white', fontSize: '3.5rem' }}>{config.familiaTitulo}</h1>
          <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Nuestros hermanos mayores de la Orden Franciscana Seglar.
          </p>
        </div>
      </header>

      {/* Contenido Base - Aquí es donde seguiremos construyendo */}
      <section style={{ padding: '6rem 10%', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Sobre la Fraternidad</h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {config.familiaDescripcion}
        </p>
        
        <div className="glass-card" style={{ padding: '3rem', marginTop: '4rem', borderLeft: '5px solid var(--primary)' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Un camino de vida</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
            La Orden Franciscana Seglar (OFS) es una fraternidad de hombres y mujeres laicos que, movidos por el Espíritu Santo, se comprometen a vivir el Evangelio a la manera de San Francisco de Asís, en su propio estado secular, siguiendo una Regla aprobada por la Iglesia.
          </p>
        </div>

        {/* Espacio para más contenido futuro */}
        <div style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.5 }}>
          <span style={{ fontSize: '3rem' }}>🕯️</span>
          <p style={{ fontStyle: 'italic', marginTop: '1rem' }}>Próximamente más información sobre historia, actividades y miembros de la OFS Santa Isabel de Hungría.</p>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="landing-footer" style={{ marginTop: '4rem' }}>
        <p>&copy; {new Date().getFullYear()} Fraternidad OFS Santa Isabel de Hungría - Chiclayo</p>
        <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '1rem' }}>Paz y Bien</p>
      </footer>
    </div>
  );
};

export default OfsView;
