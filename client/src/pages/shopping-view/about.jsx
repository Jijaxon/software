import React from "react";
import { Send } from "lucide-react";

const About = () => {
  return (
    <div className="px-12 py-10">
      <div className="font-bold text-lg leading-relaxed text-justify mb-10">
        <p className="mb-4">
          <span className="font-extrabold text-[#8b4f3f]">NAFIS</span> — go'zallik va o'ziga mehr bilan qarash uchun tanlangan manzil.
        </p>
        <p className="mb-4">
          Biz yuz va soch parvarishi, makiyaj hamda atirlar bo'yicha kundalik ehtiyojingizga mos mahsulotlarni jamlaymiz. CeraVe, The Ordinary, L'Oréal Paris, Maybelline, Dior va Fenty Beauty kabi sevimli brendlaringizni topishingiz mumkin.
        </p>
        <p className="mb-4">
          NAFIS'da xarid qilish sodda: kerakli mahsulotni tanlang, savatga qo'shing va buyurtmani rasmiylashtiring. Savollar bo'lsa, biz bilan bog'laning.
        </p>
        <p>
          <span className="font-extrabold text-[#8b4f3f]">NAFIS</span> — har kungi go'zallik marosimingiz uchun.
        </p>
      </div>

      {/* Telegram bo‘limi */}
      <div className="text-center mt-10">
        <p className="font-semibold text-lg mb-4">
          Savollaringiz bormi? Telegram orqali bog'laning.
        </p>
        <a
          href="https://t.me/moonlightt5"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          <Send className="w-6 h-6" />
          Telegram'da yozish
        </a>
      </div>
    </div>
  );
};

export default About;
