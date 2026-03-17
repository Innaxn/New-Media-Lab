import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PasswordPage from "./pages/password/PasswordPage";
import CookiesPage from "./pages/cookies/CookiesPage";
import PhishingPage from "./pages/phishing/PhishingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/password" element={<PasswordPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/phishing" element={<PhishingPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
