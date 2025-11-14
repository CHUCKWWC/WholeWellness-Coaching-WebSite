export function AppointmentsMockup() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Calendar View
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            New Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">All</button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Upcoming</button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Past</button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancelled</button>
      </div>

      {/* Today's Appointments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Today - November 14, 2025
        </h3>

        <div className="space-y-3">
          {/* Appointment 1 - Confirmed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">CONFIRMED</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">3:00 PM - 4:00 PM</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sarah Johnson</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Life Coaching Session</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video Call
                  </span>
                  <span>• 60 minutes</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                  Start Session
                </button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Appointment 2 - Pending */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded">PENDING</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">5:30 PM - 6:30 PM</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Michael Chen</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Career Coaching Session</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone Call
                  </span>
                  <span>• 60 minutes</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  Confirm
                </button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming This Week */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">This Week</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 shadow-sm">
          {/* Compact appointment row */}
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Nov</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">15</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Fri</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Emma Rodriguez</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">10:00 AM • Mindfulness Session</p>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">CONFIRMED</span>
            </div>
          </div>

          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Nov</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">16</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Sat</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">James Wilson</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2:00 PM • Stress Management</p>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">CONFIRMED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
