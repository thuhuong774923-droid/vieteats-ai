const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

/**
 * Xác thực Google ID Token thật (được frontend lấy từ Google Identity Services SDK).
 * Trả về payload gồm email, name, picture đã được Google xác nhận.
 */
async function verifyGoogleToken(idToken) {
  if (!googleClient) {
    throw new Error("GOOGLE_CLIENT_ID chưa được cấu hình trong backend/.env");
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload(); // { email, name, picture, email_verified, ... }
}

/**
 * Xác thực Facebook Access Token thật bằng cách gọi Facebook Graph API.
 * Yêu cầu accessToken được lấy từ Facebook JS SDK ở frontend với quyền "email".
 */
async function verifyFacebookToken(accessToken) {
  const url = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Facebook accessToken không hợp lệ hoặc đã hết hạn");
  }
  return response.json(); // { id, name, email, picture: { data: { url } } }
}

module.exports = { verifyGoogleToken, verifyFacebookToken };
