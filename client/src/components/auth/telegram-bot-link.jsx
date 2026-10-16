import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Send} from "lucide-react";
import {getTelegramInfo} from "@/store/auth-slice/index.js";

// NAFIS Telegram botiga o'tish tugmasi. href berilmasa, bot havolasi serverdan olinadi
function TelegramBotLink({href, label = "Telegram botga o'tish", className = ""}) {
  const dispatch = useDispatch();
  const [bot, setBot] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    dispatch(getTelegramInfo()).then(({payload}) => {
      if (!isCancelled && payload?.botLink) setBot(payload);
    });
    return () => {
      isCancelled = true;
    };
  }, [dispatch]);

  const link = href || bot?.botLink;
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#2aabee]/40 bg-white text-sm font-semibold text-[#2481cc] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2aabee] hover:bg-[#e5f1fb]/70 ${className}`}
    >
      <Send className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12"/>
      {label}
      {bot?.botUsername ? <span className="font-normal text-[#2b5f8a]/70">@{bot.botUsername}</span> : null}
    </a>
  );
}

export default TelegramBotLink;
