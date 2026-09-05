import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly, adminOrLandlord } from '../../middleware/rbac';
import { CategoryController } from './controller_category';

const router = express.Router();
const ctrl = new CategoryController();

router.use(authenticate);

// Shared categories - any authenticated user can read always
router.get('/shared', ctrl.shared);

// Admin: full management of all categories
router.get('/', adminOnly, ctrl.list);
router.post('/', adminOnly, ctrl.create);
router.post('/seed', adminOnly, ctrl.seedDefaults);

// Non-admin: list only own personal categories
router.get('/personal', ctrl.personalList);

// Any authenticated user: view own shared or get by id
router.get('/:id', ctrl.getById);

// Non-admin: manage only their personal categories
router.post('/personal', ctrl.createPersonal);
router.put('/personal/:id', ctrl.updatePersonal);
router.delete('/personal/:id', ctrl.removePersonal);
router.patch('/personal/:id/toggle', ctrl.togglePersonal);

// Admin endpoints for CRUD
router.put('/:id', adminOnly, ctrl.update);
router.patch('/:id/toggle', adminOnly, ctrl.toggle);
router.delete('/:id', adminOnly, ctrl.remove);

export default router;
