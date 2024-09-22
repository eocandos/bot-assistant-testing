import express from 'express';
import { handleWebhookPost, handleWebhookGet } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/', handleWebhookPost);
router.get('/', handleWebhookGet);

export default router;
