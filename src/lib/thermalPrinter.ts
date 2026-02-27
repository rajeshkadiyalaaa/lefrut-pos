// Thermal Printer Utilities for 58mm/80mm receipts
// Optimized for thermal receipt printers

interface ThermalReceiptData {
  billNo: string;
  date: string;
  customerName?: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

// A5 layout generator for printing on A5 paper
const generateA5Receipt = (data: ThermalReceiptData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${data.billNo}</title>
  <style>
    @page { size: A5 portrait; margin: 10mm; }
    html, body { height: auto; }
    body {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #111;
    }
    .header { text-align: center; margin-bottom: 8px; }
    .title { font-weight: 700; font-size: 18px; }
    .meta { font-size: 12px; color: #333; }
    .line { border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 6px; border-bottom: 1px solid #ddd; text-align: left; }
    th { background: #f7f7f7; }
    .right { text-align: right; }
    .totals { margin-top: 8px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand { font-weight: 700; }
    .footer { text-align: center; font-size: 11px; margin-top: 12px; color: #555; }
    .no-print { display: none; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">🍊 LE FRUT 🍊</div>
    <div>Fresh Fruits & Juices</div>
    <div class="meta">7 Plot no :9, 52 1/2, Rd Number 2, Veterinary Colony, Vijayawada</div>
    <div class="meta">Ph: 97037 89888</div>
  </div>
  <div class="line"></div>
  <div class="meta">Bill: ${data.billNo} &nbsp; | &nbsp; ${data.date}</div>
  ${data.customerName ? `<div class="meta">Customer: ${data.customerName}</div>` : ''}
  <div class="line"></div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="right">Qty</th>
        <th class="right">Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td class="right">${item.qty}</td>
          <td class="right">₹${item.price.toFixed(2)}</td>
          <td class="right">₹${item.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>₹${data.subtotal.toFixed(2)}</span></div>
    ${data.discount > 0 ? `<div class="row"><span>Discount</span><span>-₹${data.discount.toFixed(2)}</span></div>` : ''}
    <div class="row grand"><span>TOTAL</span><span>₹${data.total.toFixed(2)}</span></div>
    <div class="row"><span>Payment</span><span>${data.paymentMethod}</span></div>
  </div>
  <div class="line"></div>
  <div class="footer">
    Thank you! Visit Again 🍊<br/>
    GST No: 27XXXXX1234X1ZX<br/>
    ${new Date().toLocaleString()}
  </div>
</body>
</html>
  `.trim();
};

// A5 layout for packing slip
const generateA5PackingSlip = (data: Omit<ThermalReceiptData, 'paymentMethod'>): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Packing Slip - ${data.billNo}</title>
  <style>
    @page { size: A5 portrait; margin: 10mm; }
    html, body { height: auto; }
    body {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #111;
    }
    .header { text-align: center; margin-bottom: 8px; }
    .title { font-weight: 700; font-size: 18px; }
    .meta { font-size: 12px; color: #333; }
    .line { border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 6px; border-bottom: 1px solid #ddd; text-align: left; }
    th { background: #f7f7f7; }
    .right { text-align: right; }
    .footer { text-align: center; font-size: 11px; margin-top: 12px; color: #555; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">📦 PACKING SLIP 📦</div>
    <div>LE FRUT</div>
    <div class="meta">7 Plot no :9, 52 1/2, Rd Number 2, Veterinary Colony, Vijayawada</div>
    <div class="meta">Ph: 97037 89888</div>
  </div>
  <div class="line"></div>
  <div class="meta">Order: ${data.billNo} &nbsp; | &nbsp; ${data.date}</div>
  ${data.customerName ? `<div class="meta">Customer: ${data.customerName}</div>` : ''}
  <div class="line"></div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="right">Qty</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td class="right">${item.qty}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="line"></div>
  <div class="meta">Total Items: ${data.items.reduce((sum, i) => sum + i.qty, 0)}</div>
  <div class="footer">Please check items carefully before confirming sale<br/>${new Date().toLocaleString()}</div>
</body>
</html>
  `.trim();
};
export const generateThermalReceipt = (data: ThermalReceiptData): string => {
  // Character width tuned for 58mm. On 80mm, content will be centered with wider margins.
  const width = 32;
  
  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };

  
  const line = () => '-'.repeat(width);
  
  const formatRow = (left: string, right: string) => {
    const spacesNeeded = width - left.length - right.length;
    return left + ' '.repeat(Math.max(1, spacesNeeded)) + right;
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${data.billNo}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    html, body { height: auto; }
    body {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
      font-family: 'Courier New', 'Lucida Console', monospace;
      font-size: 11px;
      line-height: 1.4;
      margin: 0 auto;
      padding: 2mm;
      background: white;
      width: auto; /* auto width with constraints for 57–80mm */
      max-width: 80mm;
      min-width: 57mm;
    }
    .no-print { display: none; }
    
    .receipt {
      white-space: pre;
    }
    
    .center {
      text-align: center;
    }
    
    .bold {
      font-weight: bold;
    }
    
    .large {
      font-size: 14px;
      font-weight: bold;
    }
    
    .line {
      border-top: 1px dashed #000;
      margin: 2px 0;
    }
    
    .no-print {
      text-align: center;
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <div class="receipt">
${center('🍊 LE FRUT 🍊')}
${center('Fresh Fruits & Juices')}
${center('7 Plot no :9, 52 1/2, Rd Number 2,')}
${center('Veterinary Colony, Vijayawada')}
${center('Ph: 97037 89888')}

${line()}
Bill: ${data.billNo.padEnd(15)}${data.date}
${data.customerName ? `Customer: ${data.customerName}\n` : ''}${line()}
Item          Qty  Price  Total
${line()}
${data.items.map(item => {
  const nameLine = item.name.substring(0, 14).padEnd(14);
  const qtyStr = item.qty.toString().padStart(3);
  const priceStr = item.price.toFixed(2).padStart(6);
  const totalStr = item.total.toFixed(2).padStart(7);
  return `${nameLine}${qtyStr}${priceStr}${totalStr}`;
}).join('\n')}
${line()}
${formatRow('Subtotal:', '₹' + data.subtotal.toFixed(2))}
${data.discount > 0 ? formatRow('Discount:', '-₹' + data.discount.toFixed(2)) + '\n' : ''}${formatRow('TOTAL:', '₹' + data.total.toFixed(2))}
${formatRow('Payment:', data.paymentMethod)}
${line()}
${center('Thank you! Visit Again 🍊')}
${center('GST No: 27XXXXX1234X1ZX')}
${center(new Date().toLocaleString())}
  </div>
  
  <div class="no-print">
    <button onclick="window.print()">🖨️ Print Receipt</button>
    <button onclick="window.close()" style="background: #6c757d; margin-left: 10px;">✖ Close</button>
  </div>
  
  <!-- Removed auto-print on load to prevent double print. Printing is handled by caller. -->
</body>
</html>
  `.trim();
};

export const generatePackingSlip = (data: Omit<ThermalReceiptData, 'paymentMethod'>): string => {
  const width = 32;
  
  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };
  
  const line = () => '-'.repeat(width);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Packing Slip - ${data.billNo}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    html, body { height: auto; }
    body {
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
      font-family: 'Courier New', 'Lucida Console', monospace;
      font-size: 11px;
      line-height: 1.4;
      margin: 0 auto;
      padding: 2mm;
      background: white;
      width: auto;
      max-width: 80mm;
      min-width: 57mm;
    }
    .no-print { display: none; }
    
    .receipt {
      white-space: pre;
    }
    
    .no-print {
      text-align: center;
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    
    button {
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:hover {
      background: #218838;
    }
  </style>
</head>
<body>
  <div class="receipt">
${center('📦 PACKING SLIP 📦')}
${center('LE FRUT')}
${center('7 Plot no :9, 52 1/2, Rd Number 2,')}
${center('Veterinary Colony, Vijayawada')}
${center('Ph: 97037 89888')}

${line()}
Order: ${data.billNo}
${data.customerName ? `Customer: ${data.customerName}\n` : ''}Date: ${data.date}
${line()}
Item                      Qty
${line()}
${data.items.map(item => {
  const name = item.name.substring(0, 24).padEnd(24);
  const qty = item.qty.toString().padStart(4);
  return `${name}${qty}`;
}).join('\n')}
${line()}
Total Items: ${data.items.reduce((sum, item) => sum + item.qty, 0)}
${line()}
${center('Please check items carefully')}
${center('before confirming sale')}
  </div>
  
  <div class="no-print">
    <button onclick="window.print()">🖨️ Print Packing Slip</button>
    <button onclick="window.close()" style="background: #6c757d; margin-left: 10px;">✖ Close</button>
  </div>
  
  <!-- Removed auto-print on load to prevent double print. Printing is handled by caller. -->
</body>
</html>
  `.trim();
};

export const printThermalReceipt = (data: ThermalReceiptData) => {
  // Read A5 preference from host window localStorage
  let useA5 = false;
  try {
    useA5 = window.localStorage.getItem('print_a5') === 'true';
  } catch {
    // no-op: localStorage may be unavailable in some environments
  }
  const html = useA5 ? generateA5Receipt(data) : generateThermalReceipt(data);
  
  // Check if running in Electron
  const isElectron = !!(window as any).api?.print;
  
  if (isElectron) {
    // In Electron: Use window.open() which is now allowed
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          setTimeout(() => {
            // Focus the print window to ensure it prints correctly
            printWindow.focus();
            printWindow.print();
            // Close after printing (give more time for dialog)
            setTimeout(() => {
              try {
                printWindow.close();
              } catch (e) {
                // Window may already be closed
              }
            }, 1000);
          }, 500);
        };
      }
    } catch (err) {
      console.error('Electron print failed:', err);
      // Fallback to iframe method
      printViaIframe(html);
    }
  } else {
    // In browser: Use iframe method
    printViaIframe(html);
  }
};

// Helper function for iframe printing
function printViaIframe(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    
    // Auto print and remove iframe
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          // Iframe already removed
        }
      }, 100);
    }, 250);
  }
}

export const printPackingSlip = (data: Omit<ThermalReceiptData, 'paymentMethod'>) => {
  // Respect A5 toggle in localStorage
  let useA5 = false;
  try {
    useA5 = window.localStorage.getItem('print_a5') === 'true';
  } catch {
    // no-op: localStorage may be unavailable in some environments
  }
  const html = useA5 ? generateA5PackingSlip(data) : generatePackingSlip(data);
  
  // Check if running in Electron
  const isElectron = !!(window as any).api?.print;
  
  if (isElectron) {
    // In Electron: Use window.open() which is now allowed
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          setTimeout(() => {
            // Focus the print window to ensure it prints correctly
            printWindow.focus();
            printWindow.print();
            // Close after printing (give more time for dialog)
            setTimeout(() => {
              try {
                printWindow.close();
              } catch (e) {
                // Window may already be closed
              }
            }, 1000);
          }, 500);
        };
      }
    } catch (err) {
      console.error('Electron packing slip print failed:', err);
      // Fallback to iframe method
      printViaIframe(html);
    }
  } else {
    // In browser: Use iframe method
    printViaIframe(html);
  }
};

