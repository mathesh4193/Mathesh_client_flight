import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../config/api";
import { DollarSign, UserPlus, XCircle } from "lucide-react";

export default function BookFlight() {
  const { state: flight } = useLocation(); // flight data from Flights.jsx
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const passengerCount = Number(flight?.passengers || 1);

  //  Initialize passengers based on flight.passengers count
  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => ({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      email: "",
      phone: "",
    }))
  );

  const [loading, setLoading] = useState(false);
  const [totalFare, setTotalFare] = useState(0);

  //  Calculate total fare dynamically
  useEffect(() => {
    const basePrice = flight?.totalPrice || flight?.price || 0;
    setTotalFare(basePrice);
  }, [flight]);

  //  Update passenger field
  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  //  Add new passenger (up to 9)
  const addPassenger = () => {
    if (passengers.length >= 9) {
      alert("Maximum 9 passengers allowed per booking.");
      return;
    }
    setPassengers([
      ...passengers,
      { firstName: "", lastName: "", dob: "", gender: "", email: "", phone: "" },
    ]);
  };

  //  Remove passenger
  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  //  Confirm booking (POST to backend)
  const handleConfirmBooking = async () => {
    if (!user) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }

    if (
      passengers.some(
        (p) =>
          !p.firstName || !p.lastName || !p.gender || !p.email || !p.phone
      )
    ) {
      alert("Please fill all passenger details correctly.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create booking in backend
      const { data: bookingRes } = await api.post("/bookings", {
        flightId: flight?._id,
        passengers,
        travelClass: flight?.travelClass || "Economy",
        totalPrice: totalFare, // total price already includes passengers
      });

      const booking = bookingRes.booking;

      // 2️⃣ Stripe redirect
      const successUrl = `${window.location.origin}/payment-success?bookingId=${booking._id}`;
      const cancelUrl = `${window.location.origin}/bookings/${booking._id}`;

      const response = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking._id, successUrl, cancelUrl }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid Stripe session URL.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Unable to process booking. Try again.");
    } finally {
      setLoading(false);
    }
  };

  //  Handle case when user refreshes page
  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-700">
          No flight selected.
        </h2>
        <button
          onClick={() => navigate("/flights")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 my-12 bg-white shadow-lg rounded-2xl border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Passenger Information
        </h1>

        {/* ✈️ Flight Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-800">
                {flight?.airline} · {flight?.flightNumber}
              </h2>
              <p className="text-gray-600 text-sm">
                {flight?.origin} → {flight?.destination}
              </p>
              <p className="text-gray-500 text-sm">
                {flight?.departureTime} → {flight?.arrivalTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ₹{totalFare.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">
                {passengers.length} Passenger(s) · {flight?.travelClass}
              </p>
            </div>
          </div>
        </div>

        {/* 👥 Passenger Form */}
        {passengers.map((p, index) => (
          <div
            key={index}
            className="border border-gray-200 p-4 rounded-xl mb-4 bg-gray-50"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Passenger {index + 1}
              </h3>
              {passengers.length > 1 && (
                <button
                  onClick={() => removePassenger(index)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <XCircle size={14} /> Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={p.firstName}
                onChange={(e) =>
                  handlePassengerChange(index, "firstName", e.target.value)
                }
              />
              <Input
                label="Last Name"
                value={p.lastName}
                onChange={(e) =>
                  handlePassengerChange(index, "lastName", e.target.value)
                }
              />
              <Input
                label="Date of Birth"
                type="date"
                value={p.dob}
                onChange={(e) =>
                  handlePassengerChange(index, "dob", e.target.value)
                }
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  value={p.gender}
                  onChange={(e) =>
                    handlePassengerChange(index, "gender", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="Email"
                type="email"
                value={p.email}
                onChange={(e) =>
                  handlePassengerChange(index, "email", e.target.value)
                }
              />
              <Input
                label="Phone"
                type="tel"
                value={p.phone}
                onChange={(e) =>
                  handlePassengerChange(index, "phone", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        {/* ➕ Add Passenger */}
        <button
          onClick={addPassenger}
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 mb-6"
        >
          <UserPlus size={18} /> Add Another Passenger
        </button>

        {/*  Confirm Booking Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 mx-auto hover:bg-green-700 transition shadow-md"
          >
            <DollarSign size={18} />
            {loading ? "Processing..." : "Confirm Booking & Pay"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* 🔹 Reusable Input Component */
const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
    />
  </div>
);
