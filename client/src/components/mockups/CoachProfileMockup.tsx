export function CoachProfileMockup() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coach Profile</h1>
        <button 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          data-testid="button-save-changes"
        >
          Save Changes
        </button>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="relative" data-testid="profile-photo-section">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
              DC
            </div>
            <button 
              className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border-2 border-purple-500"
              data-testid="button-upload-photo"
            >
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Photo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Upload a professional headshot to help clients recognize you</p>
            <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20">
              Upload New Photo
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
            <input 
              type="text" 
              value="Dr. Christina"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
            <input 
              type="text" 
              value="Smith"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              readOnly
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specializations</label>
            <div className="flex flex-wrap gap-2" data-testid="specializations-section">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">Mindfulness</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">Mental Health</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">Life Coaching</span>
              <button 
                className="px-3 py-1 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:border-purple-500 hover:text-purple-600"
                data-testid="button-add-specialization"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Bio</h3>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[120px]"
          placeholder="Share your background, approach, and what makes you unique..."
          defaultValue="Certified wellness coach with 10+ years of experience helping clients achieve their goals through mindfulness and holistic approaches."
          data-testid="textarea-bio"
          readOnly
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This appears on your public profile</p>
      </div>

      {/* Availability */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm" data-testid="availability-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Availability Schedule</h3>
          <button 
            className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline"
            data-testid="button-edit-schedule"
          >
            Edit Schedule
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="font-medium text-gray-900 dark:text-white">Monday - Friday</span>
            <span className="text-gray-600 dark:text-gray-400">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="font-medium text-gray-900 dark:text-white">Saturday</span>
            <span className="text-gray-600 dark:text-gray-400">10:00 AM - 2:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
