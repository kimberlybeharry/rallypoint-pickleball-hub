import { USER, RECENT_ACTIVITY, RECOMMENDATIONS } from "@/lib/data";
import Link from "next/link";
import { Calendar, ShoppingBag, Gift } from "lucide-react";

const TIER_COLOURS: Record<string, string> = {
  Silver: "text-gray-600 bg-gray-100",
  Gold: "text-yellow-700 bg-yellow-100",
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  booking: <Calendar size={16} className="text-green-600" />,
  purchase: <ShoppingBag size={16} className="text-blue-500" />,
  points: <Gift size={16} className="text-purple-500" />,
};

export default function DashboardPage() {
  const progress = Math.min(
    100,
    ((USER.points - (USER.nextTierThreshold - USER.pointsToNextTier - USER.points + USER.points)) /
      USER.nextTierThreshold) *
      100
  );
  // Simpler progress: how far from 200 (Silver start) to 500 (Gold start)
  const progressPct = Math.round(((USER.points - 200) / (500 - 200)) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
      <p className="text-gray-500 mb-8">Welcome back, {USER.name}</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Points card */}
          <div className="bg-green-700 text-white rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-green-200 text-sm mb-1">Current balance</p>
                <p className="text-5xl font-extrabold">{USER.points}</p>
                <p className="text-green-200 text-sm">points</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${TIER_COLOURS[USER.tier]}`}>
                {USER.tier}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-green-200 mb-1">
                <span>{USER.tier}</span>
                <span>{USER.nextTier} ({USER.nextTierThreshold} pts)</span>
              </div>
              <div className="w-full bg-green-600 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-green-200 text-xs mt-1">
                {USER.pointsToNextTier} points to {USER.nextTier}
              </p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    {ACTIVITY_ICONS[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.description}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <span className="text-green-700 font-semibold text-sm whitespace-nowrap">
                    +{item.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* How to earn more */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">How to earn points</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Court booking", value: "50 pts / booking" },
                { label: "Equipment purchase", value: "1 pt per $1 spent" },
                { label: "Referral", value: "100 pts per friend" },
              ].map((row) => (
                <div key={row.label} className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-green-700 font-bold text-lg">{row.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{row.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — recommendations */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">Recommended for you</h2>
            <p className="text-gray-400 text-xs mb-4">Based on your activity</p>
            <div className="space-y-4">
              {RECOMMENDATIONS.map((rec) => (
                <div key={rec.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                      {rec.type === "booking" ? "🏟️" : "🏓"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{rec.title}</p>
                      <p className="text-xs text-gray-400">{rec.subtitle}</p>
                      <p className="text-xs text-green-700 font-medium mt-1">${rec.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 italic">{rec.reason}</p>
                  <Link
                    href={rec.type === "booking" ? "/booking" : "/store"}
                    className="mt-2 block text-center text-xs font-semibold text-green-700 border border-green-200 rounded-lg py-1.5 hover:bg-green-50 transition-colors"
                  >
                    {rec.type === "booking" ? "Book now" : "Add to cart"}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Challenge card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">Active Challenge</h2>
            <p className="text-xs text-gray-400 mb-3">Ends April 30</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-yellow-700 font-bold text-lg">3x Bookings</p>
              <p className="text-yellow-600 text-xs">Complete 3 court bookings this month</p>
              <div className="mt-2 flex justify-center gap-1">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      n <= 2 ? "bg-yellow-400 text-white" : "bg-yellow-100 text-yellow-400"
                    }`}
                  >
                    {n <= 2 ? "✓" : n}
                  </div>
                ))}
              </div>
              <p className="text-yellow-600 text-xs mt-2">2 of 3 complete &bull; 200 bonus pts on finish</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
