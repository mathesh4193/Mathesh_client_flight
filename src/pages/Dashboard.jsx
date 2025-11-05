import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  User,
  Search,
  MapPin,
  Users,
  Briefcase,
  Plane,
  IndianRupee,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    date: "",
    passengers: 1,
    travelClass: "Economy",
  });

  const [flights, setFlights] = useState([]);
  const [options, setOptions] = useState({ origins: [], destinations: [] });
  const [loading, setLoading] = useState(false);

  //  Fetch all flights for dropdown options
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch("https://mathesh-fligh-server.onrender.com/api/flights");
        const data = await res.json();

        const origins = [...new Set(data.map((f) => f.origin))];
        const destinations = [...new Set(data.map((f) => f.destination))];

        setOptions({ origins, destinations });
      } catch (err) {
        console.error("Error fetching flights:", err);
      }
    };
    fetchFlights();
  }, []);

  //  Function to calculate duration between two times
  const calculateDuration = (departure, arrival) => {
    try {
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const depMins = parseTime(departure);
      const arrMins = parseTime(arrival);
      let diff = arrMins - depMins;
      if (diff < 0) diff += 24 * 60; // next-day arrival

      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hrs}h ${mins}m`;
    } catch {
      return "N/A";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "passengers" ? Number(value) : value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
      });

      const res = await fetch(
        `https://mathesh-fligh-server.onrender.com/api/flights/search?${params}`
      );
      if (!res.ok) throw new Error("Failed to fetch flights");

      const data = await res.json();

      const classMultiplier = {
        Economy: 1,
        Business: 1.8,
        "First Class": 2.5,
      };

      const updatedFlights = data.map((f) => {
        const total = f.price * formData.passengers * classMultiplier[formData.travelClass];
        const duration = calculateDuration(f.departureTime, f.arrivalTime);
        return { ...f, total, duration };
      });

      setFlights(updatedFlights);
    } catch (err) {
      console.error(" Search Error:", err);
      alert("Failed to fetch flights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white text-center">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/30 shadow-xl">
          <User className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold">
          Welcome back, {user?.name || "Traveler"}!
        </h1>
        <p className="text-blue-100 mt-2 text-lg">
          Search your next flight below ✈️
        </p>
      </header>

      {/* Flight Search */}
      <main className="flex-1 p-8">
        <section className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl max-w-5xl mx-auto border border-white/20 p-8 mb-8">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Origin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Origin
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                >
                  <option value="">Select Origin</option>
                  {options.origins.map((o, i) => (
                    <option key={i} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                >
                  <option value="">Select Destination</option>
                  {options.destinations.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Travel Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* Passengers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Passengers
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="passengers"
                  min="1"
                  max="10"
                  value={formData.passengers}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Travel Class
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="travelClass"
                  value={formData.travelClass}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option>Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-3 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                {loading ? "Searching..." : "Search Flights"}
              </button>
            </div>
          </form>
        </section>

        {/* Flight Results */}
        <section className="max-w-5xl mx-auto space-y-6">
          {flights.length > 0 ? (
            flights.map((flight) => (
              <div
                key={flight._id}
                className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Plane className="text-blue-600 w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {flight.airline}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {flight.flightNumber}
                    </p>
                  </div>
                </div>

                <div className="text-gray-700 text-center md:text-left">
                  <p className="font-semibold">
                    {flight.origin} → {flight.destination}
                  </p>
                  <p className="text-sm text-gray-500">
                    {flight.departureTime} → {flight.arrivalTime} (
                    {flight.duration})
                  </p>
                </div>

                <div className="text-green-600 font-bold text-lg flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {flight.total.toLocaleString()}
                </div>

                <button
                 
                 onClick={() =>
                    navigate(`/book/${flight._id}`, {
                      state: {
                        ...flight,
                        passengers: formData.passengers,
                        travelClass: formData.travelClass,
                      },
                    })
                  }
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Book Now
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              No flights found yet. Try searching!
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
