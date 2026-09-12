import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Music'
  });

  const [categories, setCategories] = useState([
    { name: 'General Admission', capacity: 100, price: 50 }
  ]);

  const addCategory = () => {
    setCategories([...categories, { name: '', capacity: 0, price: 0 }]);
  };

  const updateCategory = (index, field, value) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;
    setCategories(newCategories);
  };

  const removeCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (categories.length === 0) {
      return setError('At least one seat category is required.');
    }
    
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/events', {
        ...formData,
        seatCategories: categories
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-medium mb-6 hover:underline">
          &larr; Back to Dashboard
        </button>

        <div className="glass bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Create New Event</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Seat Categories</h3>
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  + Add Category
                </button>
              </div>

              <div className="space-y-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Name (e.g. VIP)</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={cat.name}
                        onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={cat.capacity}
                        onChange={(e) => updateCategory(idx, 'capacity', Number(e.target.value))}
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        value={cat.price}
                        onChange={(e) => updateCategory(idx, 'price', Number(e.target.value))}
                      />
                    </div>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Publishing Event...' : 'Publish Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
