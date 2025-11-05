import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    seatPreference: "window",
    mealPreference: "regular",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);
      await register(form);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-6">
      <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md mb-3">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Join and explore the world 🌍</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
            autoFocus
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            inputMode="email"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            inputMode="tel"
            autoComplete="tel"
            pattern="[0-9]{10,15}"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {/* DOB */}
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            autoComplete="bday"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {/* Preferences */}
          <div className="flex gap-2">
            <select
              name="seatPreference"
              value={form.seatPreference}
              onChange={handleChange}
              className="w-1/2 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
            >
              <option value="window">Window</option>
              <option value="middle">Middle</option>
              <option value="aisle">Aisle</option>
            </select>

            <select
              name="mealPreference"
              value={form.mealPreference}
              onChange={handleChange}
              className="w-1/2 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
            >
              <option value="regular">Regular</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="kosher">Kosher</option>
              <option value="halal">Halal</option>
            </select>
          </div>

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password" // ✅ added
            minLength={4}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password" // ✅ added
            minLength={4}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-5 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
