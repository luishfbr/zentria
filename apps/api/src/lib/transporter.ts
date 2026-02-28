import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: 465,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
    },
})