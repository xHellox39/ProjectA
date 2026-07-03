import { useEffect, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { bookingApi } from "../api/booking";
import "./TenantSimplePage.css";

function LandlordBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [cards, setCards] = useState([
    { label: "Total Requests", value: "..." },
    { label: "Pending", value: "..." },
    { label: "Approved", value: "..." },
    { label: "Rejected", value: "..." },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeStatus = (status) => String(status || "").toUpperCase();

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await bookingApi.list();

      const items =
        response.data?.data ||
        response.data?.bookings ||
        response.data ||
        [];

      const bookingList = Array.isArray(items) ? items : [];

      setBookings(bookingList);

      setCards([
        { label: "Total Requests", value: bookingList.length },
        {
          label: "Pending",
          value: bookingList.filter((b) => normalizeStatus(b.status) === "PENDING").length,
        },
        {
          label: "Approved",
          value: bookingList.filter((b) => normalizeStatus(b.status) === "APPROVED").length,
        },
        {
          label: "Rejected",
          value: bookingList.filter((b) => normalizeStatus(b.status) === "REJECTED").length,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load booking requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await bookingApi.update(bookingId, { status });
      loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Failed to update booking status"
      );
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <>
      <section className="tenant-simple-hero">
        <div>
          <h1>Booking Management</h1>
          <p>Review tenant booking requests and approve or reject applications.</p>
        </div>
      </section>

      <section className="tenant-simple-cards">
        {cards.map((card) => (
          <article className="tenant-simple-card" key={card.label}>
            <div className="tenant-simple-icon">
              <CalendarDays size={26} />
            </div>
            <p>{card.label}</p>
            <h3>{card.value}</h3>
          </article>
        ))}
      </section>

      <section className="tenant-simple-table-card">
        <div className="tenant-simple-table-header">
          <h2>Booking Requests</h2>

          <div className="tenant-simple-search">
            <Search size={17} />
            <input type="text" placeholder="Search records..." />
          </div>
        </div>

        {error && <p style={{ color: "red", padding: 12 }}>{error}</p>}

        {loading ? (
          <div className="tenant-simple-table">
            <div className="tenant-simple-table-head">Loading...</div>
          </div>
        ) : (
          <div className="tenant-simple-table">
            <div
              className="tenant-simple-table-head"
              style={{ gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr 0.8fr 1.3fr" }}
            >
              <p>Tenant</p>
              <p>Property</p>
              <p>Start Date</p>
              <p>End Date</p>
              <p>Status</p>
              <p>Action</p>
            </div>

            {bookings.length === 0 && (
              <div className="tenant-simple-table-row">
                <div
                  style={{
                    gridColumn: "1 / 7",
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  No booking requests found
                </div>
              </div>
            )}

            {bookings.map((booking) => (
              <div
                className="tenant-simple-table-row"
                style={{ gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr 0.8fr 1.3fr" }}
                key={booking.id}
              >
                <div>
                  <span>
                    {booking.user?.full_name ||
                      booking.user?.email ||
                      booking.userId ||
                      "Tenant"}
                  </span>
                </div>

                <div>
                  <span>
                    {booking.property?.title ||
                      booking.propertyTitle ||
                      booking.propertyId ||
                      "Property"}
                  </span>
                </div>

                <div>
                  <span>
                    {booking.start_date
                      ? new Date(booking.start_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <div>
                  <span>
                    {booking.end_date
                      ? new Date(booking.end_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <div>
                  <span>{booking.status}</span>
                </div>

                <div>
                  {normalizeStatus(booking.status) === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => updateStatus(booking.id, "APPROVED")}
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(booking.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button type="button">View</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default LandlordBookingManagement;