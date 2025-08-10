import ApiError from "../../../errors/ApiErrors"
import prisma from "../../../shared/prisma"

const getSessionQueueBySessionId = async (sessionId: string) => {
  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: { sessionId },
    include: {
      SessionQueueParticipant: {
        include: { member: true },
      },
    },
  })

  if (!sessionQueue) {
    throw new ApiError(400, "SessionQueue not found")
  }

  return sessionQueue
}

const getSessionQueueParticipants = async (sessionId: string, query: any) => {
  const { limit = 10, page = 1 } = query
  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    sessionId,
  }

  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: whereConditions,
  })

  if (!sessionQueue) {
    throw new ApiError(400, "SessionQueue not found")
  }
  const sessionQueueParticipants =
    await prisma.sessionQueueParticipant.findMany({
      where: {
        sessionQueueId: sessionQueue.id,
      },
      skip,
      take,
      include: {
        member: true,
      },
    })

  if (!sessionQueueParticipants) {
    throw new ApiError(400, "No participants found in the session queue")
  }

  const totalCount = sessionQueueParticipants.length
  return {
    totalCount,
    participants: sessionQueueParticipants,
  }
}

export const sessionQueueService = {
  getSessionQueueBySessionId,
  getSessionQueueParticipants,
  // Add other session queue related methods here
}
