import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useNearbyUsers } from '../../hooks/useNearbyUsers';

// Map container styling
const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px'
};

// Default map center (Tel Aviv area)
const defaultCenter = {
  lat: 31.788,
  lng: 35.2112
};

function MapContainer() {
  const [radius, setRadius] = useState(10); // Radius state in kilometers

  // Fetching live data using Avital's custom geo-radius hook
  const { nearbyUsers, loading, error } = useNearbyUsers(defaultCenter, radius);

  // Load the Google Maps API JavaScript SDK
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "" 
  });

  // Handle API loading or database query errors
  if (loadError || error) {
    console.error("Maps context or hook replication error:", loadError || error);
    return <div>Error loading maps environment</div>;
  }

  // Show loading state while API is fetching
  if (!isLoaded) {
    return <div>Loading Map Components...</div>;
  }

  // Handler for slider changes
  const handleRadiusChange = (e) => {
    const newRadius = Number(e.target.value);
    setRadius(newRadius);
    console.log(`Search radius updated to: ${newRadius} km`);
  };

  // Restored handler for marker clicks to prevent runtime failures
  const handleMarkerClick = (username) => {
    console.log(`Marker selected for user: ${username}`);
    alert(`לחצת על השותף: ${username}`);
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      
      {/* Radius Slider Section */}
      <div style={{ marginBottom: '20px', fontFamily: 'sans-serif' }}>
        <label style={{ fontWeight: 'bold' }}>
          רדיוס חיפוש: {radius} ק"מ
          {loading ? " (מעדכן שותפים...)" : ` (נמצאו ${nearbyUsers?.length || 0} שותפים)`}
        </label>
        <input 
          id="radius-slider"
          type="range" 
          min="1" 
          max="50" 
          value={radius} 
          onChange={handleRadiusChange}
          style={{ marginRight: '15px', marginLeft: '15px', verticalAlign: 'middle', width: '200px' }}
        />
      </div>

      {/* Google Map Implementation */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
      >
        {
          console.log("Rendering map with nearby users:", nearbyUsers)
        }
        {/* Render real pins dynamically fetched and filtered by the hook */}
        {!loading && nearbyUsers && nearbyUsers.map((user) => {
          console.log("Processing user in map loop:", user.id, user.name, user.location);
          
          // Safety check: Ensure the user document contains valid nested location properties
          if (!user.location || typeof user.location.lat !== 'number' || typeof user.location.lng !== 'number') {
            console.warn(`User ${user.id} is missing valid latitude/longitude numbers`);
            return null;
          }

          // Explicitly returning the MarkerF component
          return (
            <MarkerF
              key={user.id}
              position={{
                lat: user.location.lat,
                lng: user.location.lng
              }}
              title={user.name}
              onClick={() => handleMarkerClick(user.name)}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}

export default MapContainer;