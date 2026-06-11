const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

let transporter;

// In a real environment, we'd use SMTP. In development, we can use a JSON/test transporter.
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Mock transporter that logs emails to console/files
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
}

const emailService = {
  sendEmail: async ({ to, subject, html, text }) => {
    try {
      const info = await transporter.sendMail({
        from: '"PeopleDesk ERP" <noreply@peopledesk.com>',
        to,
        subject,
        text,
        html,
      });

      if (!process.env.SMTP_HOST) {
        logger.info(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
        // Log the message contents to the combined log
        logger.info(`Mock Email Details: ${JSON.stringify(info.message)}`);
      } else {
        logger.info(`[EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
      }
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`, error);
      return false;
    }
  },

  sendWelcomeEmail: async (userEmail, userName) => {
    return emailService.sendEmail({
      to: userEmail,
      subject: "Welcome to PeopleDesk ERP! 🚀",
      html: `<h1>Welcome, ${userName}!</h1>
             <p>Your employee account has been created successfully.</p>
             <p>You can now log in to the portal and view your dashboard, leaves, and assets.</p>
             <br/>
             <p>Best regards,</p>
             <p>HR Operations Team</p>`,
      text: `Welcome, ${userName}! Your employee account has been created successfully. Best regards, HR Operations Team`,
    });
  },

  sendLeaveStatusEmail: async (userEmail, userName, leaveType, fromDate, toDate, status, remarks) => {
    const subject = `Leave Request ${status.toUpperCase()} - PeopleDesk ERP`;
    return emailService.sendEmail({
      to: userEmail,
      subject,
      html: `<h1>Leave Request Update</h1>
             <p>Hello ${userName},</p>
             <p>Your request for <strong>${leaveType}</strong> from ${fromDate} to ${toDate} has been <strong>${status}</strong>.</p>
             ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
             <br/>
             <p>Best regards,</p>
             <p>Operations Portal</p>`,
      text: `Hello ${userName}, Your request for ${leaveType} from ${fromDate} to ${toDate} has been ${status}. Remarks: ${remarks || "None"}`,
    });
  },

  sendAssetAllocationEmail: async (userEmail, userName, assetName, assetCode, action) => {
    const subject = `Asset ${action === "allocated" ? "Assigned" : "Returned"} - PeopleDesk ERP`;
    const actionText = action === "allocated" ? "allocated to" : "returned from";
    return emailService.sendEmail({
      to: userEmail,
      subject,
      html: `<h1>Asset Assignment Update</h1>
             <p>Hello ${userName},</p>
             <p>The asset <strong>${assetName}</strong> (${assetCode}) has been successfully <strong>${actionText}</strong> you.</p>
             <br/>
             <p>Best regards,</p>
             <p>IT Inventory Team</p>`,
      text: `Hello ${userName}, The asset ${assetName} (${assetCode}) has been successfully ${actionText} you. Best regards, IT Inventory Team`,
    });
  },
};

module.exports = emailService;
