import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Event Types ──
export const getEvents = () => api.get("/events");
export const getEventById = (id) => api.get(`/events/${id}`);
export const getEventBySlug = (slug) => api.get(`/events/slug/${slug}`);
export const createEvent = (data) => api.post("/events", data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// ── Availability ──
export const getAvailability = () => api.get("/availability");
export const setAvailability = (data) => api.post("/availability", data);
export const getOverrides = () => api.get("/availability/overrides");
export const createOverride = (data) => api.post("/availability/override", data);
export const deleteOverride = (id) => api.delete(`/availability/override/${id}`);

// ── Booking ──
export const getSlots = (slug, date) => api.get(`/booking/slots/${slug}?date=${date}`);
export const getBookingEvent = (slug) => api.get(`/booking/event/${slug}`);
export const createBooking = (data) => api.post("/booking", data);
export const rescheduleBooking = (id, data) => api.patch(`/booking/${id}/reschedule`, data);

// ── Meetings ──
export const getMeetings = () => api.get("/meetings");
export const getMeetingById = (id) => api.get(`/meetings/${id}`);
export const cancelMeeting = (id) => api.patch(`/meetings/${id}/cancel`);

export default api;
