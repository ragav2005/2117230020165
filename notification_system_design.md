# Notification System Design

## Stage 1: Priority Inbox Architecture

### 1. Ranking Mechanism (Weighted Recency Model)

The Priority Inbox uses a Weighted Recency Model to ensure that high-stakes information is never buried by high-volume, low-priority updates.

- **Weight Assignment:** Each notification type is assigned a base value:
  - Placement: 3000
  - Result: 2000
  - Event: 1000
- **Recency Factor:** To act as a tie-breaker, the Unix epoch timestamp (in seconds) is added to the base weight.
- **Formula:**
  - Score = (TypeWeight) + (UnixTimestamp)
- **Logic:** By using large base weights, a “Placement” notification from yesterday will still outrank a “Result” notification from today, while ensuring that within the “Placement” category, the newest items appear first.

### 2. Maintaining the Top 'N' Efficiently

While a standard O(NlogN) sort is sufficient for small lists, maintaining the top 10 in a continuous stream of incoming data requires a more efficient approach:

- **Min-Heap Strategy:** To maintain the Top 10 efficiently without re-sorting the entire dataset, we implement a Min-Heap of size 10.
- **Mechanism:** As new notifications arrive, we compare their score to the root of the heap (the 10th highest score). If the new notification’s score is higher, we replace the root and perform a “Heapify” operation.
- **Complexity:** This reduces the insertion cost to O(log10), ensuring the application remains responsive even during high-frequency notification bursts.

## Stage 2: Frontend Implementation & UX

### 1. Architecture & State Management

The frontend is built as a responsive Single Page Application (SPA) using React and Material UI (MUI).

- **Routing:** Managed via `react-router-dom`, providing distinct views for the General Feed (`/`) and the Priority Inbox (`/priority`).
- **Data Persistence (Read/Unread):** Since no backend state is maintained for user interactions, we utilize `localStorage` to track “Viewed” notifications.
  - When a notification card is clicked, its unique ID is appended to a `viewed_notifications` array in storage.
  - The UI dynamically compares incoming API data against this local array to determine if a “New” badge should be displayed.

### 2. UI/UX Strategy

Adhering to the “Production-Grade” requirement, the interface prioritizes clarity and accessibility:

- **Clutter Reduction:** Notifications are presented in a vertical feed using MUI Cards with clear typography hierarchy.
- **Responsive Design:** Utilizing MUI’s Grid and Container systems, the layout fluidly adapts between a multi-column desktop view and a single-column mobile-optimized view.
- **Visual Cues:** High-priority “Placement” items utilize distinct color-coded chips to draw immediate user attention.

### 3. Observability & Telemetry

Every significant event within the application lifecycle is captured by the Logging Middleware:

- **API Lifecycle:** Fetch attempts, successful rank operations, and network failures are logged to the remote telemetry server.
- **User Behavior:** Interactions such as switching filters or navigating between routes trigger informational logs, providing a clear narrative of application usage for debugging and performance monitoring.
