"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, FileText, CheckCircle, XCircle, Download } from "lucide-react";

interface DeviceType {
  id: string;
  typeCode: string;
  name: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [csvData, setCsvData] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const res = await fetch("/api/admin/device-types");
      if (res.ok) {
        const data = await res.json();
        setDeviceTypes(Array.isArray(data) ? data : (data.deviceTypes || []));
      }
    } catch (error) {
      console.error("Error fetching device types:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const devices = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const device: Record<string, string> = {};

      headers.forEach((header, index) => {
        if (header === "serial" || header === "serialnumber" || header === "serial_number") {
          device.serialNumber = values[index] || "";
        } else if (header === "imei") {
          device.imei = values[index] || "";
        } else if (header === "mac" || header === "macaddress" || header === "mac_address") {
          device.macAddress = values[index] || "";
        } else if (header === "notes" || header === "note") {
          device.notes = values[index] || "";
        }
      });

      if (device.serialNumber) {
        devices.push(device);
      }
    }

    return devices;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedType) {
      toast.error("Please select a device type");
      return;
    }

    if (!csvData.trim()) {
      toast.error("Please provide CSV data");
      return;
    }

    const devices = parseCSV(csvData);
    if (devices.length === 0) {
      toast.error("No valid devices found in CSV");
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/inventory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceTypeId: selectedType,
          devices,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        if (data.success > 0) {
          toast.success(`Successfully imported ${data.success} devices`);
        }
        if (data.failed > 0) {
          toast.error(`${data.failed} devices failed to import`);
        }
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = "serialNumber,imei,macAddress,notes\nWAT-2026-0001,123456789012345,AA:BB:CC:DD:EE:FF,Sample device\nWAT-2026-0002,,,Another device";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/inventory" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Inventory
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bulk Import Devices</h1>
          <p className="text-gray-500 mt-1">Import multiple devices from a CSV file</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="space-y-2">
          <Label>Device Type *</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              {deviceTypes.map((dt) => (
                <SelectItem key={dt.id} value={dt.id}>
                  {dt.name} ({dt.typeCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Upload CSV File</Label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="max-w-xs mx-auto"
            />
            <p className="text-sm text-gray-500 mt-2">
              CSV with columns: serialNumber, imei, macAddress, notes
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Or Paste CSV Data</Label>
          <Textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="serialNumber,imei,macAddress,notes&#10;WAT-2026-0001,123456789012345,AA:BB:CC:DD:EE:FF,Sample device"
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <Button onClick={handleImport} disabled={importing} className="w-full">
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Devices
            </>
          )}
        </Button>

        {result && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Import Results</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>{result.success} successful</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>{result.failed} failed</span>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.errors.slice(0, 10).map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>... and {result.errors.length - 10} more errors</li>
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
