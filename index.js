const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["https://your-portfolio-domain.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Portfolio Backend is running!",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// Contact form route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required: name, email, subject, message" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide a valid email address" 
      });
    }

    console.log("Received contact form submission:", { name, email, subject });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Portfolio Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">New Message from Portfolio</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="margin-top: 20px;">
            <h3 style="color: #333;">Message:</h3>
            <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
        </div>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log("Email sent successfully");
    res.json({ 
      success: true, 
      message: "Message sent successfully! I'll get back to you soon." 
    });

  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send message. Please try again later." 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service ready`);
});


