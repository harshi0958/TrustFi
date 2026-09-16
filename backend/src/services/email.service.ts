import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendWelcomeEmail = async (
  name: string,
  email: string
) => {
  try {
    await transporter.sendMail({
      from: `"TrustFi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to TrustFi – Your Confidential Lending Partner",

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#030712;
          font-family:Arial, Helvetica, sans-serif;
          color:#ffffff;
        ">

          <div style="
            max-width:620px;
            margin:40px auto;
            background:#07101f;
            border:1px solid #123047;
            border-radius:18px;
            overflow:hidden;
          ">

            <!-- Header -->

            <div style="
              padding:30px;
              text-align:center;
              background:linear-gradient(135deg,#07101f,#0b1b2d);
              border-bottom:1px solid #123047;
            ">

              <h1 style="
                margin:0;
                font-size:32px;
                letter-spacing:-1px;
              ">
                <span style="color:#22d3ee;">Trust</span>Fi
              </h1>

              <p style="
                margin:8px 0 0;
                color:#94a3b8;
                font-size:14px;
              ">
                Private Finance. Real Possibilities.
              </p>

            </div>

            <!-- Content -->

            <div style="padding:35px 30px;">

              <h2 style="
                margin:0 0 15px;
                color:#ffffff;
                font-size:24px;
              ">
                Welcome to TrustFi, ${name}! 👋
              </h2>

              <p style="
                color:#cbd5e1;
                font-size:15px;
                line-height:1.7;
              ">
                Your TrustFi account has been successfully created.
                We're excited to have you with us.
              </p>

              <p style="
                color:#cbd5e1;
                font-size:15px;
                line-height:1.7;
              ">
                TrustFi combines intelligent technology, privacy-focused
                architecture and transparent lending to create a smarter
                financial experience.
              </p>

              <!-- Facilities -->

              <div style="
                margin:25px 0;
                padding:20px;
                background:#0b1628;
                border:1px solid #17324a;
                border-radius:14px;
              ">

                <h3 style="
                  margin:0 0 15px;
                  color:#22d3ee;
                  font-size:17px;
                ">
                  Explore TrustFi Loan Facilities
                </h3>

                <p style="
                  margin:8px 0;
                  color:#cbd5e1;
                  font-size:14px;
                ">
                  🔹 Personal Loans
                </p>

                <p style="
                  margin:8px 0;
                  color:#cbd5e1;
                  font-size:14px;
                ">
                  🔹 Property Loans
                </p>

                <p style="
                  margin:8px 0;
                  color:#cbd5e1;
                  font-size:14px;
                ">
                  🔹 Gold Loans
                </p>

                <p style="
                  margin:8px 0;
                  color:#cbd5e1;
                  font-size:14px;
                ">
                  🔹 AI-powered eligibility assessment
                </p>

                <p style="
                  margin:8px 0;
                  color:#cbd5e1;
                  font-size:14px;
                ">
                  🔹 Privacy-focused lending
                </p>

              </div>

              <p style="
                color:#94a3b8;
                font-size:14px;
                line-height:1.7;
              ">
                Your registered mobile number can be used for
                secure OTP-based login to your TrustFi account.
              </p>

              <div style="
                margin-top:30px;
                padding-top:20px;
                border-top:1px solid #17324a;
              ">

                <p style="
                  margin:0;
                  color:#64748b;
                  font-size:12px;
                ">
                  This email confirms the successful creation of
                  your TrustFi account.
                </p>

              </div>

            </div>

            <!-- Footer -->

            <div style="
              padding:22px 30px;
              text-align:center;
              background:#050c18;
              border-top:1px solid #123047;
            ">

              <p style="
                margin:0;
                color:#64748b;
                font-size:12px;
              ">
                🛡️ Your information is securely protected.
              </p>

              <p style="
                margin:8px 0 0;
                color:#475569;
                font-size:11px;
              ">
                TrustFi — Building a More Inclusive Tomorrow
              </p>

            </div>

          </div>

        </body>
        </html>
      `,
    });

    console.log(`Welcome email sent successfully to ${email}`);

    return true;
  } catch (error) {
    console.error("Welcome Email Error:", error);
    return false;
  }
};