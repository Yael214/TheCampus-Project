import { useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import * as geofire from 'geofire-common';

// Must match the libraries list in MapContainer so the Google script loads with the same options.
const LIBRARIES = ['places'];

/**
 * A self-contained address input.
 *
 * Behavior:
 *  - Uses Google Places Autocomplete (type: 'address') to suggest real addresses as the user types.
 *  - Only accepts addresses picked from the dropdown - free text typing leaves the location unset.
 *  - When the user picks a suggestion, the component computes a geohash from the place's lat/lng
 *    using geofire-common and reports { address, location: { geohash, lat, lng } } to the parent.
 *  - Shows a fixed help line below the field about how the address will be used.
 *  - Shows an error message below the help line if provided.
 *
 * Props:
 *  - value: the address text currently displayed in the input
 *  - onTextChange(text): called on every keystroke (parent should clear the saved location since
 *    typing free text invalidates the previous selection)
 *  - onLocationSelected({ address, location: { geohash, lat, lng } }): called when the user picks
 *    a valid place from the dropdown
 *  - error: optional error message to display
 *  - name, className: forwarded to the underlying <input>
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

    const handleLoad = (ac) => setAutocomplete(ac);

    const handlePlaceChanged = () => {
        if (!autocomplete) return;
        const place = autocomplete.getPlace();

        // place.geometry is missing when the user pressed Enter without picking a suggestion.
        // Ignore - the parent will keep treating the field as invalid.
        if (!place || !place.geometry || !place.geometry.location) {
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

    // While the Google script is still loading, render a disabled input so the layout doesn't jump.
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
                <span style={helpStyle}>
                    * הכנס כתובת בה אנשים אחרים יוכלו לראות ולמצוא אותך 
                </span>
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
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="הקלד/י כתובת ובחר/י מהרשימה..."
                    className={className}
                    autoComplete="off"
                />
            </Autocomplete>
            {/*<span style={helpStyle}>
                * הכנס כתובת שאנשים אחרים יוכלו לראות ולמצוא אותך שם, הכתובת המדוייקת לא תוצג למשתמשים האחרים
            </span>*/}
            {error && <span className="error-msg">{error}</span>}
        </>
    );
}
