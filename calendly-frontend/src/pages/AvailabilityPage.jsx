import React, { useEffect, useState } from "react";
import {
  getAvailability,
  setAvailability,
  getOverrides,
  createOverride,
  deleteOverride,
} from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { ToastContainer, useToast } from "../components/Toast";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function AvailabilityPage() {
  const [schedule, setSchedule] = useState(
    DAY_NAMES.map((_, i) => ({
      day_of_week: i,
      is_available: i >= 1 && i <= 5,
      start_time: "09:00",
      end_time: "17:00",
      timezone: "Asia/Kolkata",
    }))
  );
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [deleteOverrideConfirm, setDeleteOverrideConfirm] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const [overrideForm, setOverrideForm] = useState({
    date: "",
    start_time: "09:00",
    end_time: "17:00",
    is_blocked: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availRes, overRes] = await Promise.all([
        getAvailability(),
        getOverrides(),
      ]);

      if (availRes.data.length > 0) {
        const newSchedule = DAY_NAMES.map((_, i) => {
          const existing = availRes.data.find((a) => a.day_of_week === i);
          if (existing) {
            return {
              day_of_week: i,
              is_available: existing.is_available,
              start_time: existing.start_time?.substring(0, 5) || "09:00",
              end_time: existing.end_time?.substring(0, 5) || "17:00",
              timezone: existing.timezone || "Asia/Kolkata",
            };
          }
          return {
            day_of_week: i,
            is_available: false,
            start_time: "09:00",
            end_time: "17:00",
            timezone: "Asia/Kolkata",
          };
        });
        setSchedule(newSchedule);
        setTimezone(availRes.data[0]?.timezone || "Asia/Kolkata");
      }

      setOverrides(overRes.data);
    } catch (err) {
      addToast("Failed to load availability", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.day_of_week === dayIndex
          ? { ...s, is_available: !s.is_available }
          : s
      )
    );
  };

  const handleTimeChange = (dayIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((s) =>
        s.day_of_week === dayIndex ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = schedule.map((s) => ({
        ...s,
        timezone,
      }));
      await setAvailability(data);
      addToast("Availability saved successfully");
    } catch (err) {
      addToast("Failed to save availability", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOverride = async () => {
    if (!overrideForm.date) {
      addToast("Please select a date", "error");
      return;
    }
    try {
      await createOverride(overrideForm);
      addToast("Date override added");
      setOverrideModalOpen(false);
      setOverrideForm({
        date: "",
        start_time: "09:00",
        end_time: "17:00",
        is_blocked: false,
      });
      fetchData();
    } catch (err) {
      addToast("Failed to create override", "error");
    }
  };

  const handleDeleteOverride = async (id) => {
    try {
      await deleteOverride(id);
      addToast("Override removed");
      fetchData();
    } catch (err) {
      addToast("Failed to delete override", "error");
    }
    setDeleteOverrideConfirm(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Availability</h1>
            <p className="page-subtitle">
              Set your weekly hours and date-specific overrides.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Timezone */}
        <div style={{ marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select
              className="form-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{ maxWidth: 300 }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weekly Schedule */}
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            marginBottom: 16,
            color: "var(--gray-800)",
          }}
        >
          Weekly Hours
        </h2>

        <div className="availability-grid">
          {schedule.map((day) => (
            <div className="availability-row" key={day.day_of_week}>
              <div className="availability-day">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={day.is_available}
                    onChange={() => handleToggleDay(day.day_of_week)}
                  />
                  <span className="toggle-slider" />
                </label>
                <span
                  className="availability-day-name"
                  style={{
                    color: day.is_available
                      ? "var(--gray-800)"
                      : "var(--gray-400)",
                  }}
                >
                  {DAY_NAMES[day.day_of_week]}
                </span>
              </div>

              <div className="availability-times">
                {day.is_available ? (
                  <>
                    <input
                      type="time"
                      className="availability-time-input"
                      value={day.start_time}
                      onChange={(e) =>
                        handleTimeChange(
                          day.day_of_week,
                          "start_time",
                          e.target.value
                        )
                      }
                    />
                    <span className="availability-separator">—</span>
                    <input
                      type="time"
                      className="availability-time-input"
                      value={day.end_time}
                      onChange={(e) =>
                        handleTimeChange(
                          day.day_of_week,
                          "end_time",
                          e.target.value
                        )
                      }
                    />
                  </>
                ) : (
                  <span className="availability-unavailable">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Date-Specific Overrides */}
        <div className="overrides-section">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--gray-800)",
                }}
              >
                Date-Specific Hours
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--gray-500)",
                  marginTop: 4,
                }}
              >
                Override your availability for specific dates.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setOverrideModalOpen(true)}
            >
              + Add Override
            </button>
          </div>

          <div className="overrides-list">
            {overrides.length === 0 ? (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--gray-500)",
                  padding: "16px 0",
                }}
              >
                No date overrides set.
              </p>
            ) : (
              overrides.map((o) => (
                <div className="override-item" key={o.id}>
                  <div>
                    <div className="override-date">{formatDate(o.date)}</div>
                    <div className="override-detail">
                      {o.is_blocked
                        ? "Blocked — No availability"
                        : `${o.start_time?.substring(0, 5)} — ${o.end_time?.substring(0, 5)}`}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteOverrideConfirm(o)}
                    style={{ color: "var(--red)" }}
                  >
                    🗑 Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Add Date Override"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setOverrideModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateOverride}>
              Add Override
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={overrideForm.date}
            onChange={(e) =>
              setOverrideForm((f) => ({ ...f, date: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={overrideForm.is_blocked}
                onChange={(e) =>
                  setOverrideForm((f) => ({
                    ...f,
                    is_blocked: e.target.checked,
                  }))
                }
              />
              <span className="toggle-slider" />
            </label>
            <span className="form-label" style={{ marginBottom: 0 }}>
              Block entire day
            </span>
          </label>
        </div>

        {!overrideForm.is_blocked && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={overrideForm.start_time}
                onChange={(e) =>
                  setOverrideForm((f) => ({
                    ...f,
                    start_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={overrideForm.end_time}
                onChange={(e) =>
                  setOverrideForm((f) => ({
                    ...f,
                    end_time: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Override Confirm */}
      <ConfirmDialog
        isOpen={!!deleteOverrideConfirm}
        title="Remove Override"
        message={`Remove the date override for ${deleteOverrideConfirm ? formatDate(deleteOverrideConfirm.date) : ""}?`}
        confirmText="Remove"
        danger
        onConfirm={() => handleDeleteOverride(deleteOverrideConfirm.id)}
        onCancel={() => setDeleteOverrideConfirm(null)}
      />
    </Layout>
  );
}

export default AvailabilityPage;
