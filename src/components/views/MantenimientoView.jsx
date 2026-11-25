import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const MantenimientoView = ({ onRetry }) => {
  const [comprobando, setComprobando] = useState(false);
  const [estadoBackend, setEstadoBackend] = useState('verificando'); // 'online' | 'offline' | 'verificando'

  const verificarEstado = async () => {
    setComprobando(true);
    setEstadoBackend('verificando');
    try {
      const res = await api.get('/web-config', { timeout: 5000 });
      if (res.data) {
        setEstadoBackend('online');
      } else {
        setEstadoBackend('offline');
      }
    } catch (err) {
      setEstadoBackend('offline');
    } finally {
      setComprobando(false);
    }
  };

  useEffect(() => {
    verificarEstado();
  }, []);

  return (
    <div style={styles.container}>
      {/* Luces y formas orgánicas de fondo */}
      <div style={styles.glowAmber} />
      <div style={styles.glowTerracotta} />

      <div style={styles.card}>
        {/* Cabecera con TAU */}
        <div style={styles.tauContainer}>
          <div style={styles.tauBadge}>
            <span style={styles.tauSymbol}>T</span>
          </div>
          <span style={styles.pazBienText}>PAZ Y BIEN</span>
        </div>

        {/* Título Principal */}
        <h1 style={styles.title}>
          Momento de Oración <br />& Mantenimiento
        </h1>

        {/* Mensaje Fraterno */}
        <p style={styles.description}>
          Paz y Bien, hermanos. Nuestra plataforma web comunitaria se encuentra temporalmente en 
          proceso de actualización y optimización de servidores para brindarte una mejor experiencia fraterna.
        </p>

        {/* Cita Franciscana */}
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>
            «Empieza por hacer lo necesario, luego lo que es posible, y de pronto estarás haciendo lo imposible.»
          </p>
          <span style={styles.quoteAuthor}>— San Francisco de Asís</span>
        </div>

        {/* Estado en tiempo real */}
        <div style={styles.statusBox}>
          <div style={{
            ...styles.statusDot,
            backgroundColor: estadoBackend === 'online' ? '#16a34a' : (estadoBackend === 'verificando' ? '#f59e0b' : '#c2410c')
          }} />
          <span style={styles.statusLabel}>
            {estadoBackend === 'online' && 'Servidores en línea · Haz clic en Reintentar'}
            {estadoBackend === 'verificando' && 'Comprobando estado de la fraternidad...'}
            {estadoBackend === 'offline' && 'Actualización programada en curso'}
          </span>
        </div>

        {/* Acciones */}
        <div style={styles.actionsRow}>
          <a
            href="https://wa.me/51982225200?text=Paz%20y%20Bien,%20quisiera%20consultar%20sobre%20la%20plataforma%20de%20JUFRA%20Pomalca"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.primaryButton}
          >
            💬 Contactar por WhatsApp
          </a>

          <button
            onClick={() => {
              verificarEstado();
              if (onRetry) {
                onRetry();
              } else {
                window.location.reload();
              }
            }}
            style={styles.secondaryButton}
            disabled={comprobando}
          >
            {comprobando ? 'Comprobando...' : '🔄 Reintentar conexión'}
          </button>
        </div>

        {/* Redes y Parroquia */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Fraternidad Juventud Franciscana de Pomalca<br />
            Parroquia Ntra. Sra. del Perpetuo Socorro · Lambayeque, Perú
          </p>
          <div style={styles.socialLinks}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>Facebook</a>
            <span style={styles.socialDot}>·</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>Instagram</a>
            <span style={styles.socialDot}>·</span>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>TikTok</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#18110b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
  },
  glowAmber: {
    position: 'absolute',
    top: '-15%',
    right: '-10%',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    filter: 'blur(100px)',
    pointerEvents: 'none',
  },
  glowTerracotta: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    backgroundColor: 'rgba(194, 65, 12, 0.14)',
    filter: 'blur(120px)',
    pointerEvents: 'none',
  },
  card: {
    maxWidth: '620px',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '28px',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
    boxSizing: 'border-box',
  },
  tauContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '1.75rem',
  },
  tauBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
  },
  tauSymbol: {
    color: '#f59e0b',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: '800',
    fontSize: '1.85rem',
    lineHeight: 1,
  },
  pazBienText: {
    color: '#fef3c7',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.22em',
    fontFamily: 'monospace, sans-serif',
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 'clamp(2rem, 4.5vw, 2.75rem)',
    fontWeight: '800',
    lineHeight: 1.15,
    margin: '0 0 1.25rem 0',
    letterSpacing: '-0.025em',
  },
  description: {
    color: '#d6d3d1',
    fontSize: '1.05rem',
    lineHeight: 1.65,
    margin: '0 0 1.75rem 0',
    fontWeight: '400',
  },
  quoteBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderLeft: '3px solid #f59e0b',
    padding: '1.1rem 1.35rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  quoteText: {
    color: '#f5f5f4',
    fontStyle: 'italic',
    fontSize: '0.92rem',
    lineHeight: 1.5,
    margin: '0 0 0.35rem 0',
  },
  quoteAuthor: {
    color: '#fbbf24',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  statusBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.55rem',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: '0.5rem 1.1rem',
    borderRadius: '50px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '2rem',
  },
  statusDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease',
  },
  statusLabel: {
    color: '#e7e5e4',
    fontSize: '0.82rem',
    fontWeight: '500',
  },
  actionsRow: {
    display: 'flex',
    gap: '0.85rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '2.5rem',
  },
  primaryButton: {
    backgroundColor: '#c2410c',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    padding: '0.85rem 1.75rem',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(194, 65, 12, 0.35)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    padding: '0.85rem 1.75rem',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1.5rem',
  },
  footerText: {
    color: '#a8a29e',
    fontSize: '0.82rem',
    lineHeight: 1.5,
    margin: '0 0 0.85rem 0',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.65rem',
  },
  socialLink: {
    color: '#f59e0b',
    textDecoration: 'none',
    fontSize: '0.82rem',
    fontWeight: '600',
  },
  socialDot: {
    color: '#78716c',
  },
};

export default MantenimientoView;
