import nodemailer from "nodemailer";
import User from "#/models/user";
import { CreateUser, VerifyEmailRequest } from "#/types/user";
import { generateToken } from "#/utils/helper";
import EmailVerificationToken from "#/models/emailVerificationToken";
import {
  sendForgetPasswordLink,
  sendPasswordResetEmail,
  sendVerificationMail,
} from "#/utils/mail";
import { isValidObjectId } from "mongoose";
import PasswordResetToken from "#/models/passwordResetToken";
import { JWT_SECRET, RESET_LINK } from "#/utils/variables";
import jwt from "jsonwebtoken";

export const createUser = async (req: CreateUser, res: any) => {
  const { name, email, password } = req.body;
  let user = await User.create({
    name: name,
    email: email,
    password: password,
  });

  let token = generateToken();
  await EmailVerificationToken.create({
    owner: user._id,
    token,
  });
  sendVerificationMail(token, { name, email, userId: user._id.toString() });
  res.status(201).json({ user: { id: user._id, name, email } });
};

export const verifyEmail = async (req: VerifyEmailRequest, res: any) => {
  const { token, userId } = req.body;

  const verficationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (!verficationToken) res.status(403).json({ error: "Invalid Token!" });

  const match = await verficationToken?.compareToken(token);
  if (!match) res.status(403).json({ error: "Invalid Token!" });

  await User.findByIdAndUpdate(userId, {
    verified: true,
  });
  await EmailVerificationToken.findByIdAndDelete(verficationToken._id);

  res.status(200).json({ message: "Your email is verified!" });
};

export const sendReVerificationToken = async (req: any, res: any) => {
  const { userId } = req.body;
  if (!isValidObjectId(userId))
    return res.status(403).json({ error: "Invalid Request!" });

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Invalid Request!" });

  await EmailVerificationToken.findOneAndDelete({ owner: userId });

  const token = generateToken();
  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user._id.toString(),
  });

  res
    .status(200)
    .json({
      message: "Email verification token sent. Please check your email.",
    });
};

export const generateForgotPasswordLink = async (req: any, res: any) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Account not found!" });
  await PasswordResetToken.findOneAndDelete({ owner: user._id });
  const token = crypto.getRandomValues(new Uint32Array(1))[0].toString();
  PasswordResetToken.create({
    owner: user._id,
    token,
  });
  const resetLink = `${RESET_LINK}?token=${token}&userId=${user._id}`;
  sendForgetPasswordLink({ email, link: resetLink });
  res.status(200).json({ message: "Password reset link sent to your email." });
};

export const grantValid = async (req: any, res: any) => {
  res.status(200).json({ valid: true });
};

export const updatePassword = async (req: any, res: any) => {
  const { password, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found!" });

  const matched = await user.comparePassword(password);
  if (matched)
    return res
      .status(403)
      .json({ error: "New password can't be same as old password!" });

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: userId });
  sendPasswordResetEmail(user.name, user.email);

  res.status(200).json({ message: "Password updated successfully!" });
};

export const signIn = async (req: any, res: any) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Email/Password mismatch!" });

  const matched = await user.comparePassword(password);
  if (!matched)
    return res
      .status(403)
      .json({ error: "Email/Password mismatch!" });

  //generate jwt token
  const token = await jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "30d",
  });
  user.tokens.push(token);
  await user.save();
  res
    .status(200)
    .json({
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar?.url,
        verified: user.verified,
        followers: user.followers,
        following: user.following,
      },
      token,
    });
};
