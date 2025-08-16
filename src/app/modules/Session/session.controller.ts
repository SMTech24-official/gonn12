import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { SessionServices } from "./session.service"

const createSession = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const { startTime, name } = req.body

  console.log(req.body)

  if (!name) {
    throw new ApiError(400, "Session name is required")
  }

  const session = await SessionServices.createSession({
    ...req.body,
    clubId: club.id,
  })

  sendResponse(res, {
    statusCode: 200,
    message: "Session created successfully",
    data: session,
  })
})

const getAllSessions = catchAsync(async (req, res) => {
  const sessions = await SessionServices.getAllSessions(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Sessions retrieved successfully",
    data: sessions,
  })
})

const getMyClubSessions = catchAsync(async (req, res) => {
  const ownerId = req.user.id
  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found for the owner")
  }

  const sessions = await SessionServices.getMyClubSessions({ clubId: club.id })
  sendResponse(res, {
    statusCode: 200,
    message: "My Club Sessions retrieved successfully",
    data: sessions,
  })
})

const getSingleSession = catchAsync(async (req, res) => {
  const session = await SessionServices.getSingleSession(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Session retrieved successfully",
    data: session,
  })
})

const updateSession = catchAsync(async (req, res) => {
  const session = await SessionServices.updateSession(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Session updated successfully",
    data: session,
  })
})

const deleteSession = catchAsync(async (req, res) => {
  const session = await SessionServices.deleteSession(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Session deleted successfully",
    data: session,
  })
})

const endSession = catchAsync(async (req, res) => {
  const session = await SessionServices.endSession(req.params.id)
  sendResponse(res, {
    statusCode: 200,
    message: "Session ended successfully",
    data: session,
  })
})

const getActiveSession = catchAsync(async (req, res) => {
  const ownerId = req.user.id
  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found for the owner")
  }

  const session = await SessionServices.getActiveSession(club.id)
  if (!session) {
    throw new ApiError(404, "No active session found for this club")
  }

  sendResponse(res, {
    statusCode: 200,
    message: "Active session retrieved successfully",
    data: session,
  })
})

export const SessionControllers = {
  createSession,
  getAllSessions,
  getMyClubSessions,
  getSingleSession,
  updateSession,
  deleteSession,
  endSession,
  getActiveSession,
}
