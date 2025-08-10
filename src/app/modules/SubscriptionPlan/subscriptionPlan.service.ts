import { SubscriptionPlan } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors"

const createSubscriptionPlan = async (payload: SubscriptionPlan) => {
  const subscriptionPlan = await prisma.subscriptionPlan.create({
    data: payload,
  });
  return subscriptionPlan;
};

const getAllSubscriptionPlans = async (query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereConditions: any = {};

  const totalCount = await prisma.subscriptionPlan.count({
    where: whereConditions,
  });

  const subscriptionPlans = await prisma.subscriptionPlan.findMany({
    where: whereConditions,
    skip,
    take,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: subscriptionPlans,
  };
};

const getSingleSubscriptionPlan = async (id: string) => {
  const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
    where: {
      id,
    },
  });

  if (!subscriptionPlan) {
    throw new ApiError(400, "SubscriptionPlan not found");
  }

  return subscriptionPlan;
};

const updateSubscriptionPlan = async (id: string, payload: Partial<SubscriptionPlan>) => {
  const subscriptionPlan = await prisma.subscriptionPlan.update({
    where: {
      id,
    },
    data: payload,
  });

  return subscriptionPlan;
};

const deleteSubscriptionPlan = async (id: string) => {
  const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
    where: {
      id,
    },
  });

  if (!subscriptionPlan) {
    throw new ApiError(400, "SubscriptionPlan not found");
  }

  await prisma.subscriptionPlan.delete({
    where: {
      id,
    },
  });

  return subscriptionPlan;
};

export const SubscriptionPlanServices = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
};