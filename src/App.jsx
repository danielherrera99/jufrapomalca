import { getImageUrl } from './config/api';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from './config/api';
import Consejo from './components/Consejo';
import AnunciosView from './components/views/AnunciosView';
import EventosView from './components/views/EventosView';
import ServiciosView from './components/views/ServiciosView';
import ActasView from './components/views/ActasView';
import FormacionView from './components/views/FormacionView';
import CantosView from './components/views/CantosView';
import PeticionesView from './components/views/PeticionesView';
import HermanosView from './components/views/HermanosView';
import GaleriaView from './components/views/GaleriaView';
import EspirituView from './components/views/EspirituView';
import DocumentosView from './components/views/DocumentosView';
import AsistenciaView from './components/views/AsistenciaView';
import DashboardView from './components/views/DashboardView';
import PerfilView from './components/views/PerfilView';
import MapaView from './components/views/MapaView';
import ComunicacionView from './components/views/ComunicacionView';
import LandingView from './components/views/LandingView';
import OfsView from './components/views/OfsView';
import TerceraOrdenView from './components/views/TerceraOrdenView';
import OfsChiclayoView from './components/views/OfsChiclayoView';
import WebConfigView from './components/views/WebConfigView';
import OfsConfigView from './components/views/OfsConfigView';
import CampaignsAdminView from './components/views/CampaignsAdminView';
import CampaignView from './components/views/CampaignView';
import CelebracionesView from './components/views/CelebracionesView';
import MisMensajesView from './components/views/MisMensajesView';
import MensajesAdminView from './components/views/MensajesAdminView';
import AsistenteIAView from './components/views/AsistenteIAView';
import SolicitudesView from './components/views/SolicitudesView';
import FraternidadesAdminView from './components/views/FraternidadesAdminView';
import OfsFraternidadesAdminView from './components/views/OfsFraternidadesAdminView';
import RedesAdminView from './components/views/RedesAdminView';
import GaleriaWebAdminView from './components/views/GaleriaWebAdminView';
import QuienesSomosView from './components/views/QuienesSomosView';
import JufraPeruView from './components/views/JufraPeruView';
import FraternidadDetailView from './components/views/FraternidadDetailView';
import FinanzasView from './components/views/FinanzasView';
import RegistrosMascotasAdminView from './components/views/RegistrosMascotasAdminView';
import { FraternidadProvider, useFraternidad } from './context/FraternidadContext';
import FraternidadSelector from './components/FraternidadSelector';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ActivityIndicator = () => <div className="spinner"></div>;

// Selector interactivo de mapa mejorado (Drag & Click)
const MapPicker = ({ lat, lng, onChange }) => {
  const defaultPosition = [-6.764, -79.866]; 
  const position = [lat || defaultPosition[0], lng || defaultPosition[1]];
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onChange(Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6)));
        }
      },
    }),
    [onChange]
  );

  const LocationListener = () => {
    useMapEvents({
      click(e) {
        onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      },
    });
    return null;
  };

  return (
    <div style={{ height: '230px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginTop: '0.5rem', position: 'relative' }}>
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationListener />
        {lat && lng && (
          <Marker 
            position={[lat, lng]} 
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 12px', bottom: '10px', left: '10px', fontSize: '11px', borderRadius: '6px', zIndex: 1000, pointerEvents: 'none', fontWeight: 'bold' }}>📍 Arrastra el pin o haz clic en cualquier lugar</div>
    </div>
  );
};

// Componente para imágenes seguras
const SafeImage = ({ src, style, fallbackIcon }) => {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--surface), rgba(0,0,0,0.05))', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '3rem', opacity: 0.5 }}>{fallbackIcon || '🖼️'}</span>
      </div>
    );
  }
  return <img src={getImageUrl(src)} style={{ ...style, objectFit: 'cover', display: 'block' }} onError={() => setError(true)} alt="Anuncio" />;
};;

import './App.css';

const getSafeDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};


