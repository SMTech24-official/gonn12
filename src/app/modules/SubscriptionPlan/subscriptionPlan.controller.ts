import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { SubscriptionPlanServices } from "./subscriptionPlan.service"

const createSubscriptionPlan = catchAsync(async (req, res) => {
  const subscriptionPlan = await SubscriptionPlanServices.createSubscriptionPlan(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SubscriptionPlan created successfully",
    data: subscriptionPlan,
  })
})

const getAllSubscriptionPlans = catchAsync(async (req, res) => {
  const subscriptionPlans = await SubscriptionPlanServices.getAllSubscriptionPlans(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "SubscriptionPlans retrieved successfully",
    data: subscriptionPlans,
  })
})

const getSingleSubscriptionPlan = catchAsync(async (req, res) => {
  const subscriptionPlan = await SubscriptionPlanServices.getSingleSubscriptionPlan(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SubscriptionPlan retrieved successfully",
    data: subscriptionPlan,
  })
})

const updateSubscriptionPlan = catchAsync(async (req, res) => {
  const subscriptionPlan = await SubscriptionPlanServices.updateSubscriptionPlan(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SubscriptionPlan updated successfully",
    data: subscriptionPlan,
  })
})

const deleteSubscriptionPlan = catchAsync(async (req, res) => {
  const subscriptionPlan = await SubscriptionPlanServices.deleteSubscriptionPlan(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SubscriptionPlan deleted successfully",
    data: subscriptionPlan,
  })
})

export const SubscriptionPlanControllers = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
}
