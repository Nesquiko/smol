type ServerPath = `/${string}`;

export type InputExample = {
  name: string;
  path: ServerPath;
};

export const EXAMPLES: Array<InputExample> = [
  {
    name: "Simple Example",
    path: "/examples/simple-example.txt",
  } satisfies InputExample,
  {
    name: "Complex Example",
    path: "/examples/complex-example.txt",
  } satisfies InputExample,
] satisfies Array<InputExample>;

export const LOGS_EXAMPLE: Array<string> = [
  "[2026-03-29T11:00:42.123Z] INFO: Server started on port 3000",
  "[2026-03-29T11:00:42.456Z] DEBUG: Loading configuration from /etc/app/config.json",
  "[2026-03-29T11:00:42.789Z] INFO: Database connection pool initialized (10 connections)",
  "[2026-03-29T11:00:43.012Z] DEBUG: Cache layer activated (Redis 6.2.11)",
  "[2026-03-29T11:00:43.245Z] INFO: API rate limiter configured: 100 req/min per IP",
  "[2026-03-29T11:00:43.678Z] WARN: SSL certificate expires in 45 days",
  "[2026-03-29T11:00:44.001Z] INFO: Middleware stack loaded (15 handlers)",
  "[2026-03-29T11:00:44.234Z] DEBUG: Route /api/users registered",
  "[2026-03-29T11:00:44.567Z] DEBUG: Route /api/products registered",
  "[2026-03-29T11:00:44.890Z] DEBUG: Route /api/orders registered",
  "[2026-03-29T11:00:45.123Z] INFO: Worker processes spawned: 4",
  "[2026-03-29T11:00:45.456Z] DEBUG: Health check endpoint ready at /health",
  "[2026-03-29T11:00:45.789Z] INFO: Application startup completed in 3.67s",
  "[2026-03-29T11:01:02.012Z] INFO: Incoming request GET /api/users from 192.168.1.45",
  "[2026-03-29T11:01:02.234Z] DEBUG: Query parameter page=1, limit=20",
  "[2026-03-29T11:01:02.456Z] DEBUG: Executing SQL query: SELECT * FROM users LIMIT 20",
  "[2026-03-29T11:01:02.678Z] DEBUG: Query result: 20 rows returned in 45ms",
  "[2026-03-29T11:01:02.890Z] INFO: Response sent: 200 OK (1.2 KB)",
  "[2026-03-29T11:01:15.123Z] WARN: High memory usage detected: 78% of 4GB allocated",
  "[2026-03-29T11:01:15.456Z] DEBUG: Garbage collection triggered",
  "[2026-03-29T11:01:15.789Z] DEBUG: Freed 512MB, now at 42% utilization",
  "[2026-03-29T11:02:34.012Z] ERROR: Database connection timeout after 30s",
  "[2026-03-29T11:02:34.234Z] ERROR: Stack trace:",
  "[2026-03-29T11:02:34.456Z] ERROR:   at Database.connect (src/db.ts:145:23)",
  "[2026-03-29T11:02:34.678Z] ERROR:   at ConnectionPool.acquire (src/pool.ts:89:11)",
  "[2026-03-29T11:02:34.890Z] ERROR:   at Route.handler (src/routes/users.ts:34:5)",
  "[2026-03-29T11:02:35.012Z] WARN: Retrying database connection (attempt 1/3)",
  "[2026-03-29T11:02:45.234Z] INFO: Database reconnected successfully",
  "[2026-03-29T11:02:45.456Z] INFO: Pending requests resumed (5 queued)",
  "[2026-03-29T11:03:12.789Z] INFO: Incoming request POST /api/orders from 192.168.1.67",
  "[2026-03-29T11:03:12.890Z] DEBUG: Request body size: 4.3 KB",
  "[2026-03-29T11:03:12.901Z] DEBUG: Validating request schema against OrderSchema",
  "[2026-03-29T11:03:12.912Z] INFO: Schema validation passed",
  "[2026-03-29T11:03:12.923Z] DEBUG: Creating new order in database",
  "[2026-03-29T11:03:13.034Z] DEBUG: Order ID generated: ord_7f2a8c9b1e4d6k3m",
  "[2026-03-29T11:03:13.145Z] INFO: Response sent: 201 Created (0.8 KB)",
  "[2026-03-29T11:03:45.256Z] DEBUG: Cache key miss for user:456",
  "[2026-03-29T11:03:45.367Z] DEBUG: Fetching from primary data source",
  "[2026-03-29T11:03:45.478Z] DEBUG: Populating cache entry with TTL 3600s",
  "[2026-03-29T11:04:22.589Z] WARN: API response time degraded: 850ms (threshold: 500ms)",
  "[2026-03-29T11:04:22.690Z] DEBUG: Slow query detected: src/routes/products.ts:78",
  "[2026-03-29T11:04:22.701Z] INFO: Creating performance alert",
  "[2026-03-29T11:04:50.812Z] INFO: Scheduled task executed: cleanup_expired_sessions",
  "[2026-03-29T11:04:50.923Z] DEBUG: Deleted 1,247 expired session records",
  "[2026-03-29T11:04:51.034Z] INFO: Task completed in 222ms",
  "[2026-03-29T11:05:10.145Z] INFO: Server health check: OK (uptime: 4m 28s)",
  "[2026-03-29T11:05:10.256Z] DEBUG: Memory: 1.8GB / 4GB | CPU: 12% | Connections: 8/10",
] satisfies Array<string>;