// Login Component (Premium Aesthetics - Split Screen)
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (['admin', 'superadmin', 'admin_nacional', 'consejo'].includes(data.usuario.rol)) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        if (data.usuario.fraternidadId) {
          localStorage.setItem('selected_fraternidad_id', data.usuario.fraternidadId);
        }
        if (rememberMe) {
          localStorage.setItem('rememberedUser', username);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        onLogin(data.usuario);
      } else {
        setError('Acceso denegado: Solo miembros del consejo o administración.');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error')) {
        setError('El servidor se está despertando (puede tomar hasta 1 min). Vuelve a intentar en unos segundos.');
      } else {
        setError('Credenciales inválidas o cuenta no aprobada.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: '¿Olvidaste tu contraseña?',
      text: 'Por motivos de seguridad, comunícate con el Administrador o con el Consejo Local de JUFRA Pomalca para restablecer tus credenciales.',
      icon: 'info',
      confirmButtonColor: '#c2410c',
      confirmButtonText: 'Entendido, gracias'
    });
  };

  return (
    <div className="login-split-page">
      {/* Columna Izquierda: Identidad y Carisma Franciscano */}
      <div className="login-left-pane">
        <div className="login-shape-1"></div>
        <div className="login-shape-2"></div>
        <div className="login-shape-3"></div>

        <div className="login-left-content">
          <div className="login-brand-badge">
            <div className="login-brand-tau">T</div>
            <span className="login-brand-name">JUFRA Pomalca</span>
          </div>

          <div className="login-left-hero">
            <span className="login-hero-tag">ACCESO INTERNO • CONSEJO LOCAL</span>
            <h1 className="login-hero-title">
              Gestión fraterna al servicio de la comunidad
            </h1>
            <p className="login-hero-desc">
              Administra el directorio de hermanos, el registro de asistencia sabatina por QR, las etapas formativas y los mensajes de nuevos jóvenes.
            </p>
          </div>

          <div className="login-left-footer">
            Parroquia Ntra. Sra. del Perpetuo Socorro · Pomalca
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Autenticación */}
      <div className="login-right-pane">
        <div className="login-right-content">
          <a href="/" className="login-back-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver a la página principal
          </a>

          <div className="login-form-heading">
            <h2 className="login-form-title">JUFRA Admin</h2>
            <p className="login-form-subtitle">Ingresa con tu cuenta de animador o consejo local.</p>
          </div>

          <div className="login-modern-card">
            {error && (
              <div className="login-alert-error animate-fade">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label className="login-field-label">Usuario o correo</label>
                <div className="login-input-container">
                  <span className="login-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    placeholder="francisco"
                    className="login-modern-input"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-split">
                  <label className="login-field-label">Contraseña</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="login-forgot-btn"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="login-input-container">
                  <span className="login-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••••"
                    className="login-modern-input is-password"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="login-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="login-remember-box">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">
                  Recordar sesión en este equipo
                </label>
              </div>

              <button 
                type="submit" 
                className="login-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar al Panel'}
              </button>
            </form>
          </div>

          <div className="login-peace-note">
            Paz y Bien · Sistema interno de JUFRA Pomalca
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component Shell
const modules = [
  { id: 'Dashboard', label: 'Inicio (Panel)', icon: '🏠' },
  { id: 'Hermanos', label: 'Hermanos', icon: '👤' },
  { id: 'Consejo', label: 'El Consejo', icon: '🛡️' },
  { id: 'Espiritu', label: 'Espíritu', icon: '🔥' },
  { id: 'Asistencia', label: 'Asistencia (QR)', icon: '✅' },
  { id: 'Anuncios', label: 'Anuncios', icon: '📢' },
  { id: 'Eventos', label: 'Calendario (Eventos)', icon: '📅' },
  { id: 'Servicios', label: 'Servicios', icon: '💼' },
  { id: 'Peticiones', label: 'Peticiones', icon: '🙏' },
  { id: 'Solicitudes', label: 'Solicitudes Web', icon: '🙋' },
  { id: 'Formacion', label: 'Formación', icon: '📖' },
  { id: 'Actas', label: 'Actas', icon: '📝' },
  { id: 'Documentos', label: 'Documentos', icon: '📄' },
  { id: 'Finanzas', label: 'Finanzas', icon: '💰' },
  { id: 'Galeria', label: 'Galería', icon: '🖼️' },
  { id: 'Mapa', label: 'Mapa', icon: '🗺️' },
  { id: 'Mensajes', label: 'Mensajes (Control)', icon: '🕵️' },
  { id: 'Chat', label: 'Mis Mensajes', icon: '💬' },
  { id: 'Cantos', label: 'Cancionero', icon: '🎵' },
  { id: 'Comunicacion', label: 'Comunicación', icon: '📢' },
  { id: 'Asistente', label: 'Asistente IA', icon: '🤖' },
  { id: 'Redes', label: 'Redes Sociales', icon: '📱' },
  { id: 'GaleriaWeb', label: 'Galería Web', icon: '🌐' },
  { id: 'QuienesSomos', label: 'Quiénes Somos', icon: '👥' },
  { id: 'WebConfig', label: 'Web Institucional', icon: '🌐' },
  { id: 'Campanas', label: 'Gestor de Campañas', icon: '🎯' },
  { id: 'RegistrosMascotas', label: 'Registro de Mascotas', icon: '🐾' },
  { id: 'OfsConfig', label: 'Configuración OFS', icon: '☦️' },
  { id: 'OfsFraternidades', label: 'Fraternidades OFS', icon: '🕊️' },
  { id: 'Fraternidades', label: 'JUFRA Perú', icon: '🇵🇪' },
  { id: 'Perfil', label: 'Mi Perfil', icon: '👤' },
];

const Dashboard = ({ user, onLogout }) => {
  const { selectedFraternidadId } = useFraternidad();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el tab activo de la URL
  const activeTab = useMemo(() => {
    const segments = location.pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment === 'dashboard' || !lastSegment) return 'Dashboard';
    
    const foundModule = modules.find(m => m.id.toLowerCase() === lastSegment.toLowerCase());
    return foundModule ? foundModule.id : 'Dashboard';
  }, [location.pathname]);

  const setActiveTab = (tabId) => {
    setSearchTerm('');
    if (tabId === 'Dashboard') navigate('/dashboard');
    else navigate(`/dashboard/${tabId.toLowerCase()}`);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const formatSafeDate = (dateStr, fmt = 'dd MMM yyyy') => {
    if (!dateStr) return 'Sin fecha';
    try {
      let parsed;
      if (typeof dateStr === 'string') {
        parsed = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);
      } else if (dateStr instanceof Date) {
        parsed = dateStr;
      } else {
        parsed = new Date(dateStr);
      }
      if (isNaN(parsed.getTime())) return 'Fecha inválida';
      return format(parsed, fmt, { locale: es });
    } catch (err) {
      return 'Error de fecha';
    }
  };



  return (
    <div className="dashboard-layout">
      {isSidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1000 }} 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">JUFRA Admin</div>
        <nav className="nav-menu">
          {/* GRUPO: GESTIÓN */}
          <div className="nav-section-title">GESTIÓN</div>
          {modules.filter(m => ['Dashboard', 'Hermanos', 'Consejo', 'Asistencia'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: VIDA FRATERNA */}
          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>VIDA FRATERNA</div>
          {modules.filter(m => ['Espiritu', 'Peticiones', 'Cantos', 'Anuncios', 'Eventos', 'Chat', 'Mapa'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: ADMIN */}
          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>ADMINISTRACIÓN</div>
          {modules.filter(m => ['Documentos', 'Actas', 'Formacion', 'Galeria', 'Finanzas', 'Servicios', 'Comunicacion', 'Asistente', 'Mensajes', 'Perfil'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: GESTIÓN WEB */}
          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>GESTIÓN WEB</div>
          {modules.filter(m => ['Solicitudes', 'Redes', 'GaleriaWeb', 'QuienesSomos', 'WebConfig', 'Campanas', 'RegistrosMascotas', 'OfsConfig', 'OfsFraternidades', 'Fraternidades'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: user.rol === 'superadmin' ? '#d97706' : '#b45309',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              {user.rol === 'superadmin' ? '👑' : (user.nombre?.charAt(0) || 'U')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p className="user-name" style={{ margin: 0, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.nombre} {user.apellido}
              </p>
              <span style={{ fontSize: '0.74rem', color: user.rol === 'superadmin' ? '#d97706' : 'var(--text-muted)', fontWeight: 600 }}>
                {user.rol === 'superadmin' ? '👑 Super Admin Nacional' : (user.fraternidadNombre || 'JUFRA Pomalca')}
              </span>
            </div>
          </div>
          <button className="btn btn-logout" onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </aside>
      <main className="dashboard-content">
        <div className="mobile-header">
          <div className="sidebar-brand" style={{ padding: 0, border: 'none', fontSize: '1.2rem' }}>JUFRA Admin</div>
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>☰</button>
        </div>
        <header className="content-header flex-responsive" style={{ marginBottom: '1.5rem', gap: '1.25rem', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem' }}>
                <span style={{ color: '#78716c', fontWeight: 500 }}>Gestión</span>
                <span style={{ color: '#a8a29e', margin: '0 2px' }}>/</span>
                <span style={{ color: '#1c1917', fontWeight: 700 }}>
                  {modules.find(m => m.id === activeTab)?.label || activeTab}
                </span>
              </div>
              <p style={{ color: '#78716c', fontSize: '0.825rem', margin: '4px 0 0 0', fontWeight: 400 }}>
                {user?.fraternidadNombre || 'JUFRA Pomalca'} · {(() => {
                  const today = new Date();
                  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                  return today.toLocaleDateString('es-ES', options).replace(/^./, str => str.toUpperCase());
                })()}
              </p>
            </div>
          <div className="flex-responsive" style={{ gap: '0.75rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <FraternidadSelector user={user} />
              <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: '1 1 auto' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: '#78716c', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Buscar hermano o tema..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 14px 7px 34px',
                    borderRadius: '10px',
                    border: '1px solid #e7e5e4',
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                    color: '#1c1917',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <a 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e7e5e4',
                  backgroundColor: '#ffffff',
                  color: '#1c1917',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f4'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Ver web pública
              </a>
          </div>
        </header>

        
        <div className="mt-4" key={selectedFraternidadId || 'all-peru'}>
          <Routes>
          <Route path="/" element={<DashboardView user={user} formatSafeDate={formatSafeDate} setActiveTab={setActiveTab} ActivityIndicator={ActivityIndicator} />} />
          <Route path="hermanos" element={<HermanosView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="anuncios" element={<AnunciosView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="eventos" element={<EventosView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="servicios" element={<ServiciosView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="peticiones" element={<PeticionesView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="formacion" element={<FormacionView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="actas" element={<ActasView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="documentos" element={<DocumentosView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="finanzas" element={<FinanzasView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="galeria" element={<GaleriaView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="cantos" element={<CantosView ActivityIndicator={ActivityIndicator} />} />
          <Route path="asistencia" element={<AsistenciaView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="solicitudes" element={<SolicitudesView formatSafeDate={formatSafeDate} />} />
          <Route path="mapa" element={<MapaView ActivityIndicator={ActivityIndicator} setActiveTab={setActiveTab} />} />
          <Route path="chat" element={<MisMensajesView ActivityIndicator={ActivityIndicator} SafeImage={SafeImage} user={user} formatSafeDate={formatSafeDate} />} />
          <Route path="perfil" element={<PerfilView ActivityIndicator={ActivityIndicator} SafeImage={SafeImage} />} />
          <Route path="redes" element={<RedesAdminView />} />
          <Route path="webconfig" element={<WebConfigView />} />
          <Route path="campanas" element={<CampaignsAdminView ActivityIndicator={ActivityIndicator} />} />
          <Route path="registrosmascotas" element={<RegistrosMascotasAdminView />} />
          <Route path="ofsconfig" element={<OfsConfigView />} />
          <Route path="ofsfraternidades" element={<OfsFraternidadesAdminView ActivityIndicator={ActivityIndicator} />} />
          <Route path="fraternidades" element={<FraternidadesAdminView />} />
          <Route path="consejo" element={<Consejo />} />
          <Route path="comunicacion" element={<ComunicacionView ActivityIndicator={ActivityIndicator} />} />
          <Route path="mensajes" element={<MensajesAdminView ActivityIndicator={ActivityIndicator} formatSafeDate={formatSafeDate} />} />
          <Route path="espiritu" element={<EspirituView />} />
          <Route path="asistente" element={<AsistenteIAView />} />
          <Route path="galeriaweb" element={<GaleriaWebAdminView />} />
          <Route path="quienessomos" element={<QuienesSomosView />} />
        </Routes>
        </div>



      </main>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#ffebee', color: '#c62828', fontFamily: 'monospace', minHeight: '100vh', textAlign: 'left' }}>
          <h1>¡Cuidado! Error crítico detectado en la pantalla.</h1>
          <p>Toma una captura de esto y envíaselo al asistente:</p>
          <hr />
          <h3>Mensaje: {this.state.error?.toString()}</h3>
          <pre style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', padding: '1rem' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '10px', cursor: 'pointer' }}>Recargar Página</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import FloatingChat from './components/FloatingChat';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      console.error("Error al cargar sesión:", e);
      localStorage.removeItem('user');
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Cara Pública */}
          <Route path="/" element={<LandingView />} />
          <Route path="/campana" element={<CampaignView />} />
          <Route path="/familia" element={<OfsView />} />
          <Route path="/ofs" element={<TerceraOrdenView />} />
          <Route path="/ofs/chiclayo" element={<OfsChiclayoView />} />
          <Route path="/celebraciones" element={<CelebracionesView />} />
          <Route path="/jufra-peru" element={<JufraPeruView />} />
          <Route path="/jufra-peru/:slug" element={<FraternidadDetailView />} />
          
          {/* Panel de Administración (Privado) */}
          <Route path="/admin" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard/*" element={
            user ? (
              <FraternidadProvider user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </FraternidadProvider>
            ) : <Navigate to="/admin" />
          } />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {/* El Chatbot Flotante Premium */}
        <FloatingChat />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
