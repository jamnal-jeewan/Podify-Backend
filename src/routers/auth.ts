import { Router } from "express";
import { createUser, generateForgotPasswordLink, grantValid, sendReVerificationToken, signIn, updatePassword, verifyEmail } from "#/controllers/auth";
import { validate } from "#/middleware/validator";
import { CreateUserSchema, SignInValidationSchema, TokenAndIDValidation, UpdatePasswordSchema } from "#/utils/validationSchema";
import { isValidPassResetToken, mustAuth } from "#/middleware/auth";

let authRouter = Router();
authRouter.post("/create", validate(CreateUserSchema), createUser);
authRouter.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);
authRouter.post("/re-verify-email", sendReVerificationToken);
authRouter.post("/forget-password", generateForgotPasswordLink);
authRouter.post("/verify-pass-reset-token",validate(TokenAndIDValidation), isValidPassResetToken,grantValid);
authRouter.post("/update-password", validate(UpdatePasswordSchema), isValidPassResetToken, updatePassword);
authRouter.post("/sign-in", validate(SignInValidationSchema), signIn);
authRouter.get("/is-auth", mustAuth, (req, res) => {
    res.status(200).json({ profile: req.user });
});

export default authRouter;