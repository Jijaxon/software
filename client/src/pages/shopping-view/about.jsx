import React from "react";
import { Send } from "lucide-react";

const About = () => {
  return (
    <div className="px-12 py-10">
      <div className="font-bold text-lg leading-relaxed text-justify mb-10">
        <p className="mb-4">
          <span className="text-blue-600 font-extrabold">NextNote</span> — sizning ishonchli noutbuk va
          aksessuarlar do‘koningiz!
        </p>
        <p className="mb-4">
          Bizning maqsadimiz — har bir foydalanuvchiga sifatli, zamonaviy va ishonchli texnologiyalarni
          taklif qilishdir. HP, Dell, Lenovo, Asus, Acer va Apple kabi yetakchi brendlarning eng so‘nggi
          modellari bizda mavjud.
        </p>
        <p className="mb-4">
          Talaba bo‘lasizmi, dizaynermi yoki geymer — siz uchun mos noutbuk albatta topiladi. Biz tezkor
          yetkazib berish, qulay to‘lov tizimi va do‘stona qo‘llab-quvvatlash xizmati orqali xaridingizni
          osonlashtiramiz.
        </p>
        <p>
          <span className="text-blue-600 font-extrabold">NextNote</span> — bu faqat do‘kon emas, bu sizning
          texnologiyadagi ishonchli hamkoringiz.
        </p>
      </div>

      {/* Telegram bo‘limi */}
      <div className="text-center mt-10">
        <p className="font-semibold text-lg mb-4">
          Have questions? Contact us directly on Telegram!
        </p>
        <a
          href="https://t.me/moonlightt5"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          <Send className="w-6 h-6" />
          Message us on Telegram
        </a>
      </div>
    </div>
  );
};

export default About;
