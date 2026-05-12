'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadSimple, CheckCircle, WarningCircle, HourglassSimple } from '@phosphor-icons/react';
import { submitManualPaymentProof } from '@/lib/api';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
}

export default function PaymentProofModal({ isOpen, onClose, planName, price }: PaymentProofModalProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('JazzCash'); // Default to JazzCash
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        setError("File size exceeds 5MB limit.");
        setScreenshot(null);
        setScreenshotPreview(null);
        return;
      }
      setScreenshot(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setScreenshot(null);
      setScreenshotPreview(null);
    }
  };

  const handleSubmitProof = async () => {
    if (!screenshot || !transactionId || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('plan', planName);
    formData.append('amount', price);
    formData.append('payment_method', paymentMethod);
    formData.append('transaction_id', transactionId);
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }

    try {
      const result = await submitManualPaymentProof(formData);

      let successMsg = 'Payment proof submitted successfully!';
      if (result && result.message) {
          if (typeof result.message === 'string') {
              successMsg = result.message;
          } else {
              successMsg = JSON.stringify(result.message);
          }
      }
      setSuccessMessage(successMsg);
      setScreenshot(null);
      setScreenshotPreview(null);
      setTransactionId('');
      setPaymentMethod('JazzCash');

      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (err: any) {
      let displayError = 'An unexpected error occurred.';
      if (err instanceof Error) {
        displayError = err.message;
      } else if (typeof err === 'string') {
        displayError = err;
      } else {
        displayError = JSON.toString();
      }
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md sm:max-w-lg glass-card p-4 sm:p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-start gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-brand-primary flex-1 pr-2">
                Manual Payment for {planName} Plan
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2">
                  <WarningCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>{successMessage}</span>
                </div>
              )}

              <p className="text-text-muted">
                To upgrade to the <span className="font-bold text-white">{planName}</span> plan for{' '}
                <span className="font-bold text-white">PKR {price}</span>, please send the payment to one of the following accounts:
              </p>

              <div className="bg-white/5 p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-bold text-white">JazzCash:</span> 03170219387 (Account Name: Uzair)</p>
                <p><span className="font-bold text-white">Easypaisa:</span> 03170219387 (Account Name: Uzair)</p>
              </div>

              <p className="text-text-muted">
                After making the payment, please upload a screenshot of the transaction and enter the transaction ID below.
              </p>

              {/* Payment Method Selection */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-text-muted mb-2">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="JazzCash"
                      checked={paymentMethod === 'JazzCash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-brand-primary"
                    />
                    <span className="ml-2 text-white">JazzCash</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Easypaisa"
                      checked={paymentMethod === 'Easypaisa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-brand-primary"
                    />
                    <span className="ml-2 text-white">Easypaisa</span>
                  </label>
                </div>
              </div>

              {/* Transaction ID Input */}
              <div>
                <label htmlFor="transactionId" className="block text-sm font-medium text-text-muted mb-2">Transaction ID / Ref #</label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => {setError(null); setTransactionId(e.target.value);}}
                  placeholder="Enter transaction ID"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary outline-none focus:border-brand-primary/50"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label htmlFor="screenshotUpload" className="block text-sm font-medium text-text-muted mb-2">Upload Screenshot of Payment</label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="screenshotUpload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {screenshotPreview ? (
                      <img src={screenshotPreview} alt="Screenshot Preview" className="max-h-28 max-w-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadSimple size={32} className="text-text-muted mb-2" />
                        <p className="mb-2 text-sm text-text-muted"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-text-muted">PNG, JPG, GIF (MAX. 5MB)</p>
                      </div>
                    )}
                    <input id="screenshotUpload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitProof}
                disabled={!screenshot || !transactionId || isLoading}
                className="neon-button w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <HourglassSimple size={20} weight="bold" className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} weight="bold" /> Submit Payment Proof
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
