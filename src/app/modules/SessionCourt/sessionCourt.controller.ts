import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { SessionServices } from "../Session/session.service"
import { SessionCourtServices } from "./sessionCourt.service"

const createSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.createSessionCourt(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt created successfully",
    data: sessionCourt,
  })
})

const createSessionCourts = catchAsync(async (req, res) => {
  const userId = req.user.id
  const club = await prisma.club.findUnique({
    where: {
      ownerId: userId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const activeSession = await SessionServices.getActiveSession(club.id)

  if (!activeSession) {
    throw new ApiError(404, "Active session not found")
  }

  const { courtIds } = req.body

  const sessionCourts = await SessionCourtServices.createSessionCourts(
    activeSession.id,
    courtIds
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourts created successfully",
    data: sessionCourts,
  })
})

const getAllSessionCourts = catchAsync(async (req, res) => {
  const sessionCourts = await SessionCourtServices.getAllSessionCourts(
    req.query
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourts retrieved successfully",
    data: sessionCourts,
  })
})

const getSingleSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.getSingleSessionCourt(
    req.params.id
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt retrieved successfully",
    data: sessionCourt,
  })
})

const updateSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.updateSessionCourt(
    req.params.id,
    req.body
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt updated successfully",
    data: sessionCourt,
  })
})

const deleteSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.deleteSessionCourt(
    req.params.id
  )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt deleted successfully",
    data: sessionCourt,
  })
})

const getAvaiableCourtsForSession = catchAsync(async (req, res) => {
  const sessionCourts = await SessionCourtServices.getAvaiableCourtsForSession(
    req.params.sessionId
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Available courts for session retrieved successfully",
    data: sessionCourts,
  })
})

export const SessionCourtControllers = {
  createSessionCourt,
  createSessionCourts,
  getAllSessionCourts,
  getSingleSessionCourt,
  updateSessionCourt,
  deleteSessionCourt,
  getAvaiableCourtsForSession,
}
