"use client";

import { useState, useEffect } from "react";

export default function ContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/site-content");
      const data = await res.json();
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Content saved successfully!" });
        setContent(data.data);
      } else {
        setMessage({ type: "error", text: "Error: " + data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save content" });
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setContent({ ...content, features: newFeatures });
  };

  const updateService = (index, field, value) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setContent({ ...content, services: newServices });
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading content...</div>;
  }

  if (!content) {
    return <div className="p-6 text-center text-red-500">Failed to load content</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Homepage Content</h1>
          <p className="text-gray-500 mt-1">Edit your homepage text and sections</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-secondary border-b pb-3">Hero Section</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
          <input
            type="text"
            value={content.heroTitle}
            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Text (appears in color)</label>
          <input
            type="text"
            value={content.heroTitleHighlight}
            onChange={(e) => setContent({ ...content, heroTitleHighlight: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
          <textarea
            value={content.heroSubtitle}
            onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
            <input
              type="text"
              value={content.heroCtaText}
              onChange={(e) => setContent({ ...content, heroCtaText: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Link</label>
            <input
              type="text"
              value={content.heroCtaLink}
              onChange={(e) => setContent({ ...content, heroCtaLink: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Caption</label>
            <input
              type="text"
              value={content.heroImageCaption}
              onChange={(e) => setContent({ ...content, heroImageCaption: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Sub-Caption</label>
            <input
              type="text"
              value={content.heroImageSubCaption}
              onChange={(e) => setContent({ ...content, heroImageSubCaption: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-secondary border-b pb-3">Features Section</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
          <input
            type="text"
            value={content.featuresSectionTitle}
            onChange={(e) => setContent({ ...content, featuresSectionTitle: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="space-y-4">
          {content.features?.map((feature, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="text-sm font-medium text-gray-500">Feature {i + 1}</div>
              <input
                type="text"
                placeholder="Title"
                value={feature.title}
                onChange={(e) => updateFeature(i, "title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="text"
                placeholder="Description"
                value={feature.description}
                onChange={(e) => updateFeature(i, "description", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-secondary border-b pb-3">Services/Consultation Section</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Label</label>
            <input
              type="text"
              value={content.servicesSectionLabel}
              onChange={(e) => setContent({ ...content, servicesSectionLabel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              value={content.servicesSectionTitle}
              onChange={(e) => setContent({ ...content, servicesSectionTitle: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          {content.services?.map((service, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="text-sm font-medium text-gray-500">Service {i + 1}</div>
              <input
                type="text"
                placeholder="Title"
                value={service.title}
                onChange={(e) => updateService(i, "title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="text"
                placeholder="Description"
                value={service.description}
                onChange={(e) => updateService(i, "description", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Secure Order Page */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-secondary border-b pb-3">Secure Order Page</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
          <input
            type="text"
            value={content.securePageTitle}
            onChange={(e) => setContent({ ...content, securePageTitle: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={content.securePageDescription}
            onChange={(e) => setContent({ ...content, securePageDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Text</label>
          <input
            type="text"
            value={content.securePageContactText}
            onChange={(e) => setContent({ ...content, securePageContactText: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Disclaimer Text</label>
          <input
            type="text"
            value={content.securePageDisclaimer}
            onChange={(e) => setContent({ ...content, securePageDisclaimer: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee Text</label>
          <input
            type="text"
            value={content.securePageFeeText}
            onChange={(e) => setContent({ ...content, securePageFeeText: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-secondary border-b pb-3">Contact/Footer Section</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Title</label>
          <input
            type="text"
            value={content.contactTitle}
            onChange={(e) => setContent({ ...content, contactTitle: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Subtitle</label>
          <input
            type="text"
            value={content.contactSubtitle}
            onChange={(e) => setContent({ ...content, contactSubtitle: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <input
            type="email"
            value={content.contactEmail}
            onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
          <input
            type="text"
            value={content.copyrightText}
            onChange={(e) => setContent({ ...content, copyrightText: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
