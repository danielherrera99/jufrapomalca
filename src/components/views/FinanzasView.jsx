import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import Swal from 'sweetalert2';
import './FinanzasView.css';

const CATEGORIAS_CONFIG = {
  diezmo: { label: 'Diezmo / Aporte', icon: '🤝' },
  donacion: { label: 'Donación', icon: '🎁' },
  actividad: { label: 'Actividad Pro-fondos', icon: '🎪' },
  compras: { label: 'Compras', icon: '🛒' },
  servicios: { label: 'Servicios', icon: '💡' },
  otros: { label: 'Otros', icon: '📌' }
};

const FinanzasView = ({ formatSafeDate, ActivityIndicator }) => {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({ ingresosTotales: 0, egresosTotales: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos'); // 'todos' | 'ingreso' | 'egreso'
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ tipo: 'ingreso', monto: '', fecha: '', descripcion: '', categoria: 'otros', comprobante_url: '' });
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finanzas');
      const resData = response.data;
      setData(resData.data || []);
      setResumen(resData.resumen || { ingresosTotales: 0, egresosTotales: 0, saldo: 0 });
    } catch (err) {
      console.error('Error fetching finanzas:', err);
      Swal.fire('Error', 'No se pudieron cargar los registros de finanzas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Contadores para pestañas rápidas
  const counts = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return {
      total: list.length,
      ingresos: list.filter(i => i.tipo === 'ingreso').length,
      egresos: list.filter(i => i.tipo === 'egreso').length,
    };
  }, [data]);

  // Filtrado reactivo
  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? data : [];

    // Filtro por Tipo
    if (typeFilter !== 'todos') {
      list = list.filter(item => item.tipo === typeFilter);
    }

    // Filtro por Categoría
    if (categoryFilter !== 'todas') {
      list = list.filter(item => item.categoria === categoryFilter);
    }

    // Filtro por Búsqueda de texto
    if (searchTerm.trim()) {
      const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
      const term = normalize(searchTerm).trim();

      list = list.filter(item => {
        if (!item) return false;
        const nombreResp = item.registradoPor?.nombreCompleto || '';
        const haystack = normalize(`${item.descripcion || ''} ${item.categoria || ''} ${item.tipo || ''} ${item.monto || ''} ${nombreResp}`);
        return haystack.includes(term);
      });
    }

    return list;
  }, [data, typeFilter, categoryFilter, searchTerm]);

  // Reiniciar a página 1 al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, categoryFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.monto || parseFloat(newItem.monto) <= 0) {
      Swal.fire('Atención', 'Por favor ingresa un monto válido mayor a 0', 'warning');
      return;
    }
    try {
      await api.post('/finanzas', newItem);
      setIsModalOpen(false);
      setNewItem({ tipo: 'ingreso', monto: '', fecha: '', descripcion: '', categoria: 'otros', comprobante_url: '' });
      Swal.fire({
        icon: 'success',
        title: 'Transacción Registrada',
        text: 'El registro financiero se guardó correctamente.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al registrar la transacción', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem.monto || parseFloat(selectedItem.monto) <= 0) {
      Swal.fire('Atención', 'Por favor ingresa un monto válido mayor a 0', 'warning');
      return;
    }
    try {
      await api.put(`/finanzas/${selectedItem._id}`, selectedItem);
      setIsEditModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Transacción Actualizada',
        text: 'Los cambios fueron guardados exitosamente.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al actualizar la transacción', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta transacción se eliminará de forma permanente y el saldo en caja se recalculará.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/finanzas/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La transacción fue eliminada con éxito.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error');
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem({
      ...item,
      fecha: item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/finanzas/exportar/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Finanzas_JUFRA_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      Swal.fire({
        icon: 'success',
        title: 'Excel Descargado',
        text: 'Reporte generado correctamente.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo exportar a Excel: ' + error.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="finanzas-container animate-fade">
      {/* 1. TARJETAS DE MÉTRICAS / RESUMEN */}
      <div className="finanzas-metrics-grid">
        <div className="finanzas-metric-card ingresos">
          <div className="finanzas-metric-icon-wrap">📈</div>
          <div className="finanzas-metric-info">
            <span className="finanzas-metric-label">Ingresos Totales</span>
            <span className="finanzas-metric-amount">
              S/ {Number(resumen.ingresosTotales || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="finanzas-metric-badge">↗ Recaudación Acumulada</span>
          </div>
        </div>

        <div className="finanzas-metric-card egresos">
          <div className="finanzas-metric-icon-wrap">📉</div>
          <div className="finanzas-metric-info">
            <span className="finanzas-metric-label">Egresos Totales</span>
            <span className="finanzas-metric-amount">
              S/ {Number(resumen.egresosTotales || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="finanzas-metric-badge">↘ Gastos e Inversiones</span>
          </div>
        </div>

        <div className="finanzas-metric-card saldo">
          <div className="finanzas-metric-icon-wrap">💰</div>
          <div className="finanzas-metric-info">
            <span className="finanzas-metric-label">Saldo en Caja</span>
            <span className="finanzas-metric-amount">
              S/ {Number(resumen.saldo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="finanzas-metric-badge">
              {resumen.saldo >= 0 ? '✓ Balance Positivo' : '⚠ Balance en Déficit'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROL: BÚSQUEDA, FILTROS Y ACCIONES */}
      <div className="finanzas-toolbar">
        <div className="finanzas-filters-group">
          {/* Input de Búsqueda */}
          <div className="finanzas-search-box">
            <span className="finanzas-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por descripción, monto, encargado..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="finanzas-search-clear" onClick={() => setSearchTerm('')} title="Limpiar búsqueda">✕</button>
            )}
          </div>

          {/* Filtro Rápido Tipo (Todos / Ingresos / Egresos) */}
          <div className="finanzas-type-pills">
            <button 
              className={`finanzas-type-pill ${typeFilter === 'todos' ? 'active' : ''}`}
              onClick={() => setTypeFilter('todos')}
            >
              Todos <span className="finanzas-pill-count">{counts.total}</span>
            </button>
            <button 
              className={`finanzas-type-pill ${typeFilter === 'ingreso' ? 'active ingreso' : ''}`}
              onClick={() => setTypeFilter('ingreso')}
            >
              Ingresos <span className="finanzas-pill-count">{counts.ingresos}</span>
            </button>
            <button 
              className={`finanzas-type-pill ${typeFilter === 'egreso' ? 'active egreso' : ''}`}
              onClick={() => setTypeFilter('egreso')}
            >
              Egresos <span className="finanzas-pill-count">{counts.egresos}</span>
            </button>
          </div>

          {/* Filtro por Categoría */}
          <select 
            className="finanzas-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {Object.entries(CATEGORIAS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="finanzas-actions-group">
          <button 
            className="finanzas-btn-export" 
            onClick={handleExport}
            disabled={exporting}
            title="Exportar registros a archivo Excel"
          >
            {exporting ? '⏳ Generando...' : '📊 Exportar Excel'}
          </button>
          <button 
            className="finanzas-btn-create" 
            onClick={() => {
              setNewItem({ 
                tipo: 'ingreso', 
                monto: '', 
                fecha: new Date().toISOString().split('T')[0], 
                descripcion: '', 
                categoria: 'otros', 
                comprobante_url: '' 
              });
              setIsModalOpen(true);
            }}
          >
            + Nuevo Registro
          </button>
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL ORDENADA Y ESPACIOSA */}
      <div className="finanzas-table-card">
        {loading ? (
          <div className="finanzas-empty-state">
            <ActivityIndicator />
            <p style={{ marginTop: '1rem', fontWeight: 500 }}>Cargando registros financieros...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="finanzas-empty-state">
            <span className="finanzas-empty-icon">📂</span>
            <h3 style={{ margin: 0, color: '#334155' }}>No se encontraron transacciones</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {searchTerm || typeFilter !== 'todos' || categoryFilter !== 'todas'
                ? 'Prueba cambiando o limpiando los filtros de búsqueda.'
                : 'Aún no hay ingresos o egresos registrados en este período.'}
            </p>
          </div>
        ) : (
          <>
            <div className="finanzas-table-wrapper">
              <table className="finanzas-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Fecha</th>
                    <th style={{ width: '120px' }}>Tipo</th>
                    <th style={{ minWidth: '220px' }}>Descripción</th>
                    <th style={{ width: '170px' }}>Categoría</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Monto</th>
                    <th style={{ width: '180px' }}>Registrado Por</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => {
                    const catCfg = CATEGORIAS_CONFIG[item.categoria] || { label: item.categoria || 'Otros', icon: '📌' };
                    const isIngreso = item.tipo === 'ingreso';

                    return (
                      <tr key={item._id}>
                        {/* Fecha */}
                        <td>
                          <div className="finanzas-fecha-cell">
                            <span className="finanzas-fecha-main">
                              {formatSafeDate ? formatSafeDate(item.fecha) : new Date(item.fecha).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                        </td>

                        {/* Tipo Badge */}
                        <td>
                          <span className={`finanzas-badge-tipo ${isIngreso ? 'ingreso' : 'egreso'}`}>
                            {isIngreso ? '↗ INGRESO' : '↘ EGRESO'}
                          </span>
                        </td>

                        {/* Descripción */}
                        <td>
                          <div className="finanzas-desc-title">{item.descripcion || 'Sin descripción'}</div>
                          {item.comprobante_url && (
                            <a 
                              href={item.comprobante_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="finanzas-comprobante-link"
                            >
                              📄 Ver comprobante
                            </a>
                          )}
                        </td>

                        {/* Categoría */}
                        <td>
                          <span className="finanzas-badge-cat">
                            <span>{catCfg.icon}</span>
                            <span>{catCfg.label}</span>
                          </span>
                        </td>

                        {/* Monto */}
                        <td style={{ textAlign: 'right' }}>
                          <span className={`finanzas-monto ${isIngreso ? 'ingreso' : 'egreso'}`}>
                            {isIngreso ? '+ ' : '- '}
                            S/ {Number(item.monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Registrado Por */}
                        <td>
                          <div className="finanzas-user-pill">
                            <div className="finanzas-user-avatar">
                              {getInitials(item.registradoPor?.nombreCompleto || item.registradoPor?.nombre)}
                            </div>
                            <span>
                              {item.registradoPor?.nombreCompleto || item.registradoPor?.nombre || 'Francisco de Asís'}
                            </span>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td>
                          <div className="finanzas-action-btns" style={{ justifyContent: 'center' }}>
                            <button 
                              className="finanzas-action-btn edit" 
                              onClick={() => openEditModal(item)} 
                              title="Editar transacción"
                            >
                              ✏️
                            </button>
                            <button 
                              className="finanzas-action-btn delete" 
                              onClick={() => handleDelete(item._id)} 
                              title="Eliminar transacción"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. PIE DE TABLA Y PAGINACIÓN */}
            <div className="finanzas-table-footer">
              <span>
                Mostrando <b>{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}</b> a{' '}
                <b>{Math.min(filteredData.length, currentPage * itemsPerPage)}</b> de <b>{filteredData.length}</b> transacciones
                {filteredData.length !== data.length && ` (filtrado de ${data.length} en total)`}
              </span>

              {totalPages > 1 && (
                <div className="finanzas-pagination">
                  <button 
                    className="finanzas-page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>
                  <span className="finanzas-page-info">
                    Página <b>{currentPage}</b> de <b>{totalPages}</b>
                  </span>
                  <button 
                    className="finanzas-page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsModalOpen(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Registrar Transacción</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>Tipo de Transacción</label>
                <div className="finanzas-tipo-selector">
                  <button
                    type="button"
                    className={`finanzas-tipo-btn ${newItem.tipo === 'ingreso' ? 'selected-ingreso' : ''}`}
                    onClick={() => setNewItem({ ...newItem, tipo: 'ingreso' })}
                  >
                    📈 Ingreso (+)
                  </button>
                  <button
                    type="button"
                    className={`finanzas-tipo-btn ${newItem.tipo === 'egreso' ? 'selected-egreso' : ''}`}
                    onClick={() => setNewItem({ ...newItem, tipo: 'egreso' })}
                  >
                    📉 Egreso (-)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Monto (S/)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={newItem.monto} 
                    onChange={(e) => setNewItem({ ...newItem, monto: e.target.value })} 
                    required 
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    value={newItem.fecha} 
                    onChange={(e) => setNewItem({ ...newItem, fecha: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input 
                  type="text" 
                  value={newItem.descripcion} 
                  onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })} 
                  required 
                  placeholder="Ej: Aporte mensual, compra de flores, víveres..." 
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select 
                  value={newItem.categoria} 
                  onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })} 
                  required
                >
                  {Object.entries(CATEGORIAS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsEditModalOpen(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Editar Transacción</h2>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label>Tipo de Transacción</label>
                <div className="finanzas-tipo-selector">
                  <button
                    type="button"
                    className={`finanzas-tipo-btn ${selectedItem.tipo === 'ingreso' ? 'selected-ingreso' : ''}`}
                    onClick={() => setSelectedItem({ ...selectedItem, tipo: 'ingreso' })}
                  >
                    📈 Ingreso (+)
                  </button>
                  <button
                    type="button"
                    className={`finanzas-tipo-btn ${selectedItem.tipo === 'egreso' ? 'selected-egreso' : ''}`}
                    onClick={() => setSelectedItem({ ...selectedItem, tipo: 'egreso' })}
                  >
                    📉 Egreso (-)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Monto (S/)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={selectedItem.monto} 
                    onChange={(e) => setSelectedItem({ ...selectedItem, monto: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    value={selectedItem.fecha} 
                    onChange={(e) => setSelectedItem({ ...selectedItem, fecha: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input 
                  type="text" 
                  value={selectedItem.descripcion} 
                  onChange={(e) => setSelectedItem({ ...selectedItem, descripcion: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select 
                  value={selectedItem.categoria} 
                  onChange={(e) => setSelectedItem({ ...selectedItem, categoria: e.target.value })} 
                  required
                >
                  {Object.entries(CATEGORIAS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanzasView;
