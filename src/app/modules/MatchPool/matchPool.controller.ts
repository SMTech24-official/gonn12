import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { MatchPoolServices } from "./matchPool.service"

const addToMatchPool = catchAsync(async (req, res) => {
  const { matchpoolId, sessionParticipantId, teamName } = req.body

  const matchPoolParticipant = await MatchPoolServices.addToMatchPool(
    matchpoolId,
    sessionParticipantId,
    teamName
  )

  sendResponse(res, {
    statusCode: 201,
    message: "Participant added to match pool successfully",
    data: {
      matchPoolParticipant,
    },
  })
})

const removeFromMatchPool = catchAsync(async (req, res) => {
  const { matchPoolParticipantId } = req.body

  const matchPoolParticipant = await MatchPoolServices.removeFromMatchPool(
    matchPoolParticipantId
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Participant removed from match pool successfully",
    data: {
      matchPoolParticipant,
    },
  })
})

const generateMatchPool = catchAsync(async (req, res) => {
  const { sessionId, genderType } = req.body

  const matchPool = await MatchPoolServices.generateMatchPool(
    sessionId,
    genderType
  )

  sendResponse(res, {
    statusCode: 200,
    message: "Match pool generated successfully",
    data: {
      matchPool,
    },
  })
})

const getAllMatchPools = catchAsync(async (req, res) => {
  const matchPools = await MatchPoolServices.getAllMatchPools(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "All match pools retrieved successfully",
    data: {
      matchPools,
    },
  })
})

const getMatchPoolById = catchAsync(async (req, res) => {
  const { id } = req.params

  const matchPool = await MatchPoolServices.getMatchPoolById(id)

  sendResponse(res, {
    statusCode: 200,
    message: "Match pool retrieved successfully",
    data: {
      matchPool,
    },
  })
})

const createSessionMatch = catchAsync(async (req, res) => {
  const { matchPoolId, sessionCourtId } = req.body
  const match = await MatchPoolServices.createSessionMatch(
    matchPoolId,
    sessionCourtId
  )

  sendResponse(res, {
    statusCode: 201,
    message: "Match created successfully from match pool",
    data: {
      match,
    },
  })

  return match
})

export const MatchPoolController = {
  addToMatchPool,
  removeFromMatchPool,
  generateMatchPool,
  getAllMatchPools,
  getMatchPoolById,
  createSessionMatch,
}
