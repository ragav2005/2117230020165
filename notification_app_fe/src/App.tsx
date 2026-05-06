import { useEffect } from "react";
import { Log } from "../../logging_middleware/logger";

function App() {
  useEffect(() => {
    const initLogger = async () => {
      const token = import.meta.env.VITE_ACCESS_TOKEN;
      const url = import.meta.env.VITE_API_URL;

      await Log(token, url, "frontend", "info", "middleware", "Testing Logger");
    };

    initLogger();
  }, []);

  return (
    <div>
      <h1>Notification Dashboard</h1>
    </div>
  );
}

export default App;
