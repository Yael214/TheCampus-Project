import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import PartnerCard from '../../pages/PartnerCard.jsx';

// Map container styling
const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px'
};


function MapContainer({ center, partners, selectedPartner, onPartnerSelect }) {
  const [radius, setRadius] = useState(10); // Radius state in kilometers

  // Load the Google Maps API JavaScript SDK
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "" 
  });

  if (loadError) return <div>Error loading maps environment</div>;
  if (!isLoaded) return <div>Loading Map Components...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      {partners.map((user) => {
        if (!user.location || typeof user.location.lat !== 'number' || typeof user.location.lng !== 'number') {
          return null;
        }

        return (
            <MarkerF
              key={user.id}
              position={{ lat: user.location.lat, lng: user.location.lng }}
              title={user.fullName}
              onClick={() => onPartnerSelect(user)}
            />
        );
      })}
    </GoogleMap>
  );
}

export default MapContainer;