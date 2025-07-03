import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-gray-900">404</h1>
        <p className="mt-3 text-xl text-gray-600">Page not found</p>
        <p className="mt-4 text-gray-500">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;