import passwordResetToken from "#/models/passwordResetToken";
import User from "#/models/user";
import { JWT_SECRET } from "#/utils/variables";
import { JwtPayload, verify } from "jsonwebtoken";

export const isValidPassResetToken = async (req:any, res:any, next:any) => {
  const { token, userId } = req.body;
  const resetToken = await passwordResetToken.findOne({owner: userId});
  if(!resetToken) return res.status(403).json({error: "Unauthorized access, invalid token!"});

  const matched = await resetToken.compareToken(token);
  if(!matched) return res.status(403).json({error: "Unauthorized access, invalid token!"});

  next();
};

export const mustAuth = async (req:any, res:any, next:any) => {
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];
  if(!token) return res.status(403).json({error: "Unauthorized request!"});
  const payload = verify(token,JWT_SECRET) as JwtPayload;
  const userId = payload.userId;
  const user = await User.findOne({_id: userId, tokens: token});
  if(!user) return res.status(403).json({error: "Unauthorized request!"});
  req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar?.url,
      verified: user.verified,
      followers: user.followers,
      following: user.following,
  }
  next();
};