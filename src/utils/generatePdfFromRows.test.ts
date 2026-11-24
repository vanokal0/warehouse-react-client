import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePdfFromOrders, generatePdfFromBookings } from "./generatePdfFromRows";
import { makeBooking, makeOrder, makeProduct } from "../test/fixtures";

const doc = vi.hoisted(() => ({
  addPage: vi.fn(),
  text: vi.fn(),
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  save: vi.fn(),
  splitTextToSize: vi.fn((line: string) => [line]),
}));

vi.mock("jspdf", () => ({
  default: vi.fn(function () {
    return doc;
  }),
}));

const textCalls = () => doc.text.mock.calls.map((c) => c[0]);

beforeEach(() => {
  vi.clearAllMocks();
  doc.splitTextToSize.mockImplementation((line: string) => [line]);
});

describe("generatePdfFromOrders", () => {
  it("renders order details and saves with default title", () => {
    generatePdfFromOrders([makeOrder()]);
    const texts = textCalls();
    expect(texts).toEqual(
      expect.arrayContaining([
        "Order ORD-1",
        "Order Date:",
        "2025-01-15",
        "Supplier Inc",
        "100 USD",
        "Card",
        "2025-01-20",
        "2025-01-25",
        "New",
        "Products:",
        "None",
      ])
    );
    expect(doc.addPage).not.toHaveBeenCalled();
    expect(doc.save).toHaveBeenCalledWith("Orders.pdf");
  });

  it("adds a page per additional order and uses custom title", () => {
    generatePdfFromOrders([makeOrder(), makeOrder({ number: "ORD-2" }), makeOrder()], "Report");
    expect(doc.addPage).toHaveBeenCalledTimes(2);
    expect(doc.save).toHaveBeenCalledWith("Report.pdf");
  });

  it("lists products, wrapping long lines and falling back for unnamed ones", () => {
    doc.splitTextToSize.mockImplementation((line: string) => [line, "wrapped"]);
    const order = makeOrder({
      products: [
        { orderNumber: "ORD-1", concreteProduct: makeProduct(), quantity: 3 },
        {
          orderNumber: "ORD-1",
          concreteProduct: undefined as never,
          quantity: 1,
        },
      ],
    });
    generatePdfFromOrders([order]);
    expect(doc.splitTextToSize).toHaveBeenCalledWith("- Cola 0.5L – 3", 160);
    expect(doc.splitTextToSize).toHaveBeenCalledWith("- Unnamed product – 1", 160);
    expect(textCalls()).not.toContain("None");

    const productYs = doc.text.mock.calls
      .filter((c) => Array.isArray(c[0]))
      .map((c) => c[2] as number);
    expect(productYs[1] - productYs[0]).toBe(14);
  });

  it("prints '-' for missing values and dates", () => {
    const order = makeOrder({
      supplier: undefined as never,
      estimatedArrivalDate: "",
      products: undefined as never,
    });
    generatePdfFromOrders([order]);
    const calls = doc.text.mock.calls;
    const valueAfter = (label: string) =>
      calls[calls.findIndex((c) => c[0] === label) + 1][0];
    expect(valueAfter("Supplier:")).toBe("-");
    expect(valueAfter("Arrival Date:")).toBe("-");
    expect(textCalls()).toContain("None");
  });
});

describe("generatePdfFromBookings", () => {
  it("renders booking details with formatted date-times", () => {
    generatePdfFromBookings([makeBooking()]);
    expect(textCalls()).toEqual(
      expect.arrayContaining([
        "Lot Bookings LB1",
        "L1",
        "Supplier Inc",
        "2025-01-10 08:00",
        "2025-01-20 09:15",
        "2025-01-20 11:45",
      ])
    );
    expect(doc.save).toHaveBeenCalledWith("lot_bookings.pdf");
  });

  it("places three bookings per page", () => {
    const bookings = Array.from({ length: 7 }, (_, i) => makeBooking({ number: `LB${i}` }));
    generatePdfFromBookings(bookings);
    expect(doc.addPage).toHaveBeenCalledTimes(2);

    const headerYs = doc.text.mock.calls
      .filter((c) => String(c[0]).startsWith("Lot Bookings LB"))
      .map((c) => c[2]);
    expect(headerYs).toEqual([20, 100, 180, 20, 100, 180, 20]);
  });

  it("normalizes custom title into file name and handles missing dates", () => {
    generatePdfFromBookings([makeBooking({ endDateTime: "" })], "  My  Custom Title ");
    const calls = doc.text.mock.calls;
    const endIdx = calls.findIndex((c) => c[0] === "End Time:");
    expect(calls[endIdx + 1][0]).toBe("-");
    expect(doc.save).toHaveBeenCalledWith("my_custom_title.pdf");
  });

  it("saves an empty document when there are no bookings", () => {
    generatePdfFromBookings([]);
    expect(doc.text).not.toHaveBeenCalled();
    expect(doc.save).toHaveBeenCalledWith("lot_bookings.pdf");
  });
});
