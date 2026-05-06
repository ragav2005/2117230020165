import {
  AppBar,
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, Route, Routes } from "react-router-dom";
import AllNotificationsPage from "./pages/AllNotificationsPage";
import PriorityInboxPage from "./pages/PriorityInboxPage";

const navItems = [
  { label: "All Notifications", path: "/" },
  { label: "Priority Inbox", path: "/priority" },
];

const App = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar
          sx={{ justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" color="text.primary">
              Campus Notification App
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                color="primary"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  "&.active": {
                    backgroundColor: "action.selected",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Routes>
          <Route path="/" element={<AllNotificationsPage />} />
          <Route path="/priority" element={<PriorityInboxPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
