import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [error, setError] = useState(null);
  const [loadingRole, setLoadingRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFastLogin = async (role) => {
    setError(null);
    setLoadingRole(role);
    try {
      const email = role === 'organizer' ? 'organizer@eventease.com' : 'attendee@eventease.com';
      await login(email, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Ensure backend is running.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-600 mb-8">Choose a role to sign in instantly</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleFastLogin('organizer')}
              disabled={loadingRole !== null}
              className="w-full py-4 px-4 bg-white/70 hover:bg-white text-indigo-700 font-bold rounded-xl shadow-lg border-2 border-indigo-200 hover:border-indigo-400 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loadingRole === 'organizer' ? 'Signing in...' : '👔 Login as Organizer'}
            </button>

            <button
              onClick={() => handleFastLogin('attendee')}
              disabled={loadingRole !== null}
              className="w-full py-4 px-4 bg-white/70 hover:bg-white text-purple-700 font-bold rounded-xl shadow-lg border-2 border-purple-200 hover:border-purple-400 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loadingRole === 'attendee' ? 'Signing in...' : '🎫 Login as Attendee'}
            </button>
          </div>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            One-click demo login enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
