import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BookingDetail() {
  const { id } = useParams();
  const { api } = useAuth();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // ✅ Load booking details
  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      setBooking(data.booking);
    } catch (err) {
      console.error("❌ Error loading booking:", err);
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ Fetch flight status (mock API)
  useEffect(() => {
    if (booking?.flight?.flightNumber) {
      fetch(`${API_BASE_URL}/api/flight-status/${booking.flight.flightNumber}`)
        .then((res) => res.json())
        .then((data) => setStatus(data))
        .catch((err) => console.error("⚠️ Flight status fetch failed:", err));
    }
  }, [booking]);

  // ✅ Download PDF
  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/itinerary.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to download itinerary");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${booking.bookingReference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("❌ PDF download error:", err);
      alert("Unable to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Verify Payment
  const verifyPayment = async () => {
    try {
      const res = await api.get(`/payments/verify/${booking._id}`);
      alert(res.data.message);
      await load();
    } catch (err) {
      console.error("❌ Payment verification failed:", err);
      alert("Failed to verify payment. Please try again.");
    }
  };

  // ✅ Cancel Booking
  const cancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      await load();
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("❌ Cancel Booking Error:", err);
      alert("Failed to cancel booking.");
    }
  };

  // ✅ Upgrade to Business Class
  const changeToBusiness = async () => {
    try {
      await api.post(`/bookings/${id}/change`, { travelClass: "Business" });
      await load();
      alert("Upgraded to Business class!");
    } catch (err) {
      console.error("❌ Upgrade Error:", err);
      alert("Failed to upgrade class.");
    }
  };

  // ✅ Loading / Not Found States
  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-gray-500 text-lg">
          Loading booking...
        </div>
        <Footer />
      </div>
    );

  if (!booking)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-red-600 text-lg">
          Booking not found or failed to load.
        </div>
        <Footer />
      </div>
    );

  // ✅ Format Date/Time
  const formatDateTime = (dt) => new Date(dt).toLocaleString();

  // ✅ Main Render
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="flex-grow py-10 px-6">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">
            Booking Details
          </h2>

          {/* Booking Info */}
          <div className="space-y-2 text-gray-700 mb-6">
            <p>
              <b>Booking Reference:</b> {booking.bookingReference}
            </p>
            <p>
              <b>Status:</b> {booking.status} / {booking.paymentStatus}
            </p>
            {booking.flight && (
              <>
                <p>
                  <b>Flight:</b> {booking.flight.airline} ({booking.flight.flightNumber})
                </p>
                <p>
                  <b>Route:</b> {booking.flight.origin} → {booking.flight.destination}
                </p>
                <p>
                  <b>Departure:</b> {formatDateTime(booking.flight.departureTime)}
                </p>
                <p>
                  <b>Arrival:</b> {formatDateTime(booking.flight.arrivalTime)}
                </p>
              </>
            )}
            <p>
              <b>Class:</b> {booking.travelClass}
            </p>
            <p>
              <b>Total Price:</b>{" "}
              <span className="text-green-600 font-semibold">
                ₹{booking.totalPrice?.toLocaleString()}
              </span>
            </p>

            {status && (
              <p className="text-sm text-gray-500">
                ✈️ Flight Status:{" "}
                <span className="font-medium">{status.statusText}</span>
              </p>
            )}
          </div>

          {/* Passenger List */}
          <hr className="my-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Passenger List
          </h3>

          {booking.passengers?.length > 0 ? (
            <div className="space-y-3">
              {booking.passengers.map((p, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm"
                >
                  <p>
                    <b>Passenger {i + 1}:</b> {p.name}
                  </p>
                  <p>
                    <b>Gender:</b> {p.gender}
                  </p>
                  <p>
                    <b>Age:</b> {p.age}
                  </p>
                  <p>
                    <b>Seat:</b> {p.seat}
                  </p>
                  {p.email && (
                    <p>
                      <b>Email:</b> {p.email}
                    </p>
                  )}
                  {p.phone && (
                    <p>
                      <b>Phone:</b> {p.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No passenger data found.</p>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {downloading ? "Downloading..." : "Download PDF"}
            </button>

            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700 transition"
            >
              Print
            </button>

            <button
              onClick={verifyPayment}
              className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800 transition"
            >
              Verify Payment
            </button>

            {booking.travelClass !== "Business" && (
              <button
                onClick={changeToBusiness}
                className="bg-amber-600 text-white px-5 py-2 rounded hover:bg-amber-700 transition"
              >
                Upgrade to Business
              </button>
            )}

            {booking.status !== "CANCELLED" && (
              <button
                onClick={cancelBooking}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
