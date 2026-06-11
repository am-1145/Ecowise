import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MapService } from '../services/mapService';

export class MapController {
  /**
   * Compare routes and calculate carbon savings
   */
  static planRoute(req: AuthRequest, res: Response) {
    try {
      const { origin, destination } = req.query;

      if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination coordinates/names are required.' });
      }

      const routes = MapService.calculateRoutes(origin as string, destination as string);
      return res.json({ origin, destination, routes });
    } catch (error) {
      console.error('[mapController.ts:planRoute] Error:', error);
      return res.status(500).json({ error: 'Failed to compute green route suggestions.' });
    }
  }

  /**
   * Fetch nearby eco stations (EV charger, recycling, eco shops)
   */
  static getServices(req: AuthRequest, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string) || 37.7749; // Default San Francisco
      const lng = parseFloat(req.query.lng as string) || -122.4194;
      const radius = parseFloat(req.query.radius as string) || 5;

      const services = MapService.getNearbyServices(lat, lng, radius);
      return res.json({ lat, lng, radius, services });
    } catch (error) {
      console.error('[mapController.ts:getServices] Error:', error);
      return res.status(500).json({ error: 'Failed to scan nearby sustainable facilities.' });
    }
  }
}
