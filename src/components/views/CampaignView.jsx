import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const CampaignView = () => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            try {
                const { data } = await api.get('/campaigns/active');
                setCampaign(data);
            } catch (err) {
                setError('No hay campañas activas en este momento o ocurrió un error.');
            } finally {
                setLoading(false);
            }
        };
        fetchActiveCampaign();
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Vuelve pronto</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error || 'Actualmente no tenemos ninguna campaña destacada.'}</p>
                <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem', textDecoration: 'none' }}>Volver al Inicio</a>
            </div>
        );
    }

    const shareOnWhatsApp = () => {
        const text = `¡Únete a nuestra campaña: ${campaign.titulo}!\n📅 Fecha: ${campaign.fechaHora}\n📍 Lugar: ${campaign.ubicacion || 'Por confirmar'}\nMás información aquí: ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const addToCalendar = () => {
        const text = encodeURIComponent(campaign.titulo);
        const details = encodeURIComponent(campaign.descripcion || '');
        const location = encodeURIComponent(campaign.ubicacion || '');
        // Usamos una fecha genérica ya que tenemos un string libre, o podríamos usar fecha del sistema. 
        // Para que funcione el link, pondremos un evento de todo el día para hoy, 
        // ya que la fechaHora es texto libre, el usuario tendrá que ajustarlo.
        const start = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${start}/${start}`;
        window.open(url, '_blank');
    };

    return (
        <div className="animate-fade" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
            
            <a href="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem', display: 'inline-block' }}>
                ← Volver
            </a>

            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>{campaign.titulo}</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{campaign.descripcion}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={addToCalendar} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📅 Añadir a mi Calendario
                    </button>
                    <button onClick={shareOnWhatsApp} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', border: 'none' }}>
                        📲 Compartir por WhatsApp
                    </button>
                </div>
            </header>

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                {/* Detalles y Cronograma */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Información del Evento</h3>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><strong>📅 Fecha y Hora:</strong> <br/>{campaign.fechaHora}</p>
                    {campaign.ubicacion && (
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}><strong>📍 Ubicación:</strong> <br/>{campaign.ubicacion}</p>
                    )}

                    {campaign.cronograma && campaign.cronograma.length > 0 && (
                        <>
                            <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Cronograma de Actividades</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {campaign.cronograma.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                                        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center', fontSize: '0.9rem' }}>
                                            {item.hora}
                                        </div>
                                        <div style={{ paddingTop: '0.2rem' }}>{item.actividad}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Reglas y Mapa */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {campaign.reglas && campaign.reglas.length > 0 && (
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Indicaciones Importantes</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {campaign.reglas.map((regla, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{regla.icono}</div>
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>{regla.texto}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {campaign.mapQuery && (
                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <iframe 
                                src={campaign.mapQuery} 
                                width="100%" 
                                height="300" 
                                style={{ border: 0, display: 'block' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mapa del Evento"
                            ></iframe>
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};

export default CampaignView;
