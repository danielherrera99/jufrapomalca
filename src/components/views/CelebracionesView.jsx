import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const CelebracionesView = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEventos = async () => {
    try {
      const response = await api.get('/eventos/web');
      if (response.data && response.data.eventos) {
        setActividades(response.data.eventos);
      }
    } catch (error) {
      console.error('Error al cargar eventos de la web:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    const fecha = new Date(fechaString);
    // Ajustar zona horaria local sumando minutos offset
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString('es-ES', opciones);
  };

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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando actividades...</div>
          ) : actividades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕊️</div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>No hay actividades programadas por ahora</h3>
              <p style={{ color: 'var(--text-muted)' }}>Mantente atento a nuestras redes sociales o regresa pronto para ver los próximos encuentros.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
              {actividades.map((act) => (
                <div key={act._id} className="feature-card zoom-hover" style={{ 
                  background: 'white', 
                  padding: '0', 
                  overflow: 'hidden', 
                  borderRadius: '20px',
                  border: act.destacado ? '2px solid var(--secondary)' : 'none',
                  boxShadow: act.destacado ? '0 15px 35px rgba(212, 165, 116, 0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {act.imagenUrl && (
                    <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                      <img src={act.imagenUrl} alt={act.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {act.tipo || 'Evento'}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!act.imagenUrl && (
                      <span style={{ display: 'inline-block', background: 'rgba(139, 69, 19, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', alignSelf: 'flex-start', textTransform: 'capitalize' }}>
                        {act.tipo || 'Evento'}
                      </span>
                    )}
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '1rem', lineHeight: '1.4' }}>{act.titulo}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>📅</span> {formatearFecha(act.fecha)} {act.hora ? `• ${act.hora}` : ''}
                    </div>
                    {act.lugar && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        <span>📍</span> {act.lugar}
                      </div>
                    )}
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '2rem', flex: 1, whiteSpace: 'pre-line' }}>
                      {act.descripcion}
                    </p>
                    <a href={`https://wa.me/51981574685?text=Paz%20y%20Bien.%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre:%20${act.titulo}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textAlign: 'center', display: 'block', textDecoration: 'none', borderRadius: '10px', width: '100%' }}>
                      Saber Más / Inscribirme
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
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
