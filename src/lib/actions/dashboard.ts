'use server';

import { prisma } from '@/db';

export interface DashboardData {
  name: string;
  points: number;
  tier: string;
  nextTier: string;
  nextTierThreshold: number;
  pointsToNextTier: number;
  recentActivity: {
    id: string;
    type: 'booking' | 'purchase' | 'points';
    description: string;
    points: number;
    date: string;
  }[];
  challenge: {
    name: string;
    description: string;
    progress: number;
    requiredCount: number;
    rewardPoints: number;
    expiresAt: string;
  } | null;
}

function getTier(points: number): { tier: string; nextTier: string; threshold: number } {
  if (points >= 1000) return { tier: 'Platinum', nextTier: 'Platinum', threshold: 1000 };
  if (points >= 500) return { tier: 'Gold', nextTier: 'Platinum', threshold: 1000 };
  if (points >= 200) return { tier: 'Silver', nextTier: 'Gold', threshold: 500 };
  return { tier: 'Bronze', nextTier: 'Silver', threshold: 200 };
}

function eventLabel(eventType: string, points: number): string {
  switch (eventType) {
    case 'WELCOME':
      return 'Welcome bonus — joined RallyPoint';
    case 'BOOKING':
      return 'Court booking';
    case 'PURCHASE':
      return `Equipment purchase — $${points.toFixed(0)} spent`;
    case 'REFERRAL':
      return 'Friend referral bonus';
    default:
      return eventType.charAt(0) + eventType.slice(1).toLowerCase();
  }
}

function eventActivityType(eventType: string): 'booking' | 'purchase' | 'points' {
  if (eventType === 'BOOKING') return 'booking';
  if (eventType === 'PURCHASE') return 'purchase';
  return 'points';
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  // Run all 4 queries in parallel — eliminates 3 sequential DB round-trips
  const [user, events, userChallenge, activeChallenge] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, points: true },
    }),
    prisma.pointsEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.userChallenge.findFirst({
      where: {
        userId,
        challenge: { isActive: true, expiresAt: { gte: now } },
      },
      include: { challenge: true },
      orderBy: { challenge: { expiresAt: 'asc' } },
    }),
    prisma.challenge.findFirst({
      where: { isActive: true, expiresAt: { gte: now } },
    }),
  ]);

  const { tier, nextTier, threshold } = getTier(user.points);

  const recentActivity = events.map((e) => ({
    id: e.id,
    type: eventActivityType(e.eventType),
    description: eventLabel(e.eventType, e.points),
    points: e.points,
    date: e.createdAt.toLocaleDateString('en-TT', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  // Challenge: use user-specific progress if found, otherwise active challenge with 0 progress
  let challenge: DashboardData['challenge'] = null;
  if (userChallenge) {
    challenge = {
      name: userChallenge.challenge.name,
      description: userChallenge.challenge.description,
      progress: userChallenge.progress,
      requiredCount: userChallenge.challenge.requiredCount,
      rewardPoints: userChallenge.challenge.rewardPoints,
      expiresAt: userChallenge.challenge.expiresAt.toLocaleDateString('en-TT', {
        month: 'long',
        day: 'numeric',
      }),
    };
  } else if (activeChallenge) {
    challenge = {
      name: activeChallenge.name,
      description: activeChallenge.description,
      progress: 0,
      requiredCount: activeChallenge.requiredCount,
      rewardPoints: activeChallenge.rewardPoints,
      expiresAt: activeChallenge.expiresAt.toLocaleDateString('en-TT', {
        month: 'long',
        day: 'numeric',
      }),
    };
  }

  return {
    name: user.name ?? 'Player',
    points: user.points,
    tier,
    nextTier,
    nextTierThreshold: threshold,
    pointsToNextTier: Math.max(0, threshold - user.points),
    recentActivity,
    challenge,
  };
}

export interface Recommendation {
  id: string;
  type: 'product' | 'booking';
  title: string;
  subtitle: string;
  price: number;
  reason: string;
}

export async function getAIRecommendations(userId: string): Promise<Recommendation[]> {
  const events = await prisma.pointsEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { eventType: true, points: true, createdAt: true },
  });

  const history = events
    .map((e) => `${e.eventType} (${e.points} pts, ${e.createdAt.toISOString().slice(0, 10)})`)
    .join('; ');

  const prompt = `You are a recommendation engine for RallyPoint Pickleball Hub.
Based on this player's recent activity: ${history || 'new player, no activity yet'}
Suggest 3 personalised recommendations (2 products, 1 court booking, or any mix).
Available products: ProStrike Carbon Paddle ($89.99), Elite Spin Paddle ($64.99), Tournament Ball Pack ($18.99), All-Court Carry Bag ($49.99), Rally Court Shoes ($75.00), RallyPoint Performance Cap ($22.00).
Court booking price: $15.00.
Respond ONLY with a JSON array of exactly 3 objects with keys: id (r1/r2/r3), type ("product"|"booking"), title, subtitle, price (number), reason (one sentence).`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getDefaultRecommendations();
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!res.ok) return getDefaultRecommendations();

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? '';
    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return getDefaultRecommendations();
    const recs = JSON.parse(match[0]) as Recommendation[];
    return Array.isArray(recs) ? recs.slice(0, 3) : getDefaultRecommendations();
  } catch {
    return getDefaultRecommendations();
  }
}

function getDefaultRecommendations(): Recommendation[] {
  return [
    {
      id: 'r1',
      type: 'product',
      title: 'Tournament Ball Pack (6)',
      subtitle: 'Balls',
      price: 18.99,
      reason: 'Add balls to complete your kit',
    },
    {
      id: 'r2',
      type: 'booking',
      title: 'Court 1 — Book a session',
      subtitle: 'Court booking',
      price: 15.0,
      reason: 'Get on the court and earn 50 points',
    },
    {
      id: 'r3',
      type: 'product',
      title: 'All-Court Carry Bag',
      subtitle: 'Bags',
      price: 49.99,
      reason: 'Popular with players who own multiple paddles',
    },
  ];
}
