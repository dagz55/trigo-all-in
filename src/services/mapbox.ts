/**
 * Represents a geographical coordinate.
 */
export interface Coordinate {
  /**
   * The longitude of the coordinate.
   */
  longitude: number;
  /**
   * The latitude of the coordinate.
   */
  latitude: number;
}

/**
 * Represents a location with a name and geographical coordinates.
 */
export interface Location {
  /**
   * The name of the location.
   */
  name: string;
  /**
   * The geographical coordinates of the location.
   */
  coordinate: Coordinate;
}

/**
 * Represents a route between two locations.
 */
export interface Route {
  /**
   * The distance of the route in meters.
   */
  distance: number;
  /**
   * The estimated travel time of the route in seconds.
   */
  duration: number;
  /**
   * The geographical coordinates that make up the route.
   */
  geometry: Coordinate[];
}


/**
 * Geocodes a search term into a location.
 *
 * @param searchTerm The search term to geocode.
 * @returns A promise that resolves to a Location object.
 */
export async function geocode(searchTerm: string): Promise<Location[]> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features.map((feature: any) => ({
        name: feature.place_name,
        coordinate: {
          longitude: feature.center[0],
          latitude: feature.center[1],
        },
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
}

/**
 * Calculates the route between two locations.
 *
 * @param origin The starting location.
 * @param destination The ending location.
 * @returns A promise that resolves to a Route object.
 */
export async function getRoute(origin: Coordinate, destination: Coordinate): Promise<Route> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry.coordinates.map((coord: number[]) => ({
          longitude: coord[0],
          latitude: coord[1],
        })),
      };
    } else {
      return {
        distance: 0,
        duration: 0,
        geometry: [],
      };
    }
  } catch (error) {
    console.error("Directions API error:", error);
    return {
      distance: 0,
      duration: 0,
      geometry: [],
    };
  }
}
