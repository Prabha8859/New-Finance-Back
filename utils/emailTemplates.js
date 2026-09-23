const otpEmailTemplate = ({ otp, minutes }) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="height: 4px; background: linear-gradient(90deg, #066a9c, #26ae90, #f2f231);"></div>
  <div style="padding: 32px;">
    <h2 style="color: rgb(0, 102, 153); margin: 0 0 8px;">Indexia Finance Admin</h2>
    <p style="color: #475569; font-size: 14px; margin: 0 0 24px;">
      Use the code below to reset your admin password. This code expires in ${minutes} minutes.
    </p>
    <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: rgb(0, 102, 153);">
      ${otp}
    </div>
    <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</div>
`;

module.exports = { otpEmailTemplate };
