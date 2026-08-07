import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useHouse } from "./context/HouseContext";
import HomePage from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import SettingsPage from "./pages/settings/SettingsPage";

export default function App() {
  const { house } = useHouse();

  if (!house) {
    return <WelcomePage />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/settings"
        element={<SettingsPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}