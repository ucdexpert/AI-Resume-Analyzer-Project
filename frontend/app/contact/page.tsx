"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Envelope, Phone, MapPin, LinkedinLogo, GithubLogo, PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormState({ name: "", email: "", subject: "", message: "" });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold mb-4"
          >
            Get in <span className="text-brand-primary">Touch</span>
          </motion.h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Have questions about SkillSense? We're here to help you optimize your career path.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-info/10 flex items-center justify-center text-brand-info shrink-0">
                    <Phone size={24} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Call Us</p>
                    <a href="tel:+923170219387" className="text-lg font-medium hover:text-brand-primary transition-colors">
                      03170219387
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <Envelope size={24} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Email Us</p>
                    <a href="mailto:uzairkhilji307@gmail.com" className="text-lg font-medium hover:text-brand-primary transition-colors">
                      uzairkhilji307@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-success/10 flex items-center justify-center text-brand-success shrink-0">
                    <LinkedinLogo size={24} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">LinkedIn</p>
                    <a href="https://www.linkedin.com/in/muhammad-uzair-066733314/" target="_blank" className="text-lg font-medium hover:text-brand-primary transition-colors">
                      Muhammad Uzair
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white shrink-0">
                    <GithubLogo size={24} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">GitHub</p>
                    <a href="https://github.com/ucdexpert" target="_blank" className="text-lg font-medium hover:text-brand-primary transition-colors">
                      ucdexpert
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10">
                <h3 className="font-bold mb-4">Follow Our Journey</h3>
                <div className="flex gap-4">
                   <a href="https://www.linkedin.com/in/muhammad-uzair-066733314/" target="_blank" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                     <LinkedinLogo size={20} />
                   </a>
                   <a href="https://github.com/ucdexpert" target="_blank" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-primary transition-colors">
                     <GithubLogo size={20} />
                   </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card p-8">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-brand-success/20 text-brand-success rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} weight="fill" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-text-muted mb-8">We've received your inquiry and will get back to you shortly.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-muted ml-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-muted ml-1">Email Address</label>
                      <input
                        required
                        type="email"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted ml-1">Subject</label>
                    <input
                      required
                      type="text"
                      value={formState.subject}
                      onChange={(e) => setFormState({...formState, subject: e.target.value})}
                      placeholder="How can we help?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted ml-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                    />
                  </div>
                  
                  {error && <p className="text-brand-danger text-sm">{error}</p>}

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : (
                      <>
                        Send Message
                        <PaperPlaneTilt size={20} weight="bold" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
