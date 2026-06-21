/// <reference types="jest" />

import { describe, it, expect } from '@jest/globals';
import { MapService } from '../services/mapService';

describe('MapService Tests', () => {
  describe('calculateRoutes', () => {
    it('should generate route options with consistent distance, durations, and emissions values', () => {
      const origin = 'San Francisco';
      const destination = 'Oakland';
      const routes = MapService.calculateRoutes(origin, destination);

      expect(routes.length).toBe(5); // driving, ev, transit, cycling, walking
      
      const drivingRoute = routes.find(r => r.mode === 'driving');
      const evRoute = routes.find(r => r.mode === 'ev');
      const cyclingRoute = routes.find(r => r.mode === 'cycling');
      const walkingRoute = routes.find(r => r.mode === 'walking');

      expect(drivingRoute).toBeDefined();
      expect(evRoute).toBeDefined();
      expect(cyclingRoute).toBeDefined();
      expect(walkingRoute).toBeDefined();

      // Cycling and walking must be zero emission
      expect(cyclingRoute!.carbonEmissionKg).toBe(0);
      expect(walkingRoute!.carbonEmissionKg).toBe(0);

      // Ensure distance/duration are deterministic and consistent across modes
      const expectedDrivingDistance = drivingRoute!.distanceKm;
      expect(evRoute!.distanceKm).toBe(expectedDrivingDistance);
      expect(cyclingRoute!.distanceKm).toBeCloseTo(expectedDrivingDistance * 0.95);
      expect(walkingRoute!.distanceKm).toBeCloseTo(expectedDrivingDistance * 0.9);

      // EV route emission must be lower than standard driving
      expect(evRoute!.carbonEmissionKg).toBeLessThan(drivingRoute!.carbonEmissionKg);
      expect(evRoute!.carbonSavedKg).toBeGreaterThan(0);

      // Carbon saved should be non-negative for all non-driving modes
      const nonDriving = routes.filter(r => r.mode !== 'driving');
      nonDriving.forEach(r => {
        expect(r.carbonSavedKg).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getNearbyServices', () => {
    it('should return mock sustainability facilities with correct ratings, addresses, details, distance, and ports', () => {
      const services = MapService.getNearbyServices(37.7749, -122.4194, 5);

      expect(services.length).toBe(4);

      const evStation = services.find(s => s.type === 'ev_station');
      const recyclingDepot = services.find(s => s.type === 'recycling');

      expect(evStation).toBeDefined();
      expect(evStation!.chargingPorts).toBe(4);
      expect(evStation!.distanceMiles).toBe(1.2);
      expect(evStation!.rating).toBe(4.7);

      expect(recyclingDepot).toBeDefined();
      expect(recyclingDepot!.distanceMiles).toBe(0.8);
      expect(recyclingDepot!.rating).toBe(4.8);
    });
  });
});
