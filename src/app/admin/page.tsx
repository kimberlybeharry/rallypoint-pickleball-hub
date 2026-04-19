import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/db';

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'ADMIN') redirect('/');

  const [userCount, orderCount, bookingCount, courts, recentOrders, recentBookings] =
    await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.booking.count(),
      prisma.court.findMany({ orderBy: { name: 'asc' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          court: { select: { name: true } },
        },
      }),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">RallyPoint Pickleball Hub</p>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Users', value: userCount },
          { label: 'Total Orders', value: orderCount },
          { label: 'Total Bookings', value: bookingCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-6 text-center"
          >
            <p className="text-4xl font-extrabold text-green-700">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Courts */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">Courts</h2>
          <div className="space-y-2">
            {courts.map((court) => (
              <div
                key={court.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{court.name}</p>
                  <p className="text-xs text-gray-400">{court.surfaceType ?? 'Unknown surface'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-700">${court.hourlyRate}/hr</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${court.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {court.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-2">
            {recentBookings.length === 0 ? (
              <p className="text-gray-400 text-sm">No bookings yet.</p>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {b.user.name ?? b.user.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {b.court.name} &bull; {b.startTime} &bull;{' '}
                      {new Date(b.date).toLocaleDateString('en-TT')}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                      b.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : b.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4">
                    Total
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-4">
                      <p className="font-medium text-gray-800">{order.user.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="py-2 pr-4 font-semibold text-gray-800">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-TT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
