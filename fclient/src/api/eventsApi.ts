import { Event } from '../types';

export const getEvents = async (): Promise<Event[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const eventsStr = localStorage.getItem('eventease_events');
  return eventsStr ? JSON.parse(eventsStr) : [];
};

export const getEventById = async (id: string): Promise<Event | null> => {
  const events = await getEvents();
  return events.find(e => e.id === id) || null;
};

export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const events = await getEvents();
  
  const newEvent: Event = {
    ...eventData,
    id: 'evt_' + Math.random().toString(36).substr(2, 9)
  };
  
  events.push(newEvent);
  localStorage.setItem('eventease_events', JSON.stringify(events));
  return newEvent;
};

export const getEventsByOrganizer = async (organizerId: string): Promise<Event[]> => {
  const events = await getEvents();
  return events.filter(e => e.organizerId === organizerId);
};
