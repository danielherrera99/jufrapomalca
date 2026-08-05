import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';

const AsistenciaView = () => {
  const [data, setData] = useState([]);
  const [hermanos, setHermanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedArchivos, setExpandedArchivos] = useState({});
  const [selectedAsistenciaDate, setSelectedAsistenciaDate] = useState('');

  // Estados para exportación
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDates, setExportDates] = useState({ start: '', end: '' });

  // Estados para toma de asistencia masiva
  const [showBulkAsistencia, setShowBulkAsistencia] = useState(false);
  const [bulkList, setBulkList] = useState([]);
  const [bulkGuests, setBulkGuests] = useState([]);
  const [bulkGuestName, setBulkGuestName] = useState("");
  const [bulkConfig, setBulkConfig] = useState({ fecha: new Date().toISOString().split('T')[0], tipoReunion: 'semanal' });

  const toggleArchivo = (key) => {
    setExpandedArchivos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [asisRes, herRes] = await Promise.all([
        api.get('/asistencia'),
        api.get('/hermanos?todos=true')
      ]);
      const resData = asisRes.data;
      setData(resData.asistencia || (Array.isArray(resData) ? resData : []));
      setHermanos(herRes.data.hermanos || []);
    } catch (err) {
      console.error('Error fetching asistencia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedAsistencias = useMemo(() => {
    if (!Array.isArray(data)) return {};
    return data.reduce((acc, item) => {
      if (!item || !item.fecha) return acc;
      const rawDate = new Date(item.fecha);
      if (isNaN(rawDate.getTime())) return acc;
      
      const year = rawDate.getFullYear().toString();
      const month = rawDate.toLocaleDateString('es-ES', { month: 'long' });
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
      const dateStr = rawDate.toLocaleDateString('es-ES');
      
      if (!acc[year]) acc[year] = {};
      if (!acc[year][monthCapitalized]) acc[year][monthCapitalized] = {};
      if (!acc[year][monthCapitalized][dateStr]) acc[year][monthCapitalized][dateStr] = [];
      
      acc[year][monthCapitalized][dateStr].push(item);
      return acc;
    }, {});
  }, [data]);

    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Cargando asistencias...</p>
        </div>
      );
    }

    const handleSaveBulkAsistencia = async () => {
      try {
        const payload = {
          fecha: bulkConfig.fecha,
          tipoReunion: bulkConfig.tipoReunion,
          asistencias: [
            ...bulkList.map(item => ({
              usuarioId: item._id,
              estado: item.estado || 'falta'
            })),
            ...bulkGuests.map(name => ({
              nombreInvitado: name,
              estado: 'presente'
            }))
          ]
        };
        await api.post('/asistencia/lote', payload);
        alert('Asistencia registrada correctamente ✅');
        setShowBulkAsistencia(false);
        setBulkGuests([]);
        fetchData();
      } catch (err) {
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    };

    const handleExportAsistencia = async (e) => {
      e.preventDefault();
      try {
        const queryParams = new URLSearchParams();
        if (exportDates.start) queryParams.append('start', exportDates.start);
        if (exportDates.end) queryParams.append('end', exportDates.end);
        
        const response = await api.get(`/asistencia/export?${queryParams.toString()}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `asistencias_reporte_${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setIsExportModalOpen(false);
      } catch (err) {
        alert('Error al exportar asistencias. Asegúrate de que hay datos en el rango seleccionado.');
      }
    };

  if (!groupedAsistencias || Object.keys(groupedAsistencias).length === 0) {
    return (
      <div className="glass-card animate-fade">
        <p style={{ color: "var(--text-muted)" }}>No se encontraron asistencias registradas.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="flex-responsive" style={{ gap: '1rem', marginBottom: '1rem' }}>
        <button 
          className="btn zoom-hover" 
          style={{ background: '#1D6F42', color: 'white', border: 'none', fontWeight: 'bold' }} 
          onClick={() => setIsExportModalOpen(true)}
        >
          📊 <span className="desktop-only">Descargar Excel</span>
        </button>
        <button 
          onClick={() => {
            const hActivos = hermanos.filter(h => h.activo);
            setBulkList(hActivos.map(h => ({ ...h, estado: 'falta' })));
            setShowBulkAsistencia(true);
          }}
          className="btn btn-primary zoom-hover" 
          style={{ background: 'var(--primary)', boxShadow: '0 4px 15px rgba(139, 90, 43, 0.4)', fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          📝 Tomar Asistencia
        </button>
      </div>
      
      {!groupedAsistencias || Object.keys(groupedAsistencias).length === 0 ? (
        <div className="glass-card animate-fade">
          <p style={{ color: "var(--text-muted)" }}>No se encontraron asistencias registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
          {/* Izquierda: Menú de Archivos */}
          <div className="glass-card" style={{ flex: '0 0 280px', padding: '1rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}>
              <span>📁</span> Archivo
            </h3>
        
        {Object.keys(groupedAsistencias).sort((a, b) => b - a).map(year => {
          const isYearExpanded = expandedArchivos[year] !== false;
          return (
            <div key={year} style={{ marginBottom: '0.5rem' }}>
              <div 
                onClick={() => toggleArchivo(year)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--surface)', borderRadius: '6px', fontWeight: 'bold', color: 'var(--text-main)', border: '1px solid var(--border)' }}
              >
                <span>📅 {year}</span>
                <span style={{ fontSize: '0.7rem' }}>{isYearExpanded ? '▼' : '▶'}</span>
              </div>
              
              {isYearExpanded && (
                <div style={{ paddingLeft: '0.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.keys(groupedAsistencias[year] || {}).sort((a,b) => {
                    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                    return months.indexOf(b) - months.indexOf(a);
                  }).map(monthStr => {
                    const monthKey = `${year}-${monthStr}`;
                    const isMonthExpanded = expandedArchivos[monthKey];

                    return (
                      <div key={monthStr}>
                        <div 
                          onClick={() => toggleArchivo(monthKey)}
                          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '0.6rem' }}>{isMonthExpanded ? '▼' : '▶'}</span>
                            {monthStr}
                          </span>
                        </div>
                        
                        {isMonthExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', borderLeft: '2px solid var(--border)', marginLeft: '0.5rem', paddingLeft: '0.5rem', marginTop: '0.3rem' }}>
                            {Object.keys(groupedAsistencias[year][monthStr] || {}).sort((a,b) => {
                              try {
                                const timeA = new Date(a.split('/').reverse().join('-')).getTime();
                                const timeB = new Date(b.split('/').reverse().join('-')).getTime();
                                return timeB - timeA;
                              } catch(e) { return 0; }
                            }).map(dateStr => (
                              <button 
                                key={dateStr}
                                onClick={() => setSelectedAsistenciaDate({ year, month: monthStr, date: dateStr })}
                                style={{
                                  textAlign: 'left', padding: '0.5rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                  background: selectedAsistenciaDate?.date === dateStr ? 'var(--primary)' : 'var(--surface)',
                                  color: selectedAsistenciaDate?.date === dateStr ? 'white' : 'var(--text-main)',
                                  transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <span>{dateStr.slice(0, 5)}</span>
                                <span style={{ fontSize: '0.75rem', background: selectedAsistenciaDate?.date === dateStr ? 'rgba(255,255,255,0.3)' : 'var(--border)', padding: '2px 6px', borderRadius: '12px' }}>
                                  {groupedAsistencias[year][monthStr][dateStr]?.length || 0}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Derecha: Resultados */}
      <div style={{ flex: '1', width: '100%' }}>
        {!selectedAsistenciaDate ? (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', border: '2px dashed var(--border)' }}>
            <span style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '1rem' }}>👈</span>
            <h2 style={{ color: 'var(--text-muted)' }}>Selecciona una reunión del archivo</h2>
          </div>
        ) : (
          <div className="animate-fade glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 Lista del {selectedAsistenciaDate.date}
              </h2>
              <div style={{ background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
                  {groupedAsistencias[selectedAsistenciaDate.year]?.[selectedAsistenciaDate.month]?.[selectedAsistenciaDate.date]?.length || 0}
                </strong>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {(groupedAsistencias[selectedAsistenciaDate.year]?.[selectedAsistenciaDate.month]?.[selectedAsistenciaDate.date] || []).map((item, index) => (
                <div key={item._id || index} style={{ 
                  background: 'var(--surface)', 
                  padding: '0.6rem 0.8rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)', 
                  borderLeft: `4px solid ${
                    item.estado === 'falta' ? '#F44336' : 
                    item.estado === 'permiso' ? '#F59E0B' : 
                    item.estado === 'tardanza' ? '#6366F1' : 
                    '#10B981'
                  }`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.3rem' 
                }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : (item.nombreInvitado ? `👤 ${item.nombreInvitado}` : 'Usuario Desconocido')}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: item.estado === 'falta' ? '#F44336' : 
                             item.estado === 'permiso' ? '#F59E0B' : 
                             item.estado === 'tardanza' ? '#6366F1' : 
                             '#10B981'
                    }}>
                      {(item.estado || 'Presente').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      )}

      {/* Bulk Asistencia Modal */}
      {showBulkAsistencia && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h2>Toma Rápida de Asistencia</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
               <div className="input-group" style={{ flex: 1 }}>
                  <label>Fecha de Reunión</label>
                  <input type="date" value={bulkConfig.fecha} onChange={e => setBulkConfig({...bulkConfig, fecha: e.target.value})} />
               </div>
               <div className="input-group" style={{ flex: 1 }}>
                  <label>Tipo de Reunión</label>
                  <select value={bulkConfig.tipoReunion} onChange={e => setBulkConfig({...bulkConfig, tipoReunion: e.target.value})}>
                     <option value="semanal">Semanal Regular</option>
                     <option value="formacion">Formación</option>
                     <option value="apostolado">Apostolado / Servicio</option>
                     <option value="consejo">Reunión de Consejo</option>
                     <option value="retiro">Retiro / Convivencia</option>
                     <option value="extraordinaria">Extraordinaria</option>
                  </select>
               </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', background: 'var(--background)' }}>
               <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Hermanos (Marcado Rápido)</h3>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {bulkList.map((item, idx) => (
                     <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px', borderLeft: `4px solid ${item.estado === 'presente' ? '#4CAF50' : item.estado === 'tardanza' ? '#FF9800' : item.estado === 'permiso' ? '#2196F3' : '#F44336'}` }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.nombreCompleto}</span>
                        <select 
                           value={item.estado || 'falta'}
                           onChange={e => {
                              const newBulk = [...bulkList];
                              newBulk[idx].estado = e.target.value;
                              setBulkList(newBulk);
                           }}
                           style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        >
                           <option value="presente">✅ Presente</option>
                           <option value="tardanza">⏰ Tardanza</option>
                           <option value="permiso">🙏 Permiso</option>
                           <option value="falta">❌ Falta</option>
                        </select>
                     </div>
                  ))}
               </div>

               <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Invitados Especiales</h3>
               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input type="text" value={bulkGuestName} onChange={e => setBulkGuestName(e.target.value)} placeholder="Nombre del invitado..." style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <button type="button" className="btn btn-primary" onClick={() => { if(bulkGuestName.trim()){ setBulkGuests([...bulkGuests, bulkGuestName.trim()]); setBulkGuestName(''); } }}>Añadir</button>
               </div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {bulkGuests.map((g, i) => (
                     <div key={i} style={{ background: '#E8F5E9', color: '#2E7D32', padding: '0.4rem 0.8rem', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        👤 {g} <button type="button" onClick={() => setBulkGuests(bulkGuests.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', color: '#C62828', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                     </div>
                  ))}
               </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button onClick={() => setShowBulkAsistencia(false)} className="btn" style={{ background: 'var(--border)' }}>Cancelar</button>
               <button onClick={handleSaveBulkAsistencia} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>💾 Guardar Lista Final</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <h2>Configuración de Reporte (Excel)</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Selecciona las fechas. Si dejas los campos vacíos, Descargarás <b>todo el historial completo</b> de la base de datos.
            </p>
            <form onSubmit={handleExportAsistencia}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Desde (Fecha Inicial)</label>
                  <input type="date" value={exportDates.start} onChange={e => setExportDates({...exportDates, start: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Hasta (Fecha Final)</label>
                  <input type="date" value={exportDates.end} onChange={e => setExportDates({...exportDates, end: e.target.value})} />
                </div>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-logout" style={{ width: 'auto'}} onClick={() => setIsExportModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn" style={{ background: '#1D6F42', color: 'white', border: 'none' }}>Generar y Descargar 📊</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AsistenciaView;
