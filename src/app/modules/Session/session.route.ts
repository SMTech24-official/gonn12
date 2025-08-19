import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { SessionControllers } from "./session.controller"

const router = express.Router()

router.post("/", auth(UserRole.CLUB_OWNER), SessionControllers.createSession)
router.get("/", SessionControllers.getAllSessions)
router.get(
  "/my-club",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.getMyClubSessions
)

router.get(
  "/active",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.getActiveSession
)

router.get(
  "/summary",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.getSessionSummary
)

router.get("/:id", auth(), SessionControllers.getSingleSession)
router.patch(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.updateSession
)
router.delete(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.deleteSession
)

router.post(
  "/:id/end",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.endSession
)

export const SessionRoutes = router
