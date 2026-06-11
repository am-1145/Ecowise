export interface IRouteOption {
  mode: 'driving' | 'transit' | 'cycling' | 'walking' | 'ev';
  distanceKm: number;
  durationMinutes: number;
  carbonEmissionKg: number;
  carbonSavedKg: number; // compared to standard driving
  polyline: string; // for mock rendering on map
}

export interface INearbyService {
  name: string;
  type: 'ev_station' | 'recycling' | 'solar' | 'store';
  address: string;
  lat: number;
  lng: number;
  rating: number;
  details: string;
}

export class MapService {
  // Emission constants in kg CO2 per km
  private static readonly EMISSIONS = {
    driving: 0.18,
    ev: 0.05,
    transit: 0.04,
    cycling: 0,
    walking: 0
  };

  /**
   * Calculate green routes from start to destination
   */
  static calculateRoutes(origin: string, destination: string): IRouteOption[] {
    // Generate deterministic distances based on the text length to make mock inputs look stable and realistic
    const mockDistance = Math.max(3, (origin.length + destination.length) % 35 + 2.4);

    return [
      {
        mode: 'driving',
        distanceKm: mockDistance,
        durationMinutes: Math.round(mockDistance * 2.5),
        carbonEmissionKg: Math.round(mockDistance * this.EMISSIONS.driving * 100) / 100,
        carbonSavedKg: 0,
        polyline: 'mock_driving_polyline'
      },
      {
        mode: 'ev',
        distanceKm: mockDistance,
        durationMinutes: Math.round(mockDistance * 2.5),
        carbonEmissionKg: Math.round(mockDistance * this.EMISSIONS.ev * 100) / 100,
        carbonSavedKg: Math.round(mockDistance * (this.EMISSIONS.driving - this.EMISSIONS.ev) * 100) / 100,
        polyline: 'mock_ev_polyline'
      },
      {
        mode: 'transit',
        distanceKm: mockDistance * 1.1,
        durationMinutes: Math.round(mockDistance * 3.5),
        carbonEmissionKg: Math.round(mockDistance * 1.1 * this.EMISSIONS.transit * 100) / 100,
        carbonSavedKg: Math.round((mockDistance * this.EMISSIONS.driving - (mockDistance * 1.1 * this.EMISSIONS.transit)) * 100) / 100,
        polyline: 'mock_transit_polyline'
      },
      {
        mode: 'cycling',
        distanceKm: mockDistance * 0.95,
        durationMinutes: Math.round(mockDistance * 4),
        carbonEmissionKg: 0,
        carbonSavedKg: Math.round(mockDistance * this.EMISSIONS.driving * 100) / 100,
        polyline: 'mock_cycling_polyline'
      },
      {
        mode: 'walking',
        distanceKm: mockDistance * 0.9,
        durationMinutes: Math.round(mockDistance * 12),
        carbonEmissionKg: 0,
        carbonSavedKg: Math.round(mockDistance * this.EMISSIONS.driving * 100) / 100,
        polyline: 'mock_walking_polyline'
      }
    ];
  }

  /**
   * Search nearby sustainability services based on coordinates
   */
  static getNearbyServices(lat: number, lng: number, radiusKm: number = 5): INearbyService[] {
    // Generate 4 mock services positioned slightly offset from user coordinates
    return [
      {
        name: 'EcoWise Community Recycling Depot',
        type: 'recycling',
        address: '42 Greenway Ave, EcoCity',
        lat: lat + 0.008,
        lng: lng - 0.005,
        rating: 4.8,
        details: 'Accepts plastics, metals, paper, and electronic waste (e-waste).'
      },
      {
        name: 'Voltaic Level 3 Fast EV Station',
        type: 'ev_station',
        address: '102 Chargepoint Blvd, EcoCity',
        lat: lat - 0.006,
        lng: lng + 0.009,
        rating: 4.7,
        details: '2x 150kW CCS chargers, 1x CHAdeMO plug. 100% renewable power.'
      },
      {
        name: 'Solace Clean Energy Solutions',
        type: 'solar',
        address: '315 Solar Way, EcoCity',
        lat: lat + 0.012,
        lng: lng + 0.004,
        rating: 4.9,
        details: 'Local residential solar panel installers and smart home energy audits.'
      },
      {
        name: 'The Zero Waste Grocery Store',
        type: 'store',
        address: '88 Bulk Retail Rd, EcoCity',
        lat: lat - 0.003,
        lng: lng - 0.007,
        rating: 4.6,
        details: 'Organic grains, beans, soaps, and produce in bulk. Bring your own containers!'
      }
    ];
  }
}
