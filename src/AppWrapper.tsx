import { AuthProvider } from "./lib/auth.tsx";
import App from "./App";

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
