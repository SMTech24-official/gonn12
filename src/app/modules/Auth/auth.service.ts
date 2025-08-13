import { Secret } from "jsonwebtoken"
import config from "../../../config"
import { jwtHelpers } from "../../../helpers/jwtHelpers"
import prisma from "../../../shared/prisma"
import * as bcrypt from "bcrypt"
import ApiError from "../../../errors/ApiErrors"
import { UserStatus } from "@prisma/client"
import httpStatus from "http-status"
import { sendEmail } from "../../utils/sendEmail"

// user login
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  })

  if (!userData?.isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is not verified!")
  }

  if (!userData?.email) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    )
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  )

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!")
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  )

  return { token: accessToken }
}

const sendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const existingOtp = await prisma.otp.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  if (existingOtp) {
    // If an OTP already exists, we can update it
    await prisma.otp.update({
      where: { id: existingOtp.id },
      data: { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    })
  } else {
    await prisma.otp.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      },
    })
  }

  const messageTemplate = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Dear ${user.name},</p>

      <p>Your OTP for email verification is:</p>

      <div style="font-size: 24px; font-weight: bold;">${otp}</div>

      <p>This OTP will expire in 5 minutes.</p>

      <p>If you did not request this OTP, please ignore this email or contact support if you have any concerns.</p>

      <p>Thank you</p>
    </div>
  `

  await sendEmail(user.email, "Verify Your Email", messageTemplate)

  return otp
}

const checkOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }

  const existingOtp = await prisma.otp.findFirst({
    where: { userId: user.id, otp },
  })

  if (!existingOtp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP")
  }

  if (existingOtp.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired")
  }

  await prisma.otp.delete({
    where: { id: existingOtp.id },
  })

  return { message: "OTP is valid" }
}

const verifyOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }

  await checkOtp(email, otp)

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  )

  return { token: accessToken }
}

// get user profile
const getMyProfile = async (userId: string) => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return userProfile
}

// change password

const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string
) => {
  const decodedToken = jwtHelpers.verifyToken(userToken, config.jwt.jwt_secret!)

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  })

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password")
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  const result = await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
    },
  })
  return { message: "Password changed successfully" }
}

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  })

  const otp = await sendOtp(userData.email)

  const resetMessageTemplate = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Dear ${userData.name},</p>

      <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>

      <div style="font-size: 24px; font-weight: bold;">${otp}</div>

      <p>This OTP will expire in 5 minutes.</p>

      <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>

      <p>Thank you</p>
    </div>
  `

  await sendEmail(userData.email, "Reset Your Password", resetMessageTemplate)

  return { message: "Reset password link sent via your email successfully" }
}

const verifyForgetPassword = async (payload: {
  email: string
  otp: string
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }

  await checkOtp(payload.email, payload.otp)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      needsPasswordChange: true,
    },
  })

  return { message: "OTP is valid" }
}

// reset password
const resetPassword = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email, needsPasswordChange: true },
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12)

  // update into database
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password,
      needsPasswordChange: false,
    },
  })
  return { message: "Password reset successfully" }
}

export const AuthServices = {
  loginUser,
  getMyProfile,
  sendOtp,
  verifyOtp,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyForgetPassword,
}
