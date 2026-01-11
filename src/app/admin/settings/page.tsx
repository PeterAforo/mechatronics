"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Bell, Shield, Database, Loader2, Mail, CreditCard, MessageSquare, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    siteName: "Mechatronics",
    supportEmail: "support@mechatronics.com",
    enableNotifications: true,
    enableMaintenanceMode: false,
    defaultCurrency: "GHS",
    // Email API
    emailProvider: "resend",
    resendApiKey: "",
    emailFrom: "Mechatronics <noreply@mechatronics.com.gh>",
    // Payment API
    paymentProvider: "flutterwave",
    flwPublicKey: "",
    flwSecretKey: "",
    flwEncryptionKey: "",
    // SMS API
    smsProvider: "mnotify",
    mnotifyApiKey: "",
    mnotifySenderId: "Mechatronics",
  });

  const toggleShowKey = (key: string) => {
    setShowApiKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.general) {
          setSettings((prev) => ({
            ...prev,
            siteName: data.general.siteName || prev.siteName,
            supportEmail: data.general.supportEmail || prev.supportEmail,
            defaultCurrency: data.general.defaultCurrency || prev.defaultCurrency,
          }));
        }
        if (data.notifications) {
          setSettings((prev) => ({
            ...prev,
            enableNotifications: data.notifications.enableNotifications === "true",
          }));
        }
        if (data.system) {
          setSettings((prev) => ({
            ...prev,
            enableMaintenanceMode: data.system.enableMaintenanceMode === "true",
          }));
        }
        if (data.email) {
          setSettings((prev) => ({
            ...prev,
            emailProvider: data.email.emailProvider || prev.emailProvider,
            resendApiKey: data.email.resendApiKey || prev.resendApiKey,
            emailFrom: data.email.emailFrom || prev.emailFrom,
          }));
        }
        if (data.payment) {
          setSettings((prev) => ({
            ...prev,
            paymentProvider: data.payment.paymentProvider || prev.paymentProvider,
            flwPublicKey: data.payment.flwPublicKey || prev.flwPublicKey,
            flwSecretKey: data.payment.flwSecretKey || prev.flwSecretKey,
            flwEncryptionKey: data.payment.flwEncryptionKey || prev.flwEncryptionKey,
          }));
        }
        if (data.sms) {
          setSettings((prev) => ({
            ...prev,
            smsProvider: data.sms.smsProvider || prev.smsProvider,
            mnotifyApiKey: data.sms.mnotifyApiKey || prev.mnotifyApiKey,
            mnotifySenderId: data.sms.mnotifySenderId || prev.mnotifySenderId,
          }));
        }
      })
      .catch(console.error)
      .finally(() => setIsFetching(false));
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            siteName: settings.siteName,
            supportEmail: settings.supportEmail,
            defaultCurrency: settings.defaultCurrency,
            enableNotifications: settings.enableNotifications,
            enableMaintenanceMode: settings.enableMaintenanceMode,
            // Email API
            emailProvider: settings.emailProvider,
            resendApiKey: settings.resendApiKey,
            emailFrom: settings.emailFrom,
            // Payment API
            paymentProvider: settings.paymentProvider,
            flwPublicKey: settings.flwPublicKey,
            flwSecretKey: settings.flwSecretKey,
            flwEncryptionKey: settings.flwEncryptionKey,
            // SMS API
            smsProvider: settings.smsProvider,
            mnotifyApiKey: settings.mnotifyApiKey,
            mnotifySenderId: settings.mnotifySenderId,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your platform settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Input
                id="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email alerts for new orders and alerts</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Active Sessions
            </Button>
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">System</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Temporarily disable public access to the platform</p>
            </div>
            <Switch
              checked={settings.enableMaintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, enableMaintenanceMode: checked })}
            />
          </div>
        </div>

        {/* Email API */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Email API</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailProvider">Provider</Label>
              <Input
                id="emailProvider"
                value={settings.emailProvider}
                onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
                placeholder="resend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resendApiKey">Resend API Key</Label>
              <div className="relative">
                <Input
                  id="resendApiKey"
                  type={showApiKeys.resendApiKey ? "text" : "password"}
                  value={settings.resendApiKey}
                  onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                  placeholder="re_xxxxx"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("resendApiKey")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys.resendApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailFrom">From Address</Label>
              <Input
                id="emailFrom"
                value={settings.emailFrom}
                onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                placeholder="Mechatronics <noreply@mechatronics.com.gh>"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway API */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Payment Gateway API</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentProvider">Provider</Label>
              <Input
                id="paymentProvider"
                value={settings.paymentProvider}
                onChange={(e) => setSettings({ ...settings, paymentProvider: e.target.value })}
                placeholder="flutterwave"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flwPublicKey">Flutterwave Public Key</Label>
              <div className="relative">
                <Input
                  id="flwPublicKey"
                  type={showApiKeys.flwPublicKey ? "text" : "password"}
                  value={settings.flwPublicKey}
                  onChange={(e) => setSettings({ ...settings, flwPublicKey: e.target.value })}
                  placeholder="FLWPUBK-xxxxx"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("flwPublicKey")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys.flwPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flwSecretKey">Flutterwave Secret Key</Label>
              <div className="relative">
                <Input
                  id="flwSecretKey"
                  type={showApiKeys.flwSecretKey ? "text" : "password"}
                  value={settings.flwSecretKey}
                  onChange={(e) => setSettings({ ...settings, flwSecretKey: e.target.value })}
                  placeholder="FLWSECK-xxxxx"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("flwSecretKey")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys.flwSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flwEncryptionKey">Flutterwave Encryption Key</Label>
              <div className="relative">
                <Input
                  id="flwEncryptionKey"
                  type={showApiKeys.flwEncryptionKey ? "text" : "password"}
                  value={settings.flwEncryptionKey}
                  onChange={(e) => setSettings({ ...settings, flwEncryptionKey: e.target.value })}
                  placeholder="xxxxx"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("flwEncryptionKey")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys.flwEncryptionKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SMS API */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">SMS API</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smsProvider">Provider</Label>
              <Input
                id="smsProvider"
                value={settings.smsProvider}
                onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
                placeholder="mnotify"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mnotifyApiKey">mNotify API Key</Label>
              <div className="relative">
                <Input
                  id="mnotifyApiKey"
                  type={showApiKeys.mnotifyApiKey ? "text" : "password"}
                  value={settings.mnotifyApiKey}
                  onChange={(e) => setSettings({ ...settings, mnotifyApiKey: e.target.value })}
                  placeholder="Your mNotify API key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("mnotifyApiKey")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys.mnotifyApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mnotifySenderId">Sender ID</Label>
              <Input
                id="mnotifySenderId"
                value={settings.mnotifySenderId}
                onChange={(e) => setSettings({ ...settings, mnotifySenderId: e.target.value })}
                placeholder="Mechatronics"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#f74780] hover:bg-[#e03a6f]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
