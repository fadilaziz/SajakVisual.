import nodemailer from 'nodemailer';

export const send_email = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: data.destination,
      subject: data.subject,
      html: data.message,
    });

    data.code = 200;
    data.status = 'success';
    data.message = 'Email sent successfully';

    return data;
  } catch (err) {
    data.code = 500;
    data.status = 'error';
    data.message = err.message;
    return data;
  }
};
