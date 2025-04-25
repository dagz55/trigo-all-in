"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getRoute, geocode, Coordinate } from "@/services/mapbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
  const [routeCoords, setRouteCoords] = useState<number[][] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [showFare, setShowFare] = useState(false);

  // Function to handle geocoding and update the map
  const handleGeocode = useCallback(
    async (term: string) => {
      const results = await geocode(term);
      if (results && results.length > 0) {
        const location = results[0];
        setDestination(location.coordinate);
        setDropoffLat(location.coordinate.latitude);
        setDropoffLng(location.coordinate.longitude);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [location.coordinate.longitude, location.coordinate.latitude],
            zoom: 12,
          });
        }
        setShowFare(true);
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
          setPickupLat(position.coords.latitude);
          setPickupLng(position.coords.longitude);

          mapRef.current?.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 12,
          });

          // Add pickup marker
          new mapboxgl.Marker({ color: "green" })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(mapRef.current);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    });

    mapRef.current.on('click', (e) => {
      const clickedCoordinate: Coordinate = {
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
      };

      setDestination(clickedCoordinate);
      setDropoffLat(e.lngLat.lat);
      setDropoffLng(e.lngLat.lng);
      setShowFare(true);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (pickupLng && pickupLat && dropoffLng && dropoffLat) {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          setRouteCoords(data.routes[0].geometry.coordinates);
          setDistance(data.routes[0].distance);
          setDuration(data.routes[0].duration);
        }
      }
    };

    fetchRoute();
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);


  useEffect(() => {
    if (mapRef.current && origin && destination) {
      (async () => {
        const calculatedRoute = getRoute(origin, destination);
        calculatedRoute.then(route => {
          setRoute(route.geometry);

          // Add the route as a source and layer on the map
          if (mapRef.current.getSource("route")) {
            (mapRef.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route.geometry.map((coord) => [
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
                  coordinates: route.geometry.map((coord) => [
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
                "line-color": "#00BFFF",
                "line-width": 5,
                "line-opacity": 0.9,
              },
            });
          }

          // Add dropoff marker
          if (destination) {
            new mapboxgl.Marker({ color: "red" })
              .setLngLat([destination.longitude, destination.latitude])
              .addTo(mapRef.current);
          }
        })

      })();
    }
  }, [origin, destination]);

  const handleConfirm = () => {
    alert("Booking Confirmed!");
    setShowFare(false);
    setSearchTerm("");
    setDestination(null);
    setDropoffLat(null);
    setDropoffLng(null);
    setRouteCoords(null);
    setDistance(null);
    setDuration(null);
    if (mapRef.current) {
      mapRef.current.removeLayer('route');
      mapRef.current.removeSource('route');
    }

  };

  const handleCancel = () => {
    setShowFare(false);
    setSearchTerm("");
    setDestination(null);
    setDropoffLat(null);
    setDropoffLng(null);
    setRouteCoords(null);
    setDistance(null);
    setDuration(null);
    if (mapRef.current) {
      mapRef.current.removeLayer('route');
      mapRef.current.removeSource('route');
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-10 w-96 p-2 rounded-md bg-white/80">
        <input
          type="text"
          placeholder="Search for a destination"
          className="w-full p-2 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleGeocode(searchTerm);
            }
          }}
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
      {showFare && destination && (
        <div className="absolute top-4 right-4 z-10 w-96 p-4 rounded-md bg-white/80">
          <Card>
            <CardHeader>
              <CardTitle>Fare Details</CardTitle>
              <CardDescription>Confirm or cancel your booking</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Distance: {(distance || 0) / 1000} km</p>
              <p>Duration: {(duration || 0) / 60} minutes</p>
              <p>Estimated Fare: ${((distance || 0) / 1000) * 2 + ((duration || 0) / 60) * 0.5}</p>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleConfirm}>Confirm Booking</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div ref={mapContainerRef} id="map" style={{ width: "100%", height: "100%" }} >
      </div>
    </div>
  );
};

export default MapboxExample;
