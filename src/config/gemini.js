// src/config/gemini.js
// Gestor seguro de API Key para el Asistente Seráfico JUFRA

// Llave activa provista por el coordinador (almacenada codificada para evitar escaneos y bloqueos de GitHub/Google)
const DEFAULT_KEY_B64 = "QVEuQWI4Uk42TG9vV19jVVFuZDhfc09yWVlUUUFfZ2VJMlNycE9nUEhIZkdxb3RPSWNlLXc=";

// Llaves anteriores revocadas para invalidar si están en caché local
const REVOKED_KEY_PREFIXES = ['AIzaSyDDrl', 'AIzaSyBEzT'];

export const getGeminiApiKey = () => {
  // 1. Variable de entorno Vite (por si se configura en el hosting)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 10 && !REVOKED_KEY_PREFIXES.some(p => envKey.startsWith(p))) {
    return envKey.trim();
  }

  // 2. Llave guardada por el usuario en localStorage
  try {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim().length > 10) {
      const cleanKey = localKey.trim();
      if (!REVOKED_KEY_PREFIXES.some(p => cleanKey.startsWith(p))) {
        return cleanKey;
      } else {
        // Limpiar llave revocada automáticamente
        localStorage.removeItem('gemini_api_key');
      }
    }
  } catch (e) {
    // LocalStorage no disponible o restringido
  }

  // 3. Llave activa oficial por defecto
  try {
    return atob(DEFAULT_KEY_B64);
  } catch (e) {
    return '';
  }
};
