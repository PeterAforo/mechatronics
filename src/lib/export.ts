// Export utilities for PDF and Excel generation

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

export interface ExportData {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  generatedAt: Date;
}

// Generate CSV content
export function generateCSV(data: ExportData): string {
  const headers = data.columns.map((col) => col.header).join(",");
  const rows = data.rows.map((row) =>
    data.columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return "";
        const strValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(",")
  );

  return [headers, ...rows].join("\n");
}

// Generate Excel XML (simple SpreadsheetML format)
export function generateExcelXML(data: ExportData): string {
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const headerRow = data.columns
    .map((col) => `<Cell><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>`)
    .join("");

  const dataRows = data.rows
    .map((row) => {
      const cells = data.columns
        .map((col) => {
          const value = row[col.key];
          if (value === null || value === undefined) {
            return '<Cell><Data ss:Type="String"></Data></Cell>';
          }
          const type = typeof value === "number" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(String(value))}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXml(data.title)}">
    <Table>
      <Row ss:StyleID="Header">${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;
}

// Generate simple HTML report (can be converted to PDF via browser print)
export function generateHTMLReport(data: ExportData): string {
  const headerCells = data.columns.map((col) => `<th>${col.header}</th>`).join("");
  const dataRows = data.rows
    .map((row) => {
      const cells = data.columns
        .map((col) => {
          const value = row[col.key];
          return `<td>${value ?? ""}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; margin-bottom: 5px; }
    .subtitle { color: #666; margin-bottom: 20px; }
    .meta { color: #999; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f74780; color: white; padding: 12px 8px; text-align: left; }
    td { padding: 10px 8px; border-bottom: 1px solid #eee; }
    tr:hover { background: #f9f9f9; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ""}
  <p class="meta">Generated: ${data.generatedAt.toLocaleString()}</p>
  
  <table>
    <thead>
      <tr>${headerCells}</tr>
    </thead>
    <tbody>
      ${dataRows}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Mechatronics IoT Platform - ${data.title}</p>
    <p>Total Records: ${data.rows.length}</p>
  </div>
  
  <div class="no-print" style="margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #f74780; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;
}

// Telemetry report columns
export const telemetryReportColumns: ExportColumn[] = [
  { key: "timestamp", header: "Timestamp" },
  { key: "deviceName", header: "Device" },
  { key: "variableCode", header: "Variable" },
  { key: "value", header: "Value" },
  { key: "unit", header: "Unit" },
];

// Alert report columns
export const alertReportColumns: ExportColumn[] = [
  { key: "timestamp", header: "Timestamp" },
  { key: "deviceName", header: "Device" },
  { key: "title", header: "Alert" },
  { key: "severity", header: "Severity" },
  { key: "status", header: "Status" },
  { key: "value", header: "Value" },
];

// Device report columns
export const deviceReportColumns: ExportColumn[] = [
  { key: "name", header: "Device Name" },
  { key: "serialNumber", header: "Serial Number" },
  { key: "type", header: "Type" },
  { key: "status", header: "Status" },
  { key: "site", header: "Site" },
  { key: "lastSeen", header: "Last Seen" },
];

// Billing report columns
export const billingReportColumns: ExportColumn[] = [
  { key: "date", header: "Date" },
  { key: "orderRef", header: "Order Ref" },
  { key: "description", header: "Description" },
  { key: "amount", header: "Amount" },
  { key: "status", header: "Status" },
];
