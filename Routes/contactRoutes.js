import express from 'express';
import { handleContactSubmit } from '../Controllers/contactController.js';

const router = express.Router();

router.post('/', handleContactSubmit);

export default router;
