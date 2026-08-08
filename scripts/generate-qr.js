/**
 * Script tạo mã QR thương hiệu VietEats AI trỏ tới một URL bất kỳ.
 * Dùng khi đã deploy lên domain thật và cần tạo lại QR (ví dụ để in poster, menu, card).
 *
 * Cài đặt (chỉ cần 1 lần):
 *   npm install qrcode sharp --save-dev
 *
 * Sử dụng:
 *   node scripts/generate-qr.js https://your-real-domain.com
 *   node scripts/generate-qr.js https://your-real-domain.com ./output.png
 *
 * Nếu không truyền URL, mặc định dùng biến NEXT_PUBLIC_SITE_URL trong frontend/.env,
 * hoặc fallback về https://vieteats.ai
 */
const path = require("path");
const fs = require("fs");

async function main() {
  let QRCode, sharp;
  try {
    QRCode = require("qrcode");
    sharp = require("sharp");
  } catch (err) {
    console.error("❌ Thiếu thư viện. Hãy chạy: npm install qrcode sharp --save-dev");
    process.exit(1);
  }

  const url = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://vieteats.ai";
  const outPath = process.argv[3] || path.join(__dirname, "../frontend/public/qr/qr-vieteats.png");
  const logoPath = path.join(__dirname, "../frontend/public/brand/logo-icon.png");

  const SIZE = 1000;
  const PRIMARY = "#D62828";

  // 1. Sinh QR gốc (module vuông đặc - ưu tiên khả năng quét tuyệt đối, error correction cao nhất)
  const qrBuffer = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    width: SIZE,
    color: { dark: PRIMARY, light: "#FFFFFF" },
  });

  // 2. Chèn logo tròn ở giữa (an toàn ở mức ~12% diện tích với error correction H)
  if (fs.existsSync(logoPath)) {
    const logoSize = Math.round(SIZE * 0.12);
    const badgeSize = Math.round(logoSize * 1.44); // nền tròn trắng viền đỏ quanh logo

    const logoResized = await sharp(logoPath).resize(logoSize, logoSize, { fit: "contain" }).toBuffer();

    const badgeSvg = Buffer.from(`
      <svg width="${badgeSize}" height="${badgeSize}">
        <circle cx="${badgeSize / 2}" cy="${badgeSize / 2}" r="${badgeSize / 2 - 2}" fill="white" stroke="${PRIMARY}" stroke-width="4"/>
      </svg>
    `);
    const badge = await sharp(badgeSvg).png().toBuffer();

    const offset = Math.round((SIZE - badgeSize) / 2);
    const logoOffset = Math.round((SIZE - logoSize) / 2);

    const final = await sharp(qrBuffer)
      .composite([
        { input: badge, left: offset, top: offset },
        { input: logoResized, left: logoOffset, top: logoOffset },
      ])
      .png()
      .toBuffer();

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, final);
  } else {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, qrBuffer);
  }

  console.log(`✅ Đã tạo mã QR trỏ tới: ${url}`);
  console.log(`   Lưu tại: ${outPath}`);
  console.log(`\n⚠️  Sau khi tạo, hãy TỰ QUÉT THỬ bằng điện thoại thật để xác nhận trước khi in ấn hàng loạt.`);
}

main().catch((err) => {
  console.error("❌ Lỗi tạo QR:", err.message);
  process.exit(1);
});
