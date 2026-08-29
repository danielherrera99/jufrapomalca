import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const ZONAS_MAP = {
  norte: 'Zona Norte',
  centro: 'Zona Centro',
  lima_callao_sur_medio: 'Lima, Callao y Sur Medio',
  sur_altiplano: 'Sur y Altiplano'
};

const JufraPeruView = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fraternidades, setFraternidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/fraternidades');
        setFraternidades(response.data.data || []);
      } catch (err) {
        console.error('Error fetching fraternidades:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  const filteredFrats = useMemo(() => {
    return fraternidades.filter(f => {
      const q = search.toLowerCase();
      return (
        (f.nombre || '').toLowerCase().includes(q) ||
        (f.departamento || '').toLowerCase().includes(q) ||
        (f.parroquia || '').toLowerCase().includes(q)
      );
    });
  }, [fraternidades, search]);

  const fratsByZone = useMemo(() => {
    const grouped = {
      norte: [],
      centro: [],
      lima_callao_sur_medio: [],
      sur_altiplano: [],
      otra: []
    };
    filteredFrats.forEach(f => {
      if (grouped[f.zona]) {
        grouped[f.zona].push(f);
      } else {
        grouped.otra.push(f);
      }
    });
    return grouped;
  }, [filteredFrats]);

  return (
    <div className="landing-page animate-fade">
      {/* Navegación */}
      <nav className="landing-nav">
        <Link to="/" className="logo">JUFRA PERÚ</Link>
        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <a href="#directorio" onClick={() => setIsMenuOpen(false)}>Directorio</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" style={{ 
        backgroundImage: `url('/hero_jufra_background.png')`,
        minHeight: '40vh',
        marginTop: '60px'
      }}>
        <div className="hero-overlay-cinematic"></div>
        <div className="hero-content" style={{ maxWidth: '800px', zIndex: 2 }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>JUFRA Perú</h1>
          <p className="hero-subtitle" style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.9 }}>
            Conoce todas las fraternidades locales de la Juventud Franciscana a nivel nacional y encuentra una cerca de ti.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 1rem', background: '#FAF6F0', color: '#333', minHeight: '50vh' }}>
        <div className="container" id="directorio" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Directorio de Fraternidades</h2>
            <div className="search-frat-wrapper" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <span className="search-frat-icon">🔍</span>
              <input
                type="text"
                className="search-frat-input"
                placeholder="Buscar por nombre, ciudad o parroquia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '30px', border: '1px solid var(--border)', fontSize: '1rem' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando fraternidades...</div>
          ) : filteredFrats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No se encontraron fraternidades que coincidan con tu búsqueda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {Object.entries(fratsByZone).map(([zonaKey, frats]) => {
                if (frats.length === 0) return null;
                return (
                  <div key={zonaKey}>
                    <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                      {ZONAS_MAP[zonaKey] || 'Otras'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {frats.map(f => (
                        <div key={f._id || f.id || Math.random()} className="glass-card zoom-hover" style={{ padding: '1.5rem', background: '#FFF' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: '#1A1D20', fontSize: '1.1rem' }}>{f.nombre}</h4>
                          </div>
                          <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#4B5563' }}>📍 <strong>{f.departamento}</strong></p>
                          {f.parroquia && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#4B5563' }}>⛪ {f.parroquia}</p>}
                          
                          {(f.contacto || f.telefono || f.enlaceSocial) && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.9rem' }}>
                              {f.contacto && <div style={{ marginBottom: '0.3rem' }}>👤 {f.contacto}</div>}
                              {f.telefono && <div style={{ marginBottom: '0.3rem' }}>📞 {f.telefono}</div>}
                              {f.enlaceSocial && (
                                <div style={{ marginTop: '0.8rem' }}>
                                  <a href={f.enlaceSocial} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                                    📱 Redes Sociales
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer style={{ background: '#2C1E16', color: 'rgba(255,255,255,0.8)', padding: '2rem', textAlign: 'center' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} JUFRA Perú. Paz y Bien.</p>
      </footer>
    </div>
  );
};

export default JufraPeruView;
