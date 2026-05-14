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
    telefonoContacto: '...',
    mapQuery: 'Pomalca',
    familiaTitulo: 'Cargando...',
    familiaDescripcion: '...'
  });
  const [eventos, setEventos] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, eventosRes] = await Promise.all([
          api.get('/web-config'),
          api.get('/eventos')
        ]);
        
        if (configRes.data.success) setConfig(configRes.data.data);
        if (eventosRes.data.success) {
          const now = new Date();
          const proximos = eventosRes.data.data
            .filter(e => {
              const isFuture = new Date(e.fecha) >= now;
              const isVisibleOnWeb = !e.visibilidad || e.visibilidad === 'web' || e.visibilidad === 'todos';
              return isFuture && isVisibleOnWeb;
            })
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 3);
          setEventos(proximos);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('es', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="landing-page animate-fade">
      {/* Navegación Pública */}
      <nav className="landing-nav">
        <Link to="/" className="logo">
          JUFRA POMALCA
        </Link>
        
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#inicio" onClick={() => setIsMenuOpen(false)}>Inicio</a>
          <a href="#mision" onClick={() => setIsMenuOpen(false)}>Misión</a>
          <a href="#eventos" onClick={() => setIsMenuOpen(false)}>Eventos</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header 
        id="inicio" 
        className="hero-section" 
        style={{ backgroundImage: `url('/hero_jufra_background.png')` }}
        role="img"
        aria-label="Jóvenes de JUFRA Pomalca compartiendo en comunidad al atardecer"
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{config.heroTitle}</h1>
          <p className="hero-subtitle">
            {config.heroSubtitle}
          </p>
          <div className="flex-responsive" style={{ justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <button className="btn btn-primary zoom-hover" style={{ padding: '1rem 3.5rem', boxShadow: '0 4px 15px rgba(139, 90, 43, 0.3)' }}>
              Únete a nuestra fraternidad
            </button>
            <button className="btn btn-ghost zoom-hover" style={{ padding: '1rem 3rem', borderColor: 'white', color: 'white' }}>
              Ver actividades
            </button>
          </div>
        </div>
      </header>

      {/* Pilares Section */}
      <section id="mision" className="features-grid section-padding" style={{ background: 'white' }}>
        <div className="feature-card zoom-hover" style={{ borderTop: '4px solid #8B4513' }}>
          <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Espiritualidad</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.mision || 'Cultivando la fe a través de la oración y el encuentro fraterno.'}</p>
        </div>
        <div className="feature-card zoom-hover" style={{ borderTop: '4px solid #D4A574' }}>
          <div className="feature-icon-wrapper" style={{ background: 'rgba(212, 165, 116, 0.1)', color: '#D4A574' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Formación</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.vision || 'Preparándonos para ser instrumentos de paz en el mundo actual.'}</p>
        </div>
        <div className="feature-card zoom-hover" style={{ borderTop: '4px solid #A67C52' }}>
          <div className="feature-icon-wrapper" style={{ background: 'rgba(166, 124, 82, 0.1)', color: '#A67C52' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Fraternidad</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.valores || 'Viviendo en comunidad, compartiendo la alegría de ser hermanos.'}</p>
        </div>
      </section>

      {/* Familia Franciscana Section */}
      <section id="familia" className="section-padding" style={{ background: '#FFFAF3', position: 'relative', overflow: 'hidden' }}>
        <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', alignItems: 'center', gap: '4rem' }}>
          <div style={{ flex: '1.2', minWidth: '300px' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Familia Global</span>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', marginTop: '0.5rem' }}>Nuestra Familia Franciscana</h2>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{config.familiaTitulo || 'Orden Franciscana Seglar (OFS)'}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.9', textAlign: 'justify' }}>
              {config.familiaDescripcion || 'Caminamos junto a nuestros hermanos mayores de la OFS, compartiendo el mismo ideal de vida y misión en la Iglesia.'}
            </p>
            <div style={{ marginTop: '2.5rem' }}>
              <Link to="/familia-ofs" target="_blank" className="btn btn-primary" style={{ padding: '1rem 2.5rem', textDecoration: 'none', background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                Conocer más de la OFS
              </Link>
            </div>
          </div>
          <div style={{ flex: '0.8', minWidth: '280px', textAlign: 'center', position: 'relative', display: 'flex', justifyContent: 'center' }}>
             <div style={{ 
               width: '350px', 
               height: '350px', 
               background: 'var(--primary)', 
               borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', 
               opacity: 0.08, 
               position: 'absolute', 
               top: '50%', 
               left: '50%', 
               transform: 'translate(-50%, -50%)',
               zIndex: 1 
             }}></div>
              <img 
                src="/escudo_ofs.jpg" 
                alt="Escudo OFS" 
                className="zoom-hover"
                style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '260px', height: 'auto', filter: 'drop-shadow(0 20px 30px rgba(139, 69, 19, 0.15))' }} 
              />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="testimonial-section section-padding" style={{ background: 'var(--primary)', color: 'white' }}>
        <div className="testimonial-card" style={{ background: 'transparent', boxShadow: 'none' }}>
          <span style={{ fontSize: '5rem', display: 'block', height: '30px', opacity: 0.3, fontFamily: 'serif', marginBottom: '1rem' }}>"</span>
          <p className="testimonial-text" style={{ color: 'white', fontSize: '1.8rem', fontStyle: 'italic', fontWeight: '300' }}>
            {config.fraseInspiradora || 'Empieza por hacer lo necesario, luego lo que es posible, y de pronto estarás haciendo lo imposible.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ width: '50px', height: '2px', background: 'rgba(255,255,255,0.3)' }}></div>
            <p style={{ fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.9rem' }}>
              — {config.autorFrase || 'San Francisco de Asís'}
            </p>
            <div style={{ width: '50px', height: '2px', background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
        </div>
      </section>

      {/* Próximos Eventos Section */}
      <section id="eventos" className="events-section section-padding">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Próximos Encuentros</h2>
          <p style={{ color: 'var(--text-muted)' }}>Espacios de alegría, formación y fe para toda la juventud.</p>
        </div>
        <div style={{ maxWidth: '950px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
          {eventos.length > 0 ? (
            eventos.map(event => {
              const { day, month } = formatDate(event.fecha);
              return (
                <div key={event._id} className="event-mini-card zoom-hover" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className="event-date-box" style={{ background: 'var(--secondary)', minWidth: '80px', height: '80px', borderRadius: '15px' }}>
                    <div className="event-date-day" style={{ fontSize: '1.8rem' }}>{day}</div>
                    <div className="event-date-month" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{month}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{event.tipo || 'Encuentro'}</span>
                    <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem', margin: '5px 0' }}>{event.titulo}</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ opacity: 0.7 }}>📍</span> {event.lugar || 'Fraternidad Pomalca'}
                    </p>
                  </div>
                  <button className="btn btn-ghost" style={{ borderRadius: '50px', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>Ver detalles</button>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#F9FAFB', borderRadius: '30px', border: '2px dashed var(--border)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📅</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Pronto anunciaremos nuestras próximas actividades.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 'bold' }}>¡Mantente conectado!</p>
            </div>
          )}
        </div>
      </section>

      {/* Sección Ubicación / Mapa */}
      <section id="ubicacion" className="section-padding" style={{ textAlign: 'center', background: 'white' }}>
        <h2 className="section-title">Encuéntranos</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Te esperamos en nuestra fraternidad en Pomalca. ¡Ven a compartir con nosotros!
        </p>
        <div className="map-container zoom-hover" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.1)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <iframe 
            src={`https://www.google.com/maps?q=${encodeURIComponent(config.mapQuery || 'Pomalca')}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div style={{ marginTop: '2.5rem' }}>
          <a 
            href={`https://www.google.com/maps/search/${encodeURIComponent(config.mapQuery || 'Pomalca')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)', padding: '0.8rem 2.5rem' }}
          >
            <span>📍</span> Abrir en Google Maps
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="landing-footer section-padding" style={{ background: '#2D1B0E', color: 'white', borderTop: '4px solid var(--primary)' }}>
        <div className="responsive-grid" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left', '--grid-min': '250px', gap: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.8rem', letterSpacing: '1px' }}>JUFRA POMALCA</h3>
            <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              Comunidad de jóvenes que buscan vivir el Evangelio al estilo de San Francisco de Asís, sembrando paz y bien en cada rincón.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--secondary)' }}>Contáctanos</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.9 }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📧</span>
                <span style={{ fontSize: '0.95rem' }}>{config.emailContacto || 'jufrapomalca@gmail.com'}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.9 }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</span>
                <span style={{ fontSize: '0.95rem' }}>{config.telefonoContacto || '+51 900 000 000'}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.9 }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</span>
                <span style={{ fontSize: '0.95rem' }}>Pomalca, Chiclayo, Perú</span>
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--secondary)' }}>Síguenos</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" className="zoom-hover" style={{ background: 'rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="zoom-hover" style={{ background: 'rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center' }}>
          <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} Juventud Franciscana - Pomalca. Sembrando Paz y Bien.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/admin" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid var(--secondary)', padding: '0.4rem 1rem', borderRadius: '4px', opacity: 0.7 }}>
              Acceso Interno
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
