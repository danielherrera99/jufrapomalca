import { getImageUrl } from '../../config/api';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { DEPARTAMENTOS_MAPA } from '../../config/mapData';
import SafeImage from '../SafeImage';

// Datos para la sección unificada: Historia, etapas y símbolos franciscanos
const historiaItems = [
  {
    year: '2000',
    badgeColor: '#c2410c',
    title: 'Fundación de la Fraternidad',
    description: 'El 18 de mayo de 2000 nace JUFRA Pomalca por iniciativa de jóvenes catecúmenos liderados por Raúl Tantaleán y guiados por el párroco Pedro Delfín Vidalón. El 8 de octubre es presentada oficialmente a la población.'
  },
  {
    year: '2019',
    badgeColor: '#d97706',
    title: 'Camino al Reconocimiento',
    description: 'El hermano Jean Pierre Juárez asume el cargo de coordinador e inicia, junto a su consejo, la búsqueda activa del reconocimiento e integración canónica e histórica formal ante la Orden Franciscana Seglar (OFS).'
  },
  {
    year: '2024',
    badgeColor: '#16a34a',
    title: 'Reconocimiento Oficial OFS',
    description: 'El 3 de enero de 2024, tras cumplir con las Constituciones Generales, se promulga el decreto de reconocimiento formal de JUFRA Pomalca y se convoca a elecciones para conformar el primer consejo electivo oficial.'
  },
  {
    year: '2026',
    badgeColor: '#0284c7',
    title: 'Innovación e Impacto Digital',
    description: 'Consolidación de la fraternidad a nivel nacional y lanzamiento oficial del portal web institucional y aplicación móvil de JUFRA Pomalca, digitalizando la asistencia, gestión interna y la comunicación fraterna.'
  }
];

const etapasItems = [
  {
    numero: '01',
    symbol: '🌱',
    title: 'Iniciado',
    shortDesc: 'Tiempo de acercamiento, descubrimiento y conocimiento...',
    fullDesc: 'Tiempo de acercamiento, descubrimiento y conocimiento inicial de la Fraternidad y del hermoso carisma franciscano.',
    checkpoints: [
      'Participación en los encuentros dominicales a las 5:00 PM',
      'Acogida fraterna e integración con la comunidad juvenil',
      'Primer acercamiento a la vida de San Francisco y Santa Clara'
    ]
  },
  {
    numero: '02',
    symbol: '🌿',
    title: 'Aceptado',
    shortDesc: 'Etapa de formación y discernimiento profundo de la vocació...',
    fullDesc: 'Etapa de formación y discernimiento profundo de la vocación, participando activamente en la vida y misión fraterna.',
    checkpoints: [
      'Profundización en los escritos y espiritualidad franciscana',
      'Participación activa en apostolados, misiones y servicios fraternos',
      'Discernimiento vocacional con acompañamiento del formador'
    ]
  },
  {
    numero: '03',
    symbol: '🌳',
    title: 'Comprometido',
    shortDesc: 'Promesa formal ante Dios y la Iglesia de vivir el Santo Evangeli...',
    fullDesc: 'Promesa formal ante Dios y la Iglesia de vivir el Santo Evangelio a la manera de San Francisco de Asís.',
    checkpoints: [
      'Celebración de la Promesa pública ante Dios y la Iglesia',
      'Compromiso activo de vivir el Evangelio en la vida cotidiana',
      'Participación plena en el consejo y liderazgo de la fraternidad'
    ]
  }
];

