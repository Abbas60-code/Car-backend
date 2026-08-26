import express from 'express';
import { handleContactSubmit, getAllContacts, deleteContact } from '../Controllers/contactController.js';

const router = express.Router();

router.post('/', handleContactSubmit);
router.get('/', getAllContacts);
router.delete('/:id', deleteContact);

export default router;
