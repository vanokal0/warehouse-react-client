import jsPDF from "jspdf";
import { LotBookingData, OrderData, OrderProductDTO } from "../typing";

export function generatePdfFromOrders(orders: OrderData[], title = "Orders") {
  const doc = new jsPDF();

  const productLineHeight = 7;
  const maxLineWidth = 180;

  orders.forEach((order, index) => {
    if (index !== 0) doc.addPage();

    const labelX = 15;
    const valueX = 60;
    let y = 30;

    const addLine = (label: string, value: string | number | undefined) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, labelX, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value ?? "-"), valueX, y);
      y += 8;
    };

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Order ${order.number}`, labelX, y);
    y += 5;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    y += 10;

    addLine("Order Date", formatDate(order.orderDateTime));
    addLine("Supplier", order.supplier);
    addLine("Order Cost", `${order.cost} USD`);
    addLine("Payment Type", order.paymentType);
    addLine("Arrival Date", formatDate(order.estimatedArrivalDate));
    addLine("Shipment Date", formatDate(order.estimatedShipmentDate));
    addLine("Status", order.orderStatus);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Products:", labelX, y);
    y += 8;

    const products: OrderProductDTO[] = order.products || [];
    doc.setFont("helvetica", "normal");

    if (products.length === 0) {
      doc.text("None", labelX + 5, y);
      y += productLineHeight;
    } else {
      products.forEach((p) => {
        const name =
          p.concreteProduct?.concreteProductName ?? "Unnamed product";
        const quantity = p.quantity;
        const line = `- ${name} – ${quantity}`;
        const wrapped = doc.splitTextToSize(line, maxLineWidth - labelX - 5);
        doc.text(wrapped, labelX + 5, y);
        y += wrapped.length * productLineHeight;
      });
    }
  });

  doc.save(`${title}.pdf`);
}

function formatDate(date: string | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export function generatePdfFromBookings(
  bookings: LotBookingData[],
  title = "Lot Bookings"
) {
  const doc = new jsPDF();
  const labelX = 15;
  const valueX = 60;
  const blockHeight = 80;
  const startY = 20;

  bookings.forEach((booking, index) => {
    const blockIndex = index % 3;
    const yStart = startY + blockIndex * blockHeight;

    if (blockIndex === 0 && index !== 0) {
      doc.addPage();
    }

    let y = yStart;

    const addLine = (label: string, value: string | number | undefined) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, labelX, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value ?? "-"), valueX, y);
      y += 8;
    };

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${title} ${booking.number}`, labelX, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    addLine("Lot Number", booking.lotNumber);
    addLine("Supplier", booking.supplierName);
    addLine("Booking Time", formatDateTime(booking.bookingDateTime));
    addLine("Start Time", formatDateTime(booking.startDateTime));
    addLine("End Time", formatDateTime(booking.endDateTime));
  });

  doc.save(`${title.trim().replace(/\s+/g, "_").toLowerCase()}.pdf`);
}

function formatDateTime(date: string | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toISOString().replace("T", " ").slice(0, 16); // YYYY-MM-DD HH:mm
}
