import { Router } from 'express';
import { getEventAlbum, addPhotoToAlbum, publishAlbum } from '../controllers/galleryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../services/storageService.js';

const router = Router();

router.get('/event/:eventId', getEventAlbum);
router.post(
  '/event/:eventId/photos',
  authenticate,
  authorize('organizer', 'admin'),
  upload.single('photo'),
  addPhotoToAlbum
);
router.post('/event/:eventId/publish', authenticate, authorize('organizer', 'admin'), publishAlbum);

export default router;
