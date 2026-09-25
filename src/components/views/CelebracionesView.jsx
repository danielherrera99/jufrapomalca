import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const mockActividades = [
  {
    id: 1,
    titulo: 'Festividad de San Francisco de Asís',
    fecha: '11 Oct 2026',
    hora: '10:15 A.M.',
    lugar: 'Parroquia María del Perpetuo Socorro, Pomalca',
    descripcion: 'Acompáñanos en la Santa Misa por la festividad de nuestro Padre Seráfico. Habrá bendición de mascotas y campaña de desparasitación veterinaria.',
    imagen: '/hero_jufra_background.png',
    etiqueta: 'Solemnidad',
    destacado: true
  },
  {
    id: 2,
    titulo: 'Encuentro de Formación Sabatino',
    fecha: '18 Oct 2026',
    hora: '4:00 P.M.',
    lugar: 'Salón Parroquial JUFRA',
    descripcion: 'Tema: "El Cántico de las Criaturas en la actualidad". Compartiremos la Palabra, cantos y dinámicas grupales.',
    imagen: null,
    etiqueta: 'Formación',
    destacado: false
  },
  {
    id: 3,
    titulo: 'Visita Solidaria',
    fecha: '25 Oct 2026',
    hora: '9:00 A.M.',
    lugar: 'Asilo de Ancianos San José',
    descripcion: 'Llevaremos víveres, cantos y mucha alegría a nuestros hermanos mayores. ¡Súmate a esta obra de caridad!',
    imagen: null,
    etiqueta: 'Acción Social',
    destacado: false
  }
];

const CelebracionesView = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
        <Link to="/" className="logo">JUFRA POMALCA</Link>
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <a href="#actividades" onClick={() => setIsMenuOpen(false)}>Actividades</a>
          <a href="#pilares" onClick={() => setIsMenuOpen(false)}>Propósito</a>
          <Link to="/familia" onClick={() => setIsMenuOpen(false)}>Familia OFS</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" style={{ backgroundImage: `url('/hero_jufra_background.png')`, minHeight: '60vh' }}>
        <div className="hero-overlay-cinematic"></div>
        <div className="hero-content" style={{ marginTop: '5rem' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1rem', display: 'block' }}>Nuestra Vida Fraterna</span>
          <h1 className="hero-title reveal-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Celebraciones y Actividades</h1>
          <p className="hero-subtitle reveal-subtitle">
            Un espacio donde vivimos la fraternidad, la oración y el servicio al estilo de San Francisco de Asís. ¡Únete a nosotros!
          </p>
          <a href="#actividades" className="btn btn-primary zoom-hover" style={{ marginTop: '2rem', display: 'inline-block', textDecoration: 'none', padding: '1rem 3rem' }}>
            Ver Próximos Eventos
          </a>
        </div>
      </header>

      {/* Próximas Actividades */}
      <section id="actividades" className="section-padding" style={{ background: '#FAF6F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title">Próximas Actividades</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
              Descubre y agéndate para nuestros siguientes encuentros y misiones. Todos son bienvenidos a participar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {mockActividades.map((act) => (
              <div key={act.id} className="feature-card zoom-hover" style={{ 
                background: 'white', 
                padding: '0', 
                overflow: 'hidden', 
                borderRadius: '20px',
                border: act.destacado ? '2px solid var(--secondary)' : 'none',
                boxShadow: act.destacado ? '0 15px 35px rgba(212, 165, 116, 0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {act.imagen && (
                  <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img src={act.imagen} alt={act.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {act.etiqueta}
                    </div>
                  </div>
                )}
                
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {!act.imagen && (
                    <span style={{ display: 'inline-block', background: 'rgba(139, 69, 19, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', alignSelf: 'flex-start' }}>
                      {act.etiqueta}
                    </span>
                  )}
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '1rem', lineHeight: '1.4' }}>{act.titulo}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span>📅</span> {act.fecha} • {act.hora}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <span>📍</span> {act.lugar}
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '2rem', flex: 1 }}>
                    {act.descripcion}
                  </p>
                  <a href={`https://wa.me/51981574685?text=Paz%20y%20Bien.%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre:%20${act.titulo}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textAlign: 'center', display: 'block', textDecoration: 'none', borderRadius: '10px', width: '100%' }}>
                    Saber Más
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Los 4 Pilares (Compactos) */}
      <section id="pilares" className="section-padding" style={{ background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '3rem' }}>¿Qué vivimos en cada encuentro?</h2>
          
          <div className="features-grid">
            <div className="feature-card" style={{ background: '#FAF6F0', boxShadow: 'none' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Formación</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Charlas, dinámicas y talleres sobre espiritualidad franciscana y doctrina católica.</p>
            </div>
            <div className="feature-card" style={{ background: '#FAF6F0', boxShadow: 'none' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
              <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Oración</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Meditación del Evangelio, adoración al Santísimo y alabanza fraterna.</p>
            </div>
            <div className="feature-card" style={{ background: '#FAF6F0', boxShadow: 'none' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍞</div>
              <h4 style={{ color: 'var(--tertiary)', marginBottom: '1rem' }}>Eucaristía</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Participación comunitaria en la Santa Misa, el centro de nuestra vida fraterna.</p>
            </div>
            <div className="feature-card" style={{ background: '#FAF6F0', boxShadow: 'none' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤲</div>
              <h4 style={{ color: '#FF9800', marginBottom: '1rem' }}>Servicio</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acción social: visitas a asilos, ecología y ayuda a los más necesitados.</p>
            </div>
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
