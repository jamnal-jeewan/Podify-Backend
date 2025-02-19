import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: any;
        name: string;
        email: string;
        avatar: string;
        verified: string;
        followers: number;
        following: number;
      };
    }
  }
}
export interface CreateUser extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export interface VerifyEmailRequest extends Request {
  body: {
    userId: string;
    token: string;
  };
}

export interface Profile {
  name: string;
  email: string;
  userId: string;
}

export interface ForgetPasswordLinkOptions {
  email: string;
  link: string;
}
