import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // Atau gunakan SMTP seperti 'smtp.example.com'
  auth: {
    user: "tajulmunandar701@gmail.com",
    pass: "icqf yeqz bihz ogec",
  },
});

const sendMail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: "tajulmunandar701@gmail.com",
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendMail };
