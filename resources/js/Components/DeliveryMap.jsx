import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Navigation, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const MAP_STYLES = { width: '100%', height: '200px', borderRadius: '8px' };

export default function DeliveryMap({ lat, lng, address, orderId }) {
    const hasCoords = lat != null && lng != null;

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    function openNavigation() {
        // Opens Google Maps turn-by-turn navigation to the delivery address
        const dest = hasCoords ? `${lat},${lng}` : encodeURIComponent(address);
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
            '_blank'
        );
    }

    // Fallback: no coordinates stored (older orders or Maps not configured)
    if (!hasCoords) {
        return (
            <div className="space-y-2">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {address}
                </p>
                <Button size="sm" variant="secondary" onClick={openNavigation} className="w-full">
                    <Navigation className="h-3 w-3 mr-2" />
                    Navigate to address
                </Button>
            </div>
        );
    }

    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

    if (loadError) {
        return (
            <div className="space-y-2">
                <p className="text-xs text-red-400">Map unavailable</p>
                <p className="text-xs text-gray-500">📍 {address}</p>
                <Button size="sm" variant="secondary" onClick={openNavigation} className="w-full">
                    <Navigation className="h-3 w-3 mr-2" />
                    Open in Google Maps
                </Button>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading map…
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <GoogleMap
                mapContainerStyle={MAP_STYLES}
                center={position}
                zoom={16}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    gestureHandling: 'cooperative',
                }}
            >
                <Marker
                    position={position}
                    title={address}
                />
            </GoogleMap>

            <p className="text-xs text-gray-500 flex items-start gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5 text-[#E8622A]" />
                {address}
            </p>

            <Button size="sm" variant="secondary" onClick={openNavigation} className="w-full">
                <Navigation className="h-3 w-3 mr-2" />
                Navigate — Order #{orderId}
            </Button>
        </div>
    );
}
