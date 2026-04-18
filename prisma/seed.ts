import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Products
  await prisma.product.deleteMany();
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'ProStrike Carbon Paddle',
        description:
          '16mm carbon fibre core, raw face texture for maximum spin. Ideal for intermediate to advanced players.',
        price: 89.99,
        category: 'Paddles',
        badge: 'Best Seller',
        stock: 20,
        skillLevel: 'Intermediate/Advanced',
        imageUrl: '/products/p1.webp',
      },
      {
        name: 'Elite Spin Paddle',
        description:
          'Fibreglass face with polymer core. Great touch and control for all-court play.',
        price: 64.99,
        category: 'Paddles',
        stock: 15,
        skillLevel: 'All levels',
        imageUrl: '/products/p2.webp',
      },
      {
        name: 'Tournament Ball Pack (6)',
        description: 'USAPA-approved outdoor balls. Consistent bounce across all court surfaces.',
        price: 18.99,
        category: 'Balls',
        badge: 'Pack of 6',
        stock: 50,
        imageUrl: '/products/p3.webp',
      },
      {
        name: 'All-Court Carry Bag',
        description: 'Holds 2 paddles, balls, towel and water bottle. Ventilated shoe compartment.',
        price: 49.99,
        category: 'Bags',
        stock: 12,
        imageUrl: '/products/p4.webp',
      },
      {
        name: 'Rally Court Shoes',
        description: 'Lateral support optimised for court movement. Non-marking rubber sole.',
        price: 75.0,
        category: 'Footwear',
        badge: 'New',
        stock: 18,
        skillLevel: 'All levels',
        imageUrl: '/products/p5.webp',
      },
      {
        name: 'RallyPoint Performance Cap',
        description: 'Moisture-wicking fabric, adjustable strap. Embroidered RallyPoint logo.',
        price: 22.0,
        category: 'Apparel',
        stock: 30,
        imageUrl: '/products/p6.webp',
      },
    ],
  });
  console.log(`Created ${products.count} products`);

  // Courts
  await prisma.court.deleteMany();
  const courts = await prisma.court.createMany({
    data: [
      {
        name: 'Court 1',
        description: 'Main outdoor court with stadium lighting',
        surfaceType: 'Concrete',
        hourlyRate: 15.0,
      },
      {
        name: 'Court 2',
        description: 'Indoor climate-controlled court',
        surfaceType: 'Sport tile',
        hourlyRate: 15.0,
      },
      {
        name: 'Court 3',
        description: 'Covered outdoor court',
        surfaceType: 'Asphalt',
        hourlyRate: 15.0,
      },
    ],
  });
  console.log(`Created ${courts.count} courts`);

  // Challenge
  await prisma.challenge.deleteMany();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  await prisma.challenge.create({
    data: {
      name: '3 Bookings This Month',
      description: 'Book a court 3 times this month and earn a bonus.',
      conditionType: 'BOOKING_COUNT',
      requiredCount: 3,
      rewardPoints: 200,
      startsAt: monthStart,
      expiresAt: monthEnd,
      isActive: true,
    },
  });
  console.log('Created challenge: 3 Bookings This Month');

  console.log('Done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
