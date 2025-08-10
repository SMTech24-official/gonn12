import catchAsync from "../../../shared/catchAsync"
import { sessionQueueService } from "./sessionQueue.service"

const getSessionQueueBySessionId = catchAsync(async (req, res) => {
  const { sessionId } = req.params

  const sessionQueue = await sessionQueueService.getSessionQueueBySessionId(
    sessionId
  )

  res.status(200).json({
    status: "success",
    data: {
      sessionQueue,
    },
  })
})

const getSessionQueueParticipants = catchAsync(async (req, res) => {
  const { sessionId } = req.params

  const participants = await sessionQueueService.getSessionQueueParticipants(
    sessionId,
    req.query
  )

  res.status(200).json({
    status: "success",
    data: {
      participants,
    },
  })
})

export const sessionQueueController = {
  getSessionQueueBySessionId,
  getSessionQueueParticipants,
  // Add other session queue related controllers here
}
