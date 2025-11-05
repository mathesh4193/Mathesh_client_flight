import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setForm({ name: "", email: "", subject: "", message: "" });
      alert("Support ticket submitted. We'll get back to you soon!");
    } catch {
      alert("Failed to submit support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Support</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full border rounded-lg p-3" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" />
            <input className="w-full border rounded-lg p-3" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <input className="w-full border rounded-lg p-3" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" />
            <textarea className="w-full border rounded-lg p-3" rows="5" name="message" value={form.message} onChange={handleChange} placeholder="How can we help?" required />
            <button disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg">
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