const simbolosItems = [
  {
    title: 'La Tau',
    image: '/assets/simbolos/tau.jpg',
    color: '#c2410c',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16" />
        <path d="M12 6v14" />
      </svg>
    ),
    description: 'Es el signo de salvación y humildad que San Francisco adoptó como propia firma. Representa la cruz y nuestro profundo deseo de conversión.'
  },
  {
    title: 'Cristo de San Damián',
    image: '/assets/simbolos/san_damian.jpg',
    color: '#d97706',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    description: 'Es el ícono bizantino desde el cual Jesús le habló a Francisco pidiéndole: "Ve y repara mi Iglesia".'
  },
  {
    title: 'Corona Seráfica',
    image: '/assets/simbolos/corona.png',
    color: '#0284c7',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </svg>
    ),
    description: 'Conocida también como el Rosario Franciscano. Consiste en 7 misterios que meditan sobre las 7 alegrías de la Virgen María.'
  },
  {
    title: 'El Escapulario',
    image: '/assets/simbolos/escapulario.png',
    color: '#78350f',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
      </svg>
    ),
    description: 'Es una forma abreviada de llevar el hábito de penitencia. Significa consagración, devoción mariana y pertenencia a la gran familia franciscana.'
  },
  {
    title: 'Cordón de los 3 Nudos',
    image: '/assets/simbolos/cordon.png',
    color: '#16a34a',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18" />
        <circle cx="7" cy="12" r="2.5" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        <circle cx="17" cy="12" r="2.5" fill="currentColor" />
      </svg>
    ),
    description: 'Representa nuestra atadura a Cristo. Sus tres nudos nos recuerdan permanentemente los votos franciscanos: Pobreza, Obediencia y Castidad.'
  }
];

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
    tiktokUrl: '',
    youtubeUrl: ''
  });
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
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

  // Estado para el formulario directo "Únete a nuestra fraternidad" (Imágenes 2 y 3)
  const [contactoForm, setContactoForm] = useState({
    nombre: '',
    contacto: '',
    area: 'Participar los domingos',
    mensaje: ''
  });
  const [contactoSubmitting, setContactoSubmitting] = useState(false);
  const [contactoSuccess, setContactoSuccess] = useState(false);
  const [contactoSubmittedName, setContactoSubmittedName] = useState('');
  const [contactoSubmittedArea, setContactoSubmittedArea] = useState('');

  const handleContactoSubmit = async (e) => {
    e.preventDefault();
    if (!contactoForm.nombre.trim() || !contactoForm.contacto.trim()) return;
    setContactoSubmitting(true);
    try {
      await api.post('/solicitudes', {
        nombre: contactoForm.nombre.trim(),
        edad: 18,
        telefono: contactoForm.contacto.trim(),
        mensaje: `[Área: ${contactoForm.area}] ${contactoForm.mensaje || ''}`.trim()
      });
      setContactoSubmittedName(contactoForm.nombre.trim());
      setContactoSubmittedArea(contactoForm.area);
      setContactoSuccess(true);
    } catch (error) {
      console.error('Error al enviar solicitud de contacto:', error);
      setContactoSubmittedName(contactoForm.nombre.trim());
      setContactoSubmittedArea(contactoForm.area);
      setContactoSuccess(true);
    } finally {
      setContactoSubmitting(false);
    }
  };

  const handleResetContacto = () => {
    setContactoForm({
      nombre: '',
      contacto: '',
      area: 'Participar los domingos',
      mensaje: ''
    });
    setContactoSuccess(false);
  };

  // Modal Promo
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Scroll & ScrollSpy states
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Pestaña activa en "Historia, etapas y símbolos franciscanos"
  const [activeCaminoTab, setActiveCaminoTab] = useState('historia'); // 'historia' | 'etapas' | 'simbolos'
  const [activeEtapaIndex, setActiveEtapaIndex] = useState(0); // 0 (Iniciado), 1 (Aceptado), 2 (Comprometido)

  const [activeCategory, setActiveCategory] = useState('todas');
  const [galleryItems, setGalleryItems] = useState([]);
  const [miembros, setMiembros] = useState([]);

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
    
    const fetchMiembros = async () => {
      try {
        const { data } = await api.get('/quienes-somos');
        if (data.success) {
          setMiembros(data.data);
        }
      } catch (err) {
        console.error('Error fetching quienes somos', err);
      }
    };

    fetchGaleria();
    fetchMiembros();
  }, []);

  const [activeSocialTab, setActiveSocialTab] = useState('todos');

  const [socialPosts, setSocialPosts] = useState({
    todos: [],
    facebook: [],
    instagram: [],
    tiktok: [],
    youtube: []
  });

  useEffect(() => {
    const fetchRedes = async () => {
      try {
        const { data } = await api.get('/redes/landing');
        if (data.posts) {
          const postsForTodos = data.posts.filter(p => p.mostrar_en_todos === true);
          const activeTabPosts = data.posts.filter(p => p.activo !== false);
          
          setSocialPosts({
            todos: postsForTodos,
            facebook: activeTabPosts.filter(p => p.red_social === 'facebook').map(p => ({
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
            instagram: activeTabPosts.filter(p => p.red_social === 'instagram').map(p => ({
              id: p.id,
              username: p.author_name,
              userIcon: p.author_icon,
              image: p.image_url,
              likes: p.likes,
              caption: p.content,
              date: p.date_text,
              link: p.link
            })),
            tiktok: activeTabPosts.filter(p => p.red_social === 'tiktok').map(p => ({
              id: p.id,
              username: p.author_name,
              description: p.content,
              thumbnail: p.image_url,
              likes: p.likes,
              link: p.link
            })),
            youtube: activeTabPosts.filter(p => p.red_social === 'youtube').map(p => ({
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

    const fetchEventos = async () => {
      try {
        const { data } = await api.get('/eventos/web');
        if (data.eventos) {
          setEventos(data.eventos);
        }
      } catch (err) {
        console.error('Error fetching eventos', err);
      }
    };

    fetchRedes();
    fetchEventos();
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
      const sections = ['inicio', 'mision', 'historia', 'quienes-somos', 'galeria', 'eventos', 'nacional', 'contacto'];
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
          const fetchedConfig = res.data.data;
          setConfig(prev => ({ ...prev, ...fetchedConfig }));
          
          if (fetchedConfig.promoActiva) {
            const hasSeenPromo = sessionStorage.getItem('promoVisto');
            if (!hasSeenPromo) {
              setShowPromoModal(true);
              sessionStorage.setItem('promoVisto', 'true');
            }
          }
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
    <div className="landing-layout-wrapper">
      {/* Navegación Pública */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
          <Link to="/" className="logo">
            JUFRA POMALCA
          </Link>
          
          <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <a href="#mision" className={activeSection === 'mision' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Misión</a>
            <a href="#historia" className={activeSection === 'historia' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Camino</a>
            <a href="#quienes-somos" className={activeSection === 'quienes-somos' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Nosotros</a>
            <a href="#galeria" className={activeSection === 'galeria' || activeSection === 'eventos' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Actividades</a>
            <a href="#nacional" className={activeSection === 'nacional' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Perú</a>
            <a 
              href="#contacto" 
              className="nav-btn-unete"
              onClick={() => setIsMenuOpen(false)}
              style={{
                backgroundColor: '#c2410c',
                color: '#ffffff',
                padding: '0.45rem 1.25rem',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(194, 65, 12, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.5rem'
              }}
            >
              Únete
            </a>
          </div>
        </nav>

      <div className="landing-page animate-fade">
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
            <div className="flex-responsive reveal-buttons" style={{ justifyContent: 'center', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary zoom-hover" onClick={() => setIsInterestModalOpen(true)} style={{ padding: '0.85rem 2.25rem', boxShadow: '0 4px 15px rgba(139, 90, 43, 0.3)' }}>
                Únete a nuestra fraternidad
              </button>
              <a href="#eventos" className="btn btn-ghost zoom-hover" style={{ padding: '0.85rem 2.25rem', borderColor: 'white', color: 'white', textDecoration: 'none' }}>
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
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Misión</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.mision || 'Cultivando la fe a través de la oración y el encuentro fraterno.'}</p>
            </div>
            
            <div className="pillar-glass-card zoom-hover" style={{ '--card-accent': 'var(--secondary)' }}>
              <div className="feature-icon-wrapper" style={{ background: 'rgba(212, 165, 116, 0.1)', color: '#D4A574' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'color 0.3s ease' }}>
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Visión</h3>
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
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Valores</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{config.valores || 'Viviendo en comunidad, compartiendo la alegría de ser hermanos.'}</p>
            </div>
          </section>
        </div>

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

        {/* Sección Unificada: Historia, etapas y símbolos franciscanos */}
        <section id="historia" className="camino-unificado-section" style={{ background: '#FAF6F0', padding: '5rem 1.5rem', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Cabecera Principal con Selector de Pestañas */}
            <div className="camino-header-flex">
              <div>
                <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '0.95rem', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                  Nuestro Camino
                </span>
                <h2 style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
                  fontWeight: '800',
                  color: '#1c1917',
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  Historia, etapas y<br />símbolos franciscanos
                </h2>
              </div>

              {/* Botones de Pestañas (Pill selector) */}
              <div className="camino-tabs-pill">
                <button
                  type="button"
                  onClick={() => setActiveCaminoTab('historia')}
                  className={`camino-tab-btn ${activeCaminoTab === 'historia' ? 'active' : ''}`}
                >
                  Nuestra Historia
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCaminoTab('etapas')}
                  className={`camino-tab-btn ${activeCaminoTab === 'etapas' ? 'active' : ''}`}
                >
                  Etapas (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCaminoTab('simbolos')}
                  className={`camino-tab-btn ${activeCaminoTab === 'simbolos' ? 'active' : ''}`}
                >
                  Símbolos (5)
                </button>
              </div>
            </div>

            {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}

            {/* PESTAÑA 1: NUESTRA HISTORIA */}
            {activeCaminoTab === 'historia' && (
              <div className="camino-grid-4 animate-fade">
                {historiaItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      padding: '2rem 1.6rem',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: item.badgeColor,
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px'
                      }}>
                        {item.year}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '1.18rem',
                      fontWeight: '800',
                      color: '#1c1917',
                      marginTop: '1.2rem',
                      marginBottom: '0.8rem',
                      lineHeight: 1.3
                    }}>
                      {item.title}
                    </h3>

                    <p style={{
                      fontSize: '0.92rem',
                      color: '#57534e',
                      lineHeight: 1.65,
                      margin: 0
                    }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* PESTAÑA 2: ETAPAS DE FORMACIÓN */}
            {activeCaminoTab === 'etapas' && (
              <div className="camino-etapas-split animate-fade">
                {/* Columna Izquierda: Lista de Etapas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {etapasItems.map((etapa, idx) => {
                    const isSelected = activeEtapaIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveEtapaIndex(idx)}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          padding: '1.4rem 1.6rem',
                          border: isSelected ? '1.5px solid #1c1917' : '1px solid #e7e5e4',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 6px 20px rgba(0,0,0,0.04)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.1rem'
                        }}
                      >
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#16a34a' : '#f5f5f4',
                          color: isSelected ? '#ffffff' : '#57534e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.92rem',
                          flexShrink: 0,
                          transition: 'all 0.2s ease'
                        }}>
                          {etapa.numero}
                        </div>

                        <span style={{ fontSize: '1.45rem', flexShrink: 0 }}>
                          {etapa.symbol}
                        </span>

                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <h4 style={{
                            margin: '0 0 0.25rem 0',
                            fontWeight: '700',
                            fontSize: '1.05rem',
                            color: '#1c1917'
                          }}>
                            {etapa.title}
                          </h4>
                          <p style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: '#78716c',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {etapa.shortDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Columna Derecha: Tarjeta de Detalle de la Etapa Seleccionada */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{
                      color: '#16a34a',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      display: 'block'
                    }}>
                      ETAPA {etapasItems[activeEtapaIndex].numero}
                    </span>
                    <span style={{
                      fontSize: '2rem',
                      lineHeight: 1,
                      padding: '4px 10px',
                      backgroundColor: '#f5f5f4',
                      borderRadius: '10px'
                    }}>
                      {etapasItems[activeEtapaIndex].symbol}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.85rem',
                    fontWeight: '800',
                    color: '#1c1917',
                    margin: '0 0 1rem 0'
                  }}>
                    {etapasItems[activeEtapaIndex].title}
                  </h3>

                  <p style={{
                    fontSize: '0.96rem',
                    color: '#57534e',
                    lineHeight: 1.65,
                    marginBottom: '1.75rem'
                  }}>
                    {etapasItems[activeEtapaIndex].fullDesc}
                  </p>

                  <div style={{ height: '1px', backgroundColor: '#f0ece7', marginBottom: '1.75rem' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {etapasItems[activeEtapaIndex].checkpoints.map((cp, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.92rem', color: '#44403c', fontWeight: '500' }}>
                          {cp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: SÍMBOLOS FRANCISCANOS CON IMÁGENES REALES */}
            {activeCaminoTab === 'simbolos' && (
              <div className="camino-grid-5 animate-fade">
                {simbolosItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      padding: '1.25rem',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Fotografía Real del Símbolo */}
                    <div style={{
                      width: '100%',
                      height: '140px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '1.1rem',
                      backgroundColor: '#f5f5f4',
                      border: '1px solid #ebe8e5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </div>

                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: '800',
                      color: '#1c1917',
                      margin: '0 0 0.6rem 0',
                      lineHeight: 1.3
                    }}>
                      {item.title}
                    </h3>

                    <p style={{
                      fontSize: '0.88rem',
                      color: '#57534e',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        
        {/* Sección Quiénes Somos */}
        <section id="quienes-somos" className="section-padding" style={{ background: '#fdfbf7', position: 'relative' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nuestra Fraternidad</span>
              <h2 className="section-title">Quiénes Somos</h2>
            </div>

            {/* Organigrama del Consejo */}
            <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '2rem', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Consejo Local</h3>
            <div className="hermanos-grid">
              {miembros.filter(m => m.categoria === 'Consejo Local').length > 0 ? (
                miembros.filter(m => m.categoria === 'Consejo Local').map((item) => (
                  <div key={item.id} className="hermano-card">
                    <div className="hermano-avatar">
                      {item.foto_url || item.fotoUrl ? (
                        <SafeImage src={getImageUrl(item.foto_url || item.fotoUrl)} alt={item.nombre} />
                      ) : (
                        <SafeImage src="/images/placeholder-user.png" alt={item.nombre} />
                      )}
                    </div>
                    <div className="hermano-name">{item.nombre}</div>
                    <div className="hermano-legend">{item.rol}</div>
                    {item.descripcion && (
                      <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{item.descripcion}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>No hay miembros registrados en el Consejo Local.</p>
              )}
            </div>

            {/* Cuadrícula de Nuestros Hermanos */}
            <div style={{ marginTop: '5rem' }}>
              <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Nuestros Hermanos</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                Conoce a los jóvenes que actualmente forman parte de la JUFRA Pomalca, viviendo su compromiso en diferentes etapas de formación.
              </p>
              
              <div className="hermanos-grid">
                {miembros.filter(m => m.categoria === 'Hermanos').length > 0 ? (
                  miembros.filter(m => m.categoria === 'Hermanos').map((item) => (
                    <div key={item.id} className="hermano-card">
                      <div className="hermano-avatar">
                        {item.foto_url || item.fotoUrl ? (
                          <SafeImage src={getImageUrl(item.foto_url || item.fotoUrl)} alt={item.nombre} />
                        ) : (
                          <SafeImage src="/images/placeholder-user.png" alt={item.nombre} />
                        )}
                      </div>
                      <div className="hermano-name">{item.nombre}</div>
                      <div className="hermano-legend">{item.rol}</div>
                      {item.descripcion && (
                        <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                          "{item.descripcion}"
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>No hay hermanos registrados aún.</p>
                )}
              </div>
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', alignItems: 'center' }}>
            
            {/* Texto y Propósito */}
            <div style={{ flex: '1 1 500px' }}>
              <h3 style={{ color: 'var(--text-color)', fontSize: '1.8rem', marginBottom: '1rem' }}>
                Un espacio de fraternidad, oración y servicio
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Nos reunimos semana a semana porque sentimos el llamado profundo de Dios a vivir el Santo Evangelio a ejemplo de San Francisco de Asís. Nuestros encuentros están diseñados para crecer humana y espiritualmente, compartiendo momentos de formación, Eucaristía y proyección social, convirtiéndonos en verdaderos instrumentos de paz y bien.
              </p>
              
              <div style={{ background: '#FAF6F0', borderRadius: '15px', padding: '1.5rem', borderLeft: '5px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>🗓️</span>
                  <div>
                    <h4 style={{ color: 'var(--text-color)', fontSize: '1rem', margin: 0 }}>¿Cuándo nos reunimos?</h4>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Todos los domingos a partir de las 5:00 PM</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📍</span>
                  <div>
                    <h4 style={{ color: 'var(--text-color)', fontSize: '1rem', margin: 0 }}>¿Dónde nos encontramos?</h4>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>En los salones de la Parroquia de Pomalca</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <Link to="/celebraciones" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '50px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                  Ver más celebraciones <span>→</span>
                </Link>
              </div>
            </div>

            {/* Imagen Representativa (Placeholder) */}
            <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '400px', background: 'var(--secondary)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative' }}>
                {/* Puedes reemplazar la URL de la imagen aquí cuando tengas una foto real de la fraternidad */}
                <img 
                  src="/hero_jufra_background.png" 
                  alt="Fraternidad JUFRA Pomalca" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '2rem 1.5rem 1.5rem' }}>
                  <p style={{ color: '#fff', margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>¡Paz y Bien!</p>
                  <p style={{ color: '#ddd', margin: 0, fontSize: '0.9rem' }}>Te esperamos para vivir el carisma franciscano.</p>
                </div>
              </div>
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
                  onClick={() => setActiveSocialTab('todos')}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                    background: activeSocialTab === 'todos' ? '#333' : 'white',
                    color: activeSocialTab === 'todos' ? 'white' : '#65676B',
                    boxShadow: activeSocialTab === 'todos' ? '0 4px 10px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                  }}>🌟 Todos</button>
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

            {/* Carrusel (Masonry Look) */}
            <div style={{ 
              display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '2rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', padding: '1rem', scrollbarWidth: 'none', msOverflowStyle: 'none'
            }} className="social-carousel hide-scrollbar">
              {activeSocialTab === 'todos' && socialPosts.todos.map(p => {
                if (p.red_social === 'facebook') {
                  const post = {
                    id: p.id, pageName: p.author_name, pageIcon: p.author_icon, date: p.date_text, content: p.content, image: p.image_url, likes: p.likes, comments: p.comments, link: p.link
                  };
                  return (
                    <div key={post.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', gap: '10px' }}>
                        <img src={post.pageIcon} alt="JUFRA" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#050505' }}>{post.pageName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#65676B' }}><span>{post.date}</span><span>•</span><span>📘 Facebook</span></div>
                        </div>
                      </div>
                      <div style={{ padding: '0 1rem 0.5rem 1rem', fontSize: '0.95rem', color: '#050505', lineHeight: '1.4' }}>{post.content}</div>
                      <div style={{ width: '100%', height: '220px', background: '#f0f2f5' }}><img src={getImageUrl(post.image)} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /></div>
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
                  );
                } else if (p.red_social === 'instagram') {
                  const post = {
                    id: p.id, username: p.author_name, userIcon: p.author_icon, image: p.image_url, likes: p.likes, caption: p.content, date: p.date_text, link: p.link
                  };
                  return (
                    <div key={post.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #efefef' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', gap: '10px' }}>
                        <img src={post.userIcon} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E1306C', padding: '2px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#262626' }}>{post.username}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#E1306C', fontWeight: 'bold' }}>📸 IG</span>
                      </div>
                      <div style={{ width: '100%', height: '350px', background: '#fafafa' }}><img src={getImageUrl(post.image)} alt="Insta" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /></div>
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
                  );
                } else if (p.red_social === 'tiktok') {
                  const video = {
                    id: p.id, username: p.author_name, description: p.content, thumbnail: p.image_url, likes: p.likes, link: p.link
                  };
                  return (
                    <div key={video.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: '#000', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div style={{ width: '100%', height: '500px', background: '#222', position: 'relative' }}>
                        <img src={getImageUrl(video.thumbnail)} alt="TikTok" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '3rem', color: 'rgba(255,255,255,0.7)' }}>▶️</div>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>🎵 TikTok</div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.3rem' }}>{video.username}</div>
                          <div style={{ color: 'white', fontSize: '0.9rem', lineHeight: '1.3' }}>{video.description}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '0.8rem', color: 'white', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>❤️ {video.likes}</span>
                          </div>
                        </div>
                      </div>
                      <a href={video.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#000', background: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0.8rem', display: 'block' }}>
                        Ver en TikTok
                      </a>
                    </div>
                  );
                } else if (p.red_social === 'youtube') {
                  const video = {
                    id: p.id, channelName: p.author_name, channelIcon: p.author_icon, title: p.content, thumbnail: p.image_url, views: p.likes, date: p.date_text, link: p.link
                  };
                  return (
                    <div key={video.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                        <img src={getImageUrl(video.thumbnail)} alt="YouTube" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.8)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>▶️ YouTube</div>
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>Vídeo</div>
                      </div>
                      <div style={{ display: 'flex', padding: '1rem', gap: '12px' }}>
                        <img src={video.channelIcon} alt="Channel" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#0f0f0f', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {video.title}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: '#606060' }}>{video.channelName}</span>
                          <span style={{ fontSize: '0.85rem', color: '#606060' }}>{video.views} vistas • {video.date}</span>
                        </div>
                      </div>
                      <a href={video.link} target="_blank" rel="noreferrer" style={{ margin: '0 1rem 1rem 1rem', textDecoration: 'none', color: '#FF0000', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', padding: '0.6rem', border: '1px solid #FF0000', borderRadius: '20px', transition: 'background 0.2s', display: 'block' }}>
                        Mirar en YouTube
                      </a>
                    </div>
                  );
                }
                return null;
              })}

              {activeSocialTab === 'facebook' && socialPosts.facebook.map(post => (
                <div key={post.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', gap: '10px' }}>
                    <img src={post.pageIcon} alt="JUFRA" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#050505' }}>{post.pageName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#65676B' }}><span>{post.date}</span><span>•</span><span>🌎</span></div>
                    </div>
                  </div>
                  <div style={{ padding: '0 1rem 0.5rem 1rem', fontSize: '0.95rem', color: '#050505', lineHeight: '1.4' }}>{post.content}</div>
                  <div style={{ width: '100%', height: '220px', background: '#f0f2f5' }}><img src={post.image} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /></div>
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
                <div key={post.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #efefef' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', gap: '10px' }}>
                    <img src={post.userIcon} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E1306C', padding: '2px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#262626' }}>{post.username}</span>
                  </div>
                  <div style={{ width: '100%', height: '350px', background: '#fafafa' }}><img src={post.image} alt="Insta" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /></div>
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
                <div key={video.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: '#000', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ width: '100%', height: '500px', background: '#222', position: 'relative' }}>
                    <img src={video.thumbnail} alt="TikTok" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} onError={(e) => { e.target.style.display = 'none'; }} />
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
                <div key={video.id} className="zoom-hover" style={{ flex: '0 0 auto', width: '320px', maxWidth: '85vw', scrollSnapAlign: 'start', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '200px', background: '#000', position: 'relative' }}>
                    <img src={video.thumbnail} alt="YouTube" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '35px', background: 'rgba(255,0,0,0.9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid white' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', padding: '1rem', gap: '12px' }}>
                    <img src={video.channelIcon} alt="Channel" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
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
                <img src={getImageUrl(item.archivoUrl)} alt={item.titulo} className="gallery-img" />
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
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', padding: '0 1rem' }}>
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
                    <button onClick={() => setSelectedEvento(event)} className="btn btn-ghost" style={{ borderRadius: '50px', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>Ver detalles</button>
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
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <a href="https://youfra.net/es/inicio/" target="_blank" rel="noopener noreferrer" className="btn btn-primary zoom-hover" style={{ flex: 1, padding: '1rem', textDecoration: 'none', textAlign: 'center' }}>
                  JUFRA en el Mundo 🌐
                </a>
                <Link to="/jufra-peru" className="btn zoom-hover" style={{ flex: 1, padding: '1rem', textDecoration: 'none', textAlign: 'center', background: '#D97706', color: 'white' }}>
                  JUFRA Perú 🇵🇪
                </Link>
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

        
        {/* Familia Franciscana Section */}
        <section id="familia" className="section-padding" style={{ background: '#FFFAF3', position: 'relative', overflow: 'hidden' }}>
          <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', alignItems: 'center', gap: '4rem' }}>
            <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Familia Global</span>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>Nuestra Familia Franciscana</h2>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{config.familiaTitulo || 'Las Tres Ramas de la Familia Franciscana'}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.9', maxWidth: '800px', margin: '0 auto' }}>
                {config.familiaDescripcion || 'La espiritualidad de San Francisco se divide en tres ramas que conforman nuestra gran familia. Caminamos unidos compartiendo el mismo carisma, el ideal de vida evangélica y la misión de llevar paz y bien al mundo.'}
              </p>
              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/familia" target="_blank" className="btn btn-ghost zoom-hover" style={{ padding: '1rem 2.5rem', textDecoration: 'none' }}>
                  Conocer más de la familia franciscana
                </Link>
              </div>
            </div>
          </div>
        </section>

        
        {/* Sección Encuéntranos · Contacto (Imágenes 2 y 3) */}
        <section id="contacto" className="modern-contacto-section">
          <div className="modern-contacto-container">
            <div className="modern-contacto-grid">
              
              {/* Columna Izquierda: Información de Encuentro */}
              <div>
                <span style={{
                  color: '#c2410c',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  Encuéntranos · Contacto
                </span>

                <h2 style={{
                  fontSize: '2.3rem',
                  fontWeight: '800',
                  color: '#1c1917',
                  margin: '0 0 1rem 0',
                  lineHeight: '1.2'
                }}>
                  Te esperamos en nuestra fraternidad en Pomalca
                </h2>

                <p style={{
                  color: '#57534e',
                  fontSize: '1rem',
                  lineHeight: '1.65',
                  marginBottom: '2.5rem'
                }}>
                  Ven a compartir con nosotros cada domingo. Escríbenos por WhatsApp o acércate a los salones de nuestra parroquia.
                </p>

                {/* Item 1: Ubicación */}
                <div className="contacto-info-item">
                  <div className="contacto-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '700', fontSize: '0.96rem', color: '#1c1917' }}>
                      Parroquia María del Perpetuo Socorro – Diócesis de Chiclayo
                    </h4>
                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: '#78716c' }}>
                      Calle Apolinario Salcedo s/n, Pomalca 14006, Perú
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Parroquia+Mar%C3%ADa+del+Perpetuo+Socorro+Pomalca"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#c2410c', fontSize: '0.84rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      Abrir en Google Maps ↗
                    </a>
                  </div>
                </div>

                {/* Item 2: Horario */}
                <div className="contacto-info-item">
                  <div className="contacto-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '700', fontSize: '0.96rem', color: '#1c1917' }}>
                      Horario fraterno
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#78716c' }}>
                      Todos los domingos a partir de las 5:00 PM
                    </p>
                  </div>
                </div>

                {/* Item 3: Contacto Directo */}
                <div className="contacto-info-item">
                  <div className="contacto-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '700', fontSize: '0.96rem', color: '#1c1917' }}>
                      Contacto directo
                    </h4>
                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.88rem', color: '#78716c' }}>
                      {config.emailContacto || 'jufrapomalca@gmail.com'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#78716c' }}>
                      {config.telefonoContacto || '+51 982 225 200'}
                    </p>
                  </div>
                </div>

                {/* Botón WhatsApp */}
                <a
                  href={`https://wa.me/51982225200?text=${encodeURIComponent('¡Paz y Bien! Me gustaría recibir información para unirme a la Fraternidad JUFRA Pomalca.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1.6rem',
                    borderRadius: '12px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    marginTop: '1rem',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  💬 Escribir por WhatsApp
                </a>
              </div>

              {/* Columna Derecha: Tarjeta de Registro Fraterno */}
              <div className="contacto-form-card">
                {!contactoSuccess ? (
                  <form onSubmit={handleContactoSubmit}>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1c1917', margin: '0 0 0.4rem 0' }}>
                      Únete a nuestra fraternidad
                    </h3>
                    <p style={{ color: '#78716c', fontSize: '0.92rem', margin: '0 0 1.6rem 0' }}>
                      Déjanos tu contacto y te daremos la bienvenida este domingo a las 5:00 PM.
                    </p>

                    <div className="contacto-inputs-2col">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#44403c', marginBottom: '0.45rem' }}>
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Ana Lucía Torres"
                          value={contactoForm.nombre}
                          onChange={(e) => setContactoForm({ ...contactoForm, nombre: e.target.value })}
                          className="contacto-input-field"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#44403c', marginBottom: '0.45rem' }}>
                          WhatsApp o correo electrónico
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. 902 225 200 o correo@..."
                          value={contactoForm.contacto}
                          onChange={(e) => setContactoForm({ ...contactoForm, contacto: e.target.value })}
                          className="contacto-input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#44403c', margin: '1.2rem 0 0.6rem 0' }}>
                        ¿Qué área te llama más la atención?
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {[
                          'Participar los domingos',
                          'Formación franciscana',
                          'Apostolado y triduos',
                          'Ministerio de música'
                        ].map((areaName) => {
                          const isSelected = contactoForm.area === areaName;
                          return (
                            <button
                              type="button"
                              key={areaName}
                              onClick={() => setContactoForm({ ...contactoForm, area: areaName })}
                              className={`contacto-tag-btn ${isSelected ? 'active' : ''}`}
                            >
                              {areaName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#44403c', margin: '1.2rem 0 0.45rem 0' }}>
                        Mensaje opcional
                      </label>
                      <textarea
                        placeholder="Cuéntanos si vienes por primera vez o si tienes alguna consulta..."
                        value={contactoForm.mensaje}
                        onChange={(e) => setContactoForm({ ...contactoForm, mensaje: e.target.value })}
                        className="contacto-input-field"
                        style={{ minHeight: '85px', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactoSubmitting}
                      className="contacto-submit-btn"
                    >
                      {contactoSubmitting ? 'Enviando...' : (
                        <>
                          Enviar solicitud de bienvenida
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Estado de Éxito Fraterno (Imagen 3) */
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.4rem'
                    }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1c1917', margin: '0 0 0.8rem 0' }}>
                      Paz y Bien, {contactoSubmittedName}
                    </h3>

                    <p style={{ color: '#57534e', fontSize: '0.96rem', lineHeight: '1.65', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
                      Recibimos tus datos para <strong>{contactoSubmittedArea}</strong>. Nuestro equipo de acogida de JUFRA Pomalca se pondrá en contacto contigo antes del próximo domingo.
                    </p>

                    <button
                      type="button"
                      onClick={handleResetContacto}
                      style={{
                        backgroundColor: '#f5f5f4',
                        border: '1px solid #e7e5e4',
                        borderRadius: '10px',
                        padding: '0.65rem 1.4rem',
                        color: '#1c1917',
                        fontWeight: '600',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        
        {/* Footer Moderno y Minimalista (Imágenes 2 y 3) */}
        <footer className="modern-footer">
          <div className="modern-footer-container">
            
            {/* Fila Superior: Marca y Enlaces de Redes */}
            <div className="modern-footer-top">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <img 
                    src="/logo_jufra.png" 
                    alt="Logo JUFRA Pomalca" 
                    style={{ 
                      width: '34px', 
                      height: '34px', 
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                  <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#1c1917' }}>JUFRA Pomalca</span>
                </div>
                <p style={{ color: '#78716c', fontSize: '0.9rem', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
                  Comunidad de jóvenes que buscan vivir el Evangelio al estilo de San Francisco de Asís.
                </p>
              </div>

              <div className="modern-footer-social-links">
                <a href={config.facebookUrl || "https://facebook.com/jufrapomalca"} target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href={config.instagramUrl || "https://instagram.com/jufra.pomalca"} target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href={config.whatsappUrl || "https://wa.me/51982225200"} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href={config.tiktokUrl || "https://tiktok.com/@jufra.pomalca"} target="_blank" rel="noopener noreferrer">TikTok</a>
                <a href={config.youtubeUrl || "https://youtube.com/@jufrapomalca"} target="_blank" rel="noopener noreferrer">YouTube</a>
              </div>
            </div>

            {/* Fila Inferior: Copyright y Accesos */}
            <div className="modern-footer-bottom">
              <p style={{ color: '#78716c', fontSize: '0.86rem', margin: 0 }}>
                &copy; {new Date().getFullYear()} Juventud Franciscana - Pomalca. Sembrando Paz y Bien.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <Link to="/admin" className="footer-pill-btn footer-pill-admin">
                  🔒 Acceso interno
                </Link>
                <a
                  href="https://expo.dev/artifacts/eas/bQTvc5GzYECx-h_1a35aXslI5iIfQC5SouF-vnir4-Q.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-pill-btn footer-pill-app"
                >
                  📱 App móvil
                </a>
              </div>
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

      {selectedEvento && (
        <div className="modal-overlay" onClick={() => setSelectedEvento(null)} style={{ zIndex: 2000 }}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '25px', overflow: 'hidden', padding: 0 }}>
            {selectedEvento.imagenUrl ? (
              <div style={{ height: '250px', position: 'relative' }}>
                <SafeImage src={getImageUrl(selectedEvento.imagenUrl)} alt={selectedEvento.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))' }}></div>
                <button onClick={() => setSelectedEvento(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                  <span style={{ display: 'inline-block', background: 'var(--secondary)', color: 'var(--text-main)', padding: '0.3rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                    {selectedEvento.tipo || 'Encuentro'}
                  </span>
                  <h3 style={{ color: 'white', fontSize: '1.8rem', margin: 0, textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>{selectedEvento.titulo}</h3>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 2rem 0', position: 'relative' }}>
                <button onClick={() => setSelectedEvento(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#F5F5F5', border: 'none', color: 'var(--text-main)', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                <span style={{ display: 'inline-block', background: 'var(--secondary)', color: 'var(--text-main)', padding: '0.3rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {selectedEvento.tipo || 'Encuentro'}
                </span>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: 0 }}>{selectedEvento.titulo}</h3>
              </div>
            )}
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: '#F9FAFB', borderRadius: '15px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>📅</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Fecha</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{new Date(selectedEvento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏰</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Hora</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedEvento.hora || 'Por confirmar'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📍</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Lugar</div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedEvento.lugar || 'Fraternidad Pomalca'}</div>
                    </div>
                  </div>
                  {selectedEvento.latitud && selectedEvento.longitud && (
                    <a 
                      href={`https://www.google.com/maps?q=${selectedEvento.latitud},${selectedEvento.longitud}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      🗺️ Ver en mapa
                    </a>
                  )}
                </div>
              </div>

              {selectedEvento.descripcion && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '1.1rem' }}>Sobre este encuentro:</h4>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{selectedEvento.descripcion}</p>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setSelectedEvento(null)} className="btn btn-primary" style={{ width: '100%', borderRadius: '15px', padding: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {showPromoModal && (
        <div className="promo-modal-overlay" onClick={() => setShowPromoModal(false)}>
          <div className="promo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="promo-close-btn" onClick={() => setShowPromoModal(false)}>×</button>
            {config.promoImagenUrl && (
              <img src={getImageUrl(config.promoImagenUrl)} alt="Promo" className="promo-image" />
            )}
            <h2 className="promo-title">{config.promoTitulo}</h2>
            <p className="promo-desc">{config.promoDescripcion}</p>
            {config.promoBotonTexto && (
              <div className="promo-actions">
                <Link 
                  to={config.promoBotonLink && config.promoBotonLink !== '#' ? config.promoBotonLink : '#celebraciones'} 
                  className="btn btn-primary" 
                  style={{ width: '100%', borderRadius: '15px', display: 'inline-block', textAlign: 'center' }}
                  onClick={(e) => {
                    const link = config.promoBotonLink && config.promoBotonLink !== '#' ? config.promoBotonLink : '#celebraciones';
                    if (link.startsWith('#')) {
                      e.preventDefault();
                      setShowPromoModal(false);
                      setTimeout(() => {
                        const targetId = link.substring(1);
                        const section = document.getElementById(targetId);
                        if (section) {
                          const y = section.getBoundingClientRect().top + window.pageYOffset - 80; // -80px para el menú de navegación
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }, 150);
                    } else {
                      setShowPromoModal(false);
                    }
                  }}
                >
                  {config.promoBotonTexto}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingView;
