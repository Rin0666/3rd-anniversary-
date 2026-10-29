import React, { useEffect, useState } from 'react';
import { getDaysTogether } from './anniversary';

export default function AnniversaryCounter({ startDate, timeZone }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = window.setInterval(update, 60_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const days = getDaysTogether(startDate, now, timeZone);
  return <div className="anniversary-counter" role="group" aria-label="Our time together">
    <span className="counter-heart" aria-hidden="true">♡</span>
    <div>
      <span className="counter-value">{days === null ? 'Three years & counting' : <><strong>{days.toLocaleString('en-US')}</strong> {days === 1 ? 'day' : 'days'} together</>}</span>
      <span className="counter-caption">{days === null ? 'Every day, still you.' : <>Since <time dateTime={startDate}>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${startDate}T00:00:00Z`))}</time></>}</span>
    </div>
  </div>;
}
