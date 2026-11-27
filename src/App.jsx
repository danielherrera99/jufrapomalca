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
import InventarioView from './components/views/InventarioView';
import MantenimientoView from './components/views/MantenimientoView';
import { FraternidadProvider, useFraternidad, POMALCA_ID } from './context/FraternidadContext';
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
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Registro de Nueva Cuenta (Flujo idéntico a la App Móvil)
  const [regData, setRegData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    nombreContactoEmergencia: '',
    contactoEmergencia: '',
    fraternidadId: '00000000-6a0f-b53a-d327-e42a6db2faf7',
    username: '',
    password: '',
    confirmarPassword: ''
  });
  const [fraternidades, setFraternidades] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Estados para Recuperación de Contraseña (Flujo idéntico a la App Móvil)
  const [recoverStep, setRecoverStep] = useState(1); // 1: Pedir correo/usuario, 2: Código 6 dígitos, 3: Nueva clave
  const [recoverUser, setRecoverUser] = useState('');
  const [recoverCode, setRecoverCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverError, setRecoverError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }

    const fetchFraternidades = async () => {
      try {
        const res = await api.get('/fraternidades');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setFraternidades(res.data.data);
          const pomalca = res.data.data.find(f => f.id === '00000000-6a0f-b53a-d327-e42a6db2faf7' || f.nombre?.toLowerCase().includes('pomalca'));
          if (pomalca) {
            setRegData(prev => ({ ...prev, fraternidadId: pomalca.id }));
          }
        }
      } catch (e) {
        console.error('Error al cargar fraternidades:', e);
      }
    };
    fetchFraternidades();
  }, []);

  // --- Handler de Registro de Nueva Cuenta ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regData.nombre.trim()) {
      setRegError('El nombre es requerido.');
      return;
    }
    if (!regData.apellido.trim()) {
      setRegError('El apellido es requerido.');
      return;
    }
    if (!regData.email.trim()) {
      setRegError('El correo es requerido para recuperar la contraseña y notificaciones.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email.trim())) {
      setRegError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!regData.telefono.trim()) {
      setRegError('El teléfono es requerido.');
      return;
    }
    if (!regData.username.trim()) {
      setRegError('El usuario es requerido.');
      return;
    }
    if (regData.username.trim().length < 4) {
      setRegError('El usuario debe tener al menos 4 caracteres.');
      return;
    }
    if (!regData.password) {
      setRegError('La contraseña es requerida.');
      return;
    }
    if (regData.password.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (regData.password !== regData.confirmarPassword) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }

    setRegLoading(true);
    try {
      const payload = {
        nombre: regData.nombre.trim(),
        apellido: regData.apellido.trim(),
        email: regData.email.trim(),
        telefono: regData.telefono.trim(),
        fechaNacimiento: regData.fechaNacimiento || undefined,
        contactoEmergencia: regData.contactoEmergencia.trim() || undefined,
        nombreContactoEmergencia: regData.nombreContactoEmergencia.trim() || undefined,
        fraternidadId: regData.fraternidadId || '00000000-6a0f-b53a-d327-e42a6db2faf7',
        username: regData.username.trim(),
        password: regData.password
      };

      const res = await api.post('/auth/registro', payload);
      if (res.data.success) {
        Swal.fire({
          title: '¡Solicitud Enviada! 🎉',
          text: res.data.message || 'Tu cuenta está pendiente de aprobación por el Consejo.',
          icon: 'success',
          confirmButtonColor: '#c2410c',
          confirmButtonText: 'Entendido e Iniciar Sesión'
        });
        setUsername(regData.username.trim());
        setPassword('');
        setView('login');
        setRegError('');
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Error al procesar el registro. Intenta de nuevo.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data && data.usuario && data.token) {
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
        setError('No se pudo verificar la sesión. Intenta de nuevo.');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error')) {
        setError('El servidor se está despertando (puede tomar hasta 1 min). Vuelve a intentar en unos segundos.');
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Credenciales inválidas o cuenta no aprobada.';
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers de Recuperación de Contraseña ---
  const handleOpenForgot = () => {
    setView('forgot');
    setRecoverStep(1);
    setRecoverError('');
    setRecoverSuccess('');
    if (username.trim()) {
      setRecoverUser(username.trim());
    }
  };

  const handleSolicitarCodigo = async (e) => {
    if (e) e.preventDefault();
    if (!recoverUser.trim()) {
      setRecoverError('Por favor ingresa tu usuario o correo electrónico.');
      return;
    }
    setRecoverLoading(true);
    setRecoverError('');
    setRecoverSuccess('');
    try {
      const res = await api.post('/auth/recuperar-password', { usernameOrEmail: recoverUser.trim() });
      if (res.data.success) {
        setRecoverSuccess('¡Código enviado con éxito! Revisa tu bandeja de entrada o spam.');
        setRecoverStep(2);
      }
    } catch (err) {
      setRecoverError(err.response?.data?.message || err.response?.data?.error || 'No se pudo enviar el código. Verifica que el usuario o correo exista.');
    } finally {
      setRecoverLoading(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    if (e) e.preventDefault();
    if (!recoverCode.trim() || recoverCode.trim().length !== 6) {
      setRecoverError('Por favor ingresa el código numérico de 6 dígitos.');
      return;
    }
    setRecoverLoading(true);
    setRecoverError('');
    setRecoverSuccess('');
    try {
      const res = await api.post('/auth/verificar-codigo', { 
        usernameOrEmail: recoverUser.trim(), 
        codigo: recoverCode.trim() 
      });
      if (res.data.success) {
        setRecoverSuccess('Código verificado correctamente.');
        setRecoverStep(3);
      }
    } catch (err) {
      setRecoverError(err.response?.data?.message || err.response?.data?.error || 'Código incorrecto o expirado.');
    } finally {
      setRecoverLoading(false);
    }
  };

  const handleRestablecerPassword = async (e) => {
    if (e) e.preventDefault();
    if (newPassword.length < 6) {
      setRecoverError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoverError('Las contraseñas no coinciden. Verifícalas bien.');
      return;
    }
    setRecoverLoading(true);
    setRecoverError('');
    setRecoverSuccess('');
    try {
      const res = await api.put('/auth/reset-password', { 
        usernameOrEmail: recoverUser.trim(), 
        codigo: recoverCode.trim(),
        newPassword 
      });
      if (res.data.success) {
        Swal.fire({
          title: '¡Contraseña Restablecida! 🎉',
          text: 'Tu contraseña se actualizó correctamente. Ya puedes ingresar con tu nueva clave.',
          icon: 'success',
          confirmButtonColor: '#c2410c',
          confirmButtonText: 'Iniciar Sesión'
        });
        setUsername(recoverUser.trim());
        setPassword('');
        setView('login');
        setRecoverStep(1);
        setRecoverCode('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setRecoverError(err.response?.data?.message || err.response?.data?.error || 'Error al restablecer la contraseña.');
    } finally {
      setRecoverLoading(false);
    }
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
            <div className="login-brand-tau" style={{ padding: '4px', background: '#271f1a', overflow: 'hidden' }}>
              <img src="/logo_jufra.png" alt="Logo JUFRA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="login-brand-name">JUFRA Pomalca</span>
          </div>

          <div className="login-left-hero">
            <span className="login-hero-tag">
              {view === 'register' 
                ? 'FAMILIA FRANCISCANA • REGISTRO' 
                : view === 'forgot' 
                ? 'SEGURIDAD • CUENTA FRATERNA' 
                : 'PORTAL FRATERNO • COMUNIDAD JUFRA'}
            </span>
            <h1 className="login-hero-title">
              {view === 'register' 
                ? 'Únete a la fraternidad de la JUFRA' 
                : view === 'forgot' 
                ? 'Recupera tu acceso al panel' 
                : 'Vida fraterna y servicio en comunidad'}
            </h1>
            <p className="login-hero-desc">
              {view === 'register'
                ? 'Crea tu cuenta como nuevo hermano para formar parte de la comunidad, participar de los encuentros sabatinos y caminar juntos en el Evangelio.'
                : view === 'forgot'
                ? 'Te enviaremos un código de seguridad para que puedas restablecer tu contraseña y volver a ingresar al sistema.'
                : 'Accede a la vida fraterna, espiritualidad, cancionero, formación, anuncios y gestión comunitaria de la JUFRA.'}
            </p>
          </div>

          <div className="login-left-footer">
            Parroquia Ntra. Sra. del Perpetuo Socorro · Pomalca
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Autenticación, Registro o Recuperación */}
      <div className="login-right-pane">
        <div className={`login-right-content ${view === 'register' ? 'is-register' : ''}`}>
          {view === 'login' ? (
            <a href="/" className="login-back-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver a la página principal
            </a>
          ) : (
            <button 
              type="button" 
              onClick={() => { setView('login'); setRecoverStep(1); setRecoverError(''); setRecoverSuccess(''); setRegError(''); }}
              className="login-back-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver al inicio de sesión
            </button>
          )}

          <div className="login-form-heading">
            <h2 className="login-form-title">
              {view === 'login' ? 'Portal Fraterno' : view === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña'}
            </h2>
            <p className="login-form-subtitle">
              {view === 'login' && 'Ingresa con tu cuenta de hermano o consejo local.'}
              {view === 'register' && 'Completa tus datos para unirte a la fraternidad.'}
              {view === 'forgot' && recoverStep === 1 && 'Ingresa tu usuario o correo para enviarte un código de seguridad.'}
              {view === 'forgot' && recoverStep === 2 && 'Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.'}
              {view === 'forgot' && recoverStep === 3 && 'Crea tu nueva contraseña segura para acceder al panel.'}
            </p>
          </div>

          <div className="login-modern-card">
            {view === 'login' ? (
              <>
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
                        onClick={handleOpenForgot}
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

                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e7e5e4', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#78716c' }}>
                      ¿Aún no tienes una cuenta fraterna?
                    </p>
                    <button 
                      type="button" 
                      onClick={() => { setView('register'); setRegError(''); }}
                      className="login-btn-secondary"
                      style={{ width: '100%', fontWeight: '600', color: '#c2410c', borderColor: '#fdba74' }}
                    >
                      ✨ Crear Cuenta de Hermano
                    </button>
                  </div>
                </form>
              </>
            ) : view === 'register' ? (
              /* Flujo de Registro de Nueva Cuenta (Idéntico a la App Móvil) */
              <div className="animate-fade">
                {regError && (
                  <div className="login-alert-error animate-fade">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  {/* Sección 1: Información Personal */}
                  <div className="login-form-section-title">
                    <span>👤</span> Información Personal
                  </div>

                  <div className="login-form-grid-2">
                    <div className="login-field">
                      <label className="login-field-label">Nombres</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">👤</span>
                        <input 
                          type="text" 
                          value={regData.nombre} 
                          onChange={e => setRegData({ ...regData, nombre: e.target.value })} 
                          required 
                          placeholder="Tus nombres"
                          className="login-modern-input"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="login-field">
                      <label className="login-field-label">Apellidos</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">👤</span>
                        <input 
                          type="text" 
                          value={regData.apellido} 
                          onChange={e => setRegData({ ...regData, apellido: e.target.value })} 
                          required 
                          placeholder="Tus apellidos"
                          className="login-modern-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="login-field">
                    <label className="login-field-label">Correo Electrónico</label>
                    <div className="login-input-container">
                      <span className="login-input-icon">📧</span>
                      <input 
                        type="email" 
                        value={regData.email} 
                        onChange={e => setRegData({ ...regData, email: e.target.value })} 
                        required 
                        placeholder="ejemplo@gmail.com"
                        className="login-modern-input"
                      />
                    </div>
                  </div>

                  <div className="login-form-grid-2">
                    <div className="login-field">
                      <label className="login-field-label">Fecha de Nacimiento</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">📅</span>
                        <input 
                          type="date" 
                          value={regData.fechaNacimiento} 
                          onChange={e => setRegData({ ...regData, fechaNacimiento: e.target.value })} 
                          className="login-modern-input"
                        />
                      </div>
                    </div>
                    <div className="login-field">
                      <label className="login-field-label">Teléfono / WhatsApp</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">📱</span>
                        <input 
                          type="tel" 
                          value={regData.telefono} 
                          onChange={e => setRegData({ ...regData, telefono: e.target.value })} 
                          required 
                          placeholder="+51 999 999 999"
                          className="login-modern-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="login-form-grid-2">
                    <div className="login-field">
                      <label className="login-field-label">Contacto de Emergencia <span style={{ fontWeight: 'normal', color: '#78716c' }}>(Opcional)</span></label>
                      <div className="login-input-container">
                        <span className="login-input-icon">👥</span>
                        <input 
                          type="text" 
                          value={regData.nombreContactoEmergencia} 
                          onChange={e => setRegData({ ...regData, nombreContactoEmergencia: e.target.value })} 
                          placeholder="Ej: Mamá / Papá"
                          className="login-modern-input"
                        />
                      </div>
                    </div>
                    <div className="login-field">
                      <label className="login-field-label">Número de Emergencia <span style={{ fontWeight: 'normal', color: '#78716c' }}>(Opcional)</span></label>
                      <div className="login-input-container">
                        <span className="login-input-icon">📞</span>
                        <input 
                          type="tel" 
                          value={regData.contactoEmergencia} 
                          onChange={e => setRegData({ ...regData, contactoEmergencia: e.target.value })} 
                          placeholder="+51 999 999 999"
                          className="login-modern-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Fraternidad */}
                  <div className="login-form-section-title">
                    <span>📍</span> Tu Fraternidad
                  </div>

                  <div className="login-field">
                    <label className="login-field-label">Selecciona tu fraternidad en Perú</label>
                    <div className="login-input-container">
                      <span className="login-input-icon">🏛️</span>
                      <select 
                        value={regData.fraternidadId} 
                        onChange={e => setRegData({ ...regData, fraternidadId: e.target.value })}
                        className="login-modern-input"
                        style={{ cursor: 'pointer' }}
                      >
                        {fraternidades.length > 0 ? (
                          fraternidades.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.nombre} ({f.departamento || f.zona || 'Perú'})
                            </option>
                          ))
                        ) : (
                          <option value="00000000-6a0f-b53a-d327-e42a6db2faf7">JUFRA Pomalca (Lambayeque)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Sección 3: Información de la Cuenta */}
                  <div className="login-form-section-title">
                    <span>🔒</span> Información de la Cuenta
                  </div>

                  <div className="login-field">
                    <label className="login-field-label">Usuario</label>
                    <div className="login-input-container">
                      <span className="login-input-icon">👤</span>
                      <input 
                        type="text" 
                        value={regData.username} 
                        onChange={e => setRegData({ ...regData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })} 
                        required 
                        placeholder="Elige tu nombre de usuario"
                        className="login-modern-input"
                        autoCapitalize="none"
                      />
                    </div>
                    <small style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '4px', display: 'block' }}>
                      Mínimo 4 caracteres. Sin espacios.
                    </small>
                  </div>

                  <div className="login-form-grid-2">
                    <div className="login-field">
                      <label className="login-field-label">Contraseña</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">🔒</span>
                        <input 
                          type={showRegPassword ? "text" : "password"} 
                          value={regData.password} 
                          onChange={e => setRegData({ ...regData, password: e.target.value })} 
                          required 
                          placeholder="Mínimo 6 caracteres"
                          className="login-modern-input is-password"
                        />
                        <button 
                          type="button" 
                          className="login-toggle-eye"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          aria-label={showRegPassword ? "Ocultar" : "Mostrar"}
                        >
                          {showRegPassword ? (
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

                    <div className="login-field">
                      <label className="login-field-label">Confirmar Contraseña</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">🔒</span>
                        <input 
                          type={showRegConfirmPassword ? "text" : "password"} 
                          value={regData.confirmarPassword} 
                          onChange={e => setRegData({ ...regData, confirmarPassword: e.target.value })} 
                          required 
                          placeholder="Repite la clave"
                          className="login-modern-input is-password"
                        />
                        <button 
                          type="button" 
                          className="login-toggle-eye"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          aria-label={showRegConfirmPassword ? "Ocultar" : "Mostrar"}
                        >
                          {showRegConfirmPassword ? (
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
                  </div>

                  <button 
                    type="submit" 
                    className="login-btn-primary" 
                    disabled={regLoading}
                    style={{ marginTop: '1.5rem' }}
                  >
                    {regLoading ? 'Registrando cuenta...' : 'Crear Cuenta'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setView('login'); setRegError(''); }}
                    className="login-btn-secondary"
                    style={{ marginTop: '0.75rem' }}
                  >
                    Ya tengo una cuenta · Iniciar Sesión
                  </button>
                </form>

                {/* Ayuda directa por WhatsApp (idéntico a la app) */}
                <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e7e5e4', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#78716c' }}>
                    ¿Problemas con el registro o necesitas ayuda?
                  </p>
                  <a 
                    href="https://wa.me/51981574685?text=Hola%20hermano,%20tengo%20un%20problema%20en%20la%20web%20para%20crear%20mi%20cuenta,%20por%20favor%20me%20ayudas"
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                  >
                    <span>💬</span> Ayuda por WhatsApp con el Consejo
                  </a>
                </div>
              </div>
            ) : (
              /* Flujo de Recuperación de Contraseña */
              <div className="animate-fade">
                {/* Indicador de pasos */}
                <div className="login-step-indicators">
                  <div className={`login-step-item ${recoverStep === 1 ? 'active' : recoverStep > 1 ? 'completed' : ''}`}>
                    <div className="login-step-circle">{recoverStep > 1 ? '✓' : '1'}</div>
                    <span className="login-step-label">Correo</span>
                  </div>
                  <div className={`login-step-item ${recoverStep === 2 ? 'active' : recoverStep > 2 ? 'completed' : ''}`}>
                    <div className="login-step-circle">{recoverStep > 2 ? '✓' : '2'}</div>
                    <span className="login-step-label">Código</span>
                  </div>
                  <div className={`login-step-item ${recoverStep === 3 ? 'active' : ''}`}>
                    <div className="login-step-circle">3</div>
                    <span className="login-step-label">Nueva Clave</span>
                  </div>
                </div>

                {recoverError && (
                  <div className="login-alert-error animate-fade">
                    {recoverError}
                  </div>
                )}

                {recoverSuccess && (
                  <div className="login-alert-success animate-fade">
                    {recoverSuccess}
                  </div>
                )}

                {/* Paso 1: Solicitar Código */}
                {recoverStep === 1 && (
                  <form onSubmit={handleSolicitarCodigo}>
                    <div className="login-field">
                      <label className="login-field-label">Usuario o correo electrónico</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          value={recoverUser} 
                          onChange={e => setRecoverUser(e.target.value)} 
                          required 
                          placeholder="Ej: francisco o correo@gmail.com"
                          className="login-modern-input"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="login-btn-primary" 
                      disabled={recoverLoading}
                      style={{ marginTop: '1.5rem' }}
                    >
                      {recoverLoading ? 'Enviando código...' : 'Enviar Código al Correo'}
                    </button>
                  </form>
                )}

                {/* Paso 2: Verificar Código de 6 Dígitos */}
                {recoverStep === 2 && (
                  <form onSubmit={handleVerificarCodigo}>
                    <div className="login-field">
                      <div className="login-label-split">
                        <label className="login-field-label">Código de seguridad (6 dígitos)</label>
                        <button 
                          type="button" 
                          onClick={() => { setRecoverStep(1); setRecoverError(''); }} 
                          className="login-forgot-btn"
                        >
                          Cambiar usuario
                        </button>
                      </div>
                      <div className="login-input-container">
                        <span className="login-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          value={recoverCode} 
                          onChange={e => setRecoverCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                          required 
                          maxLength={6}
                          placeholder="123456"
                          className="login-modern-input"
                          style={{ letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center' }}
                          autoFocus
                        />
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#78716c' }}>
                        Revisa tu bandeja de entrada o spam para <strong>{recoverUser}</strong>. Expira en 15 minutos.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      className="login-btn-primary" 
                      disabled={recoverLoading}
                      style={{ marginTop: '1.25rem' }}
                    >
                      {recoverLoading ? 'Verificando...' : 'Verificar Código'}
                    </button>

                    <button 
                      type="button" 
                      onClick={handleSolicitarCodigo}
                      disabled={recoverLoading}
                      className="login-btn-secondary"
                      style={{ marginTop: '0.75rem' }}
                    >
                      Reenviar código
                    </button>
                  </form>
                )}

                {/* Paso 3: Restablecer Contraseña */}
                {recoverStep === 3 && (
                  <form onSubmit={handleRestablecerPassword}>
                    <div className="login-field">
                      <label className="login-field-label">Nueva Contraseña</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          value={newPassword} 
                          onChange={e => setNewPassword(e.target.value)} 
                          required 
                          placeholder="Mínimo 6 caracteres"
                          className="login-modern-input is-password"
                          autoFocus
                        />
                        <button 
                          type="button" 
                          className="login-toggle-eye"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Ocultar" : "Mostrar"}
                        >
                          {showNewPassword ? (
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

                    <div className="login-field">
                      <label className="login-field-label">Confirmar Contraseña</label>
                      <div className="login-input-container">
                        <span className="login-input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        </span>
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)} 
                          required 
                          placeholder="Repite la nueva contraseña"
                          className="login-modern-input is-password"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="login-btn-primary" 
                      disabled={recoverLoading}
                      style={{ marginTop: '1.25rem' }}
                    >
                      {recoverLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                  </form>
                )}

                {/* Ayuda directa por WhatsApp (idéntico a la app) */}
                <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e7e5e4', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#78716c' }}>
                    ¿No recibes el código o necesitas ayuda?
                  </p>
                  <a 
                    href="https://wa.me/51981574685?text=Hola%20hermano,%20tengo%20un%20problema%20en%20la%20web%20para%20recuperar%20mi%20contrase%C3%B1a,%20por%20favor%20me%20ayudas"
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                  >
                    <span>💬</span> Ayuda por WhatsApp con el Consejo
                  </a>
                </div>
              </div>
            )}
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
  { id: 'Inventario', label: 'Inventario', icon: '📦', adminOnly: true },
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
  const { selectedFraternidadId, activeFraternidad } = useFraternidad();
  const navigate = useNavigate();
  const location = useLocation();

  const isPomalca = (selectedFraternidadId === POMALCA_ID) || 
    (!selectedFraternidadId && user?.fraternidadId === POMALCA_ID) ||
    (activeFraternidad?.nombre && activeFraternidad.nombre.toUpperCase().includes('POMALCA'));

  const esAdmin = ['admin', 'superadmin', 'admin_nacional'].includes(user?.rol);
  const esConsejo = ['admin', 'superadmin', 'admin_nacional', 'consejo'].includes(user?.rol);

  // Módulos reservados exclusivamente para el Consejo Local y Administradores
  const modulosConsejo = useMemo(() => [
    'Consejo', 'Actas', 'Finanzas', 'Inventario', 'Solicitudes', 'Redes', 
    'GaleriaWeb', 'QuienesSomos', 'WebConfig', 'Campanas', 'RegistrosMascotas', 
    'OfsConfig', 'OfsFraternidades', 'Fraternidades', 'Comunicacion', 'Mensajes', 'Asistente'
  ], []);

  // Obtener el tab activo de la URL con protección de rol
  const activeTab = useMemo(() => {
    const segments = location.pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment === 'dashboard' || !lastSegment) return 'Dashboard';
    
    const foundModule = modules.find(m => m.id.toLowerCase() === lastSegment.toLowerCase());
    if (!foundModule) return 'Dashboard';
    if (!esConsejo && modulosConsejo.includes(foundModule.id)) return 'Dashboard';
    return foundModule.id;
  }, [location.pathname, esConsejo, modulosConsejo]);

  const setActiveTab = (tabId) => {
    setSearchTerm('');
    if (!esConsejo && modulosConsejo.includes(tabId)) {
      navigate('/dashboard');
      return;
    }
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
        <div className="sidebar-brand">
          {esConsejo ? 'JUFRA Admin' : 'JUFRA Fraternidad'}
        </div>

        {/* Selector de Fraternidad en la Barra Lateral Izquierda (arriba de los menús) */}
        <div style={{ padding: '0 0.85rem 0.85rem' }}>
          <FraternidadSelector user={user} isSidebar={true} />
        </div>

        <nav className="nav-menu">
          {/* GRUPO: GESTIÓN O VIDA FRATERNA */}
          <div className="nav-section-title">
            {esConsejo ? 'GESTIÓN' : 'VIDA FRATERNA'}
          </div>
          {modules.filter(m => {
            if (m.id === 'Consejo' && !esConsejo) return false;
            return ['Dashboard', 'Hermanos', 'Consejo', 'Asistencia'].includes(m.id);
          }).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: VIDA FRATERNA / ESPIRITUALIDAD */}
          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>ESPIRITUALIDAD Y COMUNIDAD</div>
          {modules.filter(m => ['Espiritu', 'Peticiones', 'Cantos', 'Anuncios', 'Eventos', 'Chat', 'Mapa'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: ADMINISTRACIÓN O RECURSOS */}
          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>
            {esConsejo ? 'ADMINISTRACIÓN' : 'RECURSOS Y FORMACIÓN'}
          </div>
          {modules.filter(m => {
            if (!esConsejo) {
              return ['Formacion', 'Documentos', 'Galeria', 'Servicios', 'Perfil'].includes(m.id);
            }
            if (m.id === 'Inventario') return esAdmin;
            return ['Documentos', 'Actas', 'Formacion', 'Galeria', 'Finanzas', 'Servicios', 'Comunicacion', 'Asistente', 'Mensajes', 'Perfil'].includes(m.id);
          }).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: GESTIÓN WEB (SOLO CONSEJO Y ADMIN) */}
          {esConsejo && (
            <>
              <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>GESTIÓN WEB</div>
              {modules.filter(m => {
                // Redes sociales actualmente exclusivas de JUFRA Pomalca
                if (m.id === 'Redes' && !isPomalca) return false;
                return ['Solicitudes', 'Redes', 'GaleriaWeb', 'QuienesSomos', 'WebConfig', 'Campanas', 'RegistrosMascotas', 'OfsConfig', 'OfsFraternidades', 'Fraternidades'].includes(m.id);
              }).map((mod) => (
                 <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
                  className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
                >
                  <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
                </a>
              ))}
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: user.rol === 'superadmin' ? '#d97706' : esConsejo ? '#b45309' : '#059669',
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
                {user.rol === 'superadmin' 
                  ? '👑 Super Admin Nacional' 
                  : esConsejo 
                    ? (user.cargo && user.cargo !== 'ninguno' ? `🛡️ ${user.cargo}` : '🛡️ Consejo')
                    : '🕊️ Hermano(a) JUFRA'}
              </span>
            </div>
          </div>
          <button className="btn btn-logout" onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </aside>
      <main className="dashboard-content">
        <div className="mobile-header">
          <div className="sidebar-brand" style={{ padding: 0, border: 'none', fontSize: '1.2rem' }}>
            {esConsejo ? 'JUFRA Admin' : 'JUFRA Fraternidad'}
          </div>
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>☰</button>
        </div>
        <header className="content-header flex-responsive" style={{ marginBottom: '1.25rem', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.85rem' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem' }}>
                <span style={{ color: '#78716c', fontWeight: 500 }}>
                  {esConsejo ? 'Gestión' : 'Fraternidad'}
                </span>
                <span style={{ color: '#a8a29e', margin: '0 2px' }}>/</span>
                <span style={{ color: '#1c1917', fontWeight: 700 }}>
                  {modules.find(m => m.id === activeTab)?.label || activeTab}
                </span>
              </div>
              <p style={{ color: '#78716c', fontSize: '0.78rem', margin: '2px 0 0 0', fontWeight: 400 }}>
                {activeFraternidad?.nombre 
                  ? `${activeFraternidad.nombre} (${activeFraternidad.departamento || activeFraternidad.zona || 'Local'})`
                  : (selectedFraternidadId === 'all-peru' ? 'Consolidado Nacional · Todo el Perú' : (user?.fraternidadNombre || 'JUFRA Pomalca'))} · {(() => {
                  const today = new Date();
                  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                  return today.toLocaleDateString('es-ES', options).replace(/^./, str => str.toUpperCase());
                })()}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, flexWrap: 'nowrap' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: '#78716c', pointerEvents: 'none' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                    height: '32px',
                    padding: '0 10px 0 30px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    backgroundColor: '#ffffff',
                    fontSize: '0.78rem',
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
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #e7e5e4',
                  backgroundColor: '#ffffff',
                  color: '#1c1917',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  boxSizing: 'border-box'
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
          {/* Vistas comunes: Hermanos y Consejo */}
          <Route path="/" element={<DashboardView user={user} formatSafeDate={formatSafeDate} setActiveTab={setActiveTab} ActivityIndicator={ActivityIndicator} />} />
          <Route path="hermanos" element={<HermanosView user={user} formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="anuncios" element={<AnunciosView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="eventos" element={<EventosView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="servicios" element={<ServiciosView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="peticiones" element={<PeticionesView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="formacion" element={<FormacionView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="documentos" element={<DocumentosView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="galeria" element={<GaleriaView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="cantos" element={<CantosView ActivityIndicator={ActivityIndicator} />} />
          <Route path="asistencia" element={<AsistenciaView user={user} formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="mapa" element={<MapaView ActivityIndicator={ActivityIndicator} setActiveTab={setActiveTab} />} />
          <Route path="chat" element={<MisMensajesView ActivityIndicator={ActivityIndicator} SafeImage={SafeImage} user={user} formatSafeDate={formatSafeDate} />} />
          <Route path="perfil" element={<PerfilView ActivityIndicator={ActivityIndicator} SafeImage={SafeImage} />} />
          <Route path="espiritu" element={<EspirituView />} />

          {/* Vistas exclusivas de Consejo y Administración */}
          <Route path="actas" element={esConsejo ? <ActasView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} /> : <Navigate to="/dashboard" />} />
          <Route path="finanzas" element={esConsejo ? <FinanzasView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} /> : <Navigate to="/dashboard" />} />
          <Route path="inventario" element={esAdmin ? <InventarioView ActivityIndicator={ActivityIndicator} formatSafeDate={formatSafeDate} /> : <Navigate to="/dashboard" />} />
          <Route path="solicitudes" element={esConsejo ? <SolicitudesView formatSafeDate={formatSafeDate} /> : <Navigate to="/dashboard" />} />
          <Route path="redes" element={esConsejo ? <RedesAdminView /> : <Navigate to="/dashboard" />} />
          <Route path="webconfig" element={esConsejo ? <WebConfigView /> : <Navigate to="/dashboard" />} />
          <Route path="campanas" element={esConsejo ? <CampaignsAdminView ActivityIndicator={ActivityIndicator} /> : <Navigate to="/dashboard" />} />
          <Route path="registrosmascotas" element={esConsejo ? <RegistrosMascotasAdminView /> : <Navigate to="/dashboard" />} />
          <Route path="ofsconfig" element={esConsejo ? <OfsConfigView /> : <Navigate to="/dashboard" />} />
          <Route path="ofsfraternidades" element={esConsejo ? <OfsFraternidadesAdminView ActivityIndicator={ActivityIndicator} /> : <Navigate to="/dashboard" />} />
          <Route path="fraternidades" element={esConsejo ? <FraternidadesAdminView /> : <Navigate to="/dashboard" />} />
          <Route path="consejo" element={esConsejo ? <Consejo /> : <Navigate to="/dashboard" />} />
          <Route path="comunicacion" element={esConsejo ? <ComunicacionView ActivityIndicator={ActivityIndicator} /> : <Navigate to="/dashboard" />} />
          <Route path="mensajes" element={esConsejo ? <MensajesAdminView ActivityIndicator={ActivityIndicator} formatSafeDate={formatSafeDate} /> : <Navigate to="/dashboard" />} />
          <Route path="asistente" element={esConsejo ? <AsistenteIAView /> : <Navigate to="/dashboard" />} />
          <Route path="galeriaweb" element={esConsejo ? <GaleriaWebAdminView /> : <Navigate to="/dashboard" />} />
          <Route path="quienessomos" element={esConsejo ? <QuienesSomosView /> : <Navigate to="/dashboard" />} />
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

  componentDidUpdate(prevProps) {
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <MantenimientoView 
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })} 
        />
      );
    }
    return this.props.children;
  }
}

const ErrorBoundaryWithLocation = ({ children }) => {
  const location = useLocation();
  return (
    <ErrorBoundary locationKey={location.pathname} key={location.pathname}>
      {children}
    </ErrorBoundary>
  );
};

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
      <ErrorBoundaryWithLocation>
        <Routes>
          {/* Cara Pública */}
          <Route path="/" element={<LandingView />} />
          <Route path="/mantenimiento" element={<MantenimientoView />} />
          <Route path="/campana" element={<CampaignView />} />
          <Route path="/familia" element={<OfsView />} />
          <Route path="/ofs" element={<TerceraOrdenView />} />
          <Route path="/ofs/chiclayo" element={<OfsChiclayoView />} />
          <Route path="/celebraciones" element={<CelebracionesView />} />
          <Route path="/jufra-peru" element={<JufraPeruView />} />
          <Route path="/jufra-peru/:slug" element={<FraternidadDetailView />} />
          <Route path="/f/:slug" element={<FraternidadDetailView />} />
          
          {/* Panel de Administración (Privado) */}
          <Route path="/admin" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={
            user ? (
              <FraternidadProvider user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </FraternidadProvider>
            ) : <Navigate to="/admin" replace />
          } />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {/* El Chatbot Flotante Premium */}
        <FloatingChat />
      </ErrorBoundaryWithLocation>
    </BrowserRouter>
  );
}

export default App;
