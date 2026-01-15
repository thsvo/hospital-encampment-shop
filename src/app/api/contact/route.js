import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp0001.neo.space",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { firstName, lastName, email, message } = await request.json();

    if (!firstName || !lastName || !email || !message) {
      return Response.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    // Email to support with the contact form details
    const mailOptions = {
      from: `"BioVibe Peptides" <support@biovibepeptides.com>`,
      replyTo: email, // Reply goes to the person who submitted the form
      to: 'support@biovibepeptides.com',
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: #0B2E27; padding: 30px; text-align: center;">
            <h1 style="color: #41DAC1; margin: 0; font-size: 28px;">BioVibe Peptides</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">New Contact Form Submission</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #0B2E27; margin: 0 0 20px 0;">Contact Details</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; color: #0B2E27;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; color: #0B2E27;"><a href="mailto:${email}" style="color: #41DAC1;">${email}</a></td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 15px 0; color: #0B2E27; font-size: 16px;">Message</h3>
              <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #0B2E27; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">This message was sent from the BioVibe Peptides website contact form.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
