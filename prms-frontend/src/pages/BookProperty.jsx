import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingApi } from "../api/booking";

function BookProperty() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const propertyIdFromUrl = searchParams.get("propertyId") || "";

  const [propertyId, setPropertyId] = useState(propertyIdFromUrl);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await bookingApi.create({
        propertyId,
        start_date: startDate,
        end_date: endDate,
        totalAmount: totalAmount ? Number(totalAmount) : undefined,
      });

      setMessage("Booking request submitted successfully.");

      setTimeout(() => {
        navigate("/tenant/bookings");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Book Property</h1>
      <p>Submit a booking request for the selected property.</p>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Property ID</label>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="Enter property ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Amount</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Example: 1200"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Booking"}
        </button>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default BookProperty;