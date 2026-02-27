import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { printPackingSlip } from '../lib/thermalPrinter';

interface SlipItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface PackingSlipData {
  billNo: string;
  date: string;
  customerName?: string;
  items: SlipItem[];
  subtotal: number;
  discount: number;
  total: number;
}

interface PackingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  slip: PackingSlipData;
}

const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ isOpen, onClose, slip }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    printPackingSlip(slip);
  };

  const handleDownload = () => {
    const text = `
═══════════════════════════════
          📦 PACKING SLIP 📦
           LE FRUT
   7 Plot no :9, 52 1/2, Rd Number 2,
   Veterinary Colony, Vijayawada
   Ph: 97037 89888
═══════════════════════════════

Order No: ${slip.billNo}
Date: ${slip.date}
${slip.customerName ? `Customer: ${slip.customerName}\n` : ''}
───────────────────────────────
ITEMS
───────────────────────────────

${slip.items.map(i => `${i.name} x${i.qty}\n  ₹${i.price.toFixed(2)} each = ₹${i.total.toFixed(2)}`).join('\n\n')}

───────────────────────────────
Subtotal:           ₹${slip.subtotal.toFixed(2)}
${slip.discount > 0 ? `Discount:          -₹${slip.discount.toFixed(2)}\n` : ''}───────────────────────────────
TOTAL:              ₹${slip.total.toFixed(2)}
───────────────────────────────

Please verify items before dispatch.
${new Date().toLocaleString()}
═══════════════════════════════
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PackingSlip-${slip.billNo}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 space-y-4 font-mono text-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
              <h3 className="text-xl font-bold mb-2">📦 PACKING SLIP 📦</h3>
              <p className="text-xs text-gray-600">LE FRUT</p>
              <p className="text-xs text-gray-600">7 Plot no :9, 52 1/2, Rd Number 2,</p>
              <p className="text-xs text-gray-600">Veterinary Colony, Vijayawada</p>
              <p className="text-xs text-gray-600">Ph: 97037 89888</p>
            </div>

            {/* Info */}
            <div className="space-y-1 border-b-2 border-dashed border-gray-300 pb-4">
              <div className="flex justify-between"><span className="text-gray-600">Order No:</span><span className="font-semibold">{slip.billNo}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date:</span><span>{slip.date}</span></div>
              {slip.customerName && (
                <div className="flex justify-between"><span className="text-gray-600">Customer:</span><span>{slip.customerName}</span></div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3 border-b-2 border-dashed border-gray-300 pb-4">
              <p className="font-semibold text-gray-700">ITEMS</p>
              {slip.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name} <span className="text-gray-500">x{item.qty}</span></span>
                    <span className="font-semibold">₹{item.total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-2">₹{item.price.toFixed(2)} each</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span>₹{slip.subtotal.toFixed(2)}</span></div>
              {slip.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount:</span><span>-₹{slip.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2"><span>TOTAL:</span><span>₹{slip.total.toFixed(2)}</span></div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button onClick={handlePrint} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button onClick={handleDownload} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            <button onClick={onClose} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PackingSlipModal;
