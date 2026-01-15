"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    streetAddress: "",
    cityStateZip: "",
    phone: "",
    fax: "",
    website: "",
    email: "",
    contactName: "",
  });

  // Admin credentials state
  const [adminEmail, setAdminEmail] = useState("");
  const [credentialsForm, setCredentialsForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [credentialsSaving, setCredentialsSaving] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [settingsRes, credentialsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/auth/credentials"),
        ]);
        
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setFormData(settingsData.data);
        }

        const credentialsData = await credentialsRes.json();
        if (credentialsData.success) {
          setAdminEmail(credentialsData.data.email);
          setCredentialsForm(prev => ({ ...prev, newEmail: credentialsData.data.email }));
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setCredentialsError("");
    setCredentialsSaved(false);

    if (credentialsForm.newPassword && credentialsForm.newPassword !== credentialsForm.confirmPassword) {
      setCredentialsError("New passwords do not match");
      return;
    }

    if (!credentialsForm.currentPassword) {
      setCredentialsError("Please enter your current password");
      return;
    }

    setCredentialsSaving(true);

    try {
      const res = await fetch("/api/auth/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: credentialsForm.currentPassword,
          newEmail: credentialsForm.newEmail !== adminEmail ? credentialsForm.newEmail : undefined,
          newPassword: credentialsForm.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCredentialsSaved(true);
        setAdminEmail(credentialsForm.newEmail);
        setCredentialsForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        setTimeout(() => setCredentialsSaved(false), 3000);
      } else {
        setCredentialsError(data.error || "Failed to update credentials");
      }
    } catch (error) {
      setCredentialsError("Failed to update credentials");
    } finally {
      setCredentialsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your company details and admin credentials</p>
      </div>

      {/* Admin Credentials Section */}
      <form onSubmit={handleCredentialsSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
            Admin Credentials
          </h2>
          <p className="text-sm text-gray-500 mb-4">Update your admin login email and password</p>
          
          {credentialsError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {credentialsError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <input
                type="password"
                value={credentialsForm.currentPassword}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter current password to make changes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={credentialsForm.newEmail}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, newEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="admin@example.com"
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={credentialsForm.newPassword}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={credentialsForm.confirmPassword}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={credentialsSaving}
            className="px-6 py-2.5 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {credentialsSaving ? (
              <>Updating...</>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Update Credentials
              </>
            )}
          </button>
          {credentialsSaved && (
            <span className="text-green-600 flex items-center gap-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Credentials updated!
            </span>
          )}
        </div>
      </form>

      {/* Company Details Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
            Company / Vendor Details
          </h2>
          <p className="text-sm text-gray-500 mb-4">These details appear on order memos and invoices</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="BioVibe Peptides"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City, State, ZIP</label>
              <input
                type="text"
                value={formData.cityStateZip}
                onChange={(e) => setFormData({ ...formData, cityStateZip: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="New York, NY 10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fax</label>
              <input
                type="text"
                value={formData.fax}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="(555) 123-4568"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="www.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="support@example.com"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Settings
              </>
            )}
          </button>
          {saved && (
            <span className="text-green-600 flex items-center gap-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

