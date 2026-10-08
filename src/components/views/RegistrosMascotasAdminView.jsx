import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import Swal from 'sweetalert2';

const RegistrosMascotasAdminView = () => {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRegistros = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/registros-mascotas');
            if (data.success) {
                setRegistros(data.data);
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar los registros', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistros();
    }, []);

    const handleAprobar = async (id) => {
        try {
            const { data } = await api.put(`/registros-mascotas/${id}/aprobar`);
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Aprobado',
                    text: 'El registro se validó correctamente. El usuario ya puede descargar su certificado.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                fetchRegistros(); // Recargar para actualizar UI
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo aprobar el registro', 'error');
        }
    };

    const handleCheckboxChange = async (id, field, currentValue) => {
        try {
            const { data } = await api.put(`/registros-mascotas/${id}/servicios`, {
                [field]: !currentValue
            });
            if (data.success) {
                // Actualizar UI localmente
                setRegistros(registros.map(r => r.id === id ? { ...r, [field]: !currentValue } : r));
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el servicio', 'error');
        }
    };

    const filteredRegistros = registros.filter(r => 
        r.idSolicitud.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nombreDueno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nombreMascota.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="admin-content animate-fade">
            <header className="admin-header">
                <div>
                    <h1>🐾 Registro de Mascotas</h1>
                    <p>Valida los servicios y aprueba registros en la mesa de atención.</p>
                </div>
            </header>

            <div className="admin-controls" style={{ marginBottom: '2rem' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por ID, dueño o mascota..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                />
            </div>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID Solicitud</th>
                            <th>Mascota</th>
                            <th>Dueño</th>
                            <th>WhatsApp</th>
                            <th>Servicios</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegistros.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No se encontraron registros.</td></tr>
                        ) : (
                            filteredRegistros.map((registro) => (
                                <tr key={registro.id}>
                                    <td><b style={{ color: 'var(--primary)' }}>{registro.idSolicitud}</b></td>
                                    <td>{registro.nombreMascota}</td>
                                    <td>{registro.nombreDueno}</td>
                                    <td>{registro.whatsapp}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={registro.recibioBendicion} 
                                                    onChange={() => handleCheckboxChange(registro.id, 'recibioBendicion', registro.recibioBendicion)}
                                                /> Bendición
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={registro.recibioVacuna} 
                                                    onChange={() => handleCheckboxChange(registro.id, 'recibioVacuna', registro.recibioVacuna)}
                                                /> Vacuna
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={registro.recibioDesparasitacion} 
                                                    onChange={() => handleCheckboxChange(registro.id, 'recibioDesparasitacion', registro.recibioDesparasitacion)}
                                                /> Desparasitación
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${registro.estadoAprobado ? 'status-active' : 'status-inactive'}`}>
                                            {registro.estadoAprobado ? 'Aprobado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td>
                                        {!registro.estadoAprobado && (
                                            <button 
                                                onClick={() => handleAprobar(registro.id)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                ✅ Aprobar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegistrosMascotasAdminView;
