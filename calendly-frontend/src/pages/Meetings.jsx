import React, { useEffect, useState } from "react";
import { getMeetings, cancelMeeting } from "../services/api";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import { ToastContainer, useToast } from "../components/Toast";

function Meetings() {
  const [data, setData] = useState({ upcoming: [], past: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await getMeetings();
      setData(res.data);
    } catch (err) {
      addToast("Failed to load meetings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelMeeting(id);
      addToast("Meeting cancelled");
      fetchMeetings();
    } catch (err) {
      addToast("Failed to cancel meeting", "error");
    }
    setCancelConfirm(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${period}`;
  };

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: data.upcoming?.length || 0 },
    { key: "past", label: "Past", count: data.past?.length || 0 },
    { key: "cancelled", label: "Cancelled", count: data.cancelled?.length || 0 },
  ];

  const currentItems =
    activeTab === "upcoming"
      ? data.upcoming
      : activeTab === "past"
        ? data.past
        : data.cancelled;

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Meetings</h1>
            <p className="page-subtitle">
              View and manage your scheduled meetings.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background:
                      activeTab === tab.key
                        ? "var(--primary-light)"
                        : "var(--gray-100)",
                    color:
                      activeTab === tab.key
                        ? "var(--primary)"
                        : "var(--gray-600)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : currentItems?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === "upcoming"
                ? "📅"
                : activeTab === "past"
                  ? "📋"
                  : "🚫"}
            </div>
            <div className="empty-state-title">
              No {activeTab} meetings
            </div>
            <div className="empty-state-text">
              {activeTab === "upcoming"
                ? "You don't have any upcoming meetings scheduled."
                : activeTab === "past"
                  ? "No past meetings to show."
                  : "No cancelled meetings."}
            </div>
          </div>
        ) : (
          currentItems.map((meeting) => (
            <div className="meeting-card" key={meeting.id}>
              <div
                className="meeting-color-dot"
                style={{
                  backgroundColor:
                    meeting.EventType?.color || "var(--primary)",
                }}
              />

              <div className="meeting-info">
                <div className="meeting-event-name">
                  {meeting.EventType?.name || "Meeting"}
                  {meeting.status === "cancelled" && (
                    <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                      Cancelled
                    </span>
                  )}
                </div>
                <div className="meeting-invitee">
                  👤 {meeting.name} · {meeting.email}
                </div>
                <div className="meeting-datetime">
                  📅 {formatDate(meeting.date)} · 🕐{" "}
                  {formatTime(meeting.time)}
                  {meeting.EventType?.duration && (
                    <span> · {meeting.EventType.duration} min</span>
                  )}
                </div>
                {meeting.EventType?.location && (
                  <div
                    className="meeting-datetime"
                    style={{ marginTop: 4 }}
                  >
                    📍 {meeting.EventType.location}
                  </div>
                )}
                {meeting.notes && (
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--gray-500)",
                      marginTop: 6,
                      fontStyle: "italic",
                    }}
                  >
                    "{meeting.notes}"
                  </div>
                )}
              </div>

              <div className="meeting-actions">
                {activeTab === "upcoming" && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCancelConfirm(meeting)}
                    style={{
                      color: "var(--red)",
                      borderColor: "var(--red)",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelConfirm}
        title="Cancel Meeting"
        message={`Are you sure you want to cancel the meeting with ${cancelConfirm?.name} on ${cancelConfirm ? formatDate(cancelConfirm.date) : ""}?`}
        confirmText="Cancel Meeting"
        danger
        onConfirm={() => handleCancel(cancelConfirm.id)}
        onCancel={() => setCancelConfirm(null)}
      />
    </Layout>
  );
}

export default Meetings;