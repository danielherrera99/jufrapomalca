/* src/components/FloatingChat.jsx */
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import api from '../config/api';
import './FloatingChat.css';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: '¡Paz y bien! Soy el Asistente Seráfico de JUFRA Pomalca. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/web-config');
        if (res.data.success) {
          setConfig(res.data.data);
        }
      } catch (error) {
        console.error("Error cargando web config en chat:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!apiKey) throw new Error("API Key no configurada.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const systemInstruction = `Eres el "Asistente Seráfico", un chatbot amigable integrado en la web de la Juventud Franciscana (JUFRA) de Pomalca, Perú. Nuestra sede es la Parroquia María del Perpetuo Socorro. Tu misión es ayudar a los visitantes a conocer la JUFRA, dar oraciones, explicar nuestras actividades (reuniones, apostolados) y reflejar el carisma franciscano con mucha alegría y paz. Siempre saluda con "Paz y bien". Sé conciso y amable.`;
      
      const prompt = `${systemInstruction}\n\nUsuario: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'ai', content: text }]);
    } catch (error) {
      console.error("Error en Chat Flotante:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Lo siento, tuve un pequeño problema técnico. ¿Podrías intentar preguntarme de nuevo?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="floating-chat-container">
      
      {/* Contenedor de Redes Sociales Ocultables */}
      <div className={`social-links-container ${isSocialOpen ? 'open' : ''}`}>
        {/* Botón Flotante de Facebook */}
        <a 
          href={config.facebookUrl || "https://facebook.com/jufrapomalca"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-bubble facebook"
          title="Facebook"
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </span>
        </a>
        {/* Botón Flotante de Instagram */}
        <a 
          href={config.instagramUrl || "https://instagram.com/jufra.pomalca"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-bubble instagram"
          title="Instagram"
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </span>
        </a>
        {/* Botón Flotante de TikTok */}
        <a 
          href={config.tiktokUrl || "https://tiktok.com/@jufra.pomalca"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-bubble tiktok"
          title="TikTok"
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.53-4.09-1.37-.76-.53-1.43-1.22-1.93-2.02v6.18c.1 2.62-1.12 5.25-3.32 6.66-2.22 1.43-5.23 1.58-7.6 1.05-2.37-.53-4.52-2.23-5.46-4.53-1-2.45-.63-5.48 1.01-7.58 1.62-2.07 4.34-3.13 6.94-2.82 1.08.13 2.15.53 3.03 1.18V.02zm-3.24 10.74c-1.42-.23-2.92.36-3.72 1.57-.8 1.21-.83 2.89-.09 4.14.74 1.25 2.19 1.95 3.62 1.81 1.42-.14 2.7-1.15 3.12-2.52.42-1.37-.01-2.96-1.08-3.87-.73-.61-1.67-.98-2.63-1.13z"/></svg>
          </span>
        </a>
        {/* Botón Flotante de YouTube */}
        <a 
          href={config.youtubeUrl || "https://youtube.com/@jufrapomalca"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-bubble youtube"
          title="YouTube"
          style={{ background: '#FF0000', color: 'white' }}
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </span>
        </a>
      </div>

      {/* Botón Toggle Redes */}
      <div 
        className={`social-bubble toggle-social ${isSocialOpen ? 'active' : ''}`}
        onClick={() => setIsSocialOpen(!isSocialOpen)}
        title="Redes Sociales"
      >
        <span className="icon">{isSocialOpen ? '✕' : '🔗'}</span>
      </div>
      {/* Botón Flotante de WhatsApp */}
      <a 
        href={config.whatsappUrl || "https://wa.me/51981574685?text=¡Paz%20y%20bien!%20Me%20gustaría%20recibir%20información%20sobre%20la%20fraternidad."} 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-bubble"
      >
        <span className="icon">
          <svg viewBox="0 0 24 24" fill="currentColor" height="30" width="30">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </span>
      </a>

      {/* Burbuja Flotante Asistente */}
      <div className={`chat-bubble ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">{isOpen ? '✕' : '🤖'}</span>
        {!isOpen && <div className="chat-badge"></div>}
      </div>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🕊️</div>
              <div className="chat-header-text">
                <h3>Asistente Seráfico</h3>
                <p><span className="online-dot"></span> En línea ahora</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">El asistente está escribiendo...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Escribe tu mensaje..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button type="submit" className="send-btn" disabled={isLoading}>
              {isLoading ? '...' : '➤'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
