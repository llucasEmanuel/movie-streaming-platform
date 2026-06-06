import { Router } from "express";
import { getProfile, updateEmail, updateName, updatePassword, updatePhoto, updateProfile } from "../controllers/account-controller";

export const router = Router();

router.get("/:id", getProfile);
router.put("/:id", updateProfile);
router.put("/:id/email", updateEmail);
router.put("/:id/name", updateName);
router.put("/:id/password", updatePassword);
router.put("/:id/photo", updatePhoto);
