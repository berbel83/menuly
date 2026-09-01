import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import BottomNavigation from "./components/navigation/BottomNavigation";
import PushBootstrap from "./components/notifications/PushBootstrap";
import NetworkStatus from "./components/status/NetworkStatus";
import UpdatePrompt from "./components/updates/UpdatePrompt";
import { useHouse } from "./context/useHouse";
import FastingHistoryPage from "./pages/FastingHistoryPage";
import FastingPage from "./pages/FastingPage";
import HomePage from "./pages/HomePage";
import RecipeSelectionPage from "./pages/RecipeSelectionPage";
import ShoppingPage from "./pages/ShoppingPage";
import TodayPage from "./pages/TodayPage";
import WelcomePage from "./pages/WelcomePage";
import SettingsPage from "./pages/settings/SettingsPage";

export default function App() {
  const { house } = useHouse();

  if (!house) {
    return <WelcomePage />;
  }

  return (
    <>
      <PushBootstrap />
      <NetworkStatus />
      <UpdatePrompt />

      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/menu" element={<HomePage />} />
        <Route path="/choose" element={<RecipeSelectionPage />} />
        <Route path="/fasting" element={<FastingPage />} />
        <Route path="/fasting/history" element={<FastingHistoryPage />} />
        <Route path="/shopping" element={<ShoppingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BottomNavigation />
    </>
  );
}
