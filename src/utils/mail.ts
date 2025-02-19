import nodemailer from "nodemailer";
import { generateToken } from "./helper";
import { MAILTRAP_PASS, MAILTRAP_USER, SIGN_IN_URL, VERIFICATION_EMAIL } from "#/utils/variables";
import EmailVerificationToken from "#/models/emailVerificationToken";
import { generateTemplate } from "#/mail/template";
import path from "path";
import { ForgetPasswordLinkOptions, Profile } from "#/types/user";

const generateMailTransporter = async () => {
  var transport = await nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });

  return transport;
};


export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = await generateMailTransporter();
  const { email } = profile;

  transport.sendMail({
    from: VERIFICATION_EMAIL,
    to: email,
    subject: "Verification Email ✔",
    html: generateTemplate({
      title: "Welcome to Podify!!!",
      message: "Enter your otp to start using podify",
      link: "#",
      logo: "cid:logo",
      banner: "cid:banner",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "banner.jpg",
        path: path.join(__dirname, "../mail/banner.jpg"),
        cid: "banner",
      },
    ],
  });
};


export const sendForgetPasswordLink = async (options: ForgetPasswordLinkOptions) => {
    const transport = await generateMailTransporter();
    const { email, link } = options;
  
    transport.sendMail({
      from: VERIFICATION_EMAIL,
      to: email,
      subject: "FORGET PASSWORD",
      html: generateTemplate({
        title: "RESET YOUR PASSWORD",
        message: "Set new password for your account",
        link: link,
        logo: "cid:logo",
        banner: "cid:banner",
        btnTitle: "RESET",
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../mail/logo.png"),
          cid: "logo",
        },
        {
          filename: "banner.jpg",
          path: path.join(__dirname, "../mail/banner.jpg"),
          cid: "banner",
        },
      ],
    });
  };

export const sendPasswordResetEmail = async (name:string, email:string) => {
    const transport = await generateMailTransporter();
  
    transport.sendMail({
      from: VERIFICATION_EMAIL,
      to: email,
      subject: "Password Reset Successful",
      html: generateTemplate({
        title: "Password Updated!",
        message:  `Dear ${name}, your password has been successfully reset. Now you can login with your new password.`,
        link: SIGN_IN_URL,
        logo: "cid:logo",
        banner: "cid:banner",
        btnTitle: "Login",
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../mail/logo.png"),
          cid: "logo",
        },
        {
          filename: "banner.jpg",
          path: path.join(__dirname, "../mail/banner.jpg"),
          cid: "banner",
        },
      ],
    });
  };