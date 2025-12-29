"use client";
import  { useEffect, useState } from "react";

function getTimeLeft(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Home() {
  // Set your launch date here
  const launchDate = new Date("2026-01-01T10:00:00+05:30");
  const initialNow = new Date("2025-12-29T02:00:00+05:30");
  const totalTime = launchDate.getTime() - initialNow.getTime();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(launchDate));

  const [progress, setProgress] = useState(0);

  useEffect(() => {

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(launchDate));

      const now = new Date();
      const elapsed = now.getTime() - initialNow.getTime();
      const progressPercent = (elapsed / totalTime) * 100;

      setProgress(Math.max(0, Math.min(100, progressPercent)));
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  return (
    <div className="relative flex flex-col items-center w-full h-[78vh] pb-2 pt-16">
      <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat -z-10 opacity-70"></div>
      <h1 className="lg:text-5xl md:text-4xl text-2xl font-bold text-[rgba(58,63,187,1)] mb-2">Launching Soon</h1>
      <p className="lg:text-2xl md:text-xl text-[rgba(128,132,239,1)] mb-6">Almost ready to meet you</p>
      <div className="w-40 h-4 bg-white border-2 border-[rgba(58,63,187,1)] rounded-full p-0.5 items-center justify-center mb-8">
        <div className="h-2 bg-[rgba(58,63,187,1)] shadow-md rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex gap-6 bg-white rounded-xl shadow-lg p-6 mb-10">
        <div className="flex flex-col items-center px-6 py-4 border-2 border-[rgba(196,240,0,1)] bg-[rgba(196,240,0,1)] rounded-lg">
          <span className="lg:text-5xl md:text-[40px] text-xl font-semibold text-[rgba(58,63,187,1)]">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="text-base font-semibold text-[rgba(10,13,26,1)]">Days</span>
        </div>
        <div className="flex flex-col items-center px-6 py-4 border-2 border-[rgba(196,240,0,1)] bg-[rgba(214,255,42,1)] rounded-lg">
          <span className="lg:text-5xl md:text-[40px] text-xl font-semibold text-[rgba(58,63,187,1)]">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-base font-semibold text-[rgba(10,13,26,1)]">Hours</span>
        </div>
        <div className="flex flex-col items-center px-6 py-4 border-2 border-[rgba(196,240,0,1)] bg-[rgba(214,255,42,1)] rounded-lg">
          <span className="lg:text-5xl md:text-[40px] text-xl font-semibold text-[rgba(58,63,187,1)]">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-base font-semibold text-[rgba(10,13,26,1)]">Minutes</span>
        </div>
        <div className="hidden flex-col md:flex items-center px-6 py-4 border-2 border-[rgba(196,240,0,1)] bg-[rgba(214,255,42,1)] rounded-lg">
          <span className="lg:text-5xl md:text-[40px] text-xl font-semibold text-[rgba(58,63,187,1)]">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-base font-semibold text-[rgba(10,13,26,1)]">Seconds</span>
        </div>
      </div>
    </div>
  );
}
