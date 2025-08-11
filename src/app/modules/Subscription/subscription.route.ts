import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { SubscriptionControllers } from "./subscription.controller"

const router = express.Router()

router.post(
  "/take/:planId",
  auth(UserRole.CLUB_OWNER),
  SubscriptionControllers.takeSubscription
)
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SubscriptionControllers.getAllSubscriptions
)
router.get(
  "/current",
  auth(UserRole.CLUB_OWNER),
  SubscriptionControllers.getCurrentSubscription
)
router.get("/:id", SubscriptionControllers.getSingleSubscription)
router.delete(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SubscriptionControllers.cancelSubscription
)

export const SubscriptionRoutes = router
