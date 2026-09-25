'use client';

import { useState } from 'react';
import { useContent, formatTelUrl } from '@/context/ContentContext';

export default function ContactPage() {
  const { content, phone, email, whatsappLink } = useContent();
  const address = content?.contact?.address || 'Nutri Ghar Artisanal Kitchen, Sector 14, Gurugram, Haryana - 122001';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16 md:py-24">
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-700">
              We'd love to hear from you. Reach out with any questions or feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1540px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
                {/* Phone */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">📞 Call Us</h3>
                  <a
                    href={formatTelUrl(phone)}
                    className="text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    {phone}
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    Monday - Friday, 9 AM - 6 PM IST
                  </p>
                </div>

                {/* Email */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">📧 Email</h3>
                  <a
                    href={`mailto:${email}`}
                    className="text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    {email}
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    We'll respond within 24 hours
                  </p>
                </div>

                {/* WhatsApp */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">💬 WhatsApp</h3>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Chat with us
                  </a>
                  <p className="text-sm text-gray-600 mt-3">
                    For quick inquiries and support
                  </p>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">📍 Address</h3>
                  <p className="text-gray-700">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h2>

                {submitted ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-3">Thank you!</h3>
                    <p className="text-gray-700">
                      We've received your message and will get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="How can we help?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-600 text-white rounded-lg font-bold text-lg hover:bg-amber-700 transition"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  How long does delivery take?
                </h3>
                <p className="text-gray-700">
                  Typically, orders are delivered within 3-5 business days. We'll send you tracking
                  details via SMS and email.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Do you deliver across India?
                </h3>
                <p className="text-gray-700">
                  We currently deliver to major cities across India. Check our delivery policy for
                  more details.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  What if I'm not satisfied with my order?
                </h3>
                <p className="text-gray-700">
                  We're confident in our quality. If you're not satisfied, contact us within 7
                  days for a full refund or replacement.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Are your products suitable for diabetics?
                </h3>
                <p className="text-gray-700">
                  Many of our products are low-sugar or sugar-free. Check the product description
                  for details. We also offer custom orders - reach out to discuss options.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Can I place bulk orders?
                </h3>
                <p className="text-gray-700">
                  Absolutely! For corporate gifts or bulk orders, please contact us directly at{' '}
                  <a href={formatTelUrl(phone)} className="text-amber-600 font-semibold underline">{phone}</a> or{' '}
                  <a href={`mailto:${email}`} className="text-amber-600 font-semibold underline">{email}</a>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Do you use preservatives?
                </h3>
                <p className="text-gray-700">
                  No, we don't use artificial preservatives. All products are made with 100%
                  natural ingredients and should be consumed within the specified shelf life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
