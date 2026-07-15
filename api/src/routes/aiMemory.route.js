import express from 'express';
import { getMemory, updateMemory } from '../controllers/aiMemory.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/get/:userId', verifyToken, getMemory);
router.put('/update/:userId', verifyToken, updateMemory);

export default router;
