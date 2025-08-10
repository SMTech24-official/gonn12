import { Subscription } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const takeSubscription = async (subscriptionPlanId: string, clubId: string) => {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: subscriptionPlanId,
    },
  })

  if (!subscriptionPlan) {
    throw new ApiError(404, "Subscription plan not found")
  }

  const startDate = new Date()
  const subscriptionDays = subscriptionPlan.duration * 24 * 60 * 60 * 1000 // Convert days to milliseconds
  const endDate = new Date(startDate.getTime() + subscriptionDays)

  const subscription = await prisma.subscription.create({
    data: {
      clubId,
      subscriptionPlanId,
      startDate,
      endDate,
    },
  })
  return subscription
}

const getAllSubscriptions = async (query: any) => {
  const { page = 1, limit = 10, userId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  const totalCount = await prisma.subscription.count({
    where: whereConditions,
  })

  const subscriptions = await prisma.subscription.findMany({
    where: whereConditions,
    skip,
    take,
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: subscriptions,
  }
}

const getSingleSubscription = async (id: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
  })

  if (!subscription) {
    throw new ApiError(400, "Subscription not found")
  }

  return subscription
}

// const updateSubscription = async (
//   id: string,
//   payload: Partial<Subscription>
// ) => {
//   const subscription = await prisma.subscription.update({
//     where: {
//       id,
//     },
//     data: payload,
//   })

//   return subscription
// }

const getCurrentSubscription = async (userId: string) => {
  const club = await prisma.club.findUnique({
    where: {
      ownerId: userId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  return prisma.subscription.findFirst({
    where: {
      clubId: club.id,
      isActive: true,
    },
  })
}

const cancelSubscription = async (id: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
  })

  if (!subscription) {
    throw new ApiError(400, "Subscription not found")
  }

  await prisma.subscription.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      endDate: new Date(),
    },
  })

  return subscription
}

export const SubscriptionServices = {
  takeSubscription,
  getCurrentSubscription,
  getAllSubscriptions,
  getSingleSubscription,
  cancelSubscription,
}
