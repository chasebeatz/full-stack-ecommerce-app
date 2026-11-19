import NavBar from "./componets/NavBar";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { useSession } from "./lib/useSession";

export default function App() {
  const session = useSession();
  if (session?.user?.role !== "admin") return <Login />;
  return (
    <div className="min-h-screen">
      <NavBar user={session.user} />
      <Admin />
    </div>
  );
}
