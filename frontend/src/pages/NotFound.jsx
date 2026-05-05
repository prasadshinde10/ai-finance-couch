import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-md">
      <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-gray-600">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  </div>
)

export default NotFound
