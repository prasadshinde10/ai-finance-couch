const Spinner = ({ label = 'Loading...', className = '' }) => (
  <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
    <span>{label}</span>
  </div>
)

export default Spinner
