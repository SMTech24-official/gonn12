import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { SubscriptionPlanControllers } from "./subscriptionPlan.controller"

const router = express.Router()

router.post(
  "/",
  auth(UserRole.ADMIN),
  SubscriptionPlanControllers.createSubscriptionPlan
)
router.get("/", SubscriptionPlanControllers.getAllSubscriptionPlans)
router.get("/:id", SubscriptionPlanControllers.getSingleSubscriptionPlan)
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  SubscriptionPlanControllers.updateSubscriptionPlan
)
router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  SubscriptionPlanControllers.deleteSubscriptionPlan
)

export const SubscriptionPlanRoutes = router
