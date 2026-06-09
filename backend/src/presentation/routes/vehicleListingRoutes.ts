import { Router } from 'express';
import vehicleListingController from '../controllers/VehicleListingController';

const router = Router();

router.get('/',     vehicleListingController.index);
router.get('/:id',  vehicleListingController.show);
router.post('/',    vehicleListingController.store);
router.patch('/:id', vehicleListingController.update);
router.delete('/:id', vehicleListingController.destroy);

router.patch('/:id/approve', vehicleListingController.approve);
router.patch('/:id/reject',  vehicleListingController.reject);
router.patch('/:id/sold',    vehicleListingController.markSold);

export default router;
