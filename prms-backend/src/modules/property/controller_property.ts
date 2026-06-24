import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../../middleware/auth';
import * as propertyService from './service_property';
import { successResponse, paginatedResponse } from '../../utils/response';

export class PropertyController {
  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { properties, total } = await propertyService.getAllProperties(page, limit);
      res.json(paginatedResponse(properties, page, limit, total));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const property = await propertyService.getPropertyById(String(req.params.id));
      if (!property) return res.status(404).json({ success: false, error: { message: 'Property not found' } });
      res.json(successResponse(property));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  create = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: { message: errors.array()[0].msg } });
    try {
      const property = await propertyService.createProperty(req.body, req.user!.id);
      res.status(201).json(successResponse(property, 'Property created'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const property = await propertyService.updateProperty(String(req.params.id), req.body);
      res.json(successResponse(property, 'Property updated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  deactivate = async (req: Request, res: Response) => {
    try {
      await propertyService.deactivateProperty(String(req.params.id));
      res.json(successResponse(null, 'Property deactivated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  addImage = async (req: Request, res: Response) => {
    try {
      const image = await propertyService.addImage(String(req.params.id), req.body.url);
      res.status(201).json(successResponse(image));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  deleteImage = async (req: Request, res: Response) => {
    try {
      await propertyService.deleteImage(String(req.params.imageId));
      res.json(successResponse(null, 'Image deleted'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  myProperties = async (req: AuthRequest, res: Response) => {
    try {
      const properties = await propertyService.getLandlordProperties(req.user!.id);
      res.json(successResponse(properties));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };
}
