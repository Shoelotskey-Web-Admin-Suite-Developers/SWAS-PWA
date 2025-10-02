import jsPDF from 'jspdf';

export type ReceiptType = 'request-summary' | 'acknowledgement-receipt';

export interface ReceiptPDFOptions {
  type: ReceiptType;
  data: any; // Transaction/summary data
  branch: string;
}

export async function exportReceiptPDF({ type: _type, data, branch }: ReceiptPDFOptions) {
  // Defensive mapping/defaults (moved up so measurement pass can read them)
  const transaction_id = data.transaction_id || '';
  const cust_name = data.cust_name || '';
  const cust_id = data.cust_id || '';
  const cust_address = data.cust_address || '';
  const date = data.date ? formatDate(data.date) : formatDate(new Date());
  const date_in = data.date_in ? formatDate(data.date_in) : '';
  const date_out = data.date_out ? formatDate(data.date_out) : '-';
  const received_by = data.received_by || '';
  const discountAmount = typeof data.discountAmount === 'number' ? data.discountAmount : 0;
  const totalAmount = typeof data.total_amount === 'number' ? data.total_amount : 0;
  const amountPaid = typeof data.amount_paid === 'number' ? data.amount_paid : 0;
  // Support updatedBalance passed directly or inside uiSummary (payment flow)
  const updatedBalanceFromData = typeof data.updatedBalance === 'number' ? data.updatedBalance :
    (data && data.uiSummary && typeof data.uiSummary.updatedBalance === 'number' ? data.uiSummary.updatedBalance : null);
  // storage fee may be passed at top-level or inside uiSummary
  let storageFeeFromData = typeof data.storageFee === 'number' ? data.storageFee :
    (data && data.uiSummary && typeof data.uiSummary.storageFee === 'number' ? data.uiSummary.storageFee : null);
  // Base balance (previous balance) = total - amountPaid. We then add any remaining storage fee
  // so that the printed balance always reflects (prev balance + remaining storage).
  let balance = (totalAmount - amountPaid);
  let storageComponent = 0;
  if (typeof storageFeeFromData === 'number' && storageFeeFromData > 0) {
    storageComponent = storageFeeFromData;
    balance += storageComponent;
  }

  // If the computed balance is negative (overpayment), move the overpaid amount to storage fee
  // and set the printed balance to 0 so receipts don't show negative balances.
  if (typeof balance === 'number' && balance < 0) {
    // Do not modify storage fee coming from the DB/uiSummary here. Just set printed balance to 0
    // so receipts don't show negative balances. The caller should pass the computed storage fee
    // (unmodified by any previous overflow adjustments) in data.storageFee or data.uiSummary.storageFee.
    balance = 0;
  }
  const shoes = Array.isArray(data.shoes) ? data.shoes : [];
  // acknowledgementText removed: not used anymore

  // Helper for date formatting
  function formatDate(d: string | Date) {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  }

  // Helper for currency formatting
  function formatCurrency(n: number) {
    // Use an ASCII-safe prefix to avoid font glyph fallbacks for the peso sign.
    // Use toLocaleString to properly insert thousand separators and fixed decimals.
    const formatted = Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // Return just the formatted number (no currency prefix). The caller will add 'PHP ' only where desired.
    return formatted;
  }

  // We'll compute the required height dynamically. Start with a measurement pass
  // that simulates the y position changes, then create the jsPDF with the computed height.
  const pageWidth = 80; // mm

  function measureHeightOnce(): number {
    let yMeasure = 10;
    // logo
    // assume logo height used earlier: 20 when added, otherwise 5
    yMeasure += 20; // keep room for logo by default
    yMeasure += 10; // branch spacing
    yMeasure += 5; // title
    yMeasure += 5; // transaction id
    yMeasure += 7; // date
    yMeasure += 5 * 4; // customer info (id, name, address, date in)
    yMeasure += 7; // spacing after customer
    yMeasure += 25; // spacing after cashier

    // shoes
    Array.isArray(shoes) && shoes.forEach((shoe: any) => {
      yMeasure += 5; // model line
      // services
      (Array.isArray(shoe.services) ? shoe.services : []).forEach(() => {
        yMeasure += 4;
      });
      // additionals
      (Array.isArray(shoe.additionals) ? shoe.additionals : []).forEach(() => {
        yMeasure += 4;
      });
      // rush
      if (shoe.rush) yMeasure += 4;
      // subtotal + est + spacing
      yMeasure += 6; // subtotal
      if (shoe.estimated_completion) yMeasure += 5;
      yMeasure += 6; // extra spacing
    });

    // discount/totals/payment/change/balance/received_by
    if (discountAmount > 0) yMeasure += 5;
    yMeasure += 5 * 5; // totals, paid, payment mode, change, balance
    // reserve space for payments list (each payment ~5mm)
    if (Array.isArray(data.payments) && data.payments.length > 0) {
      yMeasure += data.payments.length * 5;
    }
    // reserve space for storage fee line if present and greater than zero
    const _storageFee = ((typeof data.storageFee === 'number' && data.storageFee > 0) || (data && data.uiSummary && typeof data.uiSummary.storageFee === 'number' && data.uiSummary.storageFee > 0));
    if (_storageFee) yMeasure += 6;
    yMeasure += 7; // received by + spacing
    // reserve space for uiSummary (if present)
    if (data && data.uiSummary) {
      // each uiSummary field will be one line (approx 5mm)
      const uiFields = Object.keys(data.uiSummary || {}).length || 0
      yMeasure += uiFields * 5
      yMeasure += 6 // spacing after ui summary
    }
    return Math.ceil(yMeasure + 10); // a bit of bottom padding
  }

  const requiredHeight = Math.max(200, measureHeightOnce());
  const doc = new jsPDF({ unit: 'mm', format: [pageWidth, requiredHeight] });

  

  let y = 10;

  // Note: avoid loading extra fonts here; we will use built-in Helvetica for numbers to prevent glyph fallbacks.
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
  // If the caller provided a latest payment id, show it under the title
  try {
    if (data && data.latest_payment_id) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(data.latest_payment_id, 40, y, { align: 'center' });
      y += 5;
    }
  } catch (e) {}
  doc.text(`Date: ${date}`, 10, y,);
  y += 7;

  // --- Customer Info ---
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Customer ID: ${cust_id}`, 10, y);
  y += 5;
  doc.text(`Customer Name: ${cust_name}`, 10, y);
  y += 5;
  doc.text(`Address: ${cust_address}`, 10, y);
  y += 9;
  doc.text(`Date Dropped off: ${date_in}`, 10, y,);
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
      // Ensure numeric text uses a built-in font and ASCII currency formatting to avoid glyph issues.
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(price * quantity), 70, y, { align: 'right' });
      y += 4;
    });
    // Additionals
    (Array.isArray(shoe.additionals) ? shoe.additionals : []).forEach((add: any) => {
      const add_name = add.service_name || add.name || '';
      const quantity = typeof add.quantity === 'number' ? add.quantity : 1;
      const price = typeof add.service_base_price === 'number' ? add.service_base_price : (typeof add.price === 'number' ? add.price : 0);
      let qtyText = quantity > 1 ? ` x${quantity}` : '';
      doc.text(`${add_name}${qtyText}`, 12, y);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(price * quantity), 70, y, { align: 'right' });
      y += 4;
    });
    // Rush
    if (shoe.rush) {
      const rushFee = typeof shoe.rushFee === 'number' ? shoe.rushFee : 0;
      doc.text(`Rush Service`, 12, y);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(rushFee), 70, y, { align: 'right' });
      y += 4;
    }
    // compute subtotal from services + additionals + rushFee (if subtotal not provided)
    const computedServices = (Array.isArray(shoe.services) ? shoe.services : []).reduce((sum: number, sv: any) => {
      const price = typeof sv.service_base_price === 'number' ? sv.service_base_price : 0;
      const qty = typeof sv.quantity === 'number' ? sv.quantity : 1;
      return sum + price * qty;
    }, 0);
    const computedAdditionals = (Array.isArray(shoe.additionals) ? shoe.additionals : []).reduce((sum: number, ad: any) => {
      const price = typeof ad.service_base_price === 'number' ? ad.service_base_price : 0;
      const qty = typeof ad.quantity === 'number' ? ad.quantity : 1;
      return sum + price * qty;
    }, 0);
    const rushFee = shoe.rush ? (typeof shoe.rushFee === 'number' ? shoe.rushFee : 0) : 0;
    const computedSubtotal = computedServices + computedAdditionals + rushFee;
    const subtotalToShow = typeof shoe.subtotal === 'number' && shoe.subtotal > 0 ? shoe.subtotal : computedSubtotal;

    // subtotal
    doc.setFontSize(10);
    doc.text('Subtotal', 10, y);
  // Use built-in font before printing the subtotal to avoid missing-glyph fallbacks and spacing issues.
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(subtotalToShow || 0), 70, y, { align: 'right' });
    y += 4;

    // estimated completion (if present) - format as MM/DD/YYYY
    if (shoe.estimated_completion) {
      const d = new Date(shoe.estimated_completion);
      const est = isNaN(d.getTime()) ? String(shoe.estimated_completion) : `${String(d.getMonth() + 1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
      doc.setFontSize(7);
      doc.text(`Est: ${est}`, 10, y);
      doc.setFontSize(10);
      y += 5;
    }
    y += 6;
  });

  // --- Discount, totals, payment ---
  if (discountAmount > 0) {
    doc.setFont(undefined, 'bold');
    doc.text(`Discount:`, 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(discountAmount), 70, y, { align: 'right' });
    y += 5;
  }

  
  // separator line above totals
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(8, y + 2, 72, y + 2);
  y += 6;
  // If prevBalance is provided, show the augmented breakdown:
  // Total Bill, Previous Balance, Amount Paid (dueNow), Cash (customerPaid), Change, New Balance
  // Fallback to original layout
    doc.setFont(undefined, 'bold');
    doc.text(`Total Bill:`, 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(totalAmount), 70, y, { align: 'right' });
    y += 5;
    // If payments were passed as objects, list them similar to shoes (id and amount)
    // Render all payments except the last one here. The last payment will be shown after the storage fee
    // so it appears immediately after the "Add: Storage Fee" line as requested.
    let lastPayment: any = null;
    try {
      if (Array.isArray(data.payments) && data.payments.length > 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const payments = data.payments.slice();
        if (payments.length > 1) {
          lastPayment = payments.pop();
        } else {
          // only one payment – treat it as the lastPayment to be shown later
          lastPayment = payments.pop();
        }

        // Render the remaining payments (if any)
        for (const pay of payments) {
          const pid = pay && (pay.payment_id || pay.paymentId || pay._id || '');
          const pamt = Number(pay && ((pay.payment_amount ?? pay.paymentAmount ?? pay.amount) || 0));
          doc.text('Less: ' + String(pid) + '', 10, y);
          doc.setFont(undefined, 'normal');
          doc.text(formatCurrency(pamt), 70, y, { align: 'right' });
          y += 5;
        }
      }
    } catch (e) {
      // ignore rendering issues
    }
    try {
      if (typeof storageFeeFromData === 'number' && storageFeeFromData > 0) {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Add: Storage Fee`, 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(formatCurrency(storageFeeFromData), 70, y, { align: 'right' });
        y += 6;
      }
    } catch (e) {}

    // Now render the last payment (if present) immediately after the storage fee as requested.
    try {
      if (lastPayment) {
        const pid = lastPayment && (lastPayment.payment_id || lastPayment.paymentId || lastPayment._id || '');
        const pamt = Number(lastPayment && ((lastPayment.payment_amount ?? lastPayment.paymentAmount ?? lastPayment.amount) || 0));
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text('Less: ' + String(pid) + '', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(formatCurrency(pamt), 70, y, { align: 'right' });
        y += 5;
      }
    } catch (e) {
      // ignore rendering issues
    }
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Balance:`, 10, y);
    doc.setFont('helvetica', 'normal');
  // Always prefer an explicit updated balance (which should already include storage)
  // Fallback to locally computed (prev balance + storage fee)
  const balanceToDisplay = (typeof updatedBalanceFromData === 'number') ? updatedBalanceFromData : balance;
    doc.text('PHP ' + formatCurrency(balanceToDisplay), 70, y, { align: 'right' });
      y += 14;
    doc.setFontSize(10);
    doc.text(`${received_by}`, 45, y, { align: 'center' });
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(19, y + 2, 72, y + 2);
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`Cashier/Authorized Signature`, 70, y, { align: 'right' });
    y += 20;

  // acknowledgement text intentionally omitted from printed receipt

  

  // Note: uiSummary rendering removed. Selected uiSummary fields (storage fee, cashier, updated status)
  // are displayed inline above so the printed receipt matches the UI without a duplicated summary block.

  // --- Save/download ---
  // Build a safe filename: {transaction_id}_{latest_payment_id}.pdf or {transaction_id}_{YYYYMMDD}.pdf
  const safeTxn = String(transaction_id || 'receipt').replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-]/g, '');
  
  let filename;
  if (data && data.latest_payment_id) {
    const safePaymentId = String(data.latest_payment_id).replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-]/g, '');
    filename = `${safeTxn}_${safePaymentId}.pdf`;
  } else {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateForFile = `${yyyy}${mm}${dd}`;
    filename = `${safeTxn}_${dateForFile}.pdf`;
  }
  doc.save(filename);
}
