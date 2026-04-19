import { auth } from '@/auth';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getDashboardData, getAIRecommendations } from '@/lib/actions/dashboard';
import { getOrCreateReferralCode } from '@/lib/actions/orders';
import Link from 'next/link';
import { Calendar, ShoppingBag, Gift, History } from 'lucide-react';
import ReferralCard from './_components/ReferralCard';

const TIER_COLOURS: Record<string, string> = {
  Bronze: 'text-orange-700 bg-orange-100',
  Silver: 'text-gray-600 bg-gray-100',
  Gold: 'text-yellow-700 bg-yellow-100',
  Platinum: 'text-blue-700 bg-blue-100',
};

const TIER_FROM: Record<string, number> = {
  Bronze: 0,
  Silver: 200,
  Gold: 500,
  Platinum: 1000,
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  booking: <Calendar size={16} className="text-green-600" />,
  purchase: <ShoppingBag size={16} className="text-blue-500" />,
  points: <Gift size={16} className="text-purple-500" />,
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getDashboardData(session.user.id);
  const { code: referralCode } = await getOrCreateReferralCode();

  const tierFrom = TIER_FROM[data.tier] ?? 0;
  const progressPct =
    data.tier === 'Platinum'
      ? 100
      : Math.round(((data.points - tierFrom) / (data.nextTierThreshold - tierFrom)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Account</h1>
      <p className="text-gray-500 mb-8">Welcome back, {data.name}</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-green-700 text-white rounded-xl p-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="min-w-0">
                <p className="text-green-200 text-sm mb-1">Current balance</p>
                <p className="text-4xl sm:text-5xl font-extrabold">{data.points}</p>
                <p className="text-green-200 text-sm">points</p>
              </div>
              <span
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${TIER_COLOURS[data.tier] ?? 'text-gray-600 bg-gray-100'}`}
              >
                {data.tier}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-green-200 mb-1 gap-2">
                <span className="whitespace-nowrap">{data.tier}</span>
                <span className="min-w-0 truncate text-right">
                  {data.nextTier} ({data.nextTierThreshold} pts)
                </span>
              </div>
              <div className="w-full bg-green-600 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-green-200 text-xs mt-1">
                {data.tier === 'Platinum'
                  ? 'Maximum tier reached!'
                  : `${data.pointsToNextTier} points to ${data.nextTier}`}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-800 hover:text-green-700 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0 truncate">
                <History size={16} className="text-green-600 shrink-0" />
                Order &amp; Booking History
              </span>
              <span className="text-gray-400 text-xs shrink-0">View all &rarr;</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Recent Activity</h2>{' '}
            {data.recentActivity.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No activity yet. Book a court or shop to earn points!
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      {ACTIVITY_ICONS[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                    <span className="text-green-700 font-semibold text-sm whitespace-nowrap">
                      +{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">How to earn points</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Court booking', value: '50 pts / booking' },
                { label: 'Equipment purchase', value: '1 pt per $1 spent' },
                { label: 'Referral', value: '250 pts per friend' },
              ].map((row) => (
                <div key={row.label} className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-green-700 font-bold text-base">{row.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{row.label}</p>
                </div>
              ))}
            </div>
          </div>

          {referralCode && <ReferralCard code={referralCode} />}
        </div>

        <div className="space-y-4">
          <Suspense fallback={<RecommendationsSkeleton />}>
            <RecommendationsPanel userId={session.user.id} />
          </Suspense>

          {data.challenge && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-1">Active Challenge</h2>
              <p className="text-xs text-gray-400 mb-3">Ends {data.challenge.expiresAt}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-yellow-700 font-bold text-lg">{data.challenge.name}</p>
                <p className="text-yellow-600 text-xs">{data.challenge.description}</p>
                <div className="mt-2 flex justify-center gap-1">
                  {Array.from({ length: data.challenge.requiredCount }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < data.challenge!.progress
                          ? 'bg-yellow-400 text-white'
                          : 'bg-yellow-100 text-yellow-400'
                      }`}
                    >
                      {i < data.challenge!.progress ? String.fromCodePoint(0x2713) : i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-yellow-600 text-xs mt-2">
                  {data.challenge.progress} of {data.challenge.requiredCount} complete &bull;{' '}
                  {data.challenge.rewardPoints} bonus pts on finish
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function RecommendationsPanel({ userId }: { userId: string }) {
  const recs = await getAIRecommendations(userId);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold text-gray-900 mb-1">Recommended for you</h2>
      <p className="text-gray-400 text-xs mb-4">Based on your activity</p>
      <div className="space-y-4">
        {recs.map((rec) => (
          <div key={rec.id} className="border border-gray-100 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                {rec.type === 'booking'
                  ? String.fromCodePoint(0x1f3df)
                  : String.fromCodePoint(0x1f3d3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{rec.title}</p>
                <p className="text-xs text-gray-400">{rec.subtitle}</p>
                <p className="text-xs text-green-700 font-medium mt-1">${rec.price.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">{rec.reason}</p>
            <Link
              href={rec.type === 'booking' ? '/booking' : '/store'}
              className="mt-2 block text-center text-xs font-semibold text-green-700 border border-green-200 rounded-lg py-1.5 hover:bg-green-50 transition-colors"
            >
              {rec.type === 'booking' ? 'Book now' : 'Add to cart'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold text-gray-900 mb-1">Recommended for you</h2>
      <p className="text-gray-400 text-xs mb-4">Based on your activity</p>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
                <div className="h-2 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded w-full mt-3" />
            <div className="h-7 bg-gray-50 rounded mt-2 border border-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
