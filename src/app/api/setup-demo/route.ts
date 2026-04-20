import { prisma } from '@/db';
import { NextResponse } from 'next/server';

// Temporary route to promote demo admin account
// Token prevents unauthorized access -- remove this file after demo setup
const SETUP_TOKEN = 'rp-setup-2026-04-20-xK9m';

export async function POST(request: Request) {
  const { token } = await request.json();
  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { email: 'admin@rallypoint.tt' },
    data: { role: 'ADMIN' },
  });

  return NextResponse.json({
    success: true,
    email: user.email,
    role: user.role,
  });
}
