export function CoachApprovalMockup() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 min-h-[500px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coach Approval Queue</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and approve pending coach applications</p>
      </div>

      {/* Pending Applications */}
      <div className="space-y-4">
        {/* Application Card 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 border-yellow-200 dark:border-yellow-700" data-testid="application-card-1">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                EA
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dr. Emily Anderson</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">emily.anderson@example.com</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                  Pending Review
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Specializations</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                      Trauma Recovery
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      Mindfulness
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Certifications</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">Licensed Professional Counselor (LPC)</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">12 years</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Applied</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">2 days ago</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Professional Bio</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Experienced trauma-informed therapist specializing in helping survivors of domestic violence rebuild their lives through evidence-based approaches...
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium" data-testid="button-approve">
                  Approve Application
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" data-testid="button-review-documents">
                  Review Documents
                </button>
                <button className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-testid="button-reject">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Application Card 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 border-yellow-200 dark:border-yellow-700" data-testid="application-card-2">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                MJ
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Marcus Johnson</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">marcus.j@example.com</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                  Pending Review
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Specializations</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                      Life Coaching
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      Career Dev
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Certifications</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">ICF Certified Coach (ACC)</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">8 years</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Applied</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">5 days ago</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Professional Bio</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Passionate about helping individuals transition careers and achieve work-life balance through personalized coaching strategies...
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Approve Application
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Review Documents
                </button>
                <button className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Showing 2 pending applications</span>
          <span className="text-gray-600 dark:text-gray-400">34 coaches approved this month</span>
        </div>
      </div>
    </div>
  );
}
