import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './config/api';
import ItemReadModal from './components/ItemReadModal';
import Consejo from './components/Consejo';
import AnunciosView from './components/views/AnunciosView';
import EventosView from './components/views/EventosView';
import ServiciosView from './components/views/ServiciosView';
import ActasView from './components/views/ActasView';import FormacionView from './components/views/FormacionView';
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
import WebConfigView from './components/views/WebConfigView';
import OfsConfigView from './components/views/OfsConfigView';
import MisMensajesView from './components/views/MisMensajesView';
import MensajesAdminView from './components/views/MensajesAdminView';
import AsistenteIAView from './components/views/AsistenteIAView';
import SolicitudesView from './components/views/SolicitudesView';
import FraternidadesAdminView from './components/views/FraternidadesAdminView';
import RedesAdminView from './components/views/RedesAdminView';
import GaleriaWebAdminView from './components/views/GaleriaWebAdminView';
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
  return <img src={src} style={{ ...style, objectFit: 'cover', display: 'block' }} onError={() => setError(true)} alt="Anuncio" />;
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


// Login Component (Premium Aesthetics)
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data.usuario.rol === 'admin' || data.usuario.rol === 'consejo') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        if (rememberMe) {
          localStorage.setItem('rememberedUser', username);
        }
        onLogin(data.usuario);
      } else {
        setError('Acceso denegado: Solo miembros del consejo.');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.message.includes('Network Error')) {
        setError('El servidor se está despertando (puede tomar hasta 1 min). Vuelve a intentar en unos segundos.');
      } else {
        setError('Credenciales inválidas o cuenta no aprobada.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card animate-fade">
        <div className="login-header">
          <h2>JUFRA Admin</h2>
          <p>Panel de Administración</p>
        </div>
        
        {error && <div className="error-message animate-fade">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Usuario (o Email)</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="ej: francisco@jufra.org"
                className="input-with-icon"
              />
            </div>
          </div>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Contraseña</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="input-with-icon"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '1rem 0' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={e => setRememberMe(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>Recordar sesión</label>
          </div>

          <button type="submit" className="btn btn-primary w-full">Ingresar al Panel</button>
        </form>
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
  { id: 'Galeria', label: 'Galería', icon: '🖼️' },
  { id: 'Mapa', label: 'Mapa', icon: '🗺️' },
  { id: 'Mensajes', label: 'Mensajes (Control)', icon: '🕵️' },
  { id: 'Chat', label: 'Mis Mensajes', icon: '💬' },
  { id: 'Cantos', label: 'Cancionero', icon: '🎵' },
  { id: 'Comunicacion', label: 'Comunicación', icon: '📢' },
  { id: 'Asistente', label: 'Asistente IA', icon: '🤖' },
  { id: 'Redes', label: 'Redes Sociales', icon: '📱' },
  { id: 'GaleriaWeb', label: 'Galería Web', icon: '🌐' },
  { id: 'WebConfig', label: 'Web Institucional', icon: '🌐' },
  { id: 'OfsConfig', label: 'Configuración OFS', icon: '☦️' },
  { id: 'Fraternidades', label: 'JUFRA Perú', icon: '🇵🇪' },
  { id: 'Perfil', label: 'Mi Perfil', icon: '👤' },
];

const Dashboard = ({ user, onLogout }) => {
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
    setData([]);
    setSearchTerm('');
    if (tabId === 'Dashboard') navigate('/dashboard');
    else navigate(`/dashboard/${tabId.toLowerCase()}`);
  };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [readItem, setReadItem] = useState(null);
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

  // Mover auxiliares aquí
  const getTipoIcon = (tipo) => {
    switch (tipo) {
        case 'urgente': return '🚨';
        case 'evento': return '📅';
        case 'formacion': return '📖';
        case 'apostolado': return '🙏';
        default: return '📢';
    }
  };

  const getActaColor = (tipo) => {
    switch (tipo) {
      case 'consejo': return '#0288D1';
      case 'fraternidad': return '#388E3C';
      case 'formacion': return '#F57C00';
      case 'extraordinaria': return '#D32F2F';
      default: return '#757575';
    }
  };



  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'Hermanos') endpoint = '/hermanos?todos=true';
      else if (activeTab === 'Anuncios') endpoint = '/anuncios';
      else if (activeTab === 'Eventos') endpoint = '/eventos?todos=true';
      else if (activeTab === 'Servicios') endpoint = '/servicios';
      else if (activeTab === 'Peticiones') endpoint = '/peticiones';
      else if (activeTab === 'Solicitudes') endpoint = '/solicitudes';
      else if (activeTab === 'Formacion') endpoint = '/formacion';
      else if (activeTab === 'Actas') endpoint = '/actas';
      else if (activeTab === 'Documentos') endpoint = '/documentos';
      else if (activeTab === 'Galeria') endpoint = '/galeria';
      else if (activeTab === 'Cantos') endpoint = '/cantos';
      else if (activeTab === 'Asistencia') {
        const [herRes] = await Promise.all([
          api.get('/hermanos?todos=true')
        ]);
        setData({
          asistencias: [],
          hermanos: herRes.data.hermanos || []
        });
        setLoading(false);
        return;
      }
      else if (activeTab === 'Consejo') endpoint = '/hermanos?todos=true';
      else if (activeTab === 'Espiritu') endpoint = '/espiritualidad';
      else if (activeTab === 'Mensajes') endpoint = '/mensajes/admin/todas';
      else if (activeTab === 'Perfil') endpoint = '/auth/perfil';
      else if (activeTab === 'Chat') endpoint = '/mensajes/conversaciones';
      else if (activeTab === 'Fraternidades') endpoint = '/fraternidades';
      else if (activeTab === 'GaleriaWeb') endpoint = '/galeria';
      else if (activeTab === 'Comunicacion') {
        const [herRes] = await Promise.all([
          api.get('/hermanos?todos=true')
        ]);
        setData({
          hermanos: herRes.data.hermanos || []
        });
        setLoading(false);
        return;
      }
      else if (activeTab === 'Dashboard') {
        const [hermanosRes, anunciosRes, eventosRes, asisRes] = await Promise.all([
          api.get('/hermanos?todos=true'),
          api.get('/anuncios'),
          api.get('/eventos?todos=true'),
          api.get('/asistencia')
        ]);
        setData({
          hermanos: hermanosRes.data.hermanos || [],
          anuncios: anunciosRes.data.anuncios || [],
          eventos: eventosRes.data.eventos || [],
          asistencias: asisRes.data.asistencias || []
        });
        setLoading(false);
        return;
      }
      else if (activeTab === 'Mapa') {
        const [eventosRes, anunciosRes, serviciosRes] = await Promise.all([
          api.get('/eventos'),
          api.get('/anuncios'),
          api.get('/servicios')
        ]);
        setData({
          eventos: eventosRes.data.eventos || [],
          anuncios: anunciosRes.data.anuncios || [],
          servicios: serviciosRes.data.servicios || []
        });
        setLoading(false);
        return;
      }

      if (endpoint) {
        const response = await api.get(endpoint);
        // Map the responses correctly based on typical properties
        const resData = response.data;
        setData(resData.usuario || resData.conversaciones || resData.items || resData.galeria || resData.asistencias || resData.hermanos || resData.anuncios || resData.eventos || resData.servicios || resData.peticiones || resData.solicitudes || resData.data || resData.temas || resData.actas || resData.documentos || resData.fotos || resData.cantos || (Array.isArray(resData) ? resData : []));
      } else {
        setData([]); // Modulo sin endpoint programado aún
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileData, setProfileData] = useState({});

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    try {
      // 1. Update basic info
      await api.put('/auth/perfil', profileData);
      
      // 2. Update photo if provided
      if (profileData.nuevaFotoFile) {
        const formData = new FormData();
        formData.append('foto', profileData.nuevaFotoFile);
        await api.post('/auth/foto', formData);
      }
      
      alert('Perfil actualizado con éxito ✅');
      setIsProfileEditing(false);
      fetchData();
    } catch (err) {
      alert('Error al actualizar perfil: ' + (err.response?.data?.message || err.message));
    }
  };

  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [showSearchChat, setShowSearchChat] = useState(false);


  const openChatPersonal = async (user2) => {
    setActiveChat(user2);
    setChatLoading(true);
    try {
      const response = await api.get(`/mensajes/chat/${user2._id}`);
      if (response.data.success) {
        setChatMessages(response.data.mensajes);
      }
    } catch (error) {
       console.error("Error al cargar chat personal", error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!nuevoMensaje.trim() || !activeChat) return;

    try {
      const resp = await api.post('/mensajes/enviar', { destinatarioId: activeChat._id, contenido: nuevoMensaje });
      if (resp.data.success) {
        setChatMessages([...chatMessages, resp.data.mensaje]);
        setNuevoMensaje("");
      }
    } catch (error) {
       alert("Error al enviar mensaje");
    }
  };

  const openChatAdmin = async (conv) => {
    setReadItem({ ...conv, type: 'chat' });
    setChatLoading(true);
    try {
      const response = await api.get(`/mensajes/admin/chat/${conv.usuario1._id}/${conv.usuario2._id}`);
      if (response.data.success) {
        setChatMessages(response.data.mensajes);
      }
    } catch (error) {
       console.error("Error al cargar chat", error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/hermanos/${id}`, { activo: true });
      fetchData();
    } catch (error) {
      alert(`Error al aprobar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id, moduloRuta) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/${moduloRuta}/${id}`);
        fetchData();
      } catch (err) {
        alert(`Error al intentar eliminar: ${err.message}`);
      }
    }
  };

  const handleOrar = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/peticiones/${id}/orar`);
      fetchData();
    } catch (error) {
      console.error('Error al registrar oración:', error);
    }
  };

  const handleParticipar = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const { data } = await api.put(`/servicios/${id}/participar`);
      alert(data.message);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al procesar inscripción');
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
          {modules.filter(m => ['Documentos', 'Actas', 'Formacion', 'Galeria', 'Servicios', 'Comunicacion', 'Asistente', 'Mensajes', 'Perfil'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}

          {/* GRUPO: GESTIÓN WEB */}
          <div className="nav-section-title" style={{ marginTop: '1.5rem' }}>GESTIÓN WEB</div>
          {modules.filter(m => ['Solicitudes', 'Redes', 'GaleriaWeb', 'WebConfig', 'OfsConfig', 'Fraternidades'].includes(m.id)).map((mod) => (
             <a key={mod.id} href="#" onClick={(e) => { e.preventDefault(); setActiveTab(mod.id); setIsSidebarOpen(false); }}
              className={`nav-link ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{mod.icon}</span> {mod.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="user-name">{user.nombre} {user.apellido}</p>
          <button className="btn btn-logout" onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </aside>
      <main className="dashboard-content">
        <div className="mobile-header">
          <div className="sidebar-brand" style={{ padding: 0, border: 'none', fontSize: '1.2rem' }}>JUFRA Admin</div>
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>☰</button>
        </div>
        <header className="content-header flex-responsive" style={{ marginBottom: '1.5rem', gap: '2rem' }}>
            <div style={{ flexShrink: 0 }}>
              <h1 style={{ marginBottom: '0.4rem' }}>Gestión de {activeTab}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {(() => {
                  const today = new Date();
                  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                  return today.toLocaleDateString('es-ES', options).replace(/^./, str => str.toUpperCase());
                })()}
              </p>
            </div>
          <div className="flex-responsive" style={{ gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder={`Buscar en ${activeTab}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', paddingLeft: '35px', paddingRight: '1rem' }}
                />
              </div>
          </div>
        </header>

        
        <div className="mt-4">
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
          <Route path="galeria" element={<GaleriaView formatSafeDate={formatSafeDate} SafeImage={SafeImage} ActivityIndicator={ActivityIndicator} />} />
          <Route path="cantos" element={<CantosView ActivityIndicator={ActivityIndicator} />} />
          <Route path="asistencia" element={<AsistenciaView formatSafeDate={formatSafeDate} ActivityIndicator={ActivityIndicator} />} />
          <Route path="solicitudes" element={<SolicitudesView formatSafeDate={formatSafeDate} />} />
          <Route path="mapa" element={<MapaView ActivityIndicator={ActivityIndicator} setActiveTab={setActiveTab} />} />
          <Route path="chat" element={
            <MisMensajesView 
              openChatPersonal={openChatPersonal}
              SafeImage={SafeImage}
              activeChat={activeChat}
              user={user}
              formatSafeDate={formatSafeDate}
              chatLoading={chatLoading}
              chatMessages={chatMessages}
              handleSendChat={handleSendChat}
              nuevoMensaje={nuevoMensaje}
              setNuevoMensaje={setNuevoMensaje}
            />
          } />
          <Route path="perfil" element={<PerfilView ActivityIndicator={ActivityIndicator} SafeImage={SafeImage} />} />
          <Route path="redes" element={<RedesAdminView loading={loading} fetchData={fetchData} />} />
          <Route path="webconfig" element={<WebConfigView loading={loading} setLoading={setLoading} />} />
          <Route path="ofsconfig" element={<OfsConfigView loading={loading} setLoading={setLoading} />} />
          <Route path="fraternidades" element={<FraternidadesAdminView fraternidades={data || []} loading={loading} fetchData={fetchData} />} />
          <Route path="consejo" element={<Consejo miembrosData={data || []} />} />
          <Route path="comunicacion" element={<ComunicacionView loading={loading} setLoading={setLoading} hermanos={data?.hermanos || []} />} />
          <Route path="mensajes" element={<MensajesAdminView loading={loading} ActivityIndicator={ActivityIndicator} data={data} openChatAdmin={openChatAdmin} formatSafeDate={formatSafeDate} />} />
          <Route path="espiritu" element={<EspirituView />} />
          <Route path="asistente" element={<AsistenteIAView />} />
          <Route path="galeriaweb" element={<GaleriaWebAdminView data={data} loading={loading} fetchData={fetchData} />} />
        </Routes>
        </div>

        {/* Read Item Modal */}
        <ItemReadModal 
          readItem={readItem}
          setReadItem={setReadItem}
          activeTab={activeTab}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          chatLoading={chatLoading}
          formatSafeDate={formatSafeDate}
          getTipoIcon={getTipoIcon}
          SafeImage={SafeImage}
          ActivityIndicator={ActivityIndicator}
        />

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
          <Route path="/familia-ofs" element={<OfsView />} />
          
          {/* Panel de Administración (Privado) */}
          <Route path="/admin" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard/*" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/admin" />} />
          
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
