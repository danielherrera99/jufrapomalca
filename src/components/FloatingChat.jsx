/* src/components/FloatingChat.jsx */
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './FloatingChat.css';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: '¡Paz y bien! Soy el Asistente Seráfico de JUFRA Pomalca. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const systemInstruction = `Eres el "Asistente Seráfico", un chatbot amigable integrado en la web de la Juventud Franciscana (JUFRA) de Pomalca, Perú. Tu misión es ayudar a los visitantes a conocer la JUFRA, dar oraciones, explicar nuestras actividades (reuniones, apostolados) y reflejar el carisma franciscano con mucha alegría y paz. Siempre saluda con "Paz y bien". Sé conciso y amable.`;
      
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
      {/* Burbuja Flotante */}
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
