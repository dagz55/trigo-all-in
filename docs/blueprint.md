# **App Name**: TriGo

## Core Features:

- Map Display: Display a map using Mapbox GL JS to show the user's current location and the surrounding area.
- Location Search: Implement a geocoder using Mapbox Search JS React to allow users to search for destinations.
- Route Planning: Calculate and display the route between the user's current location and the selected destination using the Mapbox Directions API.

## Style Guidelines:

- Primary color: Use a calming blue (#3498db) for the map background and overall theme.
- Secondary color: Implement a clean white (#ffffff) for text and UI elements on top of the map.
- Accent: Use a vibrant green (#2ecc71) for the route line and interactive elements.
- Ensure the map takes up the majority of the screen, with UI elements like search bars and route information displayed in a non-intrusive manner.
- Use clear and recognizable icons for map markers and points of interest.
- Implement smooth transitions and animations when the map pans, zooms, or updates the route.

## Original User Request:
Implement the following guide to create the TriGo App 

# Integrating Mapbox GL JS with React

For your Next.js/React application, you can integrate Mapbox GL JS in several ways:

1. **Direct integration** - You can use Mapbox GL JS directly in your React components as shown in this example:

```jsx
import React, { useEffect, useRef } from 'react';  
import mapboxgl from 'mapbox-gl';  
  
import 'mapbox-gl/dist/mapbox-gl.css';  
  
const MapboxExample = () => {  
  const mapContainerRef = useRef();  
  const mapRef = useRef();  
  
  useEffect(() => {  
    mapboxgl.accessToken = 'MAPBOX_ACCESS_TOKEN';  
  
    mapRef.current = new mapboxgl.Map({  
      container: mapContainerRef.current,  
      style: 'mapbox://styles/mapbox/dark-v11',  
      center: [-66.065437, 18.423933],  
      zoom: 10  
    });  
  
    return () => {  
      mapRef.current.remove();  
    };  
  }, []);  
  
  return <div ref={mapContainerRef} id="map" style={{ height: '100%' }} />;  
};  
  
export default MapboxExample;
```

This approach is documented in the [Mapbox GL JS documentation](https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-with-flyto/).

2. **Framework integrations** - Mapbox offers several React-specific integrations:
   - You can use `react-mapbox-gl` which provides a React wrapper for Mapbox GL JS [GitHub](https://github.com/alex3165/react-mapbox-gl)
   - For more examples, check out the [Mapbox react examples on GitHub](https://docs.mapbox.com/help/dive-deeper/web-apps/#use-mapbox-gl-js-with-react)

## Implementing Geocoding for Location Search

For location search functionality, you can use the Mapbox Geocoding API with the Search JS React component:

```jsx
import { useRef, useEffect, useState } from "react";  
import { Geocoder } from "@mapbox/search-js-react";  
import mapboxgl from "mapbox-gl";  
import "mapbox-gl/dist/mapbox-gl.css";  
  
const accessToken = "MAPBOX_ACCESS_TOKEN";  
  
export default function MapWithGeocoder() {  
  const mapContainerRef = useRef();  
  const mapInstanceRef = useRef();  
  const [, setMapLoaded] = useState(false);  
  const [inputValue, setInputValue] = useState("");  
  useEffect(() => {  
    mapboxgl.accessToken = accessToken;  
  
    mapInstanceRef.current = new mapboxgl.Map({  
      container: mapContainerRef.current,
      center: [-74.5, 40],
      zoom: 9,  
    });  
  
    mapInstanceRef.current.on("load", () => {  
      setMapLoaded(true);  
    });  
  }, []);  
  
  return (  
    <>  
      <Geocoder  
        accessToken={accessToken}  
        map={mapInstanceRef.current}  
        mapboxgl={mapboxgl}  
        value={inputValue}  
        onChange={(d) => {  
          setInputValue(d);  
        }}  
        marker  
      />  
      <div id="map-container" ref={mapContainerRef} style={{ height: 300 }} />  
    </>  
  );  
}
```

This example comes from the [Mapbox Search JS React integration guide](https://docs.mapbox.com/mapbox-search-js/guides/geocoding/react/#integration-with-a-mapbox-gl-js-map).

## Implementing Directions API for Route Planning

For route planning and navigation, you can use the Mapbox Directions API. There are several ways to implement this:

1. **Using the Mapbox GL Directions plugin** - This is a quick way to add directions functionality to your map:
   - The [Mapbox GL Directions plugin](https://docs.mapbox.com/help/getting-started/directions/#libraries-and-plugins) can be added to your Mapbox GL JS map

2. **Direct API integration** - For more customization, you can use the Directions API directly:
   - The [Mapbox Directions API](https://docs.mapbox.com/help/getting-started/directions/) allows you to create custom routing experiences
   - You can follow the [Getting started with the Mapbox Directions API tutorial](https://docs.mapbox.com/help/tutorials/) for implementation details

## Matrix API for Fare and Time Calculation

For calculating fares and ETAs between multiple points (like in a ride-hailing app), the Matrix API is ideal:

- The [Mapbox Matrix API](https://www.mapbox.com/blog/how-mapbox-empowers-micromobility-platforms-with-cutting-edge-sdks-and-apis) can determine distances and ETAs to all vehicles in a defined boundary
- This is particularly useful for showing available vehicles within a certain time range from the user's location

## Real-time Location Tracking

For real-time location tracking, you can combine Mapbox GL JS with your Supabase real-time subscriptions:

1. Use Mapbox GL JS to display the map and vehicle markers
2. Subscribe to location updates via Supabase real-time features
3. Update marker positions on the map as new location data comes in

## Industry-Specific Considerations

Since you're building a ride-hailing app, you might want to consider these specific implementations:

- **For triders**: Implement turn-by-turn navigation using the [Mapbox Navigation SDK](https://www.mapbox.com/blog/webinar-recap-build-smarter-navigation-with-mapbox)
- **For triders**: Implement ETA calculations and real-time trip tracking
- **For dispatchers and admins**: Create admin dashboards using [Mapbox GL JS](https://www.mapbox.com/blog/how-mapbox-empowers-micromobility-platforms-with-cutting-edge-sdks-and-apis) to monitor your fleet in real-time

By leveraging these Mapbox components with our existing tech stack (Next.js, React, Supabase, and PostGIS), you can build a comprehensive ride-hailing platform with advanced mapping and location capabilities.
  