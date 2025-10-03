const nodemailer = require('nodemailer');

// Create transporter configurable via env for Gmail or any SMTP provider
// Prefer SMTP_* if provided; otherwise fallback to Gmail service
const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
  } = process.env;

  if (SMTP_HOST && EMAIL_USER && EMAIL_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 465,
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  // Fallback to Gmail service (requires 2FA + App Password)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER || 'your-email@gmail.com',
      pass: EMAIL_PASS || 'your-app-password',
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, name, otp, type = 'registration') => {
  try {
    // Development fallback: log OTP instead of sending email
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV_MODE] OTP for ${email} (${type}): ${otp}`);
      return { success: true, dev: true };
    }

    const transporter = createTransporter();
    
    const emailType = type === 'registration' ? 'Account Registration' : 'Login Verification';
    const action = type === 'registration' ? 'complete your registration' : 'log in to your account';
    
    const mailOptions = {
      from: {
        name: 'Shivalik Service Hub',
        address: process.env.EMAIL_USER || 'your-email@gmail.com'
      },
      to: email,
      subject: `${emailType} - OTP Verification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Shivalik Service Hub</h1>
            <p style="color: #6b7280; margin: 5px 0;">Your trusted service partner</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for using Shivalik Service Hub. To ${action}, please use the following One-Time Password (OTP):
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #2563eb; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 8px;">
                ${otp}
              </div>
            </div>
            
            <div style="background-color: #fef3cd; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> This OTP is valid for 10 minutes only. Do not share it with anyone.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't request this ${type}, please ignore this email or contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent by Shivalik Service Hub. Please do not reply to this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 Shivalik Service Hub. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful registration
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Shivalik Service Hub',
        address: process.env.EMAIL_USER || 'your-email@gmail.com'
      },
      to: email,
      subject: 'Welcome to Shivalik Service Hub! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">🎉 Welcome to Shivalik Service Hub!</h1>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Congratulations! Your account has been successfully created and verified. Welcome to the Shivalik Service Hub family!
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>Browse our wide range of services</li>
                <li>Add items to your cart and make purchases</li>
                <li>Track your orders and service requests</li>
                <li>Manage your account and preferences</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173" style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; display: inline-block; font-weight: bold;">
                Start Exploring
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions or need assistance, feel free to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Thank you for choosing Shivalik Service Hub!
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 Shivalik Service Hub. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Verify transporter (called on server start for diagnostics)
const verifyEmailTransport = async () => {
  if (process.env.EMAIL_DEV_MODE === 'true') {
    console.log('[DEV_MODE] Email sending is disabled. OTPs will be logged to console.');
    return true;
  }
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('SMTP transporter is ready to send emails');
    return true;
  } catch (err) {
    console.error('SMTP transporter verification failed:', err.message);
    return false;
  }
};

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (email, name, order) => {
  try {
    // Development fallback: log order instead of sending email
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV_MODE] Order confirmation for ${email}: Order ID ${order._id}`);
      return { success: true, dev: true };
    }

    const transporter = createTransporter();
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: {
        name: 'Shivalik Service Hub',
        address: process.env.EMAIL_USER || 'your-email@gmail.com'
      },
      to: email,
      subject: `Order Confirmed - #${order._id.toString().slice(-6)} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Order Confirmed!</h1>
            <p style="color: #6b7280; margin: 5px 0;">Thank you for your purchase</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Your order has been successfully placed and is being processed. Here are the details:
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">Items Ordered</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #2563eb;">
                <strong style="font-size: 18px; color: #1f2937;">Total: ₹${order.total}</strong>
              </div>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-top: 0;">Shipping Address</h3>
              <p style="margin: 5px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
              <p style="margin: 5px 0;">${order.shippingAddress.phone}</p>
              <p style="margin: 5px 0;">${order.shippingAddress.line1}</p>
              ${order.shippingAddress.line2 ? `<p style="margin: 5px 0;">${order.shippingAddress.line2}</p>` : ''}
              <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
              <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              We'll send you updates about your order status. If you have any questions, feel free to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Thank you for shopping with Shivalik Service Hub!
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 Shivalik Service Hub. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order notification email to admin
const sendAdminOrderNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (!adminEmail) {
      console.log('No admin email configured, skipping admin notification');
      return { success: true, skipped: true };
    }

    // Development fallback: log order instead of sending email
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV_MODE] Admin notification for order: ${order._id}`);
      return { success: true, dev: true };
    }

    const transporter = createTransporter();
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: {
        name: 'Shivalik Service Hub',
        address: process.env.EMAIL_USER || 'your-email@gmail.com'
      },
      to: adminEmail,
      subject: `🛒 New Order Received - #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">🛒 New Order Alert</h1>
            <p style="color: #6b7280; margin: 5px 0;">A new order has been placed</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Summary</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Order Information</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
              <p><strong>Customer:</strong> ${order.userName} (${order.userEmail})</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.total}</p>
              <p><strong>Payment Status:</strong> Confirmed</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Items Ordered</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Shipping Address</h3>
              <p style="margin: 3px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
              <p style="margin: 3px 0;">${order.shippingAddress.phone}</p>
              <p style="margin: 3px 0;">${order.shippingAddress.line1}</p>
              ${order.shippingAddress.line2 ? `<p style="margin: 3px 0;">${order.shippingAddress.line2}</p>` : ''}
              <p style="margin: 3px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
              <p style="margin: 3px 0;">${order.shippingAddress.country}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #dc2626; font-weight: bold;">Please process this order as soon as possible.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated notification from Shivalik Service Hub.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin order notification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending admin order notification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  verifyEmailTransport
};
