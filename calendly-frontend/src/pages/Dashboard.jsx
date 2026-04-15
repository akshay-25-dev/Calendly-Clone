import React, { useEffect, useState } from "react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { ToastContainer, useToast } from "../components/Toast";

const COLORS = [
  "#0069ff", "#7b2ff7", "#ff5722", "#00c853",
  "#e91e63", "#ff9800", "#009688", "#673ab7",
];

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    duration: 30,
    slug: "",
    color: "#0069ff",
    description: "",
    location: "Google Meet",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      addToast("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      duration: 30,
      slug: "",
      color: "#0069ff",
      description: "",
      location: "Google Meet",
    });
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      duration: event.duration,
      slug: event.slug,
      color: event.color || "#0069ff",
      description: event.description || "",
      location: event.location || "Google Meet",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.duration) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
        addToast("Event updated successfully");
      } else {
        await createEvent(formData);
        addToast("Event created successfully");
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      addToast(msg, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      addToast("Event deleted");
      fetchEvents();
    } catch (err) {
      addToast("Failed to delete event", "error");
    }
    setDeleteConfirm(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const copyLink = (slug, id) => {
    const link = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast("Booking link copied!");
  };

  const formatDuration = (mins) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Event Types</h1>
            <p className="page-subtitle">
              Create events to share for people to book on your calendar.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal} id="create-event-btn">
            + New Event Type
          </button>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No event types yet</div>
            <div className="empty-state-text">
              Create your first event type to start accepting bookings.
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={openCreateModal}
            >
              + Create Event Type
            </button>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <div className="event-card" key={event.id}>
                <div
                  className="event-card-color-bar"
                  style={{ backgroundColor: event.color || "#0069ff" }}
                />
                <div className="event-card-body">
                  <div className="event-card-name">{event.name}</div>
                  <div className="event-card-duration">
                    🕐 {formatDuration(event.duration)}
                  </div>
                  {event.description && (
                    <div className="event-card-description">
                      {event.description}
                    </div>
                  )}
                  {event.location && (
                    <div className="event-card-location">
                      📍 {event.location}
                    </div>
                  )}
                </div>

                <div className="event-card-footer">
                  <span
                    className={`event-card-link ${copiedId === event.id ? "copy-tooltip show" : "copy-tooltip"}`}
                    onClick={() => copyLink(event.slug, event.id)}
                  >
                    🔗 Copy Link
                  </span>

                  <div className="event-card-actions">
                    <a
                      href={`/book/${event.slug}`}
                      className="btn btn-ghost btn-sm"
                      title="Preview booking page"
                    >
                      👁
                    </a>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditModal(event)}
                      title="Edit event"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDeleteConfirm(event)}
                      title="Delete event"
                      style={{ color: "var(--red)" }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? "Edit Event Type" : "New Event Type"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingEvent ? "Save Changes" : "Create Event"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Event Name *</label>
          <input
            className="form-input"
            placeholder="e.g. 30 Minute Meeting"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData((f) => ({
                ...f,
                name,
                slug: editingEvent ? f.slug : generateSlug(name),
              }));
            }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Duration (minutes) *</label>
            <select
              className="form-select"
              value={formData.duration}
              onChange={(e) =>
                setFormData((f) => ({ ...f, duration: parseInt(e.target.value) }))
              }
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <select
              className="form-select"
              value={formData.location}
              onChange={(e) =>
                setFormData((f) => ({ ...f, location: e.target.value }))
              }
            >
              <option value="Google Meet">Google Meet</option>
              <option value="Zoom">Zoom</option>
              <option value="Microsoft Teams">Microsoft Teams</option>
              <option value="Phone Call">Phone Call</option>
              <option value="In Person">In Person</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">URL Slug *</label>
          <input
            className="form-input"
            placeholder="e.g. 30-min-meeting"
            value={formData.slug}
            onChange={(e) =>
              setFormData((f) => ({ ...f, slug: e.target.value }))
            }
          />
          <div className="form-helper">
            Booking link: {window.location.origin}/book/{formData.slug || "..."}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Add a description for your event..."
            value={formData.description}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-options">
            {COLORS.map((color) => (
              <div
                key={color}
                className={`color-option ${formData.color === color ? "selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData((f) => ({ ...f, color }))}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Event Type"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will also remove all associated bookings. This action cannot be undone.`}
        confirmText="Delete"
        danger
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Layout>
  );
}

export default Dashboard;