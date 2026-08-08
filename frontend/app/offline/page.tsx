import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <WifiOff className="w-9 h-9 text-primary" />
      </div>
      <h1 className="font-poppins text-2xl font-bold mb-2">Bạn đang offline</h1>
      <p className="text-gray-500 max-w-sm mb-6">
        Không thể kết nối tới VietEats AI lúc này. Vui lòng kiểm tra kết nối mạng và thử lại.
      </p>
      <Link href="/" className="btn-primary">Thử lại</Link>
    </div>
  );
}
