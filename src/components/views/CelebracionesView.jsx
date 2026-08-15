import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CelebracionesView = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page animate-fade">
      {/* Navegación Pública */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="logo">
          JUFRA POMALCA
        </Link>
        
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <Link to="/familia-ofs" onClick={() => setIsMenuOpen(false)}>Familia OFS</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header 
        className="hero-section" 
        style={{ 
          backgroundImage: `url('/hero_jufra_background.png')`,
          minHeight: '60vh'
        }}
      >
        <div className="hero-overlay-cinematic"></div>
        <div className="hero-content" style={{ marginTop: '5rem' }}>
          <h1 className="hero-title reveal-title" style={{ fontSize: '3.5rem' }}>Nuestras Celebraciones</h1>
          <p className="hero-subtitle reveal-subtitle">
            Un espacio donde vivimos la fraternidad, la oración y el servicio al estilo de San Francisco de Asís.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <section className="section-padding" style={{ background: '#FAF6F0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title">¿Qué vivimos en nuestros encuentros?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
              Nuestras reuniones sabatinas están diseñadas para abarcar todas las dimensiones del joven cristiano franciscano.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Formación */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', background: '#FFFFFF', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px', fontSize: '5rem', textAlign: 'center' }}>📖</div>
              <div style={{ flex: '2 1 400px' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Formación Humana y Cristiana</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  A través de charlas, dinámicas y talleres, profundizamos en temas de actualidad, crecimiento personal, doctrina católica y espiritualidad franciscana. Buscamos formar jóvenes íntegros y conscientes de su realidad.
                </p>
              </div>
            </div>

            {/* Oración */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', background: '#FFFFFF', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', alignItems: 'center', flexDirection: 'row-reverse' }}>
              <div style={{ flex: '1 1 300px', fontSize: '5rem', textAlign: 'center' }}>🙏</div>
              <div style={{ flex: '2 1 400px' }}>
                <h3 style={{ color: 'var(--secondary)', fontSize: '1.5rem', marginBottom: '1rem' }}>2. Oración Fraterna</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Hacemos un alto a nuestras actividades para conectarnos con Dios. Meditamos el Santo Evangelio, rezamos la Corona Seráfica, tenemos Adoración al Santísimo y compartimos nuestra fe a través del canto y la alabanza.
                </p>
              </div>
            </div>

            {/* Eucaristía */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', background: '#FFFFFF', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px', fontSize: '5rem', textAlign: 'center' }}>🍞</div>
              <div style={{ flex: '2 1 400px' }}>
                <h3 style={{ color: 'var(--tertiary)', fontSize: '1.5rem', marginBottom: '1rem' }}>3. La Santa Eucaristía</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Es el centro de nuestra vida fraterna. Como comunidad, participamos activamente en la Misa Parroquial, alimentándonos del Cuerpo de Cristo para tomar fuerzas y ser testimonios vivos en el mundo.
                </p>
              </div>
            </div>

            {/* Servicio */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', background: '#FFFFFF', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', alignItems: 'center', flexDirection: 'row-reverse' }}>
              <div style={{ flex: '1 1 300px', fontSize: '5rem', textAlign: 'center' }}>🤲</div>
              <div style={{ flex: '2 1 400px' }}>
                <h3 style={{ color: '#FF9800', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Acción Social y Proyección</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  El amor no puede quedarse solo en palabras. Organizamos visitas a asilos, albergues infantiles, apoyo a los más necesitados y cuidado de nuestra Casa Común (Ecología) como respuesta viva al mandato del Señor.
                </p>
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '1rem 2rem', borderRadius: '50px', background: 'var(--primary)', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              ← Volver a la página principal
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JUFRA Pomalca. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CelebracionesView;
