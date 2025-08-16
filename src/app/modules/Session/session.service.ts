import { Session, Type } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"


const createSession = async (payload:Session) => {
  const { clubId, startTime, endTime, type = Type.DOUBLES } = payload

  if (!clubId) {
    throw new ApiError(400, "clubId is required")
  }
  if (!startTime || !endTime) {
    throw new ApiError(400, "startTime and endTime are required")
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (start >= end) {
    throw new ApiError(400, "endTime must be after startTime")
  }

  if (start < new Date()) {
    throw new ApiError(400, "startTime must be in the future")
  }

  // Check overlapping sessions for the same club
  const overlappingSession = await prisma.session.findFirst({
    where: {
      clubId,
      AND: [
        { startTime: { lte: end } },
        { endTime: { gte: start } },
        { isActive: true },
      ],
    },
  })

  if (overlappingSession) {
    throw new ApiError(400, "Session overlaps with an existing active session")
  }

  // Use a transaction to create session and sessionQueue atomically
  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.session.create({
      data: {
        clubId,
        startTime: start,
        endTime: end,
        type,
        isActive: true,
      },
    })

    await tx.sessionQueue.create({
      data: {
        sessionId: createdSession.id,
      },
    })

    return createdSession
  })

  return session
}
const getAllSessions = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  const totalCount = await prisma.session.count({
    where: whereConditions,
  })

  const sessions = await prisma.session.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
      SessionParticipant: true,
    },
    orderBy: {
      startTime: "desc",
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: sessions,
  }
}

const getMyClubSessions = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  const totalCount = await prisma.session.count({
    where: whereConditions,
  })

  const sessions = await prisma.session.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
      SessionParticipant: true,
      sessionQueue: {
        include: {
          SessionQueueParticipant: {
            include: { member: true },
          },
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: sessions,
  }
}

const getSingleSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
      SessionParticipant: true,
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  return session
}

const updateSession = async (id: string, payload: Partial<Session>) => {
  const session = await prisma.session.update({
    where: {
      id,
    },
    data: payload,
  })

  return session
}

const deleteSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  await prisma.session.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  })

  return session
}

const endSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
  })
  if (!session) {
    throw new ApiError(400, "Session not found")
  }
  if (!session.isActive) {
    throw new ApiError(400, "Session is already ended")
  }
  await prisma.$transaction(async (prisma) => {
    await prisma.session.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    })

    await prisma.member.deleteMany({
      where: {
        sessionId: id,
      },
    })
  })
  return session
}

const getActiveSession = async (clubId: string) => {
  const session = await prisma.session.findFirst({
    where: {
      clubId,
      isActive: true,
    },
  })
  return session
}

export const SessionServices = {
  createSession,
  getAllSessions,
  getMyClubSessions,
  getActiveSession,
  getSingleSession,
  updateSession,
  deleteSession,
  endSession,
}
