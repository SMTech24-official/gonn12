import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { SubscriptionServices } from "./subscription.service"

const createSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionServices.createSubscription(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription created successfully",
    data: subscription,
  })
})

const getAllSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await SubscriptionServices.getAllSubscriptions(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Subscriptions retrieved successfully",
    data: subscriptions,
  })
})

const getSingleSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionServices.getSingleSubscription(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription retrieved successfully",
    data: subscription,
  })
})

const updateSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionServices.updateSubscription(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription updated successfully",
    data: subscription,
  })
})

const deleteSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionServices.deleteSubscription(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Subscription deleted successfully",
    data: subscription,
  })
})

export const SubscriptionControllers = {
  createSubscription,
  getAllSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
}
