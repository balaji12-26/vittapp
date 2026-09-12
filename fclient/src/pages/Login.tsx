import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = location.state?.returnTo || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, role);
      if (returnTo === '/' && role === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (returnTo === '/' && role === 'attendee') {
        navigate('/attendee/dashboard');
      } else {
        navigate(returnTo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600">
          <Ticket className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to EventEase
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in or create an account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${role === 'attendee' ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  onClick={() => setRole('attendee')}
                >
                  <span className="block font-medium">Attendee</span>
                  <span className="block text-xs mt-1 opacity-80">I want to book tickets</span>
                </div>
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${role === 'organizer' ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  onClick={() => setRole('organizer')}
                >
                  <span className="block font-medium">Organizer</span>
                  <span className="block text-xs mt-1 opacity-80">I want to host events</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Continuing...' : 'Continue'}
              </button>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              For this mock version, entering any email will create an account if it doesn't exist.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
