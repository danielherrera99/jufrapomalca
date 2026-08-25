import React, { useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const LocationListener = ({ onChange }) => {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handlers = useMemo(() => ({
    click(e) {
      if (onChangeRef.current) {
        onChangeRef.current(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      }
    }
  }), []);

  useMapEvents(handlers);
  return null;
};

const MapPicker = ({ lat, lng, onChange }) => {
  const defaultPosition = [-6.764, -79.866]; 
  const position = useMemo(() => [lat || defaultPosition[0], lng || defaultPosition[1]], [lat, lng]);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          if (onChangeRef.current) {
            onChangeRef.current(Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6)));
          }
        }
      },
    }),
    []
  );

  return (
    <div style={{ height: '230px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginTop: '0.5rem', position: 'relative' }}>
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationListener onChange={onChange} />
        {lat && lng && (
          <Marker 
            position={[lat, lng]} 
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
        )}
      </MapContainer>
      <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 12px', bottom: '10px', left: '10px', fontSize: '11px', borderRadius: '6px', zIndex: 1000, pointerEvents: 'none', fontWeight: 'bold' }}>📍 Arrastra el pin o haz clic en cualquier lugar</div>
    </div>
  );
};

export default React.memo(MapPicker);
