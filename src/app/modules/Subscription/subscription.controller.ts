import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { SubscriptionServices } from "./subscription.service"

const takeSubscription = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const { planId } = req.params
  const subscription = await SubscriptionServices.takeSubscription(
    planId,
    club.id
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription created successfully",
    data: subscription,
  })
})

const getAllSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await SubscriptionServices.getAllSubscriptions(
    req.query
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Subscriptions retrieved successfully",
    data: subscriptions,
  })
})

const getSingleSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionServices.getSingleSubscription(
    req.params.id
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription retrieved successfully",
    data: subscription,
  })
})

const cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionServices.cancelSubscription(
    req.params.id
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription canceled successfully",
    data: subscription,
  })
})

const getCurrentSubscription = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const subscription = await SubscriptionServices.getCurrentSubscription(
    club.id
  )

  if (!subscription) {
    throw new ApiError(404, "Current subscription not found")
  }

  sendResponse(res, {
    statusCode: 200,
    message: "Current subscription retrieved successfully",
    data: subscription,
  })
})

export const SubscriptionControllers = {
  takeSubscription,
  getAllSubscriptions,
  getSingleSubscription,
  getCurrentSubscription,
  cancelSubscription,
}
