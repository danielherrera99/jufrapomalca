import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { getFraternidadUrl } from '../../utils/fraternidadHelper';

const ZONAS_CONFIG = {
  norte: { label: 'Zona Norte', color: '#EA580C' },
  centro: { label: 'Zona Centro', color: '#D97706' },
  lima_callao_sur_medio: { label: 'Lima, Callao y Sur Medio', color: '#0284C7' },
  sur_altiplano: { label: 'Sur y Altiplano', color: '#16A34A' },
  otra: { label: 'Otras Fraternidades', color: '#78716C' }
};

const JufraPeruView = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [fraternidades, setFraternidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('todas');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        (f.nombre || '').toLowerCase().includes(q) ||
        (f.departamento || '').toLowerCase().includes(q) ||
        (f.parroquia || '').toLowerCase().includes(q)
      );
      const matchesZone = selectedZone === 'todas' || (f.zona || 'otra') === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [fraternidades, search, selectedZone]);

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

  const activeZonesCount = useMemo(() => {
    return Object.values(fratsByZone).filter(arr => arr.length > 0).length;
  }, [fratsByZone]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #FAF6F0)', color: 'var(--text-main, #1C1917)' }}>

      {/* Navegación pública estándar */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/jufra-peru" className="logo">
          JUFRA PERÚ
        </Link>

        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <a href="#directorio" className="active" onClick={() => setIsMenuOpen(false)}>Directorio</a>
          <Link
            to="/"
            className="nav-btn-unete"
            onClick={() => setIsMenuOpen(false)}
            style={{
              backgroundColor: 'var(--accent, #c2410c)',
              color: '#ffffff',
              padding: '0.45rem 1.25rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(194,65,12,0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginLeft: '0.5rem'
            }}
          >
            <span>←</span>
            <span>Volver a Pomalca</span>
          </Link>
        </div>
      </nav>

      {/* Hero editorial oscuro */}
      <header style={{
        position: 'relative',
        background: 'var(--hero-bg, #1A110B)',
        minHeight: '280px',
        marginTop: '62px',
        padding: '4.5rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Formas orgánicas de fondo */}
        <div style={{
          position: 'absolute', bottom: '-120px', left: '-40px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(154,52,18,0.25)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '-100px', right: '60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(161,98,7,0.18)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-110px', right: '18%',
          width: '210px', height: '210px', borderRadius: '50%',
          background: 'rgba(30,41,59,0.4)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <p style={{
            margin: '0 0 0.75rem 0',
            color: 'var(--secondary, #D97706)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase'
          }}>
            FRATERNIDAD NACIONAL · PERÚ
          </p>
          <h1 style={{
            margin: '0 0 0.9rem 0',
            color: '#FFFFFF',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}>
            JUFRA Perú
          </h1>
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.80)',
            fontSize: '0.98rem',
            lineHeight: 1.6
          }}>
            Conoce todas las fraternidades locales de la Juventud Franciscana a nivel nacional y encuentra una cerca de ti.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main id="directorio" style={{ flex: 1, padding: '3rem 1.5rem 4.5rem', background: 'var(--bg, #FAF6F0)' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>

          {/* Encabezado del Directorio + Buscador */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main, #1C1917)', letterSpacing: '-0.01em' }}>
                Directorio de Fraternidades
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #78716C)' }}>
                {filteredFrats.length} {filteredFrats.length === 1 ? 'fraternidad local' : 'fraternidades locales'} en {activeZonesCount} {activeZonesCount === 1 ? 'zona' : 'zonas'} del país
              </p>
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #A8A29E)',
                display: 'flex', alignItems: 'center', pointerEvents: 'none'
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o parroquia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.62rem 1rem 0.62rem 2.35rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border, #E7E5E4)',
                  background: 'var(--surface, #FFFFFF)',
                  fontSize: '0.84rem',
                  color: 'var(--text-main, #1C1917)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              />
            </div>
          </div>

          {/* Filtros por Zona */}
          <div style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            background: 'var(--surface-alt, #F3EFE9)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border, #E7E5E4)',
            marginBottom: '2.5rem'
          }}>
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'norte', label: 'Zona Norte' },
              { id: 'centro', label: 'Zona Centro' },
              { id: 'lima_callao_sur_medio', label: 'Lima, Callao y Sur Medio' },
              { id: 'sur_altiplano', label: 'Sur y Altiplano' }
            ].map(tab => {
              const isActive = selectedZone === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedZone(tab.id)}
                  style={{
                    background: isActive ? 'var(--primary, #8B5A2B)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted, #57534E)',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Listado por Zona */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted, #78716C)' }}>
              Cargando fraternidades...
            </div>
          ) : filteredFrats.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted, #78716C)' }}>
              No se encontraron fraternidades que coincidan con tu búsqueda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
              {Object.entries(fratsByZone).map(([zonaKey, frats]) => {
                if (frats.length === 0) return null;
                const zonaInfo = ZONAS_CONFIG[zonaKey] || ZONAS_CONFIG.otra;

                return (
                  <section key={zonaKey}>
                    {/* Cabecera de Zona */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border, #E7E5E4)',
                      paddingBottom: '0.6rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: zonaInfo.color, display: 'inline-block'
                        }} />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #1C1917)' }}>
                          {zonaInfo.label}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #78716C)', fontWeight: 500 }}>
                        {frats.length} {frats.length === 1 ? 'fraternidad' : 'fraternidades'}
                      </span>
                    </div>

                    {/* Grid de tarjetas */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: '1rem'
                    }}>
                      {frats.map(f => {
                        const webUrl = getFraternidadUrl(f);
                        const isPomalca = (f.nombre || '').toUpperCase().includes('POMALCA');

                        return (
                          <div
                            key={f._id || f.id || f.nombre}
                            className="glass-card zoom-hover"
                            style={{
                              border: isPomalca
                                ? '1.5px solid var(--accent, #C2410C)'
                                : '1px solid var(--border, #E7E5E4)',
                              boxShadow: isPomalca
                                ? '0 4px 16px rgba(194,65,12,0.10)'
                                : undefined,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              padding: '1.25rem'
                            }}
                          >
                            <div>
                              {/* Departamento y badge Web Oficial */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span style={{
                                  fontSize: '0.73rem',
                                  fontWeight: 600,
                                  color: isPomalca ? 'var(--accent, #C2410C)' : zonaInfo.color
                                }}>
                                  {f.departamento || 'Perú'}
                                </span>
                                {isPomalca && (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent, #C2410C)' }}>
                                    Web Oficial
                                  </span>
                                )}
                              </div>

                              {/* Nombre de la fraternidad */}
                              <Link
                                to={webUrl}
                                style={{
                                  textDecoration: 'none',
                                  color: 'var(--text-main, #1C1917)',
                                  fontSize: '0.98rem',
                                  fontWeight: 700,
                                  lineHeight: 1.35,
                                  display: 'block',
                                  marginBottom: '0.45rem'
                                }}
                              >
                                {f.nombre}
                              </Link>

                              {/* Parroquia / Ubicación */}
                              <p style={{
                                margin: 0,
                                fontSize: '0.78rem',
                                color: 'var(--text-muted, #78716C)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '5px',
                                lineHeight: 1.4
                              }}>
                                <span>📍</span>
                                <span>{f.parroquia || f.departamento || 'Perú'}</span>
                              </p>

                              {/* Contacto y Teléfono */}
                              {(f.contacto || f.telefono) && (
                                <div style={{
                                  marginTop: '0.65rem',
                                  fontSize: '0.76rem',
                                  color: 'var(--text-muted, #57534E)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '3px'
                                }}>
                                  {f.contacto && <div>👤 {f.contacto}</div>}
                                  {f.telefono && <div>📞 {f.telefono}</div>}
                                </div>
                              )}
                            </div>

                            {/* Pie de tarjeta */}
                            <div style={{
                              marginTop: '1.15rem',
                              paddingTop: '0.8rem',
                              borderTop: '1px solid var(--border, #F5F5F4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}>
                              {isPomalca ? (
                                <Link
                                  to={webUrl}
                                  style={{
                                    background: 'var(--accent, #C2410C)',
                                    color: '#FFFFFF',
                                    borderRadius: '8px',
                                    padding: '0.48rem 0.95rem',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <span>Portal Oficial</span>
                                  <span>↗</span>
                                </Link>
                              ) : f.enlaceSocial ? (
                                <a
                                  href={f.enlaceSocial}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: 'var(--primary, #8B5A2B)',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span>Ver redes</span>
                                  <span>↗</span>
                                </a>
                              ) : (
                                <Link
                                  to={webUrl}
                                  style={{
                                    color: 'var(--primary, #8B5A2B)',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span>Ver detalle</span>
                                  <span>↗</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer oscuro minimalista */}
      <footer style={{ background: 'var(--hero-bg, #1A110B)', color: '#FFFFFF', padding: '1.25rem 1.5rem' }}>
        <div style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--secondary, #F59E0B)', fontWeight: 800, fontSize: '1rem' }}>✟</span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>JUFRA Perú</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
            © {new Date().getFullYear()} JUFRA Perú. Paz y Bien.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default JufraPeruView;
