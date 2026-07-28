import { useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import * as geofire from 'geofire-common';

// Keep this in sync with the libraries list used by the map container.
const LIBRARIES = ['places'];

/**
 * A self-contained address input that uses Google Places Autocomplete.
 *
 * Behavior:
 * - Suggests real addresses as the user types.
 * - Only accepts addresses picked from the dropdown; free-text typing leaves the location unset.
 * - Computes a geohash from the selected place's lat/lng and reports it to the parent.
 * - Shows a small help line below the field and an optional error message.
 */
export default function AddressInput({
    value,
    onTextChange,
    onLocationSelected,
    error,
    name,
    className,
}) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
        language: 'iw',
    });

    const [autocomplete, setAutocomplete] = useState(null);

    const handleLoad = (activeAutocomplete) => setAutocomplete(activeAutocomplete);

    const handlePlaceChanged = () => {
        if (!autocomplete) return;

        const place = autocomplete.getPlace();

        if (!place?.geometry?.location) {
            return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const geohash = geofire.geohashForLocation([lat, lng]);
        const address = place.formatted_address || place.name || '';

        onLocationSelected({
            address,
            location: { geohash, lat, lng },
        });
    };

    const helpStyle = {
        display: 'block',
        fontSize: '12px',
        color: '#6B7280',
        marginTop: '-12px',
        marginBottom: '16px',
        lineHeight: '1.4',
    };

    if (!isLoaded) {
        return (
            <>
                <input
                    type="text"
                    placeholder="טוען..."
                    disabled
                    readOnly
                    className={className}
                />
                <span style={helpStyle}>* הכנס כתובת בה אנשים אחרים יוכלו לראות ולמצוא אותך</span>
                {error && <span className="error-msg">{error}</span>}
            </>
        );
    }

    return (
        <>
            <Autocomplete
                onLoad={handleLoad}
                onPlaceChanged={handlePlaceChanged}
                options={{ types: ['address'] }}
            >
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={(event) => onTextChange(event.target.value)}
                    placeholder="הקלד/י כתובת ובחר/י מהרשימה..."
                    className={className}
                    autoComplete="off"
                />
            </Autocomplete>
            {error && <span className="error-msg">{error}</span>}
        </>
    );
}
