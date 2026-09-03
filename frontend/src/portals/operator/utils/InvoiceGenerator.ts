import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QueueItem } from '../types';

export const generateInvoicePDF = (item: QueueItem) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(46, 125, 50); // Primary green
  doc.text('GOVERNMENT OF ANDHRA PRADESH', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('Procurement Centre Official Invoice', 105, 28, { align: 'center' });

  // Divider
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);

  // Invoice Details
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  doc.text(`Token Number: ${item.token}`, 20, 45);
  doc.text(`Date: ${date}`, 150, 45);
  
  doc.text(`Farmer Name: ${item.farmerName}`, 20, 55);
  doc.text(`Mobile: ${item.farmerPhone || 'N/A'}`, 150, 55);

  // Table Data
  const tableData = [
    ['Crop / Commodity', item.crop],
    ['Booked Quantity (Quintals)', `${item.bookedQuantity} Qtl`],
    ['Actual Procured Quantity', `${item.actualQuantity || item.bookedQuantity} Qtl`],
    ['MSP Rate per Quintal', `Rs. ${((item.totalAmount || 0) / (item.actualQuantity || item.bookedQuantity)).toFixed(2)}`],
    ['Quality Grade', item.qualityGrade || 'Grade-A'],
    ['Moisture Content', `${item.moistureContent || 12}%`],
    ['Payment Status', item.paymentStatus || 'COMPLETED']
  ];

  (doc as any).autoTable({
    startY: 70,
    head: [['Description', 'Details']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 70, right: 20, bottom: 20, left: 20 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Total Amount
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Amount Payable:', 120, finalY);
  
  doc.setFontSize(16);
  doc.setTextColor(46, 125, 50);
  doc.text(`Rs. ${item.totalAmount?.toLocaleString() || 0}`, 165, finalY);

  // Footer & Signatures
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  
  doc.line(20, finalY + 30, 80, finalY + 30);
  doc.text('Farmer Signature', 35, finalY + 35);
  
  doc.line(130, finalY + 30, 190, finalY + 30);
  doc.text('Operator / Authorized Signatory', 135, finalY + 35);

  doc.text('This is a computer generated document and does not require a physical signature.', 105, 280, { align: 'center' });

  // Save PDF
  doc.save(`Invoice_${item.token}.pdf`);
};
