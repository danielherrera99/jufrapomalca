import React, { useState, useMemo } from 'react';
import api from '../../config/api';

const SolicitudesView = ({ data, loading, fetchData }) => {
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todas');
  const [localSearch, setLocalSearch] = useState('');

  const rawSolicitudes = data.solicitudes || [];

  // Calcular KPIs en base a todos los datos sin filtrar
  const stats = useMemo(() => {
    return {
      total: rawSolicitudes.length,
      pendiente: rawSolicitudes.filter(s => s.estado === 'pendiente').length,
      contactado: rawSolicitudes.filter(s => s.estado === 'contactado').length,
      descartado: rawSolicitudes.filter(s => s.estado === 'descartado').length,
    };
  }, [rawSolicitudes]);

  // Filtrar solicitudes locales por estado y búsqueda
  const displayedSolicitudes = useMemo(() => {
    return rawSolicitudes.filter(s => {
      // 1. Filtro de estado
      if (statusFilter !== 'todas' && s.estado !== statusFilter) {
        return false;
      }
      // 2. Filtro de búsqueda por texto
      if (localSearch.trim() !== '') {
        const query = localSearch.toLowerCase().trim();
        const nombreMatch = s.nombre ? s.nombre.toLowerCase().includes(query) : false;
        const telefonoMatch = s.telefono ? s.telefono.toLowerCase().includes(query) : false;
        const edadMatch = s.edad ? String(s.edad).includes(query) : false;
        const mensajeMatch = s.mensaje ? s.mensaje.toLowerCase().includes(query) : false;
        return nombreMatch || telefonoMatch || edadMatch || mensajeMatch;
      }
      return true;
    });
  }, [rawSolicitudes, statusFilter, localSearch]);

  const handleEstadoChange = async (id, nuevoEstado) => {
    setUpdating(true);
    try {
      await api.put(`/solicitudes/${id}`, { estado: nuevoEstado });
      fetchData();
    } catch (error) {
      alert('Error al actualizar el estado de la solicitud.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás totalmente seguro de que deseas eliminar permanentemente esta solicitud de la base de datos?')) return;
    
    setUpdating(true);
    try {
      await api.delete(`/solicitudes/${id}`);
      fetchData();
    } catch (error) {
      alert('Error al eliminar la solicitud.');
    } finally {
      setUpdating(false);
    }
  };

  // Limpiar y formatear número de teléfono para WhatsApp
  const getWhatsAppLink = (solicitud) => {
    const cleanNumber = solicitud.telefono.replace(/\D/g, ''); // Deja solo dígitos
    // Si tiene 9 dígitos (celular estándar peruano), asumimos código de país +51
    const finalNumber = cleanNumber.length === 9 ? `51${cleanNumber}` : cleanNumber;
    
    const message = `¡Hola ${solicitud.nombre}! Te saludamos de la Juventud Franciscana (JUFRA) Pomalca. 🕊️ Recibimos tu registro de interés en nuestra web y nos alegra mucho. ¿Cómo estás?`;
    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`;
  };

  // Exportar solicitudes filtradas a Excel estilizado
  const handleExportExcel = () => {
    try {
      if (displayedSolicitudes.length === 0) {
        alert("No hay registros en la lista actual para exportar.");
        return;
      }

      const excelStyle = `
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          th { background-color: #8B4513; color: #FFFFFF; font-weight: bold; padding: 10px; border: 1px solid #70360F; text-align: center; }
          td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
          tr:nth-child(even) { background-color: #F9FAFB; }
          .pendiente { color: #E65100; font-weight: bold; }
          .contactado { color: #2E7D32; font-weight: bold; }
          .descartado { color: #C62828; font-weight: bold; }
        </style>
      `;

      const header = `
        <tr>
          <th>FECHA DE REGISTRO</th>
          <th>NOMBRE COMPLETO</th>
          <th>EDAD</th>
          <th>TELÉFONO</th>
          <th>MENSAJE</th>
          <th>ESTADO</th>
        </tr>
      `;

      const rows = displayedSolicitudes.map(s => {
        const fechaStr = new Date(s.createdAt).toLocaleDateString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const estadoLabel = s.estado === 'pendiente' ? 'Pendiente' : s.estado === 'contactado' ? 'Contactado' : 'Descartado';
        return `
          <tr>
            <td>${fechaStr}</td>
            <td>${s.nombre}</td>
            <td>${s.edad}</td>
            <td>'${s.telefono}</td>
            <td>${s.mensaje || ''}</td>
            <td class="${s.estado}">${estadoLabel}</td>
          </tr>
        `;
      }).join("");

      const template = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          ${excelStyle}
        </head>
        <body>
          <h2>Reporte de Solicitudes Web - JUFRA Pomalca</h2>
          <p>Filtro aplicado: <strong>${statusFilter.toUpperCase()}</strong></p>
          <p>Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
          <table>
            <thead>${header}</thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Solicitudes_${statusFilter}_${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error al generar el reporte de solicitudes.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="spinner" style={{ marginBottom: '1rem' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando solicitudes de prospectos...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* 1. KPIs Section */}
      <div className="responsive-grid" style={{ '--grid-min': '180px', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* KPI Total */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid var(--primary)', cursor: 'pointer' }} onClick={() => setStatusFilter('todas')}>
          <span style={{ fontSize: '1.8rem' }}>📝</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.total}</span>
        </div>
        {/* KPI Pendientes */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #FF9800', cursor: 'pointer' }} onClick={() => setStatusFilter('pendiente')}>
          <span style={{ fontSize: '1.8rem' }}>⏳</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Pendientes</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#E65100' }}>{stats.pendiente}</span>
        </div>
        {/* KPI Contactados */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #4CAF50', cursor: 'pointer' }} onClick={() => setStatusFilter('contactado')}>
          <span style={{ fontSize: '1.8rem' }}>✓</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Contactados</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2E7D32' }}>{stats.contactado}</span>
        </div>
        {/* KPI Descartados */}
        <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '4px solid #F44336', cursor: 'pointer' }} onClick={() => setStatusFilter('descartado')}>
          <span style={{ fontSize: '1.8rem' }}>🗑️</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Descartados</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#C62828' }}>{stats.descartado}</span>
        </div>
      </div>

      {/* 2. Toolbar & Filters */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Tabs selector */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '12px', padding: '4px', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'todas', label: 'Todas', count: stats.total },
              { id: 'pendiente', label: '⏳ Pendientes', count: stats.pendiente },
              { id: 'contactado', label: '✓ Contactados', count: stats.contactado },
              { id: 'descartado', label: '🗑️ Descartados', count: stats.descartado },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === tab.id ? 'var(--primary)' : 'transparent',
                  color: statusFilter === tab.id ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            className="btn zoom-hover btn-primary"
            onClick={handleExportExcel}
            style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', border: 'none' }}
          >
            📊 Exportar a Excel
          </button>
        </div>

        {/* Local Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o edad en esta lista..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              paddingLeft: '45px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Cards Grid */}
      {displayedSolicitudes.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>📝</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No hay solicitudes encontradas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Ninguna solicitud coincide con los filtros aplicados en este momento.</p>
        </div>
      ) : (
        <div className="responsive-grid" style={{ '--grid-min': '320px', gap: '1.5rem' }}>
          {displayedSolicitudes.map(solicitud => (
            <div 
              key={solicitud._id} 
              className="glass-card zoom-hover animate-fade" 
              style={{ 
                position: 'relative', 
                padding: '1.5rem', 
                borderTop: `4px solid ${
                  solicitud.estado === 'contactado' ? '#4CAF50' : 
                  solicitud.estado === 'descartado' ? '#F44336' : '#FF9800'
                }`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px'
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {solicitud.nombre}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      📝 {new Date(solicitud.createdAt).toLocaleDateString('es-ES', { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: 
                      solicitud.estado === 'contactado' ? '#E8F5E9' : 
                      solicitud.estado === 'descartado' ? '#FFEBEE' : '#FFF3E0',
                    color: 
                      solicitud.estado === 'contactado' ? '#2E7D32' : 
                      solicitud.estado === 'descartado' ? '#C62828' : '#E65100'
                  }}>
                    {solicitud.estado === 'contactado' ? '✓ Contactado' : 
                     solicitud.estado === 'descartado' ? '🗑️ Descartado' : '⏳ Pendiente'}
                  </span>
                </div>
                
                {/* Prospect Details */}
                <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Edad:</strong> {solicitud.edad} años
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Teléfono:</strong> <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-main)', letterSpacing: '0.5px' }}>{solicitud.telefono}</span>
                  </p>
                  {solicitud.mensaje && (
                    <p style={{ margin: 0, padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      "{solicitud.mensaje}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Main WhatsApp integration */}
                <a 
                  href={getWhatsAppLink(solicitud)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn zoom-hover"
                  style={{ 
                    backgroundColor: '#25D366', 
                    color: 'white', 
                    textDecoration: 'none', 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold', 
                    padding: '0.55rem', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>💬</span> Contactar WhatsApp
                </a>

                {/* Status Switcher & Delete Row */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  
                  {/* Selector de estado */}
                  <select
                    value={solicitud.estado}
                    disabled={updating}
                    onChange={(e) => handleEstadoChange(solicitud._id, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      border: '1px solid var(--border)',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      height: '35px'
                    }}
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="contactado">✓ Contactado</option>
                    <option value="descartado">🗑️ Descartado</option>
                  </select>

                  {/* Botón de eliminación definitiva */}
                  <button 
                    className="btn zoom-hover" 
                    onClick={() => handleDelete(solicitud._id)}
                    disabled={updating}
                    title="Eliminar registro"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                      color: 'var(--danger)', 
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '0.5rem', 
                      height: '35px',
                      width: '35px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    🗑️
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudesView;
