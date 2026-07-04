"use client";

import { useEffect, useState } from "react";

function formatCountdown(distanceMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(distanceMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function CurrentVisitCountdown({
  arrivalDateTime,
}: {
  arrivalDateTime: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const arrivalTime = new Date(arrivalDateTime).getTime();

  if (Number.isNaN(arrivalTime)) {
    return <span>Countdown unavailable.</span>;
  }

  const distance = arrivalTime - now;

  if (distance <= 0) {
    return <span>Arriving now.</span>;
  }

  return <span>Arrives in {formatCountdown(distance)}.</span>;
}
