export function AICoachingMockup() {
  return (
    <div className="w-full h-[600px] overflow-y-auto bg-white p-6 text-xs">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">Meet Our Specialized AI Coaches</h1>
        <p className="text-gray-600 text-xs">Start your personalized coaching journey</p>
      </div>

      {/* Coach Cards Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="border-2 border-gray-200 p-3 rounded-lg text-center">
          <div className="text-2xl mb-2">🧘‍♀️</div>
          <h3 className="font-bold text-xs mb-1">Charlene</h3>
          <p className="text-[10px] text-gray-600 mb-1">Mindfulness Coach</p>
          <div className="text-[9px] text-gray-500 mb-2">
            Meditation • Stress Reduction
          </div>
          <button className="w-full bg-purple-600 text-white py-1 rounded text-[10px] font-semibold">
            Start Chat
          </button>
        </div>

        <div className="border-2 border-gray-200 p-3 rounded-lg text-center">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-bold text-xs mb-1">Dasha</h3>
          <p className="text-[10px] text-gray-600 mb-1">Wellness Coach</p>
          <div className="text-[9px] text-gray-500 mb-2">
            Holistic Health • Self-Care
          </div>
          <button className="w-full bg-purple-600 text-white py-1 rounded text-[10px] font-semibold">
            Start Chat
          </button>
        </div>

        <div className="border-2 border-gray-200 p-3 rounded-lg text-center">
          <div className="text-2xl mb-2">🤗</div>
          <h3 className="font-bold text-xs mb-1">Bobby</h3>
          <p className="text-[10px] text-gray-600 mb-1">Mental Health Support</p>
          <div className="text-[9px] text-gray-500 mb-2">
            Emotional Support • Coping
          </div>
          <button className="w-full bg-purple-600 text-white py-1 rounded text-[10px] font-semibold">
            Start Chat
          </button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg text-center">
        <div className="inline-block bg-yellow-500 text-yellow-900 px-3 py-0.5 rounded text-[10px] font-bold mb-2">
          BEST VALUE
        </div>
        <h2 className="text-2xl font-bold mb-1">$19.99/month</h2>
        <p className="text-xs mb-3">7-Day Free Trial</p>
        <button className="bg-white text-purple-700 px-6 py-2 rounded-md font-bold text-sm hover:bg-gray-100">
          Start Your Free Trial
        </button>
        <p className="text-[10px] mt-2 opacity-90">
          7 days free, then $19.99/month. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
