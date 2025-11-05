import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import BookFlight from "./pages/BookFlight";
import Bookings from "./pages/Bookings";
import BookingDetail from "./pages/BookingDetail"; //  Add this
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import ContactUs from "./pages/ContactUs";
import PaymentSuccess from "./pages/PaymentSuccess";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/flights" element={<Flights />} />
      <Route path="/book/:id" element={<BookFlight />} />
      <Route path="/bookings" element={<Bookings />} />

      {/*  New Dynamic Booking Detail Route */}
      <Route path="/bookings/:id" element={<BookingDetail />} />

      <Route path="/support" element={<Support />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/reports" element={<ReportsAnalytics />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  );
}
