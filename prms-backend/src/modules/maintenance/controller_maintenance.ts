import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as maintenanceService from './service_maintenance';
import { successResponse, paginatedResponse } from '../../utils/response';

export class MaintenanceController {
  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { tickets, total } = await maintenanceService.getTickets(page, limit);
      res.json(paginatedResponse(tickets, page, limit, total));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const ticket = await maintenanceService.getTicketById(String(req.params.id));
      if (!ticket) return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
      res.json(successResponse(ticket));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const ticket = await maintenanceService.createTicket(req.body, req.user!.id);
      res.status(201).json(successResponse(ticket, 'Ticket created'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  update = async (req: Request, res: Response) => {
    try {
      const ticket = await maintenanceService.updateTicket(String(req.params.id), req.body);
      res.json(successResponse(ticket, 'Ticket updated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  resolve = async (req: Request, res: Response) => {
    try {
      const ticket = await maintenanceService.resolveTicket(String(req.params.id));
      res.json(successResponse(ticket, 'Ticket resolved'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };
}
