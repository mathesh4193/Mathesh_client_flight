import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Plane,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  Users,
  Briefcase,
  Timer,
  Search,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [locations, setLocations] = useState({ origins: [], destinations: [] });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    date: "",
    passengers: 1,
    travelClass: "Economy",
  });

  const navigate = useNavigate();

  // ✅ Load origin/destination options
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/flights/origins-destinations`);
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error("Error loading locations:", err);
        setLocations({ origins: [], destinations: [] });
      }
    })();
  }, []);

  // ✅ Calculate duration
  const calculateDuration = (departure, arrival) => {
    const toMinutes = (time) => {
      if (!time) return 0;
      const [t, meridian] = time.split(" ");
      let [h, m] = t.split(":").map(Number);
      if (meridian === "PM" && h !== 12) h += 12;
      if (meridian === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    let diff = toMinutes(arrival) - toMinutes(departure);
    if (diff < 0) diff += 1440;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  // ✅ Calculate total price
  const calculateTotal = (base, passengers, travelClass) => {
    const multiplier = { Economy: 1, Business: 1.8, "First Class": 2.5 };
    return Math.round(base * passengers * (multiplier[travelClass] || 1));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Search flights
  const handleSearch = async (e) => {
    e.preventDefault();
    const { origin, destination, date, passengers, travelClass } = formData;

    if (origin === destination) {
      setSearchError("Origin and destination cannot be the same.");
      return;
    }

    setLoading(true);
    setSearchError("");
    setFlights([]);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/flights/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`
      );
      if (res.status === 404) {
        setSearchError("No flights available for this route and date.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch flights");

      const data = await res.json();
      const results = data.map((f) => ({
        ...f,
        duration: calculateDuration(f.departureTime, f.arrivalTime),
        totalPrice: calculateTotal(f.price, passengers, travelClass),
        passengers,
        travelClass,
      }));

      setFlights(results);
      if (results.length === 0)
        setSearchError("No flights found for your criteria.");
    } catch (err) {
      console.error("Error searching flights:", err);
      setSearchError("Error fetching flights.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight) => {
    navigate(`/book/${flight._id}`, {
      state: {
        ...flight,
        passengers: formData.passengers,
        travelClass: formData.travelClass,
      },
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Find Your Perfect Flight
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search by route and date — we’ll show available flights for that day.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-blue-100">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField
              label="From"
              name="origin"
              icon={<MapPin size={18} />}
              value={formData.origin}
              options={locations.origins}
              onChange={handleChange}
            />
            <SelectField
              label="To"
              name="destination"
              icon={<MapPin size={18} />}
              value={formData.destination}
              options={locations.destinations}
              onChange={handleChange}
            />
            <InputField
              label="Departure Date"
              name="date"
              icon={<Calendar size={18} />}
              type="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
            <InputField
              label="Passengers"
              name="passengers"
              icon={<Users size={18} />}
              type="number"
              min="1"
              max="9"
              value={formData.passengers}
              onChange={handleChange}
            />
            <SelectField
              label="Class"
              name="travelClass"
              icon={<Briefcase size={18} />}
              value={formData.travelClass}
              options={["Economy", "Business", "First Class"]}
              onChange={handleChange}
            />
            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-md hover:from-blue-700 hover:to-indigo-700"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search Flights"}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-10 text-gray-500 animate-pulse">
            <Search className="w-6 h-6 mx-auto mb-2" />
            Searching for flights...
          </div>
        )}

        {searchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            <p>{searchError}</p>
          </div>
        )}

        {flights.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {flights.map((f) => (
              <FlightCard key={f._id} flight={f} onBook={() => handleBook(f)} />
            ))}
          </div>
        )}

        {!loading && flights.length === 0 && !searchError && (
          <div className="text-center py-12 text-gray-500">
            <Plane className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No flights found. Try searching above.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/* ✅ Reusable Input and Select Components */
const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">{icon}</span>
      <input
        {...props}
        className="pl-12 w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon, name, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">{icon}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className="pl-12 w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);

/* ✅ FlightCard Component */
const FlightCard = ({ flight, onBook }) => (
  <div className="bg-white shadow-xl rounded-2xl p-6 border hover:shadow-2xl transition-all">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{flight.flightNumber}</h3>
          <p className="text-gray-600">{flight.airline}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={16} /> {flight.origin}
          <ArrowRight size={16} className="text-gray-400" /> {flight.destination}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} /> {flight.departureTime} → {flight.arrivalTime}
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <Timer size={16} /> {flight.duration}
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <DollarSign size={16} />{" "}
          <span className="text-2xl font-bold">
            ₹{flight.totalPrice?.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={onBook}
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-emerald-600"
      >
        Book Now <ArrowRight size={16} />
      </button>
    </div>
  </div>
);
