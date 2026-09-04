import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const WebConfigView = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    heroTitle: '',
    heroSubtitle: '',
    mision: '',
    vision: '',
    valores: '',
    fraseInspiradora: '',
    autorFrase: '',
    emailContacto: '',
    telefonoContacto: '',
    mapQuery: '',
    familiaTitulo: '',
    familiaDescripcion: '',
    ofsHeroTitle: '',
    ofsHeroSubtitle: '',
    ofsMapQuery: '',
    facebookUrl: '',
    instagramUrl: '',
    whatsappUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    promoActiva: false,
    promoTitulo: '',
    promoDescripcion: '',
    promoImagenUrl: '',
    promoBotonTexto: '',
    promoBotonLink: ''
  });
  const [selectedPromoFile, setSelectedPromoFile] = useState(null);
  const [promoPreviewUrl, setPromoPreviewUrl] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/web-config');
      if (res.data.success) {
        const data = res.data.data;
        setConfig({
          ...config,
          ...data,
          promoActiva: data.promoActiva || false
        });
        if (data.promoImagenUrl) setPromoPreviewUrl(data.promoImagenUrl);
      }
    } catch (err) {
      console.error('Error al cargar config web:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPromoFile(file);
      setPromoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(config).forEach(key => {
        formData.append(key, config[key]);
      });

      if (selectedPromoFile) {
        formData.append('promoFile', selectedPromoFile);
      }

      const res = await api.put('/web-config', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert('¡Configuración guardada! Los cambios ya son visibles en la web pública.');
        setSelectedPromoFile(null);
        fetchConfig();
      }
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>🌐 Control de Contenido Web</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Desde aquí puedes cambiar los textos que el público ve en la página de inicio.
        </p>

        <form onSubmit={handleSubmit}>
          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Cabecera Principal (Hero)</h3>
            <div className="input-group">
              <label>Título de Bienvenida:</label>
              <input 
                type="text" 
                value={config.heroTitle} 
                onChange={e => setConfig({...config, heroTitle: e.target.value})} 
                placeholder="Ej: Juventud Franciscana en el Perú"
              />
            </div>
            <div className="input-group">
              <label>Subtítulo / Lema:</label>
              <textarea 
                value={config.heroSubtitle} 
                onChange={e => setConfig({...config, heroSubtitle: e.target.value})} 
                style={{ minHeight: '80px' }}
              />
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Misión, Visión y Valores</h3>
            <div className="input-group">
              <label>Misión (Espiritualidad):</label>
              <textarea 
                value={config.mision} 
                onChange={e => setConfig({...config, mision: e.target.value})} 
                style={{ minHeight: '100px' }}
              />
            </div>
            <div className="input-group">
              <label>Visión (Formación):</label>
              <textarea 
                value={config.vision} 
                onChange={e => setConfig({...config, vision: e.target.value})} 
                style={{ minHeight: '100px' }}
              />
            </div>
            <div className="input-group">
              <label>Valores (Fraternidad):</label>
              <textarea 
                value={config.valores} 
                onChange={e => setConfig({...config, valores: e.target.value})} 
                style={{ minHeight: '100px' }}
              />
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Familia Franciscana (Sección en Inicio)</h3>
            <div className="input-group">
              <label>Título (Sección JUFRA):</label>
              <input 
                type="text" 
                value={config.familiaTitulo} 
                onChange={e => setConfig({...config, familiaTitulo: e.target.value})} 
                placeholder="Ej: Fraternidad OFS Santa Isabel de Hungría"
              />
            </div>
            <div className="input-group">
              <label>Descripción corta:</label>
              <textarea 
                value={config.familiaDescripcion} 
                onChange={e => setConfig({...config, familiaDescripcion: e.target.value})} 
                style={{ minHeight: '80px' }}
                placeholder="Describe la relación con la OFS..."
              />
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Cita Inspiradora</h3>
            <div className="input-group">
              <label>Frase destacada:</label>
              <textarea 
                value={config.fraseInspiradora} 
                onChange={e => setConfig({...config, fraseInspiradora: e.target.value})} 
                style={{ minHeight: '60px', fontStyle: 'italic' }}
              />
            </div>
            <div className="input-group">
              <label>Autor de la frase:</label>
              <input 
                type="text" 
                value={config.autorFrase} 
                onChange={e => setConfig({...config, autorFrase: e.target.value})} 
              />
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Información de Contacto</h3>
            <div className="row" style={{ gap: '1rem' }}>
              <div className="col">
                <div className="input-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    value={config.emailContacto} 
                    onChange={e => setConfig({...config, emailContacto: e.target.value})} 
                  />
                </div>
              </div>
              <div className="col">
                <div className="input-group">
                  <label>WhatsApp:</label>
                  <input 
                    type="text" 
                    value={config.telefonoContacto} 
                    onChange={e => setConfig({...config, telefonoContacto: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Ubicación exacta en Mapa (Pin):</label>
              <input 
                type="text" 
                value={config.mapQuery} 
                onChange={e => setConfig({...config, mapQuery: e.target.value})} 
                placeholder="Ej: Parroquia San Juan Maria Vianney, Pomalca"
              />
              <small style={{ color: 'var(--text-muted)' }}>Tip: Escribe el nombre del lugar o coordenadas para mover el pin.</small>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Banner Promocional (Popup Flotante)</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Configura el anuncio que aparece al entrar a la página (solo se muestra 1 vez por sesión).</p>
            
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={config.promoActiva} 
                  onChange={e => setConfig({...config, promoActiva: e.target.checked})} 
                  style={{ width: '20px', height: '20px' }}
                />
                Activar Banner Promocional
              </label>
            </div>

            <div className="row" style={{ gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
              <div className="col" style={{ flex: 1, minWidth: '250px' }}>
                <div className="input-group">
                  <label>Título del Anuncio:</label>
                  <input 
                    type="text" 
                    value={config.promoTitulo} 
                    onChange={e => setConfig({...config, promoTitulo: e.target.value})} 
                    placeholder="Ej: ¡Gran Bingo Franciscano!"
                  />
                </div>
                <div className="input-group">
                  <label>Descripción corta:</label>
                  <textarea 
                    value={config.promoDescripcion} 
                    onChange={e => setConfig({...config, promoDescripcion: e.target.value})} 
                    style={{ minHeight: '80px' }}
                    placeholder="Describe la actividad..."
                  />
                </div>
                <div className="row" style={{ gap: '1rem', display: 'flex' }}>
                  <div className="col" style={{ flex: 1 }}>
                    <div className="input-group">
                      <label>Texto del Botón:</label>
                      <input 
                        type="text" 
                        value={config.promoBotonTexto} 
                        onChange={e => setConfig({...config, promoBotonTexto: e.target.value})} 
                        placeholder="Ej: Saber más"
                      />
                    </div>
                  </div>
                  <div className="col" style={{ flex: 1 }}>
                    <div className="input-group">
                      <label>Enlace del Botón:</label>
                      <input 
                        type="text" 
                        value={config.promoBotonLink} 
                        onChange={e => setConfig({...config, promoBotonLink: e.target.value})} 
                        placeholder="Ej: /celebraciones o URL externa"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col" style={{ flex: 1, minWidth: '250px' }}>
                <div className="input-group">
                  <label>Imagen del Flyer (Recomendado: Cuadrada o Vertical):</label>
                  {promoPreviewUrl && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <img 
                        src={promoPreviewUrl.startsWith('blob:') ? promoPreviewUrl : api.defaults.baseURL.replace('/api', '') + '/' + promoPreviewUrl} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                        onError={(e) => { e.target.src = promoPreviewUrl; }}
                      />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ padding: '0.5rem', background: '#f8f9fa' }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Redes Sociales de la JUFRA</h3>
            <div className="row" style={{ gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
              <div className="col" style={{ flex: 1, minWidth: '200px' }}>
                <div className="input-group">
                  <label>Enlace de Facebook:</label>
                  <input 
                    type="url" 
                    value={config.facebookUrl || ''} 
                    onChange={e => setConfig({...config, facebookUrl: e.target.value})} 
                    placeholder="Ej: https://facebook.com/jufra.pomalca"
                  />
                </div>
              </div>
              <div className="col" style={{ flex: 1, minWidth: '200px' }}>
                <div className="input-group">
                  <label>Enlace de Instagram:</label>
                  <input 
                    type="url" 
                    value={config.instagramUrl || ''} 
                    onChange={e => setConfig({...config, instagramUrl: e.target.value})} 
                    placeholder="Ej: https://instagram.com/jufra.pomalca"
                  />
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: '1rem', display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div className="col" style={{ flex: 1, minWidth: '200px' }}>
                <div className="input-group">
                  <label>Enlace de WhatsApp (wa.me o chat):</label>
                  <input 
                    type="url" 
                    value={config.whatsappUrl || ''} 
                    onChange={e => setConfig({...config, whatsappUrl: e.target.value})} 
                    placeholder="Ej: https://wa.me/51981574685"
                  />
                </div>
              </div>
              <div className="col" style={{ flex: 1, minWidth: '200px' }}>
                <div className="input-group">
                  <label>Enlace de TikTok:</label>
                  <input 
                    type="url" 
                    value={config.tiktokUrl || ''} 
                    onChange={e => setConfig({...config, tiktokUrl: e.target.value})} 
                    placeholder="Ej: https://tiktok.com/@jufra.pomalca"
                  />
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: '1rem', display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div className="col" style={{ flex: 1, minWidth: '200px', maxWidth: '50%' }}>
                <div className="input-group">
                  <label>Enlace de YouTube:</label>
                  <input 
                    type="url" 
                    value={config.youtubeUrl || ''} 
                    onChange={e => setConfig({...config, youtubeUrl: e.target.value})} 
                    placeholder="Ej: https://youtube.com/@jufrapomalca"
                  />
                </div>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '1rem 3rem' }}
              disabled={loading}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios Públicos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebConfigView;
