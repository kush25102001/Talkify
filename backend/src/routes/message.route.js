import express from 'express';
import { getAllContacts, getChatPartners, getMessageById, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router=express.Router();

router.use(protectRoute)

router.get('/contacts', getAllContacts);
router.get('/chats',getChatPartners);
router.get('/:id', getMessageById);
router.post('/send/:id',sendMessage);

export default router;
