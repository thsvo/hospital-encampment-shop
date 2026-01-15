"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-secondary mb-2">Message Sent!</h3>
        <p className="text-gray-600 mb-4">Thank you for reaching out. We&apos;ll get back to you soon.</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-primary font-medium hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
        />
        <textarea
          placeholder="How can we help you?"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
        ></textarea>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors shadow-lg disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
