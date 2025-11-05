import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Clock,
  Briefcase,
  Download,
  XCircle,
  DollarSign,
} from "lucide-react";

// Note: Stripe is handled server-side via redirect URLs, so no client-side stripe-js initialization is needed here.

export default function Bookings() {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/me", { cache: "no-store" });
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error(" Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Auto-refresh every 10 seconds to update payment status
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [api]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No bookings yet. Go book your first flight!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} api={api} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/*  Booking Card Component */
const BookingCard = ({ booking, api }) => {
  const navigate = useNavigate();
  const flight = booking.flight || {};

  // 🟢 Stripe Checkout (Pay Now)
  const handlePayNow = async () => {
    try {
      const res = await api.post("/payments/checkout", {
        bookingId: booking._id,
        successUrl: `${window.location.origin}/payment-success?bookingId=${booking._id}`,
        cancelUrl: `${window.location.origin}/bookings/${booking._id}`,
      });
      const { url } = res.data;
      if (url) window.location.href = url;
    } catch (err) {
      console.error(" Payment error:", err);
      alert("Failed to start payment process.");
    }
  };

  // 🟣 Download Itinerary (PDF)
  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/bookings/${booking._id}/itinerary.pdf`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
        }
      );

      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${booking.bookingReference}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(" PDF Download Error:", err);
      alert("Unable to download itinerary.");
    }
  };

  // 🔴 Cancel Booking
  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.post(`/bookings/${booking._id}/cancel`);
      alert("Booking cancelled successfully.");
      window.location.reload();
    } catch (err) {
      console.error(" Cancel Booking Error:", err);
      alert("Failed to cancel booking.");
    }
  };

  // 🟢 View Booking Details
  const handleViewDetails = () => {
    navigate(`/bookings/${booking._id}`);
  };

  // 🎨 Conditional Colors
  const paymentColor =
    booking.paymentStatus === "Paid"
      ? "text-green-600"
      : booking.paymentStatus === "Pending"
      ? "text-yellow-600"
      : "text-red-600";

  const statusColor =
    booking.status === "CONFIRMED"
      ? "text-green-700"
      : booking.status === "CANCELLED"
      ? "text-red-700"
      : "text-blue-700";

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-2xl transition-all">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* ✈️ Flight Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {flight.airline || "Unknown Airline"} · {flight.flightNumber || "N/A"}
            </h3>
            <p className="text-gray-600 text-sm">
              {flight.origin} → {flight.destination}
            </p>
            <p className="text-sm text-gray-500">
              {flight.departureTime} → {flight.arrivalTime}
            </p>
          </div>
        </div>

        {/* 💰 Booking Info */}
        <div className="text-right">
          <div className="font-bold text-green-600 text-lg">
            ₹{booking.totalPrice?.toLocaleString()}
          </div>
          <p className={`text-sm ${paymentColor}`}>
            Payment: {booking.paymentStatus}
          </p>
          <p className={`text-sm ${statusColor}`}>Status: {booking.status}</p>
        </div>
      </div>

      {/* 🕒 Meta Info */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-500" />
          <span>Ref: {booking.bookingReference}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-500" />
          <span>
            {new Date(booking.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* ⚙️ Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-3 justify-end">
        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          <Download size={16} /> Download Itinerary
        </button>

        {/* View Details */}
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-all"
        >
          View Details
        </button>

        {/* Pay Now */}
        {booking.paymentStatus === "Pending" && (
          <button
            onClick={handlePayNow}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
          >
            <DollarSign size={16} /> Pay Now
          </button>
        )}

        {/* Cancel Booking */}
        {booking.status !== "CANCELLED" && (
          <button
            onClick={handleCancelBooking}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
          >
            <XCircle size={16} /> Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};
