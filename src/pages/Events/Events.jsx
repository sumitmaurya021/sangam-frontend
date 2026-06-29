import React, { useState, useEffect } from 'react';
import { socialApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Plus, X, ArrowLeft, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/Events.css';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    starts_at: '',
    ends_at: '',
    privacy: 'public'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await socialApi.getEvents();
      if (res.data) setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events', err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDetails = async (id) => {
    try {
      const res = await socialApi.getEvent(id);
      if (res.data) setSelectedEvent(res.data);
    } catch (err) {
      toast.error('Failed to load event details');
    }
  };

  const handleResponse = async (eventId, responseType) => {
    try {
      await socialApi.respondToEvent(eventId, responseType);
      toast.success(`RSVP status changed to: ${responseType}`);
      loadEvents();
      handleEventDetails(eventId);
    } catch (err) {
      toast.error('Failed to record response');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await socialApi.createEvent({ event: form });
      if (res.data) {
        toast.success(`Event "${form.title}" published!`);
        setShowCreateModal(false);
        setForm({
          title: '',
          description: '',
          location: '',
          starts_at: '',
          ends_at: '',
          privacy: 'public'
        });
        loadEvents();
      }
    } catch (err) {
      toast.error('Failed to publish event');
    }
  };

  return (
    <div className="events-page-container">
      
      {selectedEvent ? (
        /* Detailed Event Panel */
        <div className="event-detail-panel glass">
          <button onClick={() => setSelectedEvent(null)} className="back-btn">
            <ArrowLeft size={16} /> Back to coordinates
          </button>

          <div className="event-detail-header">
            <div className="event-large-icon">
              <Calendar size={32} />
            </div>
            <div>
              <h2>{selectedEvent.title}</h2>
              <span className="privacy-badge">{selectedEvent.privacy}</span>
              <p className="event-time">Starts: {new Date(selectedEvent.starts_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="event-detail-body">
            <div className="event-desc-section">
              <h4>Details</h4>
              <p>{selectedEvent.description || 'No description provided.'}</p>
              <p className="event-location-txt">📍 {selectedEvent.location || 'Global/Online'}</p>
            </div>

            <div className="event-rsvp-actions">
              <h4>Update RSVP</h4>
              <div className="rsvp-buttons-row">
                <button onClick={() => handleResponse(selectedEvent.id, 'going')} className="rsvp-btn going">
                  <CheckCircle size={16} /> Going
                </button>
                <button onClick={() => handleResponse(selectedEvent.id, 'interested')} className="rsvp-btn interested">
                  <HelpCircle size={16} /> Interested
                </button>
                <button onClick={() => handleResponse(selectedEvent.id, 'not_going')} className="rsvp-btn not-going">
                  <AlertCircle size={16} /> Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid of All Events */
        <>
          <div className="events-header-row">
            <div>
              <h1>Events Ledger</h1>
              <p>Lock on physical coordinates and connect with local cohorts.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="glow-btn create-event-btn">
              <Plus size={16} /> Host Event
            </button>
          </div>

          {loading ? (
            <div className="events-loader">
              <div className="premium-spinner"></div>
              <p>Scanning timeline logs...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map(e => (
                <div key={e.id} onClick={() => handleEventDetails(e.id)} className="glass event-card">
                  <div className="event-card-header">
                    <div className="event-icon">
                      <Calendar size={20} />
                    </div>
                    <span className="event-privacy">{e.privacy}</span>
                  </div>
                  <h3>{e.title}</h3>
                  <p className="event-loc">📍 {e.location || 'Global / Online'}</p>
                  <span className="event-date-lbl">{new Date(e.starts_at).toLocaleDateString()}</span>
                  <div className="event-card-footer">
                    <span>Going: {e.going_count || 0}</span>
                    <span>Interested: {e.interested_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="events-empty">
              <Calendar size={48} />
              <p>No coordinates registered for this epoch.</p>
            </div>
          )}
        </>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Host New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form-scroll">
              <div className="form-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Neo-Synth Meetup"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows="3" 
                  placeholder="Provide context..."
                />
              </div>

              <div className="form-group">
                <label>Location Coordinates</label>
                <input 
                  type="text" 
                  value={form.location} 
                  onChange={(e) => setForm({ ...form, location: e.target.value })} 
                  placeholder="e.g. Shibuya Center St."
                  required 
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Starts At</label>
                  <input 
                    type="datetime-local" 
                    value={form.starts_at} 
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Ends At</label>
                  <input 
                    type="datetime-local" 
                    value={form.ends_at} 
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Privacy Mode</label>
                <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button type="submit" className="glow-btn modal-submit-btn">Register Coordinate</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
