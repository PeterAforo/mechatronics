"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";

export default function BulkImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/devices/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: 0, failed: 0, errors: ["Import failed. Please try again."] });
    }
    setImporting(false);
  };

  const downloadTemplate = () => {
    const template = "serial_number,device_type_code,tenant_code,nickname,notes\nSN001,WAT100,TENANT001,Water Meter 1,Main building\nSN002,PWR100,TENANT001,Power Monitor,Office";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Bulk Device Import</h1>
        <p className="text-gray-500 mt-1">Import multiple devices from a CSV file</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">Download Template</p>
              <p className="text-sm text-blue-700 mt-1">
                Use our CSV template to ensure your data is formatted correctly.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-gray-400 mt-1">CSV files only</p>
            </label>
          </div>
        </div>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {importing ? "Importing..." : "Import Devices"}
        </Button>

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">Import Results</h3>
            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-700">{result.success} successful</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-700">{result.failed} failed</span>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>... and {result.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
