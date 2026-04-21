import { Router } from 'express';
import { updateUserAvatar } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.patch(
  '/users/me/avatar',
  upload.single('avatar'),
  authenticate,
  updateUserAvatar,
);

export default router;
