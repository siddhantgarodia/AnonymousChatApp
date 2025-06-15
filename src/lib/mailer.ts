import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  to: string,
  username: string,
  code: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your gmail (e.g. test@gmail.com)
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  const mailOptions = {
    from: `"AnonyChat" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Verification Code",
    html: `<h2>Hello ${username},</h2><p>Your verification code is:</p><h1>${code}</h1><p>This code will expire in 10 minutes.</p><br/><p>Thanks,<br/>The AnonyChat Team</p>`,
  };

  await transporter.sendMail(mailOptions);
};
