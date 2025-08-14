import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { SessionServices } from "../Session/session.service"
import { SessionParticipantServices } from "./sessionParticipant.service"

const createSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.createSessionParticipant(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant created successfully",
    data: sessionParticipant,
  })
})

const createSessionParticipants = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: { ownerId },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const { memberIds } = req.body

  const session = await SessionServices.getActiveSession(club.id)

  if (!session) {
    throw new ApiError(404, "No active session found")
  }

  const sessionParticipants =
    await SessionParticipantServices.createSessionParticipants(
      session.id,
      memberIds
    )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipants created successfully",
    data: sessionParticipants,
  })
})

const getAllSessionParticipants = catchAsync(async (req, res) => {
  const sessionParticipants =
    await SessionParticipantServices.getAllSessionParticipants(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipants retrieved successfully",
    data: sessionParticipants,
  })
})

const getSingleSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.getSingleSessionParticipant(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant retrieved successfully",
    data: sessionParticipant,
  })
})

const updateSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.updateSessionParticipant(
      req.params.id,
      req.body
    )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant updated successfully",
    data: sessionParticipant,
  })
})

const deleteSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.deleteSessionParticipant(req.params.id)
  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant deleted successfully",
    data: sessionParticipant,
  })
})

const availableMembersToAddToSession = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: { ownerId },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const session = await SessionServices.getActiveSession(club.id)

  if (!session) {
    throw new ApiError(404, "No active session found")
  }

  const members =
    await SessionParticipantServices.availableMembersToAddToSession(session.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Available members retrieved successfully",
    data: members,
  })
})

export const SessionParticipantControllers = {
  createSessionParticipant,
  createSessionParticipants,
  getAllSessionParticipants,
  getSingleSessionParticipant,
  updateSessionParticipant,
  deleteSessionParticipant,
  availableMembersToAddToSession,
}
