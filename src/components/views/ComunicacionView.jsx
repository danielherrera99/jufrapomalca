import React, { useState } from 'react';
import api from '../../config/api';

const ComunicacionView = ({ loading, setLoading }) => {
  const [formData, setFormData] = useState({
    filtro: 'todos',
    asunto: '',
    mensaje: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asunto || !formData.mensaje) {
      alert('Por favor completa el asunto y el mensaje.');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas enviar este correo masivo a todos los hermanos seleccionados?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/hermanos/comunicacion/masivo', formData);
      if (response.data.success) {
        alert(response.data.message);
        setFormData({ filtro: 'todos', asunto: '', mensaje: '' });
      }
    } catch (err) {
      alert('Error al enviar comunicado: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>📢 Comunicados Masivos</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Envía correos electrónicos oficiales a los hermanos de la fraternidad a través de la API de Brevo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Enviar a:</label>
            <select 
              value={formData.filtro} 
              onChange={e => setFormData({...formData, filtro: e.target.value})}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
            >
              <optgroup label="General">
                <option value="todos">Todos los Hermanos Activos</option>
              </optgroup>
              <optgroup label="Por Rol">
                <option value="admin">Solo Administradores</option>
                <option value="consejo">Solo Miembros del Consejo</option>
                <option value="miembro">Solo Miembros Base</option>
              </optgroup>
              <optgroup label="Por Etapa de Formación">
                <option value="aspirante">Aspirantes</option>
                <option value="iniciado">Iniciados</option>
                <option value="en_formacion">En Formación</option>
                <option value="promesado">Promesados</option>
              </optgroup>
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '1.5rem' }}>
            <label>Asunto del Correo</label>
            <input 
              type="text" 
              value={formData.asunto} 
              onChange={e => setFormData({...formData, asunto: e.target.value})} 
              placeholder="Ej: Invitación a Reunión Extraordinaria"
              required 
            />
          </div>

          <div className="input-group" style={{ marginTop: '1.5rem' }}>
            <label>Mensaje (Contenido del correo)</label>
            <textarea 
              value={formData.mensaje} 
              onChange={e => setFormData({...formData, mensaje: e.target.value})} 
              placeholder="Escribe aquí el comunicado oficial..."
              style={{ 
                width: '100%', 
                minHeight: '250px', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              required 
            />
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : '🚀 Enviar Comunicado Masivo'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7', color: '#92400E' }}>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>
          <b>Nota:</b> Los correos se enviarán solo a los hermanos que tengan una dirección de correo electrónico válida registrada en su perfil.
        </p>
      </div>
    </div>
  );
};

export default ComunicacionView;
