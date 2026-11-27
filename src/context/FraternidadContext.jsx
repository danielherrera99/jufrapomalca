import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const FraternidadContext = createContext();

export const POMALCA_ID = '00000000-6a0f-b53a-d327-e42a6db2faf7';

export const FraternidadProvider = ({ children, user }) => {
  const [fraternidades, setFraternidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = user?.isSuperAdmin || user?.rol === 'superadmin' || user?.rol === 'admin_nacional';

  const [selectedFraternidadId, setSelectedFraternidadId] = useState(() => {
    const saved = localStorage.getItem('selected_fraternidad_id');
    if (saved && saved !== 'undefined' && saved !== 'null' && saved !== '') {
      return saved;
    }
    return user?.fraternidadId || POMALCA_ID;
  });

  useEffect(() => {
    const fetchFraternidades = async () => {
      try {
        const res = await api.get('/fraternidades');
        setFraternidades(res.data?.data || []);
      } catch (err) {
        console.error('Error al cargar fraternidades en contexto:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFraternidades();
  }, []);

  const changeFraternidad = (id) => {
    const targetId = id || POMALCA_ID;
    localStorage.setItem('selected_fraternidad_id', targetId);
    setSelectedFraternidadId(targetId);
    // Disparar evento para que vistas que escuchen puedan re-consultar sus datos
    window.dispatchEvent(new CustomEvent('fraternidad_changed', { detail: targetId }));
  };

  const activeFraternidad = fraternidades.find(f => f.id === selectedFraternidadId) || null;

  return (
    <FraternidadContext.Provider
      value={{
        fraternidades,
        selectedFraternidadId,
        changeFraternidad,
        activeFraternidad,
        isSuperAdmin,
        loading,
        POMALCA_ID
      }}
    >
      {children}
    </FraternidadContext.Provider>
  );
};

export const useFraternidad = () => useContext(FraternidadContext);
