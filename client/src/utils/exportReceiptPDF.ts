import jsPDF from 'jspdf';

export type ReceiptType = 'request-summary' | 'acknowledgement-receipt';

export interface ReceiptPDFOptions {
  type: ReceiptType;
  data: any; // Transaction/summary data
  branch: string;
}

export function exportReceiptPDF({ type, data, branch }: ReceiptPDFOptions) {
  // Fixed receipt width (80mm ~ 226px)
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] });

  // Defensive mapping/defaults
  const transaction_id = data.transaction_id || '';
  const cust_name = data.cust_name || '';
  const cust_id = data.cust_id || '';
  const cust_address = data.cust_address || '';
  const date = data.date ? formatDate(data.date) : formatDate(new Date());
  const date_in = data.date_in ? formatDate(data.date_in) : '';
  const date_out = data.date_out ? formatDate(data.date_out) : '-';
  const received_by = data.received_by || '';
  const payment_mode = data.payment_mode || '';
  const discountAmount = typeof data.discountAmount === 'number' ? data.discountAmount : 0;
  const totalAmount = typeof data.total_amount === 'number' ? data.total_amount : 0;
  const payment = typeof data.payment === 'number' ? data.payment : 0; //
  const amountPaid = typeof data.amount_paid === 'number' ? data.amount_paid : 0;
  const change = typeof data.change === 'number' ? data.change : 0;
  const balance = totalAmount - amountPaid;
  const shoes = Array.isArray(data.shoes) ? data.shoes : [];

  // Helper for date formatting
  function formatDate(d: string | Date) {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  }

  let y = 10;
  // --- Logo ---
  // Convert your PNG to base64 and paste below
  const logoBase64 = "data:image/p";

  try {
    doc.addImage(logoBase64, 'PNG', 25, y, 30, 18); // Centered, width 30mm
    y += 20;
  } catch (e) {
    y += 5;
  }

  // --- Branch Name ---
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text(branch, 40, y, { align: 'center' });
  y += 10;

  // --- Title & Transaction ID ---
  doc.setFontSize(11);
  doc.text('ACKNOWLEDGEMENT RECEIPT', 40, y, { align: 'center' });
  y += 5;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`${transaction_id}`, 40, y, { align: 'center' });
  y += 5;
  doc.text(`Date: ${date}`, 10, y,);
  y += 7;

  // --- Customer Info ---
  doc.setFontSize(10);
  doc.text(`Customer Name: ${cust_name}`, 10, y);
  y += 5;
  doc.text(`Customer ID: ${cust_id}`, 10, y);
  y += 5;
  doc.text(`Date Dropped off: ${date_in}`, 10, y,);
  y += 5;
  doc.text(`Address: ${cust_address}`, 10, y);
  y += 5;
  doc.text(`Date Pick-up: ${date_out}`, 10, y,);
  y += 7;

  // --- Shoes/services ---
  shoes.forEach((shoe: any) => {
    const model = shoe.model || '';
    doc.setFont(undefined, 'bold');
    doc.text(`${model}`, 10, y);
    doc.setFont(undefined, 'normal');
    y += 5;
    // Services
    (Array.isArray(shoe.services) ? shoe.services : []).forEach((srv: any) => {
      const service_name = srv.service_name || srv.name || '';
      const quantity = typeof srv.quantity === 'number' ? srv.quantity : 1;
      const price = typeof srv.service_base_price === 'number' ? srv.service_base_price : (typeof srv.price === 'number' ? srv.price : 0);
      let qtyText = quantity > 1 ? ` x${quantity}` : '';
      doc.text(`${service_name}${qtyText}`, 12, y);
      doc.text(`${(price * quantity).toFixed(2)}`, 70, y, { align: 'right' });
      y += 4;
    });
    // Additionals
    (Array.isArray(shoe.additionals) ? shoe.additionals : []).forEach((add: any) => {
      const add_name = add.service_name || add.name || '';
      const quantity = typeof add.quantity === 'number' ? add.quantity : 1;
      const price = typeof add.service_base_price === 'number' ? add.service_base_price : (typeof add.price === 'number' ? add.price : 0);
      let qtyText = quantity > 1 ? ` x${quantity}` : '';
      doc.text(`${add_name}${qtyText}`, 12, y);
      doc.text(`${(price * quantity).toFixed(2)}`, 70, y, { align: 'right' });
      y += 4;
    });
    // Rush
    if (shoe.rush) {
      const rushFee = typeof shoe.rushFee === 'number' ? shoe.rushFee : 0;
      doc.text(`Rush Service`, 12, y);
      doc.text(`${rushFee.toFixed(2)}`, 70, y, { align: 'right' });
      y += 4;
    }
    // Subtotal
    const subtotal = typeof shoe.subtotal === 'number' ? shoe.subtotal : 0;
    doc.text(`Subtotal:`, 12, y);
    doc.text(`${subtotal.toFixed(2)}`, 70, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    y += 6;
  });

  // --- Discount, totals, payment ---
  if (discountAmount > 0) {
    doc.text(`Discount:`, 10, y);
    doc.text(`${discountAmount.toFixed(2)}`, 70, y, { align: 'right' });
    y += 5;
  }
  doc.text(`Total Bill:`, 10, y);
  doc.text(`${totalAmount.toFixed(2)}`, 70, y, { align: 'right' });
  y += 5;
  doc.text(`Amount Paid:`, 10, y);
  doc.text(`${amountPaid.toFixed(2)}`, 70, y, { align: 'right' });
  y += 5;
  doc.text(`${payment_mode}:`, 10, y);
  doc.text(`${payment.toFixed(2)}`, 70, y, { align: 'right' });
  y += 5;
  doc.text(`Change:`, 10, y);
  doc.text(`${change.toFixed(2)}`, 70, y, { align: 'right' });
  y += 5;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Balance:`, 10, y);
  doc.text(`${balance.toFixed(2)}`, 70, y, { align: 'right' });
  y += 7;

  // --- Received by ---
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Cashier: ${received_by}`, 10, y);
  y += 7;

  // --- Save/download ---
  doc.save('acknowledgement-receipt.pdf');
}
