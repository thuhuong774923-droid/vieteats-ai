import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="hidden md:block bg-[#2A1414] text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-9 h-9 shrink-0">
              <Image src="/icons/icon-192.png" alt="VietEats AI" fill className="object-contain" />
            </div>
            <span className="font-poppins font-bold text-lg">VietEats AI</span>
          </div>
          <p className="text-sm text-white/60">
            Khám phá tinh hoa ẩm thực Việt Nam qua 63 tỉnh thành cùng trợ lý AI thông minh.
          </p>
          <div className="flex gap-3 mt-4">
            <Facebook className="w-5 h-5 text-white/60 hover:text-secondary cursor-pointer" />
            <Instagram className="w-5 h-5 text-white/60 hover:text-secondary cursor-pointer" />
            <Youtube className="w-5 h-5 text-white/60 hover:text-secondary cursor-pointer" />
            <Mail className="w-5 h-5 text-white/60 hover:text-secondary cursor-pointer" />
          </div>

          <div className="flex items-center gap-3 mt-6 p-3 rounded-xl2 bg-white/5 w-fit">
            <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white p-1">
              <Image src="/qr/qr-vieteats.png" alt="Quét mã QR để vào VietEats AI" fill className="object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/90">Quét mã để truy cập nhanh</p>
              <p className="text-[11px] text-white/50">Mở app camera và quét</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-poppins font-semibold mb-3">Giới thiệu</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link href="/about">Về chúng tôi</Link></li>
            <li><Link href="/contact">Liên hệ</Link></li>
            <li><Link href="/terms">Điều khoản sử dụng</Link></li>
            <li><Link href="/privacy">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-poppins font-semibold mb-3">Khám phá</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link href="/menu">Thực đơn</Link></li>
            <li><Link href="/provinces">63 tỉnh thành</Link></li>
            <li><Link href="/ai-assistant">AI Assistant</Link></li>
            <li><Link href="/passport">Food Passport</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-poppins font-semibold mb-3">Đăng ký nhận tin</h4>
          <p className="text-sm text-white/60 mb-3">Nhận gợi ý món ngon và ưu đãi mới nhất.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-3 py-2 rounded-xl2 text-sm text-textmain focus:outline-none"
            />
            <button className="btn-secondary !py-2 !px-4 text-sm">Gửi</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} VietEats AI. All rights reserved.
      </div>
    </footer>
  );
}
