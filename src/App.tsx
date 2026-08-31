import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { useHouse } from "./context/useHouse";

import PushBootstrap from "./components/notifications/PushBootstrap";

import HomePage from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import RecipeSelectionPage from "./pages/RecipeSelectionPage";
import FastingPage from "./pages/FastingPage";
import FastingHistoryPage from "./pages/FastingHistoryPage";
import SettingsPage from "./pages/settings/SettingsPage";

export default function App() {
  const { house } = useHouse();

  if (!house) {
    return <WelcomePage />;
  }

  return (
    <>
      <PushBootstrap />

      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/choose"
          element={<RecipeSelectionPage />}
        />

        <Route
          path="/fasting"
          element={<FastingPage />}
        />

        <Route
          path="/fasting/history"
          element={<FastingHistoryPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}
