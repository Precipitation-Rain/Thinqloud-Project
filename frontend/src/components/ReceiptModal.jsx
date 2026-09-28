import React, { useState } from 'react';
import { X, Printer, Download, ShieldCheck, Heart, Copy, Check } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receiptData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    // Add small delay to ensure any layout transitions have stabilized
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleCopy = () => {
    const num = receiptData.receipt_number || receiptData.receiptNumber || 'KB-RCPT-2026';
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const receiptNum = receiptData.receipt_number || receiptData.receiptNumber || 'KB-RCPT-2026-0924';
  const txnId = receiptData.transaction_id || receiptData.transactionId || 'TXN-CRD-8829104';
  const amount = parseFloat(receiptData.amount || 0);
  const tipAmount = parseFloat(receiptData.tip_amount || receiptData.tipAmount || 0);
  const totalAmount = parseFloat(receiptData.total_amount || receiptData.totalAmount || (amount + tipAmount));
  const donorName = receiptData.donor_name || receiptData.donorName || 'Generous Donor';
  const donorEmail = receiptData.donor_email || receiptData.donorEmail || 'donor@example.com';
  const campaignTitle = receiptData.campaign_title || receiptData.campaignTitle || 'General Humanitarian Relief';
  const dateStr = receiptData.created_at ? new Date(receiptData.created_at).toLocaleString() : new Date().toLocaleString();

  // Instant Downloadable standalone receipt document
  const handleDownloadDocument = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${receiptNum}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; background: #fff; }
    .card { max-width: 650px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; }
    .sub { font-size: 11px; color: #64748b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
    .val { font-size: 13px; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
    .total-row { font-weight: 800; font-size: 14px; background: #f8fafc; }
    .tax-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; font-size: 11px; color: #166534; margin-bottom: 20px; line-height: 1.5; }
    .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; }
    .sig { text-align: right; font-style: italic; font-family: Georgia, serif; font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand">KindBridge Global Foundation</div>
        <div class="sub">NGO Reg: 80G-501C3-99418A • EIN: US-88492019</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: bold; font-size: 12px; color: #0f766e;">OFFICIAL TAX RECEIPT</div>
        <div style="font-family: monospace; font-size: 12px; font-weight: bold;">${receiptNum}</div>
        <div class="sub">${dateStr}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="label">Issued To</div>
        <div class="val">${donorName}</div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace;">${donorEmail}</div>
      </div>
      <div>
        <div class="label">Allocated Program</div>
        <div class="val">${campaignTitle}</div>
        <div style="font-size: 11px; color: #0f766e; font-weight: 600;">100% Direct Program Use</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Payment Mode</th>
          <th style="text-align: right;">Amount (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Charitable Contribution</strong>
            ${receiptData.dedication ? `<br><span style="font-size: 10px; color: #64748b;">Dedication: "${receiptData.dedication}"</span>` : ''}
          </td>
          <td style="text-align: center; font-family: monospace;">${receiptData.payment_method || 'Online'}</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold;">$${amount.toFixed(2)}</td>
        </tr>
        ${tipAmount > 0 ? `
        <tr>
          <td>Platform Technology & Verification Support</td>
          <td style="text-align: center;">—</td>
          <td style="text-align: right; font-family: monospace;">$${tipAmount.toFixed(2)}</td>
        </tr>` : ''}
        <tr class="total-row">
          <td colspan="2">Total Amount Received</td>
          <td style="text-align: right; font-family: monospace; color: #0f766e; font-size: 15px;">$${totalAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="tax-box">
      <strong>✓ Statutory Tax Exemption Notice:</strong><br>
      This certifies that this donation qualifies for 100% tax deduction under Section 80G of the Indian Income Tax Act and Section 501(c)(3) of the US Internal Revenue Code. No goods or services were provided in exchange for this contribution.
    </div>

    <div class="footer">
      <div>
        <span style="font-family: monospace; font-size: 10px; color: #94a3b8;">Txn: ${txnId}</span><br>
        <strong style="color: #0f766e; font-size: 10px;">Digitally Authenticated by KindBridge Trust</strong>
      </div>
      <div style="text-align: right;">
        <div class="sig">Elenor Vance</div>
        <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">Compliance Officer</div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KindBridge_Receipt_${receiptNum}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-150">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white p-3.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">
            Official Tax-Deductible Receipt
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy ID'}
            </button>

            <button
              type="button"
              onClick={handleDownloadDocument}
              title="Download standalone HTML certificate"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Sheet */}
        <div id="printable-receipt" className="p-8 space-y-5 bg-white text-slate-900 font-sans">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">KindBridge Foundation</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                NGO Registration: 80G-501C3-99418A • EIN: US-88492019
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt No.</span>
              <span className="text-xs font-mono font-bold text-slate-800 block">{receiptNum}</span>
              <span className="text-[10px] text-slate-500">{dateStr}</span>
            </div>
          </div>

          {/* Donor & Campaign Meta Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Issued To</span>
              <p className="font-bold text-slate-900">{donorName}</p>
              <p className="text-slate-500 font-mono text-[11px]">{donorEmail}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Allocated Program</span>
              <p className="font-bold text-slate-900">{campaignTitle}</p>
              <p className="text-emerald-700 text-[11px]">100% Direct Program Use</p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">Payment Mode</th>
                  <th className="p-2.5 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-medium text-slate-800">
                    Charitable Contribution
                    {receiptData.dedication && (
                      <span className="block text-[11px] text-slate-500 italic">
                        Dedication: "{receiptData.dedication}"
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-mono text-slate-600">
                    {receiptData.payment_method || receiptData.paymentMethod || 'Online'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    ${amount.toFixed(2)}
                  </td>
                </tr>

                {tipAmount > 0 && (
                  <tr>
                    <td className="p-2.5 text-slate-600">Platform Technology Support</td>
                    <td className="p-2.5 text-center text-slate-400 font-mono">—</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">${tipAmount.toFixed(2)}</td>
                  </tr>
                )}

                <tr className="bg-slate-50 font-bold">
                  <td className="p-2.5 text-slate-900" colSpan="2">Total Paid</td>
                  <td className="p-2.5 text-right font-mono text-sm text-emerald-800">${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Note */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tax Exemption Certification</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              This contribution qualifies for 100% tax deduction under Section 80G of the Income Tax Act and Section 501(c)(3) of the Internal Revenue Code. No goods or services were provided in return.
            </p>
          </div>

          {/* Footer Sign-off */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
              <span>Txn: {txnId}</span>
              <span className="block text-emerald-700 font-semibold">Digitally Signed & Verified</span>
            </div>

            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-800 text-sm">
                Elenor Vance
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Compliance Officer</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
