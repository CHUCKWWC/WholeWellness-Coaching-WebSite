export function CoachesMockup() {
  return (
    <div className="w-full h-[600px] overflow-y-auto bg-gray-50 p-6 text-xs">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">Find Your Perfect Coach</h1>
        <p className="text-gray-600 text-xs">Connect with verified wellness coaches</p>
      </div>

      {/* Coach Profile Card */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            SJ
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm">Sarah Johnson</h3>
              <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                Verified Coach
              </span>
            </div>

            <p className="text-[10px] text-gray-600 mb-2 leading-relaxed">
              Licensed clinical social worker specializing in trauma recovery and domestic violence support. 8+ years helping women rebuild their lives.
            </p>

            <div className="flex gap-1 flex-wrap mb-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px]">
                Trauma Recovery
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px]">
                Domestic Violence
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px]">
                Financial Planning
              </span>
            </div>

            <div className="text-[10px] text-gray-600 mb-3">
              <strong>Speaks:</strong> English, Spanish • <strong>Experience:</strong> 8 years
            </div>

            <button className="bg-purple-600 text-white px-4 py-1.5 rounded font-semibold text-[10px]">
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg text-center">
        <h2 className="text-base font-bold mb-2">Ready to Start Your Wellness Journey?</h2>
        <p className="text-xs mb-4">Our coaches are here to support you every step of the way.</p>
        <div className="flex gap-3 justify-center">
          <button className="bg-white text-purple-700 px-4 py-2 rounded-md font-semibold text-xs">
            Schedule a Session
          </button>
          <button className="border-2 border-white px-4 py-2 rounded-md font-semibold text-xs">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
