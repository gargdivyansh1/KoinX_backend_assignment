import { Router } from "express";
import { deviation, getStates } from "../controllers/crypto.controllers.js";

const router = Router()

router.route('/stats').get(getStates)
router.route('/deviation').get(deviation)

export default router