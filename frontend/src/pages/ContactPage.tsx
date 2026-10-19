import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 bg-brand-50 text-brand-primary rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Contact Support & Help Desk</h1>
            <p className="text-xs text-gray-500 font-medium">Have a question? We're here to help you 24/7</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="flex items-center space-x-3 p-3.5 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-brand-primary shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Support Email</p>
                <p className="text-gray-900">support@housing-clone.test</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-brand-primary shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Toll-Free Helpline</p>
                <p className="text-gray-900">1800-123-4567 (Mon-Sat 9AM-8PM)</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Corporate Address</p>
                <p className="text-gray-900">Powai IT Park, Hiranandani Gardens, Mumbai, Maharashtra 400076</p>
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>Thank you! Your message has been sent to support.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
