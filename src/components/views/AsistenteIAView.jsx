import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AsistenteIAView = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Paz y bien! Soy tu Asistente Seráfico. ¿En qué te puedo ayudar hoy? Puedes pedirme que redacte comunicados, genere oraciones o resuma actas.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [apiKey, setApiKey] = useState(envApiKey || localStorage.getItem('gemini_api_key') || '');
  const [isConfiguring, setIsConfiguring] = useState(!envApiKey && !localStorage.getItem('gemini_api_key'));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsConfiguring(false);
    }
  };

  const clearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsConfiguring(true);
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || !apiKey) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Usamos el modelo ultra-nuevo Gemini 3 Flash Preview que tiene tu cuenta
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview"
      });

      // Configuración avanzada para Gemini 3
      const generationConfig = {
        thinkingConfig: { includeThoughts: true }
      };

      // Preparar historial de chat para darle contexto de JUFRA
      const systemInstruction = `Eres un asistente virtual llamado "Asistente Seráfico" para la Juventud Franciscana (JUFRA) de Pomalca. Tu tono debe ser amable, franciscano (saludando siempre con "Paz y bien" si es la primera interacción o si amerita), y dispuesto a ayudar. Estás ayudando a los líderes (el consejo) a redactar correos, actas, oraciones o resolver dudas.`;
      
      const result = await model.generateContent([systemInstruction, userMessage]);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error de conexión: ${error.message}. Si acabas de cambiar la clave, intenta recargar la página o usar el botón "Cambiar Llave" para pegar la nueva manualmente.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    let prompt = '';
    if (action === 'comunicado') {
      prompt = 'Ayúdame a redactar un comunicado corto invitando a los hermanos a una reunión extraordinaria este fin de semana.';
    } else if (action === 'oracion') {
      prompt = 'Genera una breve oración franciscana para iniciar nuestra próxima reunión del consejo.';
    } else if (action === 'acta') {
      prompt = 'Tengo el borrador de un acta de reunión, ¿puedes resumirme los acuerdos principales si te pego el texto aquí?';
    }
    handleSend(prompt);
  };

  // Vista de Configuración de API Key
  if (isConfiguring) {
    return (
      <div className="animate-fade" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>Configurar Asistente IA</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Para mantener el servicio gratuito, este módulo requiere una <b>Llave API de Google Gemini</b>. Tu llave se guardará de forma segura en tu navegador.
          </p>
          
          <form onSubmit={handleSaveKey}>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="Pega tu API Key aquí (AIzaSy...)"
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', marginBottom: '1rem', fontSize: '1.1rem' }}
              required 
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              Guardar Llave y Comenzar
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1.5rem', background: '#F0FDFA', borderRadius: '12px', border: '1px solid #CCFBF1', color: '#115E59' }}>
            <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>¿Cómo obtenerla gratis en 1 minuto?</h4>
            <ol style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Entra a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#0F766E', fontWeight: 'bold', textDecoration: 'underline' }}>Google AI Studio</a>.</li>
              <li>Inicia sesión con tu cuenta de Google.</li>
              <li>Haz clic en el botón azul <b>"Create API key"</b>.</li>
              <li>Copia el texto generado y pégalo arriba.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Vista del Chat
  return (
    <div className="animate-fade" style={{ maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0 }}>🤖 Asistente Seráfico</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Inteligencia Artificial para la gestión franciscana.</p>
        </div>
        <button onClick={clearKey} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          ⚙️ Cambiar Llave
        </button>
      </div>

      {/* Sugerencias Rápidas */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleQuickAction('comunicado')} style={{ flex: 1, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📢</span>
            <b>Redactar comunicado</b>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Invitar a una reunión</p>
          </button>
          <button onClick={() => handleQuickAction('oracion')} style={{ flex: 1, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🙏</span>
            <b>Generar Oración</b>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Para inicio de sesión</p>
          </button>
          <button onClick={() => handleQuickAction('acta')} style={{ flex: 1, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📝</span>
            <b>Resumir Acta</b>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>Extraer acuerdos principales</p>
          </button>
        </div>
      )}

      {/* Caja de Chat */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              gap: '0.8rem',
              alignItems: 'flex-start'
            }}>
              {msg.role !== 'user' && (
                <div style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>{msg.role === 'assistant' ? '🤖' : '⚠️'}</div>
              )}
              
              <div style={{ 
                background: msg.role === 'user' ? 'var(--primary)' : msg.role === 'system' ? '#FEF2F2' : 'var(--surface)',
                color: msg.role === 'user' ? 'white' : msg.role === 'system' ? '#991B1B' : 'var(--text)',
                padding: '1rem 1.2rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.role !== 'user' ? '4px' : '16px',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(139, 69, 19, 0.2)' : 'none',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap' // Permite saltos de línea
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.5rem' }}>🤖</div>
              <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid var(--border)' }}>
                <span className="typing-indicator">Escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              style={{ flex: 1, padding: '1rem', borderRadius: '24px', border: '1px solid var(--border)', outline: 'none' }}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '24px', 
                padding: '0 1.5rem', 
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !isLoading ? 1 : 0.6,
                fontWeight: 'bold'
              }}
            >
              Enviar
            </button>
          </form>
        </div>

      </div>

      <style>{`
        .typing-indicator::after {
          content: '';
          animation: ellipsis 1.5s infinite;
        }
        @keyframes ellipsis {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
          100% { content: ''; }
        }
      `}</style>
    </div>
  );
};

export default AsistenteIAView;
