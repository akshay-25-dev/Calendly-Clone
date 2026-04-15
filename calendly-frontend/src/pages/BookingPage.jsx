import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSlots, getBookingEvent, createBooking } from "../services/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState("select"); // "select" or "form"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = date.toISOString().split("T")[0];

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  useEffect(() => {
    if (event) {
      fetchSlots();
    }
  }, [date, event]);

  const fetchEvent = async () => {
    try {
      const res = await getBookingEvent(slug);
      setEvent(res.data);
    } catch (err) {
      setError("Event not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await getSlots(slug, formattedDate);
      setSlots(res.data);
    } catch (err) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot === selectedSlot ? null : slot);
  };

  const handleConfirmSlot = () => {
    if (selectedSlot) {
      setStep("form");
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Please fill in your name and email");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createBooking({
        event_type_id: event.id,
        name: formData.name,
        email: formData.email,
        date: formattedDate,
        time: selectedSlot,
        notes: formData.notes,
      });

      // Store booking info for confirmation page
      localStorage.setItem(
        "booking",
        JSON.stringify({
          date: formattedDate,
          time: selectedSlot,
          eventName: event.name,
          duration: event.duration,
          location: event.location,
          inviteeName: formData.name,
          inviteeEmail: formData.email,
        })
      );

      navigate("/success");
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${period}`;
  };

  const formatDateDisplay = (dateStr) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const tileDisabled = ({ date: d }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  if (loading) {
    return (
      <div className="booking-layout">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="booking-layout">
        <div className="booking-container" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="empty-state">
            <div className="empty-state-icon">😕</div>
            <div className="empty-state-title">Event Not Found</div>
            <div className="empty-state-text">
              This booking link is invalid or the event has been removed.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-layout">
      <div className="booking-container">
        {/* Left: Event Info */}
        <div className="booking-sidebar">
          {step === "form" && (
            <div
              className="booking-back-link"
              onClick={() => {
                setStep("select");
                setError("");
              }}
            >
              ← Back
            </div>
          )}

          <div className="booking-host-name">Admin User</div>
          <div className="booking-event-title">{event.name}</div>

          <div className="booking-detail">
            <span className="detail-icon">🕐</span>
            {event.duration} min
          </div>

          {event.location && (
            <div className="booking-detail">
              <span className="detail-icon">📍</span>
              {event.location}
            </div>
          )}

          {event.description && (
            <div className="booking-detail" style={{ alignItems: "flex-start" }}>
              <span className="detail-icon">📝</span>
              <span style={{ lineHeight: 1.5 }}>{event.description}</span>
            </div>
          )}

          {step === "form" && selectedSlot && (
            <div className="booking-detail" style={{ marginTop: 16, fontWeight: 600, color: "var(--primary)" }}>
              <span className="detail-icon">📅</span>
              <div>
                <div>{formatDateDisplay(formattedDate)}</div>
                <div>{formatTime(selectedSlot)}</div>
              </div>
            </div>
          )}
        </div>

        {step === "select" ? (
          <>
            {/* Center: Calendar */}
            <div className="booking-calendar-section">
              <div className="booking-calendar-header">Select a Date & Time</div>
              <Calendar
                onChange={setDate}
                value={date}
                tileDisabled={tileDisabled}
                minDetail="month"
                locale="en-US"
              />
            </div>

            {/* Right: Time Slots */}
            <div className="booking-slots-section">
              <div className="booking-slots-date">
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {slotsLoading ? (
                <div className="spinner-container" style={{ padding: 20 }}>
                  <div className="spinner" />
                </div>
              ) : slots.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--gray-500)",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No available times for this date.
                </p>
              ) : (
                slots.map((slot) => (
                  <div key={slot}>
                    {selectedSlot === slot ? (
                      <div className="slot-btn-group">
                        <button
                          className="slot-btn selected"
                          onClick={() => setSelectedSlot(null)}
                        >
                          {formatTime(slot)}
                        </button>
                        <button
                          className="slot-btn slot-confirm"
                          onClick={handleConfirmSlot}
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <button
                        className="slot-btn"
                        onClick={() => handleSlotClick(slot)}
                      >
                        {formatTime(slot)}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Booking Form */
          <div className="booking-form-section">
            <div className="booking-form-title">Enter Details</div>

            {error && (
              <div
                style={{
                  background: "var(--red-light)",
                  color: "#c62828",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Additional Notes{" "}
                  <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Share anything that will help prepare for our meeting."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>

              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={submitting}
                style={{ width: "100%" }}
              >
                {submitting ? "Scheduling..." : "Schedule Event"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;