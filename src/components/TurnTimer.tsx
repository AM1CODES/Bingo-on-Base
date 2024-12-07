"use client";
import React, { useState, useEffect } from "react";

interface TurnTimerProps {
  startTime: number;
  timeLimit: number;
  onTimeUp?: () => void;
}

const TurnTimer: React.FC<TurnTimerProps> = ({
  startTime,
  timeLimit,
  onTimeUp,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, timeLimit - elapsed);

      setTimeLeft(remaining);

      if (remaining === 0 && onTimeUp) {
        onTimeUp();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, timeLimit, onTimeUp]);

  const seconds = Math.ceil(timeLeft / 1000);
  const progress = (timeLeft / timeLimit) * 100;

  return (
    <div className="w-full">
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-100 ${
            progress > 50
              ? "bg-green-500"
              : progress > 20
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center text-sm mt-1">{seconds}s</div>
    </div>
  );
};

export default TurnTimer;
