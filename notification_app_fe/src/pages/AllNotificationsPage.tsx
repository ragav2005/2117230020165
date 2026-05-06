import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Log } from "../../../logging_middleware/logger";
import type { SelectChangeEvent } from "@mui/material/Select";
import NotificationCard from "../components/NotificationCard";
import type { Notification } from "../types/notification";
import {
  getViewedIds,
  setViewedIds as persistViewedIds,
} from "../utils/viewedStorage";

const API_URL = "http://20.207.122.201/evaluation-service/notifications";
const LOG_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
const LOG_URL = import.meta.env.VITE_API_URL;
const FILTER_OPTIONS = ["All", "Placement", "Result", "Event"] as const;

const extractNotifications = (payload: any): Notification[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const AllNotificationsPage = () => {
  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [filterType, setFilterType] =
    useState<(typeof FILTER_OPTIONS)[number]>("All");
  const [viewedIds, setViewedIds] = useState<string[]>(() => getViewedIds());
  const limit = 6;

  useEffect(() => {
    void Log(
      LOG_TOKEN,
      LOG_URL,
      "frontend",
      "info",
      "page",
      "Loaded General Feed page",
    );
  }, []);

  const handleFilterChange = (event: SelectChangeEvent) => {
    const nextFilter = event.target.value as (typeof FILTER_OPTIONS)[number];
    setFilterType(nextFilter);
    setPage(1);

    void Log(
      LOG_TOKEN,
      LOG_URL,
      "frontend",
      "info",
      "state",
      `Filter changed to ${nextFilter}`,
    );
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsFetching(true);

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (filterType !== "All") {
        queryParams.set("type", filterType);
      }

      try {
        const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
          headers: LOG_TOKEN
            ? { Authorization: `Bearer ${LOG_TOKEN}` }
            : undefined,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const payload = await response.json();
        const fetchedList = extractNotifications(payload);
        const filteredList =
          filterType === "All"
            ? fetchedList
            : fetchedList.filter((item) => item.Type === filterType);

        setNotifList(filteredList);

        const totalCount =
          typeof payload?.total === "number"
            ? payload.total
            : typeof payload?.totalCount === "number"
              ? payload.totalCount
              : typeof payload?.count === "number"
                ? payload.count
                : filteredList.length;

        const totalPages =
          typeof payload?.totalPages === "number"
            ? payload.totalPages
            : Math.max(1, Math.ceil(totalCount / limit));

        setPageCount(totalPages);
      } catch (error: any) {
        setNotifList([]);
        setPageCount(1);

        void Log(
          LOG_TOKEN,
          LOG_URL,
          "frontend",
          "error",
          "api",
          error?.message || "Failed to fetch notifications",
        );
      } finally {
        setIsFetching(false);
      }
    };

    void fetchNotifications();
  }, [page, filterType]);

  const emptyState = useMemo(() => {
    if (isFetching) {
      return null;
    }

    if (notifList.length > 0) {
      return null;
    }

    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No notifications to display.
        </Typography>
      </Box>
    );
  }, [isFetching, notifList.length]);

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
            All Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse the latest campus updates and announcements.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="filter-type-label">Filter</InputLabel>
          <Select
            labelId="filter-type-label"
            value={filterType}
            label="Filter"
            onChange={handleFilterChange}
          >
            {FILTER_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
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

      {emptyState}

      <Stack alignItems="center" spacing={1}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
        <Typography variant="caption" color="text.secondary">
          Page {page} of {pageCount}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default AllNotificationsPage;
