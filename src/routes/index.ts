import { Router } from 'express';
import { getChat, postAsk, postClear, getSettings, postSettings } from '../controllers/chatController';

const router = Router();

router.get('/', getChat);
router.post('/ask', postAsk);
router.post('/clear', postClear);
router.get('/settings', getSettings);
router.post('/settings', postSettings);

export default router;