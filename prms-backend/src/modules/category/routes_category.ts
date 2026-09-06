import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { CategoryController } from './controller_category';

const router = express.Router();
const ctrl = new CategoryController();

router.use(authenticate);

// --- STATIC ROUTES MUST COME BEFORE PARAMETRIC ROUTES (/:id) ---

// Shared categories - any authenticated user can read always
router.get('/shared', ctrl.shared);

// Non-admin: list only own personal categories
router.get('/personal', ctrl.personalList);

// Any authenticated user: get by id (after /shared and /personal)
router.get('/:id', ctrl.getById);

// Admin: full management of all categories (auto-seeds if empty)
router.get('/', adminOnly, ctrl.adminList);
router.post('/', adminOnly, ctrl.create);
router.put('/:id', adminOnly, ctrl.update);
router.patch('/:id/toggle', adminOnly, ctrl.toggle);
router.patch('/:id/restore', adminOnly, ctrl.restore);
router.delete('/:id', adminOnly, ctrl.remove);
router.post('/seed', adminOnly, ctrl.seedDefaults);

// Non-admin: manage only their personal categories
router.post('/personal', ctrl.createPersonal);
router.put('/personal/:id', ctrl.updatePersonal);
router.delete('/personal/:id', ctrl.removePersonal);
router.patch('/personal/:id/toggle', ctrl.togglePersonal);

// Generic filtered list (programmatic/API consumers)
router.get('/list', ctrl.list);

export default router;
