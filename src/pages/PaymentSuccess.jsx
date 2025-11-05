// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PaymentSuccess() {
  const [sp] = useSearchParams();
  const bookingId = sp.get("bookingId");
  const navigate = useNavigate();
  const { api } = useAuth();
  const [status, setStatus] = useState("Verifying your payment...");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        let attempts = 0;

        // 🔄 Keep checking until backend updates to "Paid"
        while (attempts < 10) {
          const { data } = await api.get(`/bookings/${bookingId}`);
          const paymentStatus = data.booking.paymentStatus;

          if (paymentStatus === "Paid") {
            setStatus("✅ Payment Successful!");
            setVerified(true);
            break;
          }

          attempts++;
          setStatus("⏳ Waiting for payment confirmation...");
          await new Promise((res) => setTimeout(res, 2000));
        }

        // ✅ Redirect to booking details
        setTimeout(() => {
          navigate(`/bookings/${bookingId}`);
        }, 1500);
      } catch (err) {
        console.error("❌ Error verifying payment:", err);
        setStatus("⚠️ Payment completed, but verification failed.");
        setTimeout(() => {
          navigate(`/bookings/${bookingId}`);
        }, 2000);
      }
    };

    if (bookingId) verifyPayment();
  }, [bookingId, api, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center">
      <div className="bg-white shadow-lg rounded-2xl p-10 border border-green-200 max-w-md">
        <h2 className="text-3xl font-bold text-green-700 mb-3">
          {verified ? "Payment Confirmed 🎉" : "Processing Payment..."}
        </h2>
        <p className="text-gray-700 text-lg">{status}</p>
        <p className="text-sm text-gray-500 mt-3">Booking ID: {bookingId}</p>
        {!verified && (
          <div className="mt-5 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
