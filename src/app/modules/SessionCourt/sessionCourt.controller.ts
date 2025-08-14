import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
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
  const { sessionId, courtIds } = req.body

  const sessionCourts = await SessionCourtServices.createSessionCourts(
    sessionId,
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
