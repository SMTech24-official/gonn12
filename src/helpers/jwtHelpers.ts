import jwt, { JwtPayload, Secret } from "jsonwebtoken"
import config from "../config"

const generateToken = (
  payload: any,
  secret: Secret = config.jwt.jwt_secret!,
  expiresIn: string = config.jwt.expires_in!
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  })

  return token
}

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload
}

export const jwtHelpers = {
  generateToken,
  verifyToken,
}
