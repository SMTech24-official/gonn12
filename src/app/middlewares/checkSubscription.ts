import { NextFunction, Request, Response } from "express"
import { SubscriptionServices } from "../modules/Subscription/subscription.service"
import prisma from "../../shared/prisma"

import { Subscription } from "@prisma/client"

const checkSubscription = (clubId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          clubId,
          isActive: true,
        },
      })

      if (!subscription) {
        return res.status(403).json({ message: "No active subscription found" })
      }

      if (new Date() > subscription.endDate) {
        return res.status(403).json({ message: "Subscription has expired" })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
