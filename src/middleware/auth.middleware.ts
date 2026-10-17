import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserModel } from "../models/user.model";

export const JWT_SECRET = process.env.JWT_SECRET ?? ''

export const authMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ status: 401, message: 'Unauthorized', data: null })
  }

  const token = authHeader.split(' ')[1]

  if (!token || !JWT_SECRET) {
    return response.status(401).json({ status: 401, message: 'Missing token or JWT secret', data: null })
  }

  try {
    const decoded = verify(token, JWT_SECRET)

    if (typeof decoded === 'string') {
      throw new Error("Invalid token payload");
    }

    const user    = await UserModel.where('email', decoded.email).fetch({ require: true, withRelated : ['role'] })

    request.user  = {
      id      : user.get('id'),
      name    : user.get('name'),
      email   : user.get('email'),
      role    : user.related('role')?.get('name'),
      avatar  : user.get('avatar'),
    }
  } catch {
    return response.status(403).json({ status: 403, message: 'Invalid or expired token', data: null })
  }

  next()
}

export const adminOnly = (request: Request, response: Response, next: NextFunction) => {
  const user = request.user

  if (!user || user.role != 'admin') {
    return response.status(403).json({ status: 403, message: 'Forbidden: Admins only', data: null })
  }

  next()
}

export const tutornAdmin = (request: Request, response: Response, next: NextFunction) => {
  const user = request.user

  if (!user || user.role != 'admin' && user.role != 'tutor') {
    return response.status(403).json({ status: 403, message: 'Forbidden: Admins and Tutor only', data: null })
  }

  next()
}
