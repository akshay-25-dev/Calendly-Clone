import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import Meetings from "./pages/Meetings";
import Confirmation from "./pages/Confirmation";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/success" element={<Confirmation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;