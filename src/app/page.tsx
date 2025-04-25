"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import { Geocoder } from "@mapbox/search-js-react";
import { getRoute, geocode, Coordinate } from "@/services/mapbox";
import { Button } from "@/components/ui/button";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);

  // Function to handle geocoding and update the map
  const handleGeocode = useCallback(
    async (term: string) => {
      const results = await geocode(term);
      if (results && results.length > 0) {
        const location = results[0];
        setDestination(location.coordinate);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [location.coordinate.longitude, location.coordinate.latitude],
            zoom: 12,
          });
        }
      }
    },
    [mapRef]
  );

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is required.");
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLDivElement,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-66.065437, 18.423933],
      zoom: 10,
    });

    mapRef.current.on("load", () => {
      // Get the user's location and set as origin
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: Coordinate = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          };
          setOrigin(userLocation);
          mapRef.current?.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 12,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && origin && destination) {
      (async () => {
        const calculatedRoute = await getRoute(origin, destination);
        setRoute(calculatedRoute.geometry);

        // Add the route as a source and layer on the map
        if (mapRef.current.getSource("route")) {
          (mapRef.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: calculatedRoute.geometry.map((coord) => [
                coord.longitude,
                coord.latitude,
              ]),
            },
          });
        } else {
          mapRef.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: calculatedRoute.geometry.map((coord) => [
                  coord.longitude,
                  coord.latitude,
                ]),
              },
            },
          });

          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "hsl(var(--primary))", // Use Tailwind CSS variable for the route color
              "line-width": 6,
            },
          });
        }
      })();
    }
  }, [origin, destination]);

  return (
    <div className="relative w-full h-screen">
      {/*       
      <div className="absolute top-4 left-4 z-10 w-96 p-2 rounded-md bg-white/80">
        <Geocoder
          accessToken={mapboxgl.accessToken}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e);
          }}
          onSelect={(e) => {
            handleGeocode(e.result.place_name);
          }}
          placeholder="Search for a destination"
        />
        {origin && destination && (
          <div className="mt-2">
            <p className="text-sm">
              Origin: {origin.latitude}, {origin.longitude}
            </p>
            <p className="text-sm">
              Destination: {destination.latitude}, {destination.longitude}
            </p>
          </div>
        )}
      </div>
      */}
      <div ref={mapContainerRef} id="map" style={{ width: "100%", height: "100%" }} />;
    </div>
  );
};

export default MapboxExample;
