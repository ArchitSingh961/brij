/**
 * Email Service
 * Sends order notifications to owner using Nodemailer
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 * Called once when service is first used
 */
const getTransporter = () => {
  if (transporter) return transporter;

  // Validate email configuration
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('Email configuration incomplete. Email notifications disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT) || 587,
    secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  return transporter;
};

/**
 * Send order notification to owner
 * @param {Object} order - The order object
 */
const sendOrderNotification = async (order) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('Email not configured, skipping notification');
    return { success: false, reason: 'Email not configured' };
  }

  const ownerEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER;

  // Format order items for email
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 New Order Received!</h1>
        <p style="color: white; margin: 10px 0 0;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
        <h2 style="color: #FF6B35; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Customer Details</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0;"><strong>Name:</strong></td>
            <td>${order.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Email:</strong></td>
            <td>${order.customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Phone:</strong></td>
            <td>${order.customerPhone}</td>
          </tr>
        </table>
        
        <h2 style="color: #FF6B35; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Shipping Address</h2>
        <p style="margin-bottom: 20px;">
          ${order.shippingAddress}<br>
          ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}
        </p>
        
        <h2 style="color: #FF6B35; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #f8f8f8;">
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
              <td style="padding: 10px; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr style="background: #f8f8f8;">
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
              <td style="padding: 10px; text-align: right;">₹${order.shippingCost.toFixed(2)}</td>
            </tr>
            <tr style="background: #FF6B35; color: white;">
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 10px; text-align: right;"><strong>₹${order.total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; text-align: center;">
          <p style="color: #2e7d32; margin: 0;">
            <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}
          </p>
        </div>
        
        <p style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
          This is an automated notification from Brij Namkeen Store.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await transport.sendMail({
      from: `"Brij Namkeen Store" <${process.env.SMTP_USER}>`,
      to: ownerEmail,
      subject: `🛒 New Order #${order.orderNumber} - ₹${order.total.toFixed(2)}`,
      html: emailHtml
    });

    console.log(`Order notification sent for order #${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send order notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation to customer
 * @param {Object} order - The order object
 */
const sendOrderConfirmation = async (order) => {
  const transport = getTransporter();
  if (!transport) {
    return { success: false, reason: 'Email not configured' };
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Thank You for Your Order!</h1>
        <p style="color: white; margin: 10px 0 0;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
        <p>Dear ${order.customerName},</p>
        <p>Thank you for ordering from Brij Namkeen! We've received your order and will process it shortly.</p>
        
        <div style="background: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order Total:</strong> ₹${order.total.toFixed(2)}</p>
          <p style="margin: 5px 0 0;"><strong>Items:</strong> ${order.items.length} product(s)</p>
        </div>
        
        <p>Your order will be shipped to:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
          ${order.shippingAddress}<br>
          ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}
        </p>
        
        <p>For any queries, please contact us with your order number.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>Brij Namkeen Team</strong>
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await transport.sendMail({
      from: `"Brij Namkeen Store" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: emailHtml
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send order confirmation:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact form notification to owner
 * @param {Object} contact - Contact form data
 */
const sendContactNotification = async (contact) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('Email not configured, skipping contact notification');
    return { success: false, reason: 'Email not configured' };
  }

  const ownerEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER;

  const subjectLabels = {
    general: 'General Inquiry',
    order: 'Order Request',
    bulk: 'Bulk Order Inquiry',
    feedback: 'Feedback',
    other: 'Other'
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📧 New Contact Message</h1>
        <p style="color: white; margin: 10px 0 0;">${subjectLabels[contact.subject] || contact.subject}</p>
      </div>
      
      <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
        <h2 style="color: #FF6B35; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Contact Details</h2>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; width: 120px;"><strong>Name:</strong></td>
            <td>${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td><a href="mailto:${contact.email}">${contact.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
            <td>${contact.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Subject:</strong></td>
            <td>${subjectLabels[contact.subject] || contact.subject}</td>
          </tr>
        </table>
        
        <h2 style="color: #FF6B35; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Message</h2>
        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
${contact.message}
        </div>
        
        <p style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
          This message was sent from the Brij Namkeen website contact form.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await transport.sendMail({
      from: `"Brij Namkeen Website" <${process.env.SMTP_USER}>`,
      to: ownerEmail,
      replyTo: contact.email,
      subject: `📧 Contact: ${subjectLabels[contact.subject] || contact.subject} - ${contact.name}`,
      html: emailHtml
    });

    console.log(`Contact notification sent from ${contact.email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send contact notification:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderNotification,
  sendOrderConfirmation,
  sendContactNotification
};
