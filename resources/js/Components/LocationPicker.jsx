import { useCallback, useRef, useState } from 'react';
import {
    Autocomplete,
    GoogleMap,
    Marker,
    useJsApiLoader,
} from '@react-google-maps/api';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Defined outside component to keep reference stable across renders
const LIBRARIES = ['places'];
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Manila

const MAP_STYLES = { width: '100%', height: '240px', borderRadius: '8px' };

export default function LocationPicker({ value, onChange, className }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const autocompleteRef = useRef(null);
    const [mapCenter, setMapCenter] = useState(
        value?.lat && value?.lng
            ? { lat: parseFloat(value.lat), lng: parseFloat(value.lng) }
            : DEFAULT_CENTER
    );
    const [markerPos, setMarkerPos] = useState(
        value?.lat && value?.lng
            ? { lat: parseFloat(value.lat), lng: parseFloat(value.lng) }
            : null
    );

    const onPlaceChanged = useCallback(() => {
        const place = autocompleteRef.current?.getPlace();
        if (!place?.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const pos = { lat, lng };

        setMapCenter(pos);
        setMarkerPos(pos);
        onChange({ address: place.formatted_address, lat, lng });
    }, [onChange]);

    const onMarkerDragEnd = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });

        // Reverse geocode the dragged position
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const address =
                status === 'OK' && results[0]
                    ? results[0].formatted_address
                    : value?.address ?? '';
            onChange({ address, lat, lng });
        });
    }, [onChange, value?.address]);

    const onMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const address =
                status === 'OK' && results[0]
                    ? results[0].formatted_address
                    : value?.address ?? '';
            onChange({ address, lat, lng });
        });
    }, [onChange, value?.address]);

    if (loadError) {
        return (
            <div className="space-y-2">
                <p className="text-xs text-red-500">Google Maps failed to load. Check your API key.</p>
                <input
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622A]"
                    value={value?.address ?? ''}
                    onChange={e => onChange({ address: e.target.value, lat: null, lng: null })}
                    placeholder="Enter delivery address"
                />
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2 h-10 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading map…
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            {/* Autocomplete search box */}
            <Autocomplete
                onLoad={ref => (autocompleteRef.current = ref)}
                onPlaceChanged={onPlaceChanged}
                options={{ componentRestrictions: { country: 'ph' } }}
            >
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E8622A]" />
                    <input
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622A] focus-visible:ring-offset-2"
                        value={value?.address ?? ''}
                        onChange={e => onChange({ ...value, address: e.target.value })}
                        placeholder="Search your delivery address…"
                    />
                </div>
            </Autocomplete>

            {/* Map */}
            <GoogleMap
                mapContainerStyle={MAP_STYLES}
                center={mapCenter}
                zoom={markerPos ? 16 : 12}
                onClick={onMapClick}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                {markerPos && (
                    <Marker
                        position={markerPos}
                        draggable
                        onDragEnd={onMarkerDragEnd}
                        title="Drag to adjust"
                    />
                )}
            </GoogleMap>

            {markerPos ? (
                <p className="text-xs text-[#2A6E52] flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Pin dropped — drag it to fine-tune your location
                </p>
            ) : (
                <p className="text-xs text-gray-400">
                    Search for your address above or click the map to drop a pin
                </p>
            )}
        </div>
    );
}
