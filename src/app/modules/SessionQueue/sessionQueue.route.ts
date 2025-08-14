import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { sessionQueueController } from "./sessionQueue.controller"
const router = express.Router()

router.get(
  "/current",
  auth(UserRole.CLUB_OWNER),
  sessionQueueController.getCurrentSessionQueue
)

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

router.delete(
  "/:participantId",
  auth(UserRole.CLUB_OWNER),
  sessionQueueController.deleteQueueParticipant
)

export const SessionQueueRoutes = router
