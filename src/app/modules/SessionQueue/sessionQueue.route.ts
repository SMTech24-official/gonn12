import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { sessionQueueController } from "./sessionQueue.controller"
const router = express.Router()

router.get(
  "/:sessionId",
  auth(UserRole.CLUB_OWNER),
  sessionQueueController.getSessionQueueBySessionId
)

router.get(
  "/:sessionId/participants",
  auth(UserRole.CLUB_OWNER),
  sessionQueueController.getSessionQueueParticipants
)

export const SessionQueueRoutes = router
