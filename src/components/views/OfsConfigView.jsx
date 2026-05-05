import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const OfsConfigView = ({ loading, setLoading }) => {
  const [config, setConfig] = useState({
    heroTitle: '',
    heroSubtitle: '',
    mapQuery: '',
    quienesSomos: '',
    footerDireccion: '',
    footerEmail: '',
    footerTelefono: '',
    bannerTitle: '',
    bannerDescription: '',
    bannerImage: '',
    bannerLink: '',
    bannerActive: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ofs-config');
      if (res.data.success) {
        const data = res.data.data;
        setConfig({
            ...config,
            ...data,
            bannerActive: data.bannerActive || false
        });
        if (data.bannerImage) setPreviewUrl(data.bannerImage);
      }
    } catch (err) {
      console.error('Error al cargar config OFS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Agregar todos los campos de texto al FormData
      Object.keys(config).forEach(key => {
        formData.append(key, config[key]);
      });

      // Si hay un archivo seleccionado, agregarlo
      if (selectedFile) {
        formData.append('bannerFile', selectedFile);
      }

      const res = await api.put('/ofs-config', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert('¡Configuración OFS guardada con éxito!');
        setSelectedFile(null);
        fetchConfig(); // Recargar para obtener la URL final del servidor
      }
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid #FFE0B2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>☦️</span>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0 }}>Gestión de Página OFS</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Control exclusivo de la landing page de la Familia Franciscana.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {/* SECCIÓN HERO */}
          <section style={{ marginBottom: '2rem', padding: '1.5rem', background: '#FFF9F2', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', borderBottom: '1px solid #FFE0B2', paddingBottom: '0.5rem' }}>Cabecera (Hero)</h3>
            <div className="input-group">
              <label>Título de Bienvenida:</label>
              <input type="text" value={config.heroTitle} onChange={e => setConfig({...config, heroTitle: e.target.value})} required />
            </div>
            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label>Subtítulo / Lema Espiritual:</label>
              <textarea value={config.heroSubtitle} onChange={e => setConfig({...config, heroSubtitle: e.target.value})} style={{ minHeight: '80px' }} required />
            </div>
          </section>

          {/* SECCIÓN BANNER ESPECIAL */}
          <section style={{ marginBottom: '2rem', padding: '1.5rem', background: '#FFF0F0', borderRadius: '12px', border: '1px solid #FFCDD2' }}>
            <h3 style={{ color: '#C62828', marginBottom: '1.5rem', borderBottom: '1px solid #FFCDD2', paddingBottom: '0.5rem' }}>📢 Banner de Anuncio Especial</h3>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px', borderRadius: '8px' }}>
                <input type="checkbox" id="bannerActive" checked={config.bannerActive} onChange={e => setConfig({...config, bannerActive: e.target.checked})} style={{ width: '22px', height: '22px' }} />
                <label htmlFor="bannerActive" style={{ fontWeight: 'bold', color: '#C62828' }}>Activar este banner en la web</label>
            </div>

            <div className="input-group">
              <label>Título del Banner:</label>
              <input type="text" value={config.bannerTitle || ''} onChange={e => setConfig({...config, bannerTitle: e.target.value})} />
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label>Descripción del Banner:</label>
              <textarea value={config.bannerDescription || ''} onChange={e => setConfig({...config, bannerDescription: e.target.value})} style={{ minHeight: '60px' }} />
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label>Imagen del Banner:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {previewUrl && (
                  <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    <img src={previewUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px dashed #C62828' }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666' }}>💡 Puedes subir una foto desde tu PC o pegar una URL abajo.</p>
                <input 
                  type="text" 
                  value={config.bannerImage || ''} 
                  onChange={e => setConfig({...config, bannerImage: e.target.value})} 
                  placeholder="O pega una URL de imagen aquí..."
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label>Enlace del Banner (Opcional):</label>
              <input 
                type="text" 
                value={config.bannerLink || ''} 
                onChange={e => setConfig({...config, bannerLink: e.target.value})} 
                placeholder="Ej: https://docs.google.com/forms/..."
              />
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                🔗 Si pones un link, la gente podrá hacer clic en el banner para ir a esa página.
              </p>
            </div>
          </section>

          {/* SECCIÓN IDENTIDAD */}
          <section style={{ marginBottom: '2rem', padding: '1.5rem', background: '#FFF9F2', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', borderBottom: '1px solid #FFE0B2', paddingBottom: '0.5rem' }}>Identidad (¿Quiénes somos?)</h3>
            <div className="input-group">
              <label>Descripción de Identidad:</label>
              <textarea value={config.quienesSomos} onChange={e => setConfig({...config, quienesSomos: e.target.value})} style={{ minHeight: '100px' }} required />
            </div>
          </section>

          {/* SECCIÓN FOOTER */}
          <section style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#F5F5F5', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Información de Contacto</h3>
            <div className="input-group">
              <label>Dirección física:</label>
              <input type="text" value={config.footerDireccion} onChange={e => setConfig({...config, footerDireccion: e.target.value})} />
            </div>
            <div className="row" style={{ gap: '1rem', marginTop: '1.5rem' }}>
               <div className="col">
                  <div className="input-group">
                    <label>Email:</label>
                    <input type="email" value={config.footerEmail} onChange={e => setConfig({...config, footerEmail: e.target.value})} />
                  </div>
               </div>
               <div className="col">
                  <div className="input-group">
                    <label>WhatsApp:</label>
                    <input type="text" value={config.footerTelefono} onChange={e => setConfig({...config, footerTelefono: e.target.value})} />
                  </div>
               </div>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => window.open('/familia-ofs', '_blank')}>👁️ Ver Página</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem' }} disabled={loading}>{loading ? 'Guardando...' : '💾 Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfsConfigView;
