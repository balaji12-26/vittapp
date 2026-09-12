import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">EventEase</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={user.role === 'organizer' ? '/organizer/dashboard' : '/attendee/dashboard'}
                  className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 ml-4 border-l pl-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 text-sm transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="bg-primary-600 text-white hover:bg-primary-700 font-medium px-4 py-2 rounded-md text-sm transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
