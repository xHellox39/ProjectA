import express from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOrLandlord } from '../../middleware/rbac';
import { createPropertyBody, updatePropertyBody } from './dto';
import { PropertyController } from './controller_property';

const router = express.Router();
const ctrl = new PropertyController();

router.get('/', ctrl.list);
router.get('/my-properties', authenticate, ctrl.myProperties);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, adminOrLandlord, createPropertyBody, ctrl.create);
router.put('/:id', authenticate, adminOrLandlord, updatePropertyBody, ctrl.update);
router.delete('/:id', authenticate, ctrl.deactivate);
router.post('/:id/images', authenticate, ctrl.addImage);
router.delete('/images/:imageId', authenticate, ctrl.deleteImage);

export default router;
