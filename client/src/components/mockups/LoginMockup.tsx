export function LoginMockup() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-600">Sign in to continue your wellness journey</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-xs text-purple-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-purple-700"
          >
            Sign In
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <a href="#" className="text-purple-600 font-medium hover:underline">
              Create Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
