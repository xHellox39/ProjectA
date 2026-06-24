import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as userService from './service_user';
import { successResponse, paginatedResponse } from '../../utils/response';

export class UserController {
  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { search, role, is_active } = req.query as any;
      const { users, total } = await userService.getAllUsers(page, limit, search, role, is_active);
      res.json(paginatedResponse(users, page, limit, total));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const user = await userService.getUserById(String(req.params.id));
      if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
      res.json(successResponse(user));
    } catch (error: any) { res.status(500).json({ success: false, error: { message: error.message } }); }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, phone, role } = req.body;
      const user = await userService.createUser(email, password, full_name, phone, role);
      res.status(201).json(successResponse(user, 'User created'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  update = async (req: Request, res: Response) => {
    try {
      const user = await userService.updateUser(String(req.params.id), req.body);
      res.json(successResponse(user, 'User updated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await userService.softDeleteUser(String(req.params.id));
      res.json(successResponse(null, 'User deactivated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  activate = async (req: Request, res: Response) => {
    try {
      const user = await userService.activateUser(String(req.params.id));
      res.json(successResponse(user, 'User activated'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  suspend = async (req: Request, res: Response) => {
    try {
      const user = await userService.suspendUser(String(req.params.id));
      res.json(successResponse(user, 'User suspended'));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };

  changeRole = async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      await userService.changeUserRole(String(req.params.id), role);
      res.json(successResponse(null, `Role changed to ${role}`));
    } catch (error: any) { res.status(400).json({ success: false, error: { message: error.message } }); }
  };
}
