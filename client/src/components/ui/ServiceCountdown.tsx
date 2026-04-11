import { useEffect, useState } from 'react';

// Sunday 10:30 AM Sunshine Service
const SERVICE_DAY = 0; // Sunday
const SERVICE_HOUR = 10;
const SERVICE_MIN = 30;
const SERVICE_DURATION_HRS = 2; // service runs ~2 hours

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getNextService(): { isLive: boolean; next: Date } {
  const now = new Date();
  const next = new Date(now);
  next.setHours(SERVICE_HOUR, SERVICE_MIN, 0, 0);

  // If today is Sunday
  if (now.getDay() === SERVICE_DAY) {
    const serviceEnd = new Date(next);
    serviceEnd.setHours(SERVICE_HOUR + SERVICE_DURATION_HRS, SERVICE_MIN, 0, 0);
    if (now >= next && now <= serviceEnd) {
      return { isLive: true, next };
    }
    // If Sunday but service already ended — jump to next Sunday
    if (now > serviceEnd) {
      next.setDate(next.getDate() + 7);
      return { isLive: false, next };
    }
    // Sunday but before service
    return { isLive: false, next };
  }

  // Not Sunday — calculate days until next Sunday
  const daysUntil = (7 - now.getDay()) % 7 || 7;
  next.setDate(next.getDate() + daysUntil);
  return { isLive: false, next };
}

export default function ServiceCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    function tick() {
      const { isLive: live, next } = getNextService();
      setIsLive(live);
      if (!live) {
        const diff = next.getTime() - Date.now();
        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
          });
        }
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (isLive) {
    return (
      <div className="bg-red-600 text-white py-3 px-4 text-center">
        <div className="container-max flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse inline-block" />
            WE ARE LIVE NOW — Sunshine Service in progress
          </span>
          <a href="/watch-live" className="px-4 py-1 bg-white text-red-600 font-bold rounded-full text-xs hover:bg-red-50 transition-colors">
            Watch Now →
          </a>
        </div>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-gray-900 text-white py-2.5 px-4 text-center">
      <div className="container-max flex items-center justify-center gap-4 flex-wrap text-sm">
        <span className="text-gray-400 font-medium">Next Sunshine Service — Sunday 10:30 AM</span>
        <div className="flex items-center gap-2 font-mono font-bold">
          {timeLeft.days > 0 && (
            <>
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{pad(timeLeft.days)}d</span>
            </>
          )}
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{pad(timeLeft.hours)}h</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{pad(timeLeft.minutes)}m</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{pad(timeLeft.seconds)}s</span>
        </div>
      </div>
    </div>
  );
}
