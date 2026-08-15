import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { DEPARTAMENTOS_MAPA } from '../../config/mapData';


const LandingView = () => {
  const [config, setConfig] = useState({
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
    familiaDescripcion: 'Caminamos junto a nuestros hermanos mayores de la OFS, compartiendo el mismo ideal de vida y misión en la Iglesia.',
    facebookUrl: '',
    instagramUrl: '',
    whatsappUrl: '',
    tiktokUrl: ''
  });
  const [eventos, setEventos] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estados para JUFRA en el Perú
  const [fraternidades, setFraternidades] = useState([]);
  const [loadingFrat, setLoadingFrat] = useState(true);
  const [selectedDepto, setSelectedDepto] = useState('todos');
  const [selectedZona, setSelectedZona] = useState('todas');
  const [searchFrat, setSearchFrat] = useState('');
  const [hoveredDepto, setHoveredDepto] = useState(null);
  
  // Modal de Interés
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestData, setInterestData] = useState({ nombre: '', edad: '', telefono: '', mensaje: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scroll & ScrollSpy states
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Galería
  const [activeCategory, setActiveCategory] = useState('todas');
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const fetchGaleria = async () => {
      try {
        const { data } = await api.get('/galeria-web');
        if (data.success) {
          setGalleryItems(data.galeria);
        }
      } catch (err) {
        console.error('Error fetching galeria', err);
      }
    };
    fetchGaleria();
  }, []);

  const [activeSocialTab, setActiveSocialTab] = useState('facebook');

  const [socialPosts, setSocialPosts] = useState({
    facebook: [],
    instagram: [],
    tiktok: [],
    youtube: []
  });

  useEffect(() => {
    const fetchRedes = async () => {
      try {
        const { data } = await api.get('/redes');
        if (data.posts) {
          setSocialPosts({
            facebook: data.posts.filter(p => p.red_social === 'facebook').map(p => ({
              id: p.id,
              pageName: p.author_name,
              pageIcon: p.author_icon,
              date: p.date_text,
              content: p.content,
              image: p.image_url,
              likes: p.likes,
              comments: p.comments,
              link: p.link
            })),
            instagram: data.posts.filter(p => p.red_social === 'instagram').map(p => ({
              id: p.id,
              username: p.author_name,
              userIcon: p.author_icon,
              image: p.image_url,
              likes: p.likes,
              caption: p.content,
              date: p.date_text,
              link: p.link
            })),
            tiktok: data.posts.filter(p => p.red_social === 'tiktok').map(p => ({
              id: p.id,
              username: p.author_name,
              description: p.content,
              thumbnail: p.image_url,
              likes: p.likes,
              link: p.link
            })),
            youtube: data.posts.filter(p => p.red_social === 'youtube').map(p => ({
              id: p.id,
              channelName: p.author_name,
              channelIcon: p.author_icon,
              title: p.content,
              thumbnail: p.image_url,
              views: p.likes,
              date: p.date_text,
              link: p.link
            }))
          });
        }
      } catch (err) {
        console.error('Error fetching redes', err);
      }
    };
    fetchRedes();
  }, []);

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
        telefono: interestData.telefono,
        mensaje: interestData.mensaje
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
      const sections = ['inicio', 'mision', 'historia', 'nacional', 'galeria', 'eventos', 'contacto'];
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

  const normalizeString = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const activeDeptos = useMemo(() => {
    const list = fraternidades.map(f => f.departamento).filter(Boolean);
    return [...new Set(list)].sort();
  }, [fraternidades]);

  const filteredFraternidades = useMemo(() => {
    return fraternidades.filter(f => {
      // 1. Search match
      if (searchFrat.trim()) {
        const query = searchFrat.toLowerCase();
        const matchesName = f.nombre?.toLowerCase().includes(query);
        const matchesParish = f.parroquia?.toLowerCase().includes(query);
        const matchesContact = f.contacto?.toLowerCase().includes(query);
        if (!matchesName && !matchesParish && !matchesContact) return false;
      }

      // 2. Zone match
      if (selectedZona !== 'todas' && f.zona !== selectedZona) return false;

      // 3. Depto match
      if (selectedDepto !== 'todos') {
        if (normalizeString(f.departamento) !== normalizeString(selectedDepto)) return false;
      }

      return true;
    });
  }, [fraternidades, searchFrat, selectedZona, selectedDepto]);

  const getWhatsAppLink = (tel, nombre) => {
    if (!tel) return '';
    const cleanNumber = tel.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 9 ? `51${cleanNumber}` : cleanNumber;
    const message = `¡Paz y Bien! Deseo contactarme con la Fraternidad ${nombre} de JUFRA en el Perú. 🕊️`;
    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
  };

  const getZonaStyles = (zona) => {
    switch (zona) {
      case 'norte':
        return { color: '#8B4513', badgeClass: 'norte' };
      case 'centro':
        return { color: '#D4A574', badgeClass: 'centro' };
      case 'lima_callao_sur_medio':
        return { color: '#1A5276', badgeClass: 'lima-callao-sur-medio' };
      case 'sur_altiplano':
        return { color: '#6C3483', badgeClass: 'sur-altiplano' };
      case 'sur':
        return { color: '#6B8E23', badgeClass: 'sur' };
      default:
        return { color: 'var(--primary)', badgeClass: '' };
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/web-config');
        if (res.data.success) {
          setConfig(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Error al cargar config web:', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchFraternidades = async () => {
      try {
        const res = await api.get('/fraternidades');
        if (res.data.success) {
          setFraternidades(res.data.data);
        }
      } catch (err) {
        console.error('Error al cargar fraternidades:', err);
      } finally {
        setLoadingFrat(false);
      }
    };
    fetchFraternidades();
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
            <a href="#nacional" className={activeSection === 'nacional' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>JUFRA en el Perú</a>
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
                <div className="timeline-year" style={{ '--dot-color': 'var(--primary)' }}>2000</div>
                <h4 className="timeline-title">Fundación de la Fraternidad</h4>
                <p className="timeline-text">
                  El 18 de mayo de 2000 nace JUFRA Pomalca por iniciativa de jóvenes catecúmenos liderados por Raúl Tantaleán y guiados por el párroco Pedro Delfín Vidalón. El 8 de octubre es presentada oficialmente a la población.
                </p>
              </div>
            </div>

            <div className="timeline-item animate-fade">
              <div className="timeline-dot" style={{ '--dot-color': 'var(--secondary)' }}></div>
              <div className="timeline-card">
                <div className="timeline-year" style={{ '--dot-color': 'var(--secondary)' }}>2019</div>
                <h4 className="timeline-title">Camino al Reconocimiento</h4>
                <p className="timeline-text">
                  El hermano Jean Pierre Juárez asume el cargo de coordinador e inicia, junto a su consejo, la búsqueda activa del reconocimiento e integración canónica e histórica formal ante la Orden Franciscana Seglar (OFS).
                </p>
              </div>
            </div>

            <div className="timeline-item animate-fade">
              <div className="timeline-dot" style={{ '--dot-color': 'var(--tertiary)' }}></div>
              <div className="timeline-card">
                <div className="timeline-year" style={{ '--dot-color': 'var(--tertiary)' }}>2024</div>
                <h4 className="timeline-title">Reconocimiento Oficial OFS</h4>
                <p className="timeline-text">
                  El 3 de enero de 2024, tras cumplir con las Constituciones Generales, se promulga el decreto de reconocimiento formal de JUFRA Pomalca y se convoca a elecciones para conformar el primer consejo electivo oficial.
                </p>
              </div>
            </div>

            <div className="timeline-item animate-fade">
              <div className="timeline-dot" style={{ '--dot-color': 'var(--primary)' }}></div>
              <div className="timeline-card">
                <div className="timeline-year" style={{ '--dot-color': 'var(--primary)' }}>2026</div>
                <h4 className="timeline-title">Innovación e Impacto Digital</h4>
                <p className="timeline-text">
                  Consolidación de la fraternidad a nivel nacional y lanzamiento oficial del portal web institucional y aplicación móvil de JUFRA Pomalca, digitalizando la asistencia, gestión interna y la comunicación fraterna.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Etapas de un joven franciscano */}
        <section id="etapas" className="section-padding" style={{ background: '#FFFFFF' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Formación</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Etapas de un joven franciscano</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              El camino vocacional en la Juventud Franciscana se vive de manera progresiva, madurando en la fe y en el compromiso fraterno a través de tres grandes etapas.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
            {/* Iniciado */}
            <div className="etapa-card" style={{ flex: '1 1 250px', background: '#FAF6F0', borderRadius: '15px', padding: '2rem', textAlign: 'center', borderTop: '5px solid var(--tertiary)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '1.4rem' }}>Iniciado</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Tiempo de acercamiento, descubrimiento y conocimiento inicial de la Fraternidad y del hermoso carisma franciscano.
              </p>
            </div>

            {/* Aceptado */}
            <div className="etapa-card" style={{ flex: '1 1 250px', background: '#FAF6F0', borderRadius: '15px', padding: '2rem', textAlign: 'center', borderTop: '5px solid var(--secondary)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '1.4rem' }}>Aceptado</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Etapa de formación y discernimiento profundo de la vocación, participando activamente en la vida y misión fraterna.
              </p>
            </div>

            {/* Comprometido */}
            <div className="etapa-card" style={{ flex: '1 1 250px', background: '#FAF6F0', borderRadius: '15px', padding: '2rem', textAlign: 'center', borderTop: '5px solid var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌳</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem', fontSize: '1.4rem' }}>Comprometido</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Promesa formal ante Dios y la Iglesia de vivir el Santo Evangelio a la manera de San Francisco de Asís.
              </p>
            </div>
          </div>
        </section>

        {/* Sección Símbolos Franciscanos */}
        <section id="simbolos" className="section-padding" style={{ background: '#FAF6F0' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--tertiary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nuestra Identidad</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Símbolos Franciscanos</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
              Estos son los principales símbolos que nos identifican y acompañan nuestra espiritualidad como hermanos de la Orden Franciscana.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
            {/* La Tau */}
            <div className="simbolo-card" style={{ background: '#FFFFFF', borderRadius: '15px', padding: '2rem', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/assets/simbolos/tau.png" alt="La Tau" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '10px' }} />
              </div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>La Tau</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Es el signo de salvación y humildad que San Francisco adoptó como propia firma. Representa la cruz y nuestro profundo deseo de conversión.
              </p>
            </div>

            {/* Cristo de San Damián */}
            <div className="simbolo-card" style={{ background: '#FFFFFF', borderRadius: '15px', padding: '2rem', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/assets/simbolos/san_damian.png" alt="Cristo de San Damián" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '10px' }} />
              </div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Cristo de San Damián</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Es el ícono bizantino desde el cual Jesús le habló a Francisco pidiéndole: "Ve y repara mi Iglesia".
              </p>
            </div>

            {/* Corona Seráfica */}
            <div className="simbolo-card" style={{ background: '#FFFFFF', borderRadius: '15px', padding: '2rem', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/assets/simbolos/corona.png" alt="Corona Seráfica" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '10px' }} />
              </div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Corona Seráfica</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Conocida también como el Rosario Franciscano. Consiste en 7 misterios que meditan sobre las 7 alegrías de la Virgen María.
              </p>
            </div>

            {/* Escapulario */}
            <div className="simbolo-card" style={{ background: '#FFFFFF', borderRadius: '15px', padding: '2rem', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/assets/simbolos/escapulario.png" alt="El Escapulario" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '10px' }} />
              </div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>El Escapulario</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Es una forma abreviada de llevar el hábito de penitencia. Significa consagración, devoción mariana y pertenencia a la gran familia franciscana.
              </p>
            </div>

            {/* Cordón de los 3 nudos */}
            <div className="simbolo-card" style={{ background: '#FFFFFF', borderRadius: '15px', padding: '2rem', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: '1rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/assets/simbolos/cordon.png" alt="Cordón de los 3 Nudos" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '10px' }} />
              </div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Cordón de los 3 Nudos</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Representa nuestra atadura a Cristo. Sus tres nudos nos recuerdan permanentemente los votos franciscanos: Obediencia, Pobreza y Humildad.
              </p>
            </div>
          </div>
        </section>

        {/* Sección Nuestras Celebraciones */}
        <section id="celebraciones" className="section-padding" style={{ background: '#FFFFFF' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Vida Fraterna</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Nuestras Celebraciones</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
              Nos reunimos constantemente para celebrar nuestra fe y compartir como hermanos. Conoce el propósito de nuestros encuentros:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            
            {/* Qué */}
            <div className="celebracion-card" style={{ background: '#FAF6F0', borderRadius: '15px', padding: '1.5rem', borderTop: '4px solid var(--primary)', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🎉</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>¿Qué celebramos?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Encuentros de formación, oración fraterna, Eucaristías y jornadas de servicio social.
              </p>
            </div>

            {/* Por qué */}
            <div className="celebracion-card" style={{ background: '#FAF6F0', borderRadius: '15px', padding: '1.5rem', borderTop: '4px solid var(--secondary)', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>❤️</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>¿Por qué?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Porque sentimos el llamado de Dios a vivir el Santo Evangelio a ejemplo de San Francisco.
              </p>
            </div>

            {/* Para qué */}
            <div className="celebracion-card" style={{ background: '#FAF6F0', borderRadius: '15px', padding: '1.5rem', borderTop: '4px solid var(--tertiary)', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🕊️</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>¿Para qué?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Para crecer humana y espiritualmente, siendo instrumentos de paz y bien en nuestra sociedad.
              </p>
            </div>

            {/* Cuándo */}
            <div className="celebracion-card" style={{ background: '#FAF6F0', borderRadius: '15px', padding: '1.5rem', borderTop: '4px solid #FF9800', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🗓️</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>¿Cuándo?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Todos los sábados a partir de las 5:00 PM. (Horario referencial).
              </p>
            </div>

            {/* Dónde */}
            <div className="celebracion-card" style={{ background: '#FAF6F0', borderRadius: '15px', padding: '1.5rem', borderTop: '4px solid #E91E63', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📍</div>
              <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>¿Dónde?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                En los salones de la Parroquia de Pomalca o lugares designados por la fraternidad.
              </p>
            </div>

          </div>
        </section>

        {/* Sección JUFRA en el Perú (Mapa & Directorio Nacional) */}
        <section id="nacional" className="jufra-peru-section section-padding">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Directorio Nacional</span>
            <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>JUFRA en el Perú</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Encuentra la fraternidad más cercana a ti. Estamos presentes en distintas regiones y parroquias del país viviendo el carisma franciscano.
            </p>
          </div>

          <div className="jufra-peru-container">
            {/* Columna Izquierda: Mapa Interactivo SVG */}
            <div className="map-column">
              <div className="map-header-hint">
                <span>🗺️</span> Haz clic en un departamento resaltado para filtrar
              </div>
              
              <div className="peru-svg-wrapper">
                <svg viewBox="0 0 800 1168" className="peru-svg" preserveAspectRatio="xMidYMid meet">
                  <g>
                    {DEPARTAMENTOS_MAPA.map(dep => {
                      const count = fraternidades.filter(f => normalizeString(f.departamento) === normalizeString(dep.id)).length;
                      const hasFrats = count > 0;
                      const isSelected = normalizeString(selectedDepto) === normalizeString(dep.id);
                      
                      return (
                        <path
                          key={dep.id}
                          d={dep.path}
                          className={`depto-path ${hasFrats ? 'has-frats' : ''} ${isSelected ? 'active-selected' : ''}`}
                          onMouseEnter={() => setHoveredDepto({ name: dep.name, count })}
                          onMouseLeave={() => setHoveredDepto(null)}
                          onClick={() => {
                            if (hasFrats) {
                              setSelectedDepto(normalizeString(selectedDepto) === normalizeString(dep.id) ? 'todos' : dep.id);
                            }
                          }}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Floating Map Tooltip */}
                {hoveredDepto && (
                  <div className="map-tooltip">
                    <h4>{hoveredDepto.name}</h4>
                    <p>{hoveredDepto.count > 0 ? `${hoveredDepto.count} ${hoveredDepto.count === 1 ? 'fraternidad' : 'fraternidades'} activa(s)` : 'Sin fraternidades registradas'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Controles y Tarjetas de Directorio */}
            <div className="directory-column">
              <div className="directory-controls">
                
                {/* 1. Barra de Búsqueda */}
                <div className="search-frat-wrapper">
                  <span className="search-frat-icon">🔍</span>
                  <input
                    type="text"
                    className="search-frat-input"
                    placeholder="Buscar fraternidad, parroquia o contacto..."
                    value={searchFrat}
                    onChange={(e) => setSearchFrat(e.target.value)}
                  />
                </div>

                {/* 2. Selectores de Filtros en una Fila (Región y Departamento) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.4rem' }}>
                  <div className="depto-filter-mobile-wrapper" style={{ gap: '0.3rem' }}>
                    <label htmlFor="mobile-region-select" style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Región JUFRA:</label>
                    <select
                      id="mobile-region-select"
                      className="depto-dropdown-select"
                      value={selectedZona}
                      onChange={(e) => setSelectedZona(e.target.value)}
                      style={{ height: '40px', fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: '10px' }}
                    >
                      <option value="todas">🇵🇪 Todas las Regiones</option>
                      <option value="norte">🪵 Región Norte</option>
                      <option value="centro">☀️ Región Centro</option>
                      <option value="lima_callao_sur_medio">🌊 Región L.C. y Sur Medio</option>
                      <option value="sur_altiplano">🏔️ Región Sur Altiplano</option>
                    </select>
                  </div>

                  <div className="depto-filter-mobile-wrapper" style={{ gap: '0.3rem' }}>
                    <label htmlFor="mobile-depto-select" style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Departamento:</label>
                    <select
                      id="mobile-depto-select"
                      className="depto-dropdown-select"
                      value={selectedDepto}
                      onChange={(e) => setSelectedDepto(e.target.value)}
                      style={{ height: '40px', fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: '10px' }}
                    >
                      <option value="todos">Todos los Departamentos</option>
                      {activeDeptos.map(dep => (
                        <option key={dep} value={dep}>📍 {dep}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Barra de estado de filtros activos */}
              {(selectedDepto !== 'todos' || selectedZona !== 'todas' || searchFrat.trim()) && (
                <div className="filter-status-bar">
                  <div>
                    Filtros activos: {selectedZona !== 'todas' && (
                      <span>
                        Región {
                          selectedZona === 'lima_callao_sur_medio' ? 'Lima, Callao y Sur Medio' :
                          selectedZona === 'sur_altiplano' ? 'Sur Altiplano' :
                          selectedZona === 'norte' ? 'Norte' :
                          selectedZona === 'centro' ? 'Centro' :
                          selectedZona
                        } •{' '}
                      </span>
                    )}
                    {selectedDepto !== 'todos' && <span>{selectedDepto} • </span>}
                    {searchFrat.trim() && <span>Búsqueda: "{searchFrat}" • </span>}
                    <span style={{ color: 'var(--text-muted)' }}>({filteredFraternidades.length} encontradas)</span>
                  </div>
                  <button className="btn-reset-filters" onClick={() => { setSelectedDepto('todos'); setSelectedZona('todas'); setSearchFrat(''); }}>
                    Restablecer
                  </button>
                </div>
              )}

              {/* Listado de Tarjetas */}
              {loadingFrat ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                  <p style={{ color: 'var(--text-muted)' }}>Cargando fraternidades nacionales...</p>
                </div>
              ) : filteredFraternidades.length === 0 ? (
                <div className="directory-empty-state">
                  <span>🕊️</span>
                  <h4>Paz y Bien</h4>
                  <p>No se encontraron fraternidades registradas con los filtros seleccionados.</p>
                  <button 
                    className="btn btn-primary mt-4" 
                    onClick={() => { setSelectedDepto('todos'); setSelectedZona('todas'); setSearchFrat(''); }}
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}
                  >
                    Ver todas las fraternidades
                  </button>
                </div>
              ) : (
                <div className="cards-scroll-container">
                  {filteredFraternidades.map(frat => {
                    const zStyle = getZonaStyles(frat.zona);
                    return (
                      <div 
                        key={frat._id} 
                        className="frat-card-premium" 
                        style={{ '--card-border-color': zStyle.color }}
                      >
                        <div>
                          <div className="frat-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginBottom: '0.75rem' }}>
                            <h3 className="frat-card-title" style={{ width: '100%' }}>{frat.nombre}</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                              <div className="frat-card-depto" style={{ marginTop: 0 }}>
                                <span>📍</span> {frat.departamento}
                              </div>
                              <span className={`frat-card-badge ${zStyle.badgeClass}`} style={{ whiteSpace: 'nowrap', fontSize: '0.62rem', padding: '2px 8px' }}>
                                {
                                  frat.zona === 'lima_callao_sur_medio' ? '🌊 Lima, Callao y S.M.' :
                                  frat.zona === 'sur_altiplano' ? '🏔️ Sur Altiplano' :
                                  frat.zona === 'norte' ? '🪵 Norte' :
                                  frat.zona === 'centro' ? '☀️ Centro' :
                                  frat.zona
                                }
                              </span>
                            </div>
                          </div>

                          <div className="frat-card-body">
                            {frat.parroquia && (
                              <div className="frat-detail-item">
                                <span className="frat-detail-icon">🏛️</span>
                                <span>{frat.parroquia}</span>
                              </div>
                            )}
                            {frat.contacto && (
                              <div className="frat-detail-item">
                                <span className="frat-detail-icon">👤</span>
                                <span>{frat.contacto}</span>
                              </div>
                            )}
                            {frat.telefono && (
                              <div className="frat-detail-item">
                                <span className="frat-detail-icon">📞</span>
                                <span>{frat.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="frat-card-actions">
                          {frat.telefono && (
                            <a
                              href={getWhatsAppLink(frat.telefono, frat.nombre)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-card-action btn-card-whatsapp"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                          {frat.enlaceSocial && (
                            <a
                              href={frat.enlaceSocial}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-card-action btn-card-social"
                            >
                              🌐 Red Social
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sección Redes Sociales (Facebook) */}
        <section id="redes" className="section-padding" style={{ background: '#f0f2f5' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ 
                color: activeSocialTab === 'facebook' ? '#1877F2' : 
                       activeSocialTab === 'instagram' ? '#E1306C' : 
                       activeSocialTab === 'youtube' ? '#FF0000' : '#000000', 
                fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'color 0.3s' 
              }}>Nuestras Redes</span>
              <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Últimas Publicaciones</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Entérate de lo último que estamos compartiendo en nuestras redes oficiales.</p>
              
              {/* Social Tabs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setActiveSocialTab('facebook')}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeSocialTab === 'facebook' ? '#1877F2' : 'white',
                    color: activeSocialTab === 'facebook' ? 'white' : '#65676B',
                    boxShadow: activeSocialTab === 'facebook' ? '0 4px 10px rgba(24,119,242,0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                  }}>📘 Facebook</button>
                <button 
                  onClick={() => setActiveSocialTab('instagram')}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeSocialTab === 'instagram' ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : 'white',
                    color: activeSocialTab === 'instagram' ? 'white' : '#65676B',
                    boxShadow: activeSocialTab === 'instagram' ? '0 4px 10px rgba(225,48,108,0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                  }}>📸 Instagram</button>
                <button 
                  onClick={() => setActiveSocialTab('tiktok')}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeSocialTab === 'tiktok' ? '#000000' : 'white',
                    color: activeSocialTab === 'tiktok' ? 'white' : '#65676B',
                    boxShadow: activeSocialTab === 'tiktok' ? '0 4px 10px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                  }}>🎵 TikTok</button>
                <button 
                  onClick={() => setActiveSocialTab('youtube')}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeSocialTab === 'youtube' ? '#FF0000' : 'white',
                    color: activeSocialTab === 'youtube' ? 'white' : '#65676B',
                    boxShadow: activeSocialTab === 'youtube' ? '0 4px 10px rgba(255,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                  }}>▶️ YouTube</button>
              </div>
            </div>

            {/* Carrusel (Scroll Horizontal) */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              overflowX: 'auto',
              paddingBottom: '2rem',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              padding: '1rem',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} className="hide-scrollbar">
              {activeSocialTab === 'facebook' && socialPosts.facebook.map(post => (
                <div key={post.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '350px', maxWidth: '85vw', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', gap: '10px' }}>
                    <img src={post.pageIcon} alt="JUFRA" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#050505' }}>{post.pageName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#65676B' }}><span>{post.date}</span><span>•</span><span>🌎</span></div>
                    </div>
                  </div>
                  <div style={{ padding: '0 1rem 0.5rem 1rem', fontSize: '0.95rem', color: '#050505', lineHeight: '1.4' }}>{post.content}</div>
                  <div style={{ width: '100%', height: '220px', background: '#f0f2f5' }}><img src={post.image} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#65676B', paddingBottom: '0.5rem', borderBottom: '1px solid #E4E6EB' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👍💙 {post.likes}</span><span>{post.comments} comentarios</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
                      <a href={post.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1877F2', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', borderRadius: '6px', transition: 'background 0.2s', background: '#E7F3FF', width: '100%', justifyContent: 'center' }}>
                        Ver en Facebook ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {activeSocialTab === 'instagram' && socialPosts.instagram.map(post => (
                <div key={post.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '350px', maxWidth: '85vw', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', border: '1px solid #efefef' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', gap: '10px' }}>
                    <img src={post.userIcon} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E1306C', padding: '2px' }} />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#262626' }}>{post.username}</span>
                  </div>
                  <div style={{ width: '100%', height: '350px', background: '#fafafa' }}><img src={post.image} alt="Insta" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  <div style={{ padding: '0.8rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '1.4rem' }}><span>❤️</span><span>💬</span><span>↗️</span></div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#262626', marginBottom: '0.3rem' }}>{post.likes} Me gusta</div>
                    <div style={{ fontSize: '0.9rem', color: '#262626', lineHeight: '1.4', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: '600', marginRight: '5px' }}>{post.username}</span>
                      {post.caption}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#8e8e8e', marginTop: '0.5rem', letterSpacing: '0.5px' }}>{post.date}</div>
                    <a href={post.link} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0.5rem 1rem', borderRadius: '6px', background: '#0095f6', marginTop: '1rem' }}>
                      Ver en Instagram
                    </a>
                  </div>
                </div>
              ))}

              {activeSocialTab === 'tiktok' && socialPosts.tiktok.map(video => (
                <div key={video.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '300px', maxWidth: '80vw', background: '#000', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', overflow: 'hidden', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ width: '100%', height: '500px', background: '#222', position: 'relative' }}>
                    <img src={video.thumbnail} alt="TikTok" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '3rem', color: 'rgba(255,255,255,0.7)' }}>▶️</div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.3rem' }}>{video.username}</div>
                      <div style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.3' }}>{video.description}</div>
                    </div>
                  </div>
                  <div style={{ padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111' }}>
                    <span style={{ color: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>❤️ {video.likes}</span>
                    <a href={video.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: '2px', background: '#fe2c55' }}>
                      Ver en TikTok
                    </a>
                  </div>
                </div>
              ))}

              {activeSocialTab === 'youtube' && socialPosts.youtube.map(video => (
                <div key={video.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '350px', maxWidth: '85vw', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '200px', background: '#000', position: 'relative' }}>
                    <img src={video.thumbnail} alt="YouTube" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '35px', background: 'rgba(255,0,0,0.9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid white' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', padding: '1rem', gap: '12px' }}>
                    <img src={video.channelIcon} alt="Channel" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#0f0f0f', lineHeight: '1.3', marginBottom: '4px' }}>{video.title}</span>
                      <span style={{ fontSize: '0.85rem', color: '#606060' }}>{video.channelName}</span>
                      <div style={{ display: 'flex', fontSize: '0.85rem', color: '#606060', gap: '4px' }}>
                        <span>{video.views}</span><span>•</span><span>{video.date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', justifyContent: 'center' }}>
                    <a href={video.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#FF0000', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', borderRadius: '6px', transition: 'background 0.2s', background: 'rgba(255,0,0,0.1)', width: '100%', justifyContent: 'center' }}>
                      Ver Video ↗
                    </a>
                  </div>
                </div>
              ))}
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
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a 
                  href={config.facebookUrl || "https://facebook.com/jufrapomalca"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="zoom-hover" 
                  title="Facebook"
                  style={{ background: 'rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.3s ease' }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a 
                  href={config.instagramUrl || "https://instagram.com/jufra.pomalca"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="zoom-hover" 
                  title="Instagram"
                  style={{ background: 'rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.3s ease' }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a 
                  href={config.whatsappUrl || "https://wa.me/51981574685"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="zoom-hover" 
                  title="WhatsApp"
                  style={{ background: 'rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.3s ease' }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.628 3.971 14.168 2.94 11.54 2.94c-5.444 0-9.87 4.372-9.874 9.802-.001 1.774.478 3.509 1.387 5.034L2.083 21.68l4.564-1.526zm11.482-6.861c-.302-.15-1.788-.882-2.057-.978-.268-.097-.463-.146-.658.146-.195.293-.755.978-.927 1.173-.171.197-.343.221-.646.071-.3-.15-1.269-.467-2.417-1.491-.892-.797-1.493-1.783-1.669-2.082-.176-.3-.018-.462.132-.61.135-.134.302-.35.453-.524.151-.174.2-.299.3-.499.099-.2.05-.375-.025-.524-.075-.15-.658-1.587-.902-2.172-.237-.57-.479-.493-.658-.502-.171-.008-.366-.01-.561-.01-.195 0-.512.073-.78.366-.268.293-1.024 1.002-1.024 2.445 0 1.443 1.049 2.839 1.195 3.034.146.195 2.062 3.149 4.996 4.417.697.302 1.24.482 1.664.617.7.223 1.338.192 1.843.117.563-.083 1.788-.731 2.037-1.437.249-.706.249-1.312.174-1.437-.076-.125-.27-.197-.572-.347z"/></svg>
                </a>
                <a 
                  href={config.tiktokUrl || "https://tiktok.com/@jufra.pomalca"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="zoom-hover" 
                  title="TikTok"
                  style={{ background: 'rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.3s ease' }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.53-4.09-1.37-.76-.53-1.43-1.22-1.93-2.02v6.18c.1 2.62-1.12 5.25-3.32 6.66-2.22 1.43-5.23 1.58-7.6 1.05-2.37-.53-4.52-2.23-5.46-4.53-1-2.45-.63-5.48 1.01-7.58 1.62-2.07 4.34-3.13 6.94-2.82 1.08.13 2.15.53 3.03 1.18V.02zm-3.24 10.74c-1.42-.23-2.92.36-3.72 1.57-.8 1.21-.83 2.89-.09 4.14.74 1.25 2.19 1.95 3.62 1.81 1.42-.14 2.7-1.15 3.12-2.52.42-1.37-.01-2.96-1.08-3.87-.73-.61-1.67-.98-2.63-1.13z"/></svg>
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
                    setInterestData({ nombre: '', edad: '', telefono: '', mensaje: '' });
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
                  <div className="input-group input-focus-line" style={{ marginBottom: '1.25rem' }}>
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
                  <div className="input-group input-focus-line" style={{ marginBottom: '2rem' }}>
                    <label style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>Déjanos un mensaje (Opcional)</label>
                    <textarea 
                      placeholder="Ej: Me gustaría unirme a la fraternidad..."
                      value={interestData.mensaje}
                      onChange={(e) => setInterestData({...interestData, mensaje: e.target.value})}
                      style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem', width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
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
