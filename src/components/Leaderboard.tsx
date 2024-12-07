"use client";

interface LeaderboardEntry {
  address: string;
  score: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const Leaderboard = ({ entries }: LeaderboardProps) => {
  return (
    <div className="mt-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="bg-white rounded-lg shadow-lg">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 border-b"
          >
            <span className="text-sm font-mono">
              {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
            </span>
            <span className="font-bold">{entry.score} points</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
