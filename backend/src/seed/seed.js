/**
 * VietEats AI - Seed Script
 * Sinh dữ liệu mẫu cho: 63 tỉnh thành, 1000+ món ăn, 5000+ nhà hàng, 10000+ đánh giá.
 * Chạy: npm run seed         -> sinh dữ liệu
 *       npm run seed:destroy -> xoá toàn bộ dữ liệu
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Province = require("../models/Province");
const Category = require("../models/Category");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const Passport = require("../models/Passport");
const CommunityPost = require("../models/CommunityPost");

const provincesSeed = require("./provincesData");
const {
  foodBaseNames, restaurantPrefixes, restaurantSuffixes, streetNames, reviewComments,
  pick, randInt, randFloat, jitterCoord, makeSlug, randomFullName, randomTags,
} = require("./generators");

const CATEGORY_NAMES = [
  "Món chính", "Món khai vị", "Món tráng miệng", "Đồ uống", "Món chay",
  "Ăn vặt đường phố", "Lẩu", "Nướng - BBQ", "Hải sản", "Bún - Phở - Mì",
];

const FESTIVAL_POOL = [
  { name: "Lễ hội ẩm thực địa phương", time: "Tháng 3 âm lịch" },
  { name: "Lễ hội mùa xuân", time: "Tháng Giêng" },
  { name: "Hội làng truyền thống", time: "Tháng 8 âm lịch" },
];

async function run() {
  await connectDB();
  const destroy = process.argv.includes("--destroy");

  console.log("🧹 Đang xoá dữ liệu cũ...");
  await Promise.all([
    User.deleteMany({}),
    Province.deleteMany({}),
    Category.deleteMany({}),
    Food.deleteMany({}),
    Restaurant.deleteMany({}),
    Review.deleteMany({}),
    Passport.deleteMany({}),
    CommunityPost.deleteMany({}),
  ]);

  if (destroy) {
    console.log("✅ Đã xoá toàn bộ dữ liệu.");
    process.exit(0);
  }

  // ---------- 1. USERS (admin + demo + pool để làm tác giả review) ----------
  console.log("👤 Đang tạo người dùng...");
  const admin = await User.create({
    name: "VietEats Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@vieteats.ai",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@123",
    role: "admin",
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  });
  const demo = await User.create({
    name: "Demo User",
    email: process.env.SEED_USER_EMAIL || "demo@vieteats.ai",
    password: process.env.SEED_USER_PASSWORD || "Demo@123",
    role: "user",
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    points: 120,
  });
  await Passport.create({ user: admin._id });
  await Passport.create({ user: demo._id, points: 120 });

  const poolUsers = [];
  for (let i = 0; i < 300; i++) {
    poolUsers.push({
      name: randomFullName(),
      email: `user${i}@vieteats.ai`,
      password: "Password@123",
      role: "user",
      isVerified: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      points: randInt(0, 500),
    });
  }
  // Tạo tuần tự để trigger pre-save hash password (insertMany bỏ qua middleware)
  const createdUsers = [];
  for (const u of poolUsers) {
    createdUsers.push(await User.create(u));
  }
  const allUsers = [admin, demo, ...createdUsers];
  console.log(`✅ Đã tạo ${allUsers.length} người dùng.`);

  // ---------- 2. CATEGORIES ----------
  console.log("🏷️  Đang tạo danh mục...");
  const categories = await Category.insertMany(
    CATEGORY_NAMES.map((name) => ({ name, slug: makeSlug(name, "cat") }))
  );

  // ---------- 3. PROVINCES (63 tỉnh) ----------
  console.log("🗺️  Đang tạo 63 tỉnh thành...");
  const provinces = [];
  for (const p of provincesSeed) {
    const province = await Province.create({
      name: p.name,
      slug: makeSlug(p.name, "vn"),
      region: p.region,
      coverImage: `https://picsum.photos/seed/${encodeURIComponent(p.name)}/1200/600`,
      gallery: [1, 2, 3].map((n) => `https://picsum.photos/seed/${encodeURIComponent(p.name)}-${n}/800/600`),
      description: `${p.name} là một trong những địa phương mang đậm bản sắc văn hoá và ẩm thực của miền ${p.region}, thu hút du khách bởi những món ăn đặc trưng và cảnh quan tuyệt đẹp.`,
      history: `${p.name} có bề dày lịch sử lâu đời gắn liền với quá trình hình thành và phát triển của vùng miền ${p.region} Việt Nam.`,
      cuisine: `Ẩm thực ${p.name} nổi bật với sự kết hợp tinh tế giữa nguyên liệu địa phương và kỹ thuật chế biến truyền thống.`,
      festivals: [pick(FESTIVAL_POOL), pick(FESTIVAL_POOL)],
      attractions: [1, 2, 3].map((n) => ({
        name: `Điểm tham quan ${n} - ${p.name}`,
        lat: jitterCoord(p.lat),
        lng: jitterCoord(p.lng),
        description: `Địa điểm du lịch nổi bật tại ${p.name}.`,
        image: `https://picsum.photos/seed/${encodeURIComponent(p.name)}-attr${n}/600/400`,
      })),
      location: { lat: p.lat, lng: p.lng },
      population: randInt(300000, 9000000),
    });
    provinces.push(province);
  }
  console.log(`✅ Đã tạo ${provinces.length} tỉnh thành.`);

  // ---------- 4. FOODS (~1000+) ----------
  console.log("🍜 Đang tạo món ăn (~1000+)...");
  const FOODS_PER_PROVINCE = 16; // 63 * 16 = 1008
  const foods = [];
  for (const province of provinces) {
    for (let i = 0; i < FOODS_PER_PROVINCE; i++) {
      const base = pick(foodBaseNames);
      const name = `${base} ${province.name}`;
      const priceMin = randInt(15, 80) * 1000;
      const priceMax = priceMin + randInt(10, 60) * 1000;
      const food = await Food.create({
        name,
        slug: makeSlug(name, `${province.slug}-${i}`),
        province: province._id,
        region: province.region,
        category: pick(categories)._id,
        tags: randomTags(),
        images: [1, 2].map((n) => `https://picsum.photos/seed/${encodeURIComponent(name)}-${n}/700/500`),
        priceMin,
        priceMax,
        spiceLevel: randInt(0, 5),
        isVegetarian: Math.random() < 0.12,
        story: {
          history: `${name} là món ăn gắn liền với đời sống người dân ${province.name} qua nhiều thế hệ.`,
          origin: `Bắt nguồn từ ${province.name}, món ăn dần trở thành biểu tượng ẩm thực của vùng miền ${province.region}.`,
          culturalMeaning: `Món ăn thể hiện sự khéo léo, tinh tế trong văn hoá ẩm thực ${province.region} Việt Nam.`,
          legend: "",
        },
        ingredients: ["Gia vị đặc trưng", "Nguyên liệu tươi địa phương", "Rau thơm", "Nước chấm truyền thống"],
        recipe: [
          { step: 1, description: "Sơ chế nguyên liệu tươi sạch." },
          { step: 2, description: "Ướp gia vị theo công thức truyền thống." },
          { step: 3, description: "Chế biến theo phương pháp đặc trưng địa phương." },
          { step: 4, description: "Trình bày và thưởng thức khi còn nóng." },
        ],
        nutrition: {
          calories: randInt(150, 750),
          protein: randInt(5, 40),
          fat: randInt(2, 30),
          carb: randInt(10, 80),
        },
        rating: randFloat(3.5, 5, 1),
        ratingCount: randInt(5, 400),
        viewCount: randInt(50, 5000),
        bookmarkCount: randInt(0, 300),
        isTrending: Math.random() < 0.1,
        isFeatured: Math.random() < 0.08,
      });
      foods.push(food);
    }
  }
  console.log(`✅ Đã tạo ${foods.length} món ăn.`);

  // ---------- 5. RESTAURANTS (~5000+) ----------
  console.log("🏮 Đang tạo nhà hàng (~5000+)...");
  const RESTAURANTS_PER_PROVINCE = 80; // 63 * 80 = 5040
  const foodsByProvince = {};
  for (const f of foods) {
    const key = String(f.province);
    if (!foodsByProvince[key]) foodsByProvince[key] = [];
    foodsByProvince[key].push(f);
  }

  const restaurants = [];
  for (const province of provinces) {
    const provinceFoods = foodsByProvince[String(province._id)] || [];
    const batch = [];
    for (let i = 0; i < RESTAURANTS_PER_PROVINCE; i++) {
      const name = `${pick(restaurantPrefixes)} ${pick(restaurantSuffixes)}`;
      const assignedFoods = provinceFoods.length
        ? Array.from({ length: randInt(1, 4) }, () => pick(provinceFoods)._id)
        : [];
      batch.push({
        name,
        slug: makeSlug(name, `${province.slug}-r${i}`),
        province: province._id,
        address: `${randInt(1, 300)} ${pick(streetNames)}, ${province.name}`,
        location: { lat: jitterCoord(province.lat || province.location.lat), lng: jitterCoord(province.lng || province.location.lng) },
        images: [`https://picsum.photos/seed/${encodeURIComponent(name)}-${i}/700/500`],
        foods: assignedFoods,
        priceRange: pick(["$", "$$", "$$$", "$$$$"]),
        openHours: pick(["06:00 - 21:00", "07:00 - 22:00", "10:00 - 23:00", "24/7"]),
        phone: `0${randInt(300000000, 999999999)}`,
        rating: randFloat(3.5, 5, 1),
        ratingCount: randInt(5, 500),
        isVerified: Math.random() < 0.3,
        tags: randomTags(),
      });
    }
    const created = await Restaurant.insertMany(batch);
    restaurants.push(...created);
  }
  console.log(`✅ Đã tạo ${restaurants.length} nhà hàng.`);

  // ---------- 6. REVIEWS (~10000+) ----------
  console.log("⭐ Đang tạo đánh giá (~10000+)...");
  const reviewDocs = [];
  const authorIds = allUsers.map((u) => u._id);

  // 5 reviews / food trung bình
  for (const food of foods) {
    const n = randInt(3, 7);
    for (let i = 0; i < n; i++) {
      reviewDocs.push({
        user: pick(authorIds),
        targetType: "Food",
        targetId: food._id,
        rating: randInt(3, 5),
        comment: pick(reviewComments),
        images: Math.random() < 0.2 ? [`https://picsum.photos/seed/review-${food._id}-${i}/500/400`] : [],
      });
    }
  }
  // ~1-2 reviews / restaurant trung bình
  for (const restaurant of restaurants) {
    const n = randInt(1, 2);
    for (let i = 0; i < n; i++) {
      reviewDocs.push({
        user: pick(authorIds),
        targetType: "Restaurant",
        targetId: restaurant._id,
        rating: randInt(3, 5),
        comment: pick(reviewComments),
        images: [],
      });
    }
  }

  // Insert theo batch để tránh quá tải memory
  const BATCH = 2000;
  for (let i = 0; i < reviewDocs.length; i += BATCH) {
    await Review.insertMany(reviewDocs.slice(i, i + BATCH), { ordered: false });
    console.log(`  ...đã chèn ${Math.min(i + BATCH, reviewDocs.length)}/${reviewDocs.length} đánh giá`);
  }
  console.log(`✅ Đã tạo ${reviewDocs.length} đánh giá.`);

  // ---------- 7. COMMUNITY POSTS mẫu ----------
  console.log("📝 Đang tạo bài đăng cộng đồng mẫu...");
  const postDocs = [];
  for (let i = 0; i < 150; i++) {
    const food = pick(foods);
    postDocs.push({
      user: pick(authorIds),
      content: `Vừa thưởng thức ${food.name} cực ngon tại ${provinces.find((p) => String(p._id) === String(food.province))?.name}! #vieteats #amthucviet`,
      images: [`https://picsum.photos/seed/post-${i}/700/500`],
      hashtags: ["vieteats", "amthucviet", "foodie"],
      relatedFood: food._id,
      likes: [],
      comments: [],
    });
  }
  await CommunityPost.insertMany(postDocs);
  console.log(`✅ Đã tạo ${postDocs.length} bài đăng cộng đồng.`);

  console.log("\n🎉 SEED HOÀN TẤT!");
  console.log(`   Tỉnh thành : ${provinces.length}`);
  console.log(`   Món ăn     : ${foods.length}`);
  console.log(`   Nhà hàng   : ${restaurants.length}`);
  console.log(`   Đánh giá   : ${reviewDocs.length}`);
  console.log(`   Người dùng : ${allUsers.length}`);
  console.log("\n🔑 Tài khoản mẫu:");
  console.log(`   Admin : ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || "Admin@123"}`);
  console.log(`   User  : ${demo.email} / ${process.env.SEED_USER_PASSWORD || "Demo@123"}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Lỗi khi seed dữ liệu:", err);
  process.exit(1);
});
