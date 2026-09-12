import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BrowseEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [search, category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const res = await apiClient.get(`/events?${params.toString()}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="glass sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          EventEase
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            My Dashboard
          </Link>
          <span className="text-sm font-medium text-slate-400">|</span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Discover Amazing Events</h2>
          <p className="text-slate-500 text-lg">Find the best concerts, workshops, and sports events happening near you.</p>
        </header>

        <div className="glass bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Search events by title..." 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Tech">Tech</option>
              <option value="Sports">Sports</option>
              <option value="Arts">Arts</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-20">Searching for events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-700">No events found</h3>
            <p className="mt-2">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="group flex flex-col glass bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6 text-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                  <span className="text-5xl opacity-40">
                    {event.category === 'Music' ? '🎵' : event.category === 'Tech' ? '💻' : event.category === 'Sports' ? '⚽' : '📅'}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                      {event.category}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      From ${Math.min(...event.seatCategories.map(c => c.price))}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">{event.description}</p>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between text-sm text-slate-600">
                    <div className="flex items-center">
                      <span className="mr-1">📅</span> {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📍</span> {event.location}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
