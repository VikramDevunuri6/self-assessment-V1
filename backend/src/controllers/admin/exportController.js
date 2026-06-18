const exportService = require("../../services/admin/exportService");
const asyncHandler = require("../../utils/asyncHandler");

const exportData = asyncHandler(async (req, res) => {
  const resource = req.query.resource === "results" ? "results" : "sessions";
  const format = req.query.format === "csv" ? "csv" : "json";

  const rows = await exportService.exportData(resource);

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${resource}-export.csv"`);
    res.send(exportService.toCsv(rows));
    return;
  }

  res.json({ resource, count: rows.length, data: rows });
});

module.exports = { exportData };
