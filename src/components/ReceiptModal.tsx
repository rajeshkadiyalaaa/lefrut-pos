// Receipt Modal Component - Professional popup receipt display
// Based on recepitui.md design specifications

import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { printThermalReceipt } from '../lib/thermalPrinter';

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface ReceiptData {
  billNo: string;
  date: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashier?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    // Use the thermal printer for physical printing
    printThermalReceipt(receipt);
  };

  const handleDownload = () => {
    // Generate text receipt for download
    const receiptText = `
═══════════════════════════════
      🍊 LE FRUT 🍊
   Fresh Fruits & Juices
   7 Plot no :9, 52 1/2, Rd Number 2,
   Veterinary Colony, Vijayawada
   Ph: 97037 89888
═══════════════════════════════

Bill No: ${receipt.billNo}
Date: ${receipt.date}
${receipt.customerName ? `Customer: ${receipt.customerName}\n` : ''}${receipt.cashier ? `Cashier: ${receipt.cashier}\n` : ''}
───────────────────────────────
ITEMS
───────────────────────────────

${receipt.items.map(item => 
  `${item.name} x${item.qty}\n  ₹${item.price.toFixed(2)} each = ₹${item.total.toFixed(2)}`
).join('\n\n')}

───────────────────────────────
Subtotal:           ₹${receipt.subtotal.toFixed(2)}
${receipt.discount > 0 ? `Discount:          -₹${receipt.discount.toFixed(2)}\n` : ''}───────────────────────────────
TOTAL:              ₹${receipt.total.toFixed(2)}
Payment: ${receipt.paymentMethod}
───────────────────────────────

Thank you! Visit Again 🍊
GST No: 27XXXXX1234X1ZX

${new Date().toLocaleString()}
═══════════════════════════════
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${receipt.billNo}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Receipt Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Content */}
          <div className="p-6 space-y-4 font-mono text-sm">
            
            {/* Business Header */}
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
              <h3 className="text-xl font-bold mb-2">🍊 LE FRUT 🍊</h3>
              <p className="text-xs text-gray-600">Fresh Fruits & Juices</p>
              <p className="text-xs text-gray-600">7 Plot no :9, 52 1/2, Rd Number 2,</p>
              <p className="text-xs text-gray-600">Veterinary Colony, Vijayawada</p>
              <p className="text-xs text-gray-600">Ph: 97037 89888</p>
            </div>

            {/* Transaction Information */}
            <div className="space-y-1 border-b-2 border-dashed border-gray-300 pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill No:</span>
                <span className="font-semibold">{receipt.billNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{receipt.date}</span>
              </div>
              {receipt.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span>{receipt.customerName}</span>
                </div>
              )}
              {receipt.cashier && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cashier:</span>
                  <span>{receipt.cashier}</span>
                </div>
              )}
            </div>

            {/* Itemized List */}
            <div className="space-y-3 border-b-2 border-dashed border-gray-300 pb-4">
              <p className="font-semibold text-gray-700">ITEMS</p>
              {receipt.items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.name} <span className="text-gray-500">x{item.qty}</span>
                    </span>
                    <span className="font-semibold">₹{item.total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-2">
                    ₹{item.price.toFixed(2)} each
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{receipt.subtotal.toFixed(2)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{receipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
                <span>TOTAL:</span>
                <span>₹{receipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium">{receipt.paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t-2 border-dashed border-gray-300 pt-4">
              <p className="mb-1">Thank you! Visit Again 🍊</p>
              <p>GST No: 27XXXXX1234X1ZX</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptModal;

