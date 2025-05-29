import React, { useEffect, useRef } from 'react';

function Map({ address }) {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize Google Map
    const initMap = () => {
      const geocoder = new window.google.maps.Geocoder();
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: 26.9124, lng: 75.7873 } // Default to Jaipur
      });

      // Geocode the address
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            title: 'Pickup Location'
          });
        } else {
          console.error('Geocode was not successful: ' + status);
        }
      });
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [address]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '300px' }}
      className="rounded-lg border"
    />
  );
}

export default Map;