export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex flex-col items-center gap-2 group">
            <img src="/logo.png" alt="RallyPoint" width={56} height={56} className="rounded-xl" />
            <span className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              RallyPoint
            </span>
          </a>
          <p className="text-gray-400 text-sm mt-1">Pickleball Hub</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
