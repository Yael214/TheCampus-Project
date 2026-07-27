import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '18px',
};

const LIBRARIES = ['places'];

function MapContainer({ center, partners, onPartnerSelect }) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
        language: 'iw',
    });

    if (loadError) return <div>Error loading maps environment</div>;
    if (!isLoaded) return <div>Loading Map Components...</div>;

    return (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
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