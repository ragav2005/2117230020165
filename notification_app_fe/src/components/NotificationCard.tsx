import {
  Badge,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { Notification } from "../types/notification";

interface NotificationCardProps {
  notification: Notification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}

const formatTimestamp = (timestamp: string | number) => {
  const dateValue = new Date(timestamp);
  return Number.isNaN(dateValue.getTime())
    ? String(timestamp)
    : dateValue.toLocaleString();
};

const NotificationCard = ({
  notification,
  isRead,
  onMarkRead,
}: NotificationCardProps) => {
  const normalizedId = String(notification.ID);
  const showUnread = !isRead;

  const handleClick = () => {
    if (showUnread) {
      onMarkRead(normalizedId);
    }
  };

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea onClick={handleClick} sx={{ height: "100%" }}>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Badge color="info" variant="dot" invisible={!showUnread}>
              <Chip label={notification.Type} size="small" color="secondary" />
            </Badge>
            {showUnread ? (
              <Chip label="New" size="small" color="info" variant="outlined" />
            ) : null}
          </Stack>
          <Typography variant="body1" color="text.primary">
            {notification.Message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTimestamp(notification.Timestamp)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default NotificationCard;
