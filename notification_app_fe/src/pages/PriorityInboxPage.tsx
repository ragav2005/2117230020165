import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Log } from "../../../logging_middleware/logger";
import type { SelectChangeEvent } from "@mui/material/Select";
import NotificationCard from "../components/NotificationCard";
import type { Notification } from "../types/notification";
import { getTopNotifications } from "../PriorityInboxEngine";
import {
  getViewedIds,
  setViewedIds as persistViewedIds,
} from "../utils/viewedStorage";

const LOG_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
const LOG_URL = import.meta.env.VITE_API_URL;

const PriorityInboxPage = () => {
  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [priorityLimit, setPriorityLimit] = useState(6);
  const [viewedIds, setViewedIds] = useState<string[]>(() => getViewedIds());

  useEffect(() => {
    void Log(
      LOG_TOKEN,
      LOG_URL,
      "frontend",
      "info",
      "page",
      "Loaded Priority Inbox page",
    );
  }, []);

  useEffect(() => {
    const fetchPriorityNotifications = async () => {
      setIsFetching(true);

      try {
        const topList = await getTopNotifications(priorityLimit);
        setNotifList(topList);
      } catch (error: any) {
        setNotifList([]);

        void Log(
          LOG_TOKEN,
          LOG_URL,
          "frontend",
          "error",
          "api",
          error?.message || "Failed to fetch priority notifications",
        );
      } finally {
        setIsFetching(false);
      }
    };

    void fetchPriorityNotifications();
  }, [priorityLimit]);

  const handleLimitChange = (event: SelectChangeEvent) => {
    const nextLimit = Number(event.target.value);
    setPriorityLimit(nextLimit);

    void Log(
      LOG_TOKEN,
      LOG_URL,
      "frontend",
      "info",
      "state",
      `Priority inbox limit changed to ${nextLimit}`,
    );
  };

  const handleMarkRead = (id: string) => {
    if (viewedIds.includes(id)) {
      return;
    }

    const nextIds = [...viewedIds, id];
    setViewedIds(nextIds);
    persistViewedIds(nextIds);

    void Log(
      LOG_TOKEN,
      LOG_URL,
      "frontend",
      "info",
      "state",
      `Marked notification ${id} as read`,
    );
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h4" color="text.primary">
            Priority Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Focus on the most important campus alerts first.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="priority-limit-label">Top N</InputLabel>
          <Select
            labelId="priority-limit-label"
            value={priorityLimit}
            label="Top N"
            onChange={handleLimitChange}
          >
            {[3, 6, 9, 12].map((limitOption) => (
              <MenuItem key={limitOption} value={limitOption}>
                {limitOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isFetching ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      <Grid container spacing={2}>
        {notifList.map((notification) => {
          const notificationId = String(notification.ID);
          return (
            <Grid item xs={12} md={6} lg={4} key={notificationId}>
              <NotificationCard
                notification={notification}
                isRead={viewedIds.includes(notificationId)}
                onMarkRead={handleMarkRead}
              />
            </Grid>
          );
        })}
      </Grid>

      {!isFetching && notifList.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No priority notifications available right now.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
};

export default PriorityInboxPage;
