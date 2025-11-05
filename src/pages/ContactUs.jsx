import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can integrate your backend API here to send messages
    console.log("Message sent:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
            Contact Us
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div className="bg-white shadow-xl rounded-3xl p-8">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-6">
                Have questions or need help? Reach out to us anytime. Our support team is here to assist you.
              </p>

              <div className="space-y-4 text-gray-700">
                <p className="flex items-center gap-3">
                  <Mail className="text-blue-600 w-5 h-5" />
                  support@flightbooker.com
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="text-green-600 w-5 h-5" />
                  +91 9876543210
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="text-red-600 w-5 h-5" />
                  123 main st, Madurai, Tamil Nadu, India
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-xl rounded-3xl p-8"
            >
              <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
                Send a Message
              </h2>

              {submitted && (
                <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
                   Your message has been sent successfully!
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-600 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter your name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-600 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Send className="w-5 h-5" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
