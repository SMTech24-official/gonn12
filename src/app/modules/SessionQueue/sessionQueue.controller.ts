import { send } from "process"
import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import { SessionServices } from "../Session/session.service"
import { sessionQueueService } from "./sessionQueue.service"
import sendResponse from "../../../shared/sendResponse"

const getSessionQueueBySessionId = catchAsync(async (req, res) => {
  const { sessionId } = req.params

  const sessionQueue = await sessionQueueService.getSessionQueueBySessionId(
    sessionId
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueue retrieved successfully",
    data: sessionQueue,
  })
})

const getSessionQueueParticipants = catchAsync(async (req, res) => {
  const { sessionId } = req.params

  const participants = await sessionQueueService.getSessionQueueParticipants(
    sessionId,
    req.query
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueue participants retrieved successfully",
    data: participants,
  })
})

const getCurrentSessionQueue = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: { ownerId },
  })

  if (!club) {
    throw new ApiError(400, "Club not found")
  }

  const getCurrentSession = await SessionServices.getActiveSession(club.id)

  if (!getCurrentSession) {
    throw new ApiError(400, "No active session found")
  }

  const sessionQueue = await sessionQueueService.getCurrentSessionQueue(
    getCurrentSession.id
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Current session queue retrieved successfully",
    data: sessionQueue,
  })
})

const deleteQueueParticipant = catchAsync(async (req, res) => {
  const { participantId } = req.params

  const deletedParticipant = await sessionQueueService.deleteQueueParticipant(
    participantId
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Queue participant deleted successfully",
    data: {
      participant: deletedParticipant,
    },
  })
})

export const sessionQueueController = {
  getSessionQueueBySessionId,
  getSessionQueueParticipants,
  getCurrentSessionQueue,
  deleteQueueParticipant,
  // Add other session queue related controllers here
}
