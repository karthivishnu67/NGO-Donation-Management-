import { jsPDF } from 'jspdf';

/**
 * Generates and downloads an official Section 80G Tax Exemption Certificate as a PDF.
 * This runs completely client-side and works safely inside iframes, desktop, and mobile browsers.
 */
export const generateReceiptPdf = (receipt) => {
  if (!receipt) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Outer decorative certificate border
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pageWidth - 20, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pageWidth - 24, 273);

  // Top Section: Title & NGO Accreditation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text('SECTION 80G TAX EXEMPTION CERTIFICATE', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('HOPEBRIDGE CHARITABLE FOUNDATION', pageWidth / 2, 31, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Registered Under Section 12A & 80G of Income Tax Act, 1961 · NGO PAN: AABTH8821K',
    pageWidth / 2,
    37,
    { align: 'center' }
  );
  doc.text(
    'Approval No: CIT(E)/CHN/80G/2020-21 · 42 Anna Salai, Guindy, Chennai, Tamil Nadu 600032',
    pageWidth / 2,
    42,
    { align: 'center' }
  );

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(16, 47, pageWidth - 16, 47);

  // Metadata Box (Receipt Number, Issue Date, Donor Name, PAN)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(16, 52, pageWidth - 32, 42, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(16, 52, pageWidth - 32, 42, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT NUMBER:', 22, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(receipt.receiptNumber || 'RCP-80G-2026-000'), 22, 66);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUE DATE:', pageWidth - 70, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(receipt.issueDate || '2026-11-05'), pageWidth - 70, 66);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DONOR FULL NAME:', 22, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(receipt.donorName || 'Valued Donor'), 22, 83);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DONOR PAN (80G DEDUCTION):', pageWidth - 70, 77);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(receipt.donorPan || 'NOT PROVIDED'), pageWidth - 70, 83);

  // Acknowledgement Statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  const formattedAmount = 'INR ₹' + Number(receipt.amount || 0).toLocaleString('en-IN') + '/-';
  const ackText = `Received with deep gratitude from ${receipt.donorName} (${receipt.donorEmail || 'Registered Donor'}) the sum of ${formattedAmount} via ${receipt.paymentMode || 'Online'} towards the noble charitable initiative:`;

  const splitAck = doc.splitTextToSize(ackText, pageWidth - 36);
  doc.text(splitAck, 18, 106);

  // Designated Campaign / Cause Box
  doc.setFillColor(241, 245, 249);
  doc.rect(18, 118, pageWidth - 36, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(4, 120, 87);
  doc.text(`"${receipt.campaignTitle || 'General NGO Cause'}"`, pageWidth / 2, 128, { align: 'center' });

  // Receipt Specification Table
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const startY = 146;
  const rowHeight = 9.5;
  const tableData = [
    ['Donation Reference Code:', String(receipt.donationCode || 'DON-REF-2026')],
    ['Payment Method:', String(receipt.paymentMode || 'Online Transfer')],
    ['Tax Deduction Eligibility:', String(receipt.taxExemptionSection || '50% Tax Exemption Under Section 80G')],
    ['Certificate Validity:', String(receipt.status || 'Valid')],
    ['Remarks / Dedication:', String(receipt.remarks || 'Thank you for your generous contribution towards social upliftment.')]
  ];

  tableData.forEach(([label, value], idx) => {
    const y = startY + idx * rowHeight;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, 78, y);
  });

  // Statutory Tax Exemption Declaration Box
  doc.setDrawColor(226, 232, 240);
  doc.line(16, 202, pageWidth - 16, 202);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY INCOME TAX ACT DECLARATION', 18, 210);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const declarationText =
    'Donations made to HopeBridge Charitable Foundation qualify for 50% deduction in taxable income under Section 80G of the Indian Income Tax Act, 1961. This digitally generated receipt serves as authentic proof for individual and corporate ITR filing.';
  doc.text(doc.splitTextToSize(declarationText, pageWidth - 36), 18, 216);

  // Signatures & Official NGO Stamp Area
  const sigY = 246;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORIZED SIGNATORY', 25, sigY);
  doc.text('OFFICIAL NGO SEAL / DESK', pageWidth - 75, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(String(receipt.issuedBy || 'HopeBridge NGO Finance Desk'), 25, sigY + 5);
  doc.text('Digitally Verified & Encrypted', pageWidth - 75, sigY + 5);

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(25, sigY - 2, 72, sigY - 2);
  doc.line(pageWidth - 75, sigY - 2, pageWidth - 25, sigY - 2);

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN')} · HopeBridge NGO Donation Management System (Project #23)`,
    pageWidth / 2,
    272,
    { align: 'center' }
  );

  // Trigger Save / Download
  const filename = `HopeBridge_80G_Receipt_${String(receipt.receiptNumber || 'Receipt').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
};
