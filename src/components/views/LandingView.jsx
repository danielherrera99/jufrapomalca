import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const LandingView = () => {
  const [config] = useState({
    heroTitle: 'JUFRA Pomalca',
    heroSubtitle: 'Siguiendo los pasos de San Francisco de Asís y Santa Clara...',
    mision: 'Cultivando la fe a través de la oración y el encuentro fraterno, llevando el Evangelio a la vida cotidiana.',
    vision: 'Preparándonos para ser instrumentos de paz en el mundo actual, siendo luz en nuestra comunidad.',
    valores: 'Viviendo en comunidad, compartiendo la alegría de ser hermanos y sirviendo con humildad.',
    fraseInspiradora: 'Empieza por hacer lo necesario, luego lo que es posible, y de pronto estarás haciendo lo imposible.',
    autorFrase: 'San Francisco de Asís',
    emailContacto: 'jufrapomalca@gmail.com',
    telefonoContacto: '+51 981 574 685',
    mapQuery: 'Parroquia María del Perpetuo Socorro, Pomalca',
    familiaTitulo: 'Orden Franciscana Seglar (OFS)',
    familiaDescripcion: 'Caminamos junto a nuestros hermanos mayores de la OFS, compartiendo el mismo ideal de vida y misión en la Iglesia.'
  });
  const [eventos, setEventos] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Modal de Interés
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestData, setInterestData] = useState({ nombre: '', edad: '', telefono: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scroll & ScrollSpy states
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Galería
  const [activeCategory, setActiveCategory] = useState('todas');
  const [galleryItems] = useState([
    {
      id: 1,
      titulo: 'Círculo de Oración Juvenil',
      descripcion: 'Encuentro íntimo de oración y canto bajo la luz de Cristo.',
      categoria: 'encuentros',
      archivoUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      titulo: 'Acción Ecológica Laudato Si\'',
      descripcion: 'Sembrado de árboles en Pomalca cuidando nuestra casa común.',
      categoria: 'apostolado',
      archivoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      titulo: 'Abrazo Fraterno Franciscano',
      descripcion: 'Celebrando la hermandad y alegría de estar juntos en fe.',
      categoria: 'fraternidad',
      archivoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      titulo: 'Misión Navideña Comunitaria',
      descripcion: 'Llevando alegría y canastas de víveres a las familias pomalqueñas.',
      categoria: 'apostolado',
      archivoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 5,
      titulo: 'Jornada Espiritual de Cuaresma',
      descripcion: 'Reflexión y retiro espiritual con el Consejo y hermanos de la OFS.',
      categoria: 'encuentros',
      archivoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 6,
      titulo: 'Cena de Confraternidad Jufra',
      descripcion: 'Compartiendo el pan y vivencias de nuestra vida diaria.',
      categoria: 'fraternidad',
      archivoUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  const filteredGalleryItems = activeCategory === 'todas'
    ? galleryItems
    : galleryItems.filter(item => item.categoria === activeCategory);

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.post('/solicitudes', {
        nombre: interestData.nombre,
        edad: interestData.edad,
        telefono: interestData.telefono
      });
      setSubmitSuccess(true);
    } catch (error) {
      setErrorMessage('Hubo un error al enviar tus datos. Por favor, intenta de nuevo o contáctanos por WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // 1. Transparent to solid/blurred background
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // 2. Active Section Spy
      const sections = ['inicio', 'mision', 'historia', 'galeria', 'eventos', 'contacto'];
      const scrollPosition = window.scrollY + 200; // Offset for navbar

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventosRes = await api.get('/eventos');
        
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
    <>
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
            <a href="#inicio" className={activeSection === 'inicio' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Inicio</a>
            <a href="#mision" className={activeSection === 'mision' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Misión</a>
            <a href="#historia" className={activeSection === 'historia' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Nuestro Camino</a>
            <a href="#galeria" className={activeSection === 'galeria' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Galería</a>
            <a href="#eventos" className={activeSection === 'eventos' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Eventos</a>
            <a href="#contacto" className={activeSection === 'contacto' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Contacto</a>
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
          <div className="hero-overlay-cinematic"></div>
          <div className="hero-content">
            <h1 className="hero-title reveal-title">{config.heroTitle}</h1>
            <p className="hero-subtitle reveal-subtitle">
              {config.heroSubtitle}
            </p>
            <div className="flex-responsive reveal-buttons" style={{ justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary zoom-hover" onClick={() => setIsInterestModalOpen(true)} style={{ padding: '1rem 2.5rem', boxShadow: '0 4px 15px rgba(139, 90, 43, 0.3)' }}>
                Únete a nuestra fraternidad
              </button>
              <a href="#eventos" className="btn btn-ghost zoom-hover" style={{ padding: '1rem 2.5rem', borderColor: 'white', color: 'white', textDecoration: 'none' }}>
                Ver actividades
              </a>
            </div>
          </div>
        </header>

        {/* Pilares Section */}
        <div className="features-grid-wrapper">
          <section id="mision" className="features-grid" style={{ background: 'transparent' }}>
            <div className="pillar-glass-card zoom-hover" style={{ '--card-accent': 'var(--primary)' }}>
              <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.3s ease' }}>
                  <path d="M12 2v20M5 7h14" />
                </svg>
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Espiritualidad</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.mision || 'Cultivando la fe a través de la oración y el encuentro fraterno.'}</p>
            </div>
            
            <div className="pillar-glass-card zoom-hover" style={{ '--card-accent': 'var(--secondary)' }}>
              <div className="feature-icon-wrapper" style={{ background: 'rgba(212, 165, 116, 0.1)', color: '#D4A574' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.3s ease' }}>
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Formación</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.vision || 'Preparándonos para ser instrumentos de paz en el mundo actual.'}</p>
            </div>
            
            <div className="pillar-glass-card zoom-hover" style={{ '--card-accent': 'var(--tertiary)' }}>
              <div className="feature-icon-wrapper" style={{ background: 'rgba(107, 142, 35, 0.1)', color: '#6B8E23' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.3s ease' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Fraternidad</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.valores || 'Viviendo en comunidad, compartiendo la alegría de ser hermanos.'}</p>
            </div>
          </section>
        </div>

        {/* Familia Franciscana Section */}
        <section id="familia" className="section-padding" style={{ background: '#FFFAF3', position: 'relative', overflow: 'hidden' }}>
          <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', alignItems: 'center', gap: '4rem' }}>
            <div style={{ flex: '1.2', minWidth: '300px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Familia Global</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', marginTop: '0.5rem' }}>Nuestra Familia Franciscana</h2>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{config.familiaTitulo || 'Orden Franciscana Seglar (OFS) y JUFRA Global'}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.9', textAlign: 'justify' }}>
                {config.familiaDescripcion || 'Caminamos junto a nuestros hermanos mayores de la OFS, compartiendo el mismo ideal de vida y misión en la Iglesia. Asimismo, formamos parte de una inmensa fraternidad de jóvenes presente en los cinco continentes, compartiendo el carisma de San Francisco de Asís a nivel internacional.'}
              </p>
              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/familia-ofs" target="_blank" className="btn btn-ghost zoom-hover" style={{ padding: '1rem 2.5rem', textDecoration: 'none' }}>
                  Conocer más de la OFS
                </Link>
                <a href="https://youfra.net/es/inicio/" target="_blank" rel="noopener noreferrer" className="btn btn-primary zoom-hover" style={{ padding: '1rem 2.5rem', textDecoration: 'none' }}>
                  JUFRA en el Mundo 🌐
                </a>
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

        {/* Sección Nuestro Camino (Timeline) */}
        <section id="historia" className="section-padding" style={{ background: '#FAF6F0', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nuestra Historia</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Nuestro Camino</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Conoce los momentos clave y el recorrido de amor, fe y servicio de la Juventud Franciscana en Pomalca.</p>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            <div className="timeline-item animate-fade">
              <div className="timeline-dot" style={{ '--dot-color': 'var(--primary)' }}></div>
              <div className="timeline-card">
                <div className="timeline-year" style={{ '--dot-color': 'var(--primary)' }}>2018</div>
                <h4 className="timeline-title">Fundación de la Fraternidad</h4>
                <p className="timeline-text">
                  Un pequeño grupo de jóvenes, impulsados por el carisma de San Francisco de Asís y Santa Clara, inicia las reuniones semanales de oración y vida fraterna en la Parroquia de Pomalca, sembrando las primeras semillas de paz y bien.
                </p>
              </div>
            </div>

            <div className="timeline-item animate-fade">
              <div className="timeline-dot" style={{ '--dot-color': 'var(--secondary)' }}></div>
              <div className="timeline-card">
                <div className="timeline-year" style={{ '--dot-color': 'var(--secondary)' }}>2021</div>
                <h4 className="timeline-title">Crecimiento y Misión Activa</h4>
                <p className="timeline-text">
                  Consolidación de las misiones y obras sociales navideñas en los sectores más vulnerables de Pomalca. La fraternidad crece en número de hermanos y se convierte en un pilar activo de apoyo social y espiritual en toda la comunidad.
                </p>
              </div>
            </div>

            <div className="timeline-item animate-fade">
              <div className="timeline-dot" style={{ '--dot-color': 'var(--tertiary)' }}></div>
              <div className="timeline-card">
                <div className="timeline-year" style={{ '--dot-color': 'var(--tertiary)' }}>2026</div>
                <h4 className="timeline-title">Juventud e Innovación Digital</h4>
                <p className="timeline-text">
                  Lanzamiento del portal web institucional y la aplicación móvil oficial de JUFRA Pomalca, permitiendo mayor cercanía con la comunidad, digitalización de asistencia, gestión interna y un canal de comunicación interactivo e inteligente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Galería Interactiva */}
        <section id="galeria" className="section-padding" style={{ background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Experiencias</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Momentos Compartidos</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Un recorrido visual por las diferentes actividades y vivencias que fortalecen nuestro lazo fraterno.</p>
          </div>

          <div className="gallery-tabs">
            <button 
              className={`gallery-tab ${activeCategory === 'todas' ? 'active' : ''}`}
              onClick={() => setActiveCategory('todas')}
            >
              Todas
            </button>
            <button 
              className={`gallery-tab ${activeCategory === 'encuentros' ? 'active' : ''}`}
              onClick={() => setActiveCategory('encuentros')}
            >
              Encuentros
            </button>
            <button 
              className={`gallery-tab ${activeCategory === 'apostolado' ? 'active' : ''}`}
              onClick={() => setActiveCategory('apostolado')}
            >
              Apostolado
            </button>
            <button 
              className={`gallery-tab ${activeCategory === 'fraternidad' ? 'active' : ''}`}
              onClick={() => setActiveCategory('fraternidad')}
            >
              Fraternidad
            </button>
          </div>

          <div className="gallery-grid">
            {filteredGalleryItems.map(item => (
              <div key={item.id} className="gallery-card zoom-hover">
                <img src={item.archivoUrl} alt={item.titulo} className="gallery-img" />
                <div className="gallery-overlay">
                  <span className="gallery-overlay-cat">{item.categoria}</span>
                  <h4 className="gallery-overlay-title">{item.titulo}</h4>
                  <p className="gallery-overlay-desc">{item.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Próximos Eventos Section */}
        <section id="eventos" className="events-section section-padding">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Agenda</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Próximos Encuentros</h2>
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
              src={`https://www.google.com/maps?q=${encodeURIComponent(config.mapQuery || 'Parroquia María del Perpetuo Socorro, Pomalca')}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
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
              href={`https://www.google.com/maps/search/${encodeURIComponent(config.mapQuery || 'Parroquia María del Perpetuo Socorro, Pomalca')}`} 
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
                  <span style={{ fontSize: '0.95rem' }}>{config.telefonoContacto || '+51 981 574 685'}</span>
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
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>
              &copy; {new Date().getFullYear()} Juventud Franciscana - Pomalca. Sembrando Paz y Bien.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/admin" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid var(--secondary)', padding: '0.4rem 1rem', borderRadius: '4px', opacity: 0.7 }}>
                Acceso Interno
              </Link>
              <a href="/app-release.apk" download style={{ color: '#4CAF50', textDecoration: 'none', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #4CAF50', padding: '0.4rem 1rem', borderRadius: '4px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '5px' }}>
                📱 App Móvil
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal de Interés */}
      {isInterestModalOpen && (
        <div className="modal-overlay modal-overlay-blur" onClick={() => setIsInterestModalOpen(false)}>
          <div className="modal-content modal-elastic" style={{ maxWidth: '480px', background: 'var(--surface)', padding: '2.5rem', borderRadius: '28px' }} onClick={e => e.stopPropagation()}>
            
            {submitSuccess ? (
              <div className="success-state">
                <div className="success-dove-icon">🕊️</div>
                <h2 style={{ color: 'var(--tertiary)', marginBottom: '1rem', fontSize: '1.8rem', fontFamily: 'var(--font-serif)', fontWeight: 'bold' }}>¡Paz y Bien!</h2>
                <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>¡Registro recibido, {interestData.nombre}!</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                  Hemos recibido tus datos con gran alegría. Un hermano de nuestra fraternidad se comunicará contigo vía WhatsApp al número <strong>{interestData.telefono}</strong> para darte la bienvenida e invitarte a nuestra próxima jornada de jóvenes.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setIsInterestModalOpen(false);
                    setSubmitSuccess(false);
                    setInterestData({ nombre: '', edad: '', telefono: '' });
                  }}
                  style={{ padding: '0.8rem 2.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(107, 142, 35, 0.3)', background: 'var(--tertiary)', width: '100%', fontSize: '1rem', fontWeight: 'bold' }}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>🕊️</span>
                  <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.8rem', fontFamily: 'var(--font-serif)', fontWeight: 'bold' }}>Únete a JUFRA</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>Déjanos tus datos y nos comunicaremos contigo para invitarte a nuestra próxima jornada fraterna.</p>
                </div>
                
                {errorMessage && (
                  <div className="error-message" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
                    {errorMessage}
                  </div>
                )}
                
                <form onSubmit={handleInterestSubmit}>
                  <div className="input-group input-focus-line" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej: Francisco Asís"
                      value={interestData.nombre}
                      onChange={(e) => setInterestData({...interestData, nombre: e.target.value})}
                      style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem' }}
                    />
                  </div>
                  <div className="input-group input-focus-line" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>Edad</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="Ej: 22"
                      min="12"
                      max="40"
                      value={interestData.edad}
                      onChange={(e) => setInterestData({...interestData, edad: e.target.value})}
                      style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem' }}
                    />
                  </div>
                  <div className="input-group input-focus-line" style={{ marginBottom: '2rem' }}>
                    <label style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>Número de Teléfono / WhatsApp</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="Ej: 900 000 000"
                      value={interestData.telefono}
                      onChange={(e) => setInterestData({...interestData, telefono: e.target.value})}
                      style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem' }}
                    />
                  </div>
                  
                  <div className="flex-responsive" style={{ gap: '1rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setIsInterestModalOpen(false)} style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: '600' }}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(139, 90, 43, 0.3)', fontWeight: 'bold' }}>
                      {isSubmitting ? 'Enviando...' : 'Enviar Datos'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LandingView;
