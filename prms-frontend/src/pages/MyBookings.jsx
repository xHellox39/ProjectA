import { useEffect, useState } from "react";
import { bookingApi } from "../api/booking";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    propertyId: "",
    start_date: "",
    end_date: "",
    totalAmount: "",
  });
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await bookingApi.myBookings();

      const bookingData =
        response.data?.data ||
        response.data?.bookings ||
        response.data ||
        [];

      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = () => {
    setRequestError("");
    setRequestForm({
      propertyId: "",
      start_date: "",
      end_date: "",
      totalAmount: "",
    });
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestError("");
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;

    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    setRequestLoading(true);
    setRequestError("");

    try {
      await bookingApi.create({
        propertyId: requestForm.propertyId,
        start_date: requestForm.start_date,
        end_date: requestForm.end_date,
        totalAmount: requestForm.totalAmount
          ? Number(requestForm.totalAmount)
          : undefined,
      });

      setShowRequestModal(false);
      loadBookings();
    } catch (err) {
      setRequestError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create booking request"
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      await bookingApi.cancel(bookingId);
      loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to cancel booking"
      );
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>My Bookings</h1>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="booking-page-header">
        <div>
          <h1>My Bookings</h1>
          <p>View your property booking requests and current status.</p>
        </div>

<button
  className="dark-btn"
  onClick={() => alert("Button clicked")}
>
  New Request
</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.property?.title || booking.propertyId}</td>
                  <td>{new Date(booking.start_date).toLocaleString()}</td>
                  <td>{new Date(booking.end_date).toLocaleString()}</td>
                  <td>{booking.status}</td>
                  <td>{booking.paymentStatus}</td>
                  <td>RM {booking.totalAmount || 0}</td>
                  <td>
                    {booking.status === "PENDING" ? (
                      <button onClick={() => handleCancel(booking.id)}>
                        Cancel
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRequestModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <div>
                <h2>New Booking Request</h2>
                <p>Submit a new property booking request.</p>
              </div>

              <button className="booking-modal-close" onClick={closeRequestModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="booking-modal-form">
              <label>Property ID</label>
              <input
                type="text"
                name="propertyId"
                value={requestForm.propertyId}
                onChange={handleRequestChange}
                placeholder="Enter property ID"
                required
              />

              <label>Start Date</label>
              <input
                type="datetime-local"
                name="start_date"
                value={requestForm.start_date}
                onChange={handleRequestChange}
                required
              />

              <label>End Date</label>
              <input
                type="datetime-local"
                name="end_date"
                value={requestForm.end_date}
                onChange={handleRequestChange}
                required
              />

              <label>Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={requestForm.totalAmount}
                onChange={handleRequestChange}
                placeholder="Example: 1200"
              />

              {requestError && (
                <div className="booking-modal-error">{requestError}</div>
              )}

              <div className="booking-modal-actions">
                <button
                  type="button"
                  className="light-btn"
                  onClick={closeRequestModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dark-btn"
                  disabled={requestLoading}
                >
                  {requestLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;