const User = require("../models/User");
const Passport = require("../models/Passport");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { verifyGoogleToken, verifyFacebookToken } = require("../services/oauthService");
const { sendOtpSms } = require("../services/smsService");

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email đã được sử dụng" });

    const user = await User.create({ name, email, password });
    await Passport.create({ user: user._id });

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }
    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
};

// @route POST /api/auth/forgot-password  (gửi OTP qua SMS thật nếu cấu hình Twilio, hoặc log console ở dev / hoặc qua email nếu có SMTP)
const forgotPassword = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const user = phone ? await User.findOne({ phone }) : await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const target = phone || user.phone;
    const result = await sendOtpSms(target, otp);

    res.json({
      success: true,
      message: result.sent
        ? `Mã OTP đã được gửi tới ${target}`
        : "Twilio chưa được cấu hình - mã OTP đã in ra console server (chế độ dev)",
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select("+otpCode +otpExpires");
    if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/google  (Google Sign-In - xác thực idToken thật từ Google Identity Services)
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: "Thiếu idToken" });

    const payload = await verifyGoogleToken(idToken);
    if (!payload?.email) {
      return res.status(401).json({ success: false, message: "Token Google không hợp lệ" });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        password: `google_${Math.random().toString(36).slice(2)}${Date.now()}`, // password ngẫu nhiên, user đăng nhập qua Google
        avatar: payload.picture || "",
        provider: "google",
        isVerified: true,
      });
      await Passport.create({ user: user._id });
    } else if (user.provider === "local" && !user.avatar && payload.picture) {
      user.avatar = payload.picture;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/facebook  (Facebook Login - xác thực accessToken thật qua Facebook Graph API)
const facebookLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ success: false, message: "Thiếu accessToken" });

    const profile = await verifyFacebookToken(accessToken);
    if (!profile?.email) {
      return res.status(401).json({ success: false, message: "Không lấy được thông tin tài khoản Facebook (cần quyền email)" });
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email,
        password: `facebook_${Math.random().toString(36).slice(2)}${Date.now()}`,
        avatar: profile.picture?.data?.url || "",
        provider: "facebook",
        isVerified: true,
      });
      await Passport.create({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, googleLogin, facebookLogin };
