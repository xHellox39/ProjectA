import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly, adminOrLandlord } from '../../middleware/rbac';
import { UserController } from './controller_user';

const router = express.Router();
const ctrl = new UserController();

router.use(authenticate);
router.get('/', adminOrLandlord, ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', adminOnly, ctrl.create);
router.put('/:id', adminOnly, ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);
router.post('/:id/activate', adminOnly, ctrl.activate);
router.post('/:id/suspend', adminOnly, ctrl.suspend);
router.post('/:id/change-role', adminOnly, ctrl.changeRole);

export default router;
