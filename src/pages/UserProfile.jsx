import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Phone, Calendar, Save, LogOut, Check, X } from "lucide-react";

export default function UserProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    preferences: { seatPreference: "window", mealPreference: "regular" },
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        preferences: {
          seatPreference: user.preferences?.seatPreference || "window",
          mealPreference: user.preferences?.mealPreference || "regular",
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const changed =
      profile.name !== user.name ||
      profile.email !== user.email ||
      profile.phone !== user.phone ||
      profile.dateOfBirth !== (user.dateOfBirth?.split("T")[0] || "") ||
      profile.preferences.seatPreference !== user.preferences?.seatPreference ||
      profile.preferences.mealPreference !== user.preferences?.mealPreference;
    setHasChanges(changed);
  }, [profile, user]);

  const validateForm = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = "Full name is required";
    if (!profile.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = "Please enter a valid email";
    if (!profile.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?([0-9]{10,15})$/.test(profile.phone.replace(/[\s-]/g, "")))
      newErrors.phone = "Please enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await updateProfile(profile);
      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || err?.message || "Update failed" });
    } finally {
      setIsLoading(false);
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-center mb-2">Access Restricted</h2>
          <p className="text-center text-sm text-gray-600 mb-6">Please sign in to view your profile</p>
          <button onClick={() => navigate("/login")} className="w-full py-3 bg-blue-600 text-white rounded-lg shadow hover:scale-[1.01] transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white text-center">
            <div className="mx-auto w-28 h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-xl">
              <User className="w-14 h-14" />
            </div>
            <h1 className="text-3xl font-bold mt-5">Your Profile</h1>
            <p className="text-blue-100 mt-2">Manage your personal information and preferences</p>
          </div>

          <div className="p-8 space-y-6">
            {showSuccess && (
              <div className="mx-auto w-fit bg-emerald-100 text-emerald-700 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 border border-emerald-200">
                <Check className="w-5 h-5" />
                <span className="font-medium">Profile updated successfully!</span>
              </div>
            )}

            {errors.form && (
              <div className="mx-auto w-full bg-red-100 text-red-700 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 border border-red-200">
                <X className="w-5 h-5" />
                <span className="font-medium">{errors.form}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1.5">
                    <X className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm" value={profile.email} readOnly />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1.5">
                    <X className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="flex gap-3">
              <select
                name="seatPreference"
                value={profile.preferences.seatPreference}
                onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, seatPreference: e.target.value } })}
                className="w-1/2 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              >
                <option value="window">Window</option>
                <option value="middle">Middle</option>
                <option value="aisle">Aisle</option>
              </select>

              <select
                name="mealPreference"
                value={profile.preferences.mealPreference}
                onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, mealPreference: e.target.value } })}
                className="w-1/2 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              >
                <option value="regular">Regular</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="kosher">Kosher</option>
                <option value="halal">Halal</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isLoading || !hasChanges}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  </svg>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Save Changes</span>
              </button>

              <button onClick={() => navigate("/bookings")} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" /> <span>View My Bookings</span>
              </button>

              <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout confirmation modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Sign Out</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => { logout(); setShowLogoutConfirm(false); navigate("/login"); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
