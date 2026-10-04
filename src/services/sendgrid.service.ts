import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API!);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

interface EmailCCOptions extends EmailOptions {
  cc: {
    name: string;
    email: string;
  }[];
}

const sendEmail = async ({
  to,
  subject,
  html,
  fromName = "Al Khair Foundation",
  fromEmail = "donations@donation-alkhair.co.uk",
}: EmailOptions): Promise<void> => {
  const message = {
    to,
    from: {
      name: fromName,
      email: fromEmail,
    },
    subject,
    html,
  };

  console.log("sendEmail executed.");

  try {
    const response = await sgMail.send(message);
    console.log("Email sent successfully:", response[0].statusCode);
  } catch (error: any) {
    console.log("Error sending email:", error.response?.body || error, {
      depth: null,
    });
  }
};

export const sendEmailCC = async ({
  to,
  subject,
  html,
  cc,
  fromName = "Al Khair Foundation",
  fromEmail = "donations@donation-alkhair.co.uk",
}: EmailCCOptions): Promise<void> => {
  const message = {
    to,
    from: {
      name: fromName,
      email: fromEmail,
    },
    cc,
    subject,
    html,
  };

  if (cc) {
    message.cc = cc;
  }

  console.log("sendEmail executed.");

  try {
    const response = await sgMail.send(message);
    console.log("Email sent successfully:", response[0].statusCode);
  } catch (error: any) {
    console.log("Error sending email:", error.response?.body || error, {
      depth: null,
    });
  }
};

export default sendEmail;
