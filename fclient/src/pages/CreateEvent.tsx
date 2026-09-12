import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvent } from '../api/eventsApi';
import { SeatCategory } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    bannerImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'
  });

  const [seatCategories, setSeatCategories] = useState<SeatCategory[]>([
    { id: 'sc_' + Date.now(), name: 'General', price: 50, capacity: 100, booked: 0 }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCategory = () => {
    setSeatCategories([...seatCategories, { id: 'sc_' + Date.now(), name: '', price: 0, capacity: 0, booked: 0 }]);
  };

  const removeCategory = (id: string) => {
    if (seatCategories.length > 1) {
      setSeatCategories(seatCategories.filter(c => c.id !== id));
    }
  };

  const handleCategoryChange = (id: string, field: keyof SeatCategory, value: string | number) => {
    setSeatCategories(seatCategories.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      
      const newEvent = await createEvent({
        ...formData,
        organizerId: user.id,
        seatCategories
      });
      
      navigate(`/event/${newEvent.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select required name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Business">Business</option>
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
              <input required type="url" name="bannerImage" value={formData.bannerImage} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-xl font-bold">Seat Categories</h2>
            <button type="button" onClick={addCategory} className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </button>
          </div>

          <div className="space-y-4">
            {seatCategories.map((cat, idx) => (
              <div key={cat.id} className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-grow">
                  <label className="block text-xs text-gray-500 mb-1">Category Name</label>
                  <input required type="text" value={cat.name} onChange={e => handleCategoryChange(cat.id, 'name', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g. VIP" />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                  <input required type="number" min="0" value={cat.price} onChange={e => handleCategoryChange(cat.id, 'price', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-500 mb-1">Capacity</label>
                  <input required type="number" min="1" value={cat.capacity} onChange={e => handleCategoryChange(cat.id, 'capacity', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                {seatCategories.length > 1 && (
                  <button type="button" onClick={() => removeCategory(cat.id)} className="p-2 text-red-500 hover:text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : null}
            Publish Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
