import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  period?: { start: Date; end: Date };
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: "table" | "summary" | "chart";
  data: Record<string, unknown>[] | Record<string, unknown>;
  columns?: { key: string; label: string }[];
}

export function generatePDF(report: ReportData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(88, 28, 135); // Purple
  doc.text(report.title, pageWidth / 2, 20, { align: "center" });
  
  if (report.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(report.subtitle, pageWidth / 2, 28, { align: "center" });
  }
  
  // Generated info
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${report.generatedAt.toLocaleString()}`, pageWidth / 2, 36, { align: "center" });
  
  if (report.period) {
    doc.text(
      `Period: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}`,
      pageWidth / 2, 42, { align: "center" }
    );
  }
  
  let yPosition = 55;
  
  // Sections
  for (const section of report.sections) {
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(section.title, 14, yPosition);
    yPosition += 8;
    
    if (section.type === "table" && Array.isArray(section.data) && section.columns) {
      const tableData = section.data.map(row => 
        section.columns!.map(col => String(row[col.key] ?? ""))
      );
      
      autoTable(doc, {
        startY: yPosition,
        head: [section.columns.map(c => c.label)],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [88, 28, 135] },
        margin: { left: 14, right: 14 },
      });
      
      yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    } else if (section.type === "summary" && !Array.isArray(section.data)) {
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const entries = Object.entries(section.data);
      for (const [key, value] of entries) {
        doc.text(`${key}: ${value}`, 14, yPosition);
        yPosition += 6;
      }
      yPosition += 10;
    }
    
    // Check for page break
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Mechatronics IoT Platform`,
      pageWidth / 2, 290, { align: "center" }
    );
  }
  
  return doc.output("blob");
}

export function generateCSV(data: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const header = columns.map(c => `"${c.label}"`).join(",");
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '""';
      if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
      return `"${value}"`;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

export function generateExcelXML(data: Record<string, unknown>[], columns: { key: string; label: string }[], sheetName: string = "Report"): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += `  <Worksheet ss:Name="${sheetName}">\n`;
  xml += '    <Table>\n';
  
  // Header row
  xml += '      <Row>\n';
  for (const col of columns) {
    xml += `        <Cell><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>\n`;
  }
  xml += '      </Row>\n';
  
  // Data rows
  for (const row of data) {
    xml += '      <Row>\n';
    for (const col of columns) {
      const value = row[col.key];
      const type = typeof value === "number" ? "Number" : "String";
      xml += `        <Cell><Data ss:Type="${type}">${escapeXml(String(value ?? ""))}</Data></Cell>\n`;
    }
    xml += '      </Row>\n';
  }
  
  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  xml += '</Workbook>';
  
  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
