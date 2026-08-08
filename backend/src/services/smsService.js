let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require("twilio");
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Gửi mã OTP qua SMS thật (Twilio) khi đã cấu hình TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER.
 * Nếu chưa cấu hình, in mã OTP ra console server để tiện test ở môi trường dev/demo.
 */
async function sendOtpSms(phone, otp) {
  const message = `[VietEats AI] Ma xac thuc cua ban la: ${otp}. Ma co hieu luc trong 10 phut.`;

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER && phone) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      return { sent: true, channel: "sms" };
    } catch (err) {
      console.error("❌ Gửi SMS Twilio thất bại:", err.message);
      console.log(`📩 [DEV fallback] OTP cho ${phone}: ${otp}`);
      return { sent: false, channel: "console", error: err.message };
    }
  }

  console.log(`📩 [DEV] OTP cho ${phone || "(chưa có SĐT)"}: ${otp}`);
  return { sent: false, channel: "console" };
}

module.exports = { sendOtpSms };
