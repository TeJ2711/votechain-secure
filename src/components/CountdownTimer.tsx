import { useState, useEffect } from 'react';

interface Props {
  targetDate: string;
  label?: string;
}

export default function CountdownTimer({ targetDate, label = 'Ends in' }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div>
      {label && <p className="text-xs text-muted-foreground mb-2">{label}</p>}
      <div className="flex gap-2">
        {units.map(u => (
          <div key={u.label} className="flex flex-col items-center rounded-lg bg-secondary px-3 py-2 min-w-[3.5rem]">
            <span className="text-xl font-bold font-mono text-primary">{String(u.value).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
