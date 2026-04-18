export type Category = "Paddles" | "Balls" | "Bags" | "Footwear" | "Apparel";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  badge?: string;
}

export interface Court {
  id: string;
  name: string;
}

export interface TimeSlot {
  time: string;
  label: string;
}

export interface ActivityItem {
  id: string;
  type: "booking" | "purchase" | "points";
  description: string;
  date: string;
  points: number;
}

export interface Recommendation {
  id: string;
  type: "product" | "booking";
  title: string;
  subtitle: string;
  price: number;
  reason: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "ProStrike Carbon Paddle",
    description: "16mm carbon fibre core, raw face texture for maximum spin. Ideal for intermediate to advanced players.",
    price: 89.99,
    category: "Paddles",
    badge: "Best Seller",
  },
  {
    id: "p2",
    name: "Elite Spin Paddle",
    description: "Fibreglass face with polymer core. Great touch and control for all-court play.",
    price: 64.99,
    category: "Paddles",
  },
  {
    id: "p3",
    name: "Tournament Ball Pack (6)",
    description: "USAPA-approved outdoor balls. Consistent bounce across all court surfaces.",
    price: 18.99,
    category: "Balls",
    badge: "Pack of 6",
  },
  {
    id: "p4",
    name: "All-Court Carry Bag",
    description: "Holds 2 paddles, balls, towel and water bottle. Ventilated shoe compartment.",
    price: 49.99,
    category: "Bags",
  },
  {
    id: "p5",
    name: "Rally Court Shoes",
    description: "Lateral support optimised for court movement. Non-marking rubber sole.",
    price: 75.00,
    category: "Footwear",
    badge: "New",
  },
  {
    id: "p6",
    name: "RallyPoint Performance Cap",
    description: "Moisture-wicking fabric, adjustable strap. Embroidered RallyPoint logo.",
    price: 22.00,
    category: "Apparel",
  },
];

export const COURTS: Court[] = [
  { id: "c1", name: "Court 1" },
  { id: "c2", name: "Court 2" },
  { id: "c3", name: "Court 3" },
];

export const TIME_SLOTS: TimeSlot[] = [
  { time: "07:00", label: "7:00 AM" },
  { time: "08:00", label: "8:00 AM" },
  { time: "09:00", label: "9:00 AM" },
  { time: "10:00", label: "10:00 AM" },
  { time: "11:00", label: "11:00 AM" },
  { time: "12:00", label: "12:00 PM" },
  { time: "13:00", label: "1:00 PM" },
  { time: "14:00", label: "2:00 PM" },
  { time: "15:00", label: "3:00 PM" },
  { time: "16:00", label: "4:00 PM" },
  { time: "17:00", label: "5:00 PM" },
  { time: "18:00", label: "6:00 PM" },
];

// Pre-booked slots: courtId -> Set of "YYYY-MM-DD|HH:MM"
export const PRE_BOOKED = new Set([
  "c1|09:00",
  "c1|10:00",
  "c2|08:00",
  "c2|14:00",
  "c3|11:00",
  "c3|15:00",
  "c3|16:00",
]);

export const COURT_BOOKING_PRICE = 15.00;

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "booking",
    description: "Court 2 booked — Saturday 8:00 AM",
    date: "Apr 12",
    points: 50,
  },
  {
    id: "a2",
    type: "purchase",
    description: "ProStrike Carbon Paddle purchased",
    date: "Apr 10",
    points: 90,
  },
  {
    id: "a3",
    type: "booking",
    description: "Court 1 booked — Wednesday 6:00 PM",
    date: "Apr 7",
    points: 50,
  },
  {
    id: "a4",
    type: "points",
    description: "Welcome bonus — account registration",
    date: "Apr 5",
    points: 200,
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    type: "product",
    title: "Tournament Ball Pack (6)",
    subtitle: "Paddles",
    price: 18.99,
    reason: "You have a paddle — add balls to complete your kit",
  },
  {
    id: "r2",
    type: "booking",
    title: "Court 1 — Tomorrow 7:00 AM",
    subtitle: "Court booking",
    price: 15.00,
    reason: "You played Saturday mornings 3 weeks in a row",
  },
  {
    id: "r3",
    type: "product",
    title: "All-Court Carry Bag",
    subtitle: "Bags",
    price: 49.99,
    reason: "Popular with players who own 2+ paddles",
  },
];

export const USER = {
  name: "Kimberly B.",
  points: 450,
  tier: "Silver",
  nextTier: "Gold",
  pointsToNextTier: 50,
  nextTierThreshold: 500,
};
