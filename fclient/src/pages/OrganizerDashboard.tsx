import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { getEventsByOrganizer } from '../api/eventsApi';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getEventsByOrganizer(user.id).then(data => {
        setEvents(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your events and view analytics.</p>
        </div>
        <Link 
          to="/organizer/event/new"
          className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Events</p>
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tickets Sold</p>
            <p className="text-2xl font-bold text-gray-900">
              {events.reduce((total, e) => total + e.seatCategories.reduce((sum, c) => sum + c.booked, 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><DollarSign className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Estimated Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${events.reduce((total, e) => total + e.seatCategories.reduce((sum, c) => sum + (c.booked * c.price), 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Your Events</h2>
      
      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map(event => {
                  const totalCapacity = event.seatCategories.reduce((sum, c) => sum + c.capacity, 0);
                  const totalBooked = event.seatCategories.reduce((sum, c) => sum + c.booked, 0);
                  const revenue = event.seatCategories.reduce((sum, c) => sum + (c.booked * c.price), 0);
                  const percentage = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                            <img src={event.bannerImage} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <Link to={`/event/${event.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">{event.title}</Link>
                            <div className="text-sm text-gray-500">{event.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(event.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 font-medium mr-2">{totalBooked} / {totalCapacity}</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                        ${revenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
