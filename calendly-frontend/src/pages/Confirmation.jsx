import React from "react";
import { Link } from "react-router-dom";

function Confirmation() {
  const data = JSON.parse(localStorage.getItem("booking") || "{}");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-check">
          <span className="check-icon">✓</span>
        </div>

        <h1 className="confirmation-title">You are scheduled</h1>
        <p className="confirmation-subtitle">
          A calendar invitation has been sent to your email address.
        </p>

        <div className="confirmation-details">
          <div className="confirmation-detail-row">
            <span className="confirmation-detail-icon">📅</span>
            <div>
              <div className="confirmation-detail-label">What</div>
              <div className="confirmation-detail-value">
                {data.eventName || "Meeting"}
              </div>
            </div>
          </div>

          <div className="confirmation-detail-row">
            <span className="confirmation-detail-icon">🕐</span>
            <div>
              <div className="confirmation-detail-label">When</div>
              <div className="confirmation-detail-value">
                {formatDate(data.date)}
                <br />
                {formatTime(data.time)}
                {data.duration ? ` (${data.duration} min)` : ""}
              </div>
            </div>
          </div>

          {data.location && (
            <div className="confirmation-detail-row">
              <span className="confirmation-detail-icon">📍</span>
              <div>
                <div className="confirmation-detail-label">Where</div>
                <div className="confirmation-detail-value">{data.location}</div>
              </div>
            </div>
          )}

          {data.inviteeName && (
            <div className="confirmation-detail-row">
              <span className="confirmation-detail-icon">👤</span>
              <div>
                <div className="confirmation-detail-label">Invitee</div>
                <div className="confirmation-detail-value">
                  {data.inviteeName}
                  {data.inviteeEmail ? ` (${data.inviteeEmail})` : ""}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link to="/" className="btn btn-secondary" style={{ marginRight: 12 }}>
          Back to Home
        </Link>
        {data.eventName && (
          <Link
            to={`/book/${data.slug || ""}`}
            className="btn btn-ghost"
          >
            Schedule Another
          </Link>
        )}
      </div>
    </div>
  );
}

export default Confirmation;
