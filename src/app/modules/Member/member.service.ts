import { Member } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"
import { SubscriptionServices } from "../Subscription/subscription.service"
import { Session } from "inspector"
import { SessionServices } from "../Session/session.service"

const createMember = async (payload: Member) => {
  const { clubId, isMember } = payload

  if (!isMember) {
    const currentSession = await SessionServices.getActiveSession(clubId)

    if (!currentSession) {
      throw new ApiError(404, "No active session found")
    }

    const session = await prisma.session.findUnique({
      where: {
        id: currentSession.id,
      },
    })

    if (!session) {
      throw new ApiError(404, "Session not found")
    }

    payload.sessionId = session.id
  }

  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
    include: {
      owner: true,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const subscription = await SubscriptionServices.getCurrentSubscription(clubId)

  if (!subscription) {
    if (club.remainingMembers === 0) {
      throw new ApiError(
        403,
        "No active subscription found and club is at full capacity"
      )
    }
  }

  const member = await prisma.member.create({
    data: payload,
  })

  await prisma.club.update({
    where: {
      id: clubId,
    },
    data: {
      remainingMembers: club.remainingMembers - 1,
    },
  })

  return member
}

const getAllMembers = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  const totalCount = await prisma.member.count({
    where: whereConditions,
  })

  const members = await prisma.member.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: members,
  }
}

const getMyClubMembers = async (clubId: string, query: any) => {
  const { page = 1, limit = 10 } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  const totalCount = await prisma.member.count({
    where: whereConditions,
  })

  const members = await prisma.member.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: members,
  }
}

const getSingleMember = async (id: string) => {
  const member = await prisma.member.findUnique({
    where: {
      id,
    },
    include: {
      club: true,
    },
  })

  if (!member) {
    throw new ApiError(400, "Member not found")
  }

  return member
}

const updateMember = async (id: string, payload: Partial<Member>) => {
  const { clubId } = payload

  if (clubId) {
    const club = await prisma.club.findUnique({
      where: {
        id: clubId,
      },
    })

    if (!club) {
      throw new ApiError(404, "Club not found")
    }
  }

  const member = await prisma.member.update({
    where: {
      id,
    },
    data: payload,
  })

  return member
}

const deleteMember = async (id: string) => {
  const member = await prisma.member.findUnique({
    where: {
      id,
    },
  })

  if (!member) {
    throw new ApiError(400, "Member not found")
  }

  await prisma.member.delete({
    where: {
      id,
    },
  })

  return member
}

export const MemberServices = {
  createMember,
  getAllMembers,
  getMyClubMembers,
  getSingleMember,
  updateMember,
  deleteMember,
}
