import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import { AuthServices } from "./auth.service"
import sendResponse from "../../../shared/sendResponse"
import httpStatus from "http-status"

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body)

  res.cookie("token", result.token, { httpOnly: true })
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Login successful",
    data: result,
  })
})
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User Successfully logged out",
    data: null,
  })
})

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id

  const result = await AuthServices.getMyProfile(userId)
  sendResponse(res, {
    statusCode: 201,
    message: "User profile retrieved successfully",
    data: result,
  })
})

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization
  const { oldPassword, newPassword } = req.body

  const result = await AuthServices.changePassword(
    userToken as string,
    newPassword,
    oldPassword
  )
  sendResponse(res, {
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  })
})

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Check your email!",
    data: null,
  })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.resetPassword(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password Reset!",
    data: null,
  })
})

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body
  const otp = await AuthServices.sendOtp(email)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP sent successfully",
    data: { otp },
  })
})

export const AuthController = {
  loginUser,
  logoutUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  sendOtp,
}
