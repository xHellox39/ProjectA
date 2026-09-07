import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../api/booking';

const ALL_TABS = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

export default function LandlordBookings() {
  const [tab, setTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status = tab === 'active' ? 'CONFIRMED' : tab === 'completed' ? 'COMPLETED' : tab.toUpperCase();
      const res = await bookingApi.list({ status });
      setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error('Failed to load bookings:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const confirm = async (id) => {
    try {
      await bookingApi.confirmWithInvoice(id);
      load();
    } catch (e) {
      alert(e.response?.data?.error?.message || 'Failed to confirm booking');
    }
  };

  const reject = async (id) => {
    try {
      await bookingApi.reject(id);
      load();
    } catch (e) {
      alert(e.response?.data?.error?.message || 'Failed to reject booking');
    }
  };

  const cancel = async (id) => {
    try {
      await bookingApi.cancel(id);
      load();
    } catch (e) {
      alert(e.response?.data?.error?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Bookings Management</h1>
        <p>Manage tenant booking requests for your properties.</p>
      </div>

      <div className="card-table">
        <div className="status-filter">
          {ALL_TABS.map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-danger mt-2">Error: {error} <button className="btn btn-sm" onClick={load}>Retry</button></div>}
        {loading ? <p>Loading...</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id || b.id}>
                  <td>{b.user?.full_name ?? b.user?.email ?? '—'}</td>
                  <td>{b.property?.title}</td>
                  <td>{new Date(b.start_date).toLocaleDateString()}</td>
                  <td>{new Date(b.end_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${(b.status || '').toLowerCase()}`}>{b.status || 'PENDING'}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${(b.paymentStatus || '').toLowerCase()}`}>{b.paymentStatus ?? 'UNPAID'}</span>
                  </td>
                  <td>${b.totalAmount ?? '—'}</td>
                  <td>
                    {b.status === 'PENDING' && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => confirm(b._id || b.id)}>Confirm</button>{' '}
                        <button className="btn btn-sm btn-danger" onClick={() => reject(b._id || b.id)}>Reject</button>
                      </>
                    )}
                    {b.status === 'CONFIRMED' && b.paymentStatus !== 'PAID' && (
                      <span className="text-muted">Awaiting payment</span>
                    )}
                    {b.status === 'CONFIRMED' && b.paymentStatus === 'PAID' && (
                      <button className="btn btn-sm btn-danger" onClick={() => cancel(b._id || b.id)}>Cancel</button>
                    )}
                    {(b.status === 'COMPLETED' || b.status === 'CANCELLED') && (
                      <span className="text-muted">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
              {!bookings.length && <tr><td colSpan={8}>No bookings found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
