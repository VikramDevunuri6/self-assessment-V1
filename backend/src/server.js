const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const env = require("./config/env");
const logger = require("./config/logger");

const loggerMiddleware = require("./middleware/loggerMiddleware");
const { generalLimiter } = require("./middleware/rateLimitMiddleware");
const { errorMiddleware, notFoundHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const resultRoutes = require("./routes/resultRoutes");
const v1ResultRoutes = require("./routes/v1ResultRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(express.json());
app.use(loggerMiddleware);
app.use(generalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/v1/results", v1ResultRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
