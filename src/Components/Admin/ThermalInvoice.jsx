import React, { useEffect, useRef } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

function ThermalInvoice() {
  const location = useLocation();
  const { item } = location?.state;

  console.log(item, "item for print details.......");
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const hasPrinted = useRef(false);

  // Calculate subtotal safely
  const calculateSubtotal = (order) => {
    if (!order) return 0;

    // If order has subTotal property, use it
    if (order.subTotal) return Number(order.subTotal);

    // Otherwise calculate from allProduct
    if (order.allProduct && Array.isArray(order.allProduct)) {
      return order.allProduct.reduce((sum, product) => {
        return sum + (Number(product?.totalPrice) || 0);
      }, 0);
    }

    // Fallback to allTotal
    return Number(order.allTotal) || 0;
  };

  const subtotal = calculateSubtotal(item);

  // Function to print directly to thermal printer
  const printReceipt = () => {
    const originalContents = document.body.innerHTML;
    const printContents = receiptRef.current.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;

    // Navigate back after printing
    // if (item.orderdelivarytype == "corporate") {
    window.location.assign("/corporate-booking-list");
    // } else {
    // window.location.assign("/apartment-booking-list");
    // }

    // navigate(-1)
  };

  const calculateOrderSummary = (order) => {
    console.log(order, "order......................");
    if (!order) {
      return {
        subtotal: 0,
        tax: 0,
        deliveryCharge: 0,
        cutlery: 0,
        preorderDiscount: 0,
        walletDiscount: 0,
        couponDiscount: 0,
        totalDiscounts: 0,
        amountBeforeDiscounts: 0,
        finalAmount: 0,
      };
    }

    // ✅ Calculate subtotal from allProduct array instead of relying on allTotal field
    const subtotal =
      order?.allProduct?.reduce((sum, item) => {
        return sum + (parseFloat(item?.totalPrice) || 0);
      }, 0) ||
      parseFloat(order?.allTotal) ||
      0;

    const tax = parseFloat(order?.tax) || 0;
    const deliveryCharge = parseFloat(order?.deliveryCharge) || 0;
    const cutlery = parseFloat(order?.Cutlery) || 0;
    const preorderDiscount = parseFloat(order?.preorderDiscount) || 0;
    const walletDiscount = parseFloat(order?.discountWallet) || 0;
    const couponDiscount = parseFloat(order?.coupon) || 0;

    const totalDiscounts = preorderDiscount + walletDiscount + couponDiscount;

    // ✅ amountBeforeDiscounts = subtotal + discounts (i.e. what it was before discounts applied)
    const amountBeforeDiscounts = subtotal;

    // ✅ finalAmount = subtotal (discounts already deducted in subtotal)

    var finalAmount = 0;
    if (deliveryCharge > 0) {
      finalAmount = 0;
    } else {
      finalAmount = subtotal - totalDiscounts;
    }

    return {
      subtotal,
      tax,
      deliveryCharge,
      cutlery,
      preorderDiscount,
      walletDiscount,
      couponDiscount,
      totalDiscounts,
      amountBeforeDiscounts,
      finalAmount,
    };
  };

  useEffect(() => {
    if (hasPrinted.current) return; // Prevent multiple print attempts

    if (document.readyState === "complete") {
      const timer = setTimeout(() => {
        printReceipt();
        hasPrinted.current = true;
      }, 500);

      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        const timer = setTimeout(() => {
          printReceipt();
          hasPrinted.current = true;
        }, 500);

        window.removeEventListener("load", handleLoad);
      };

      window.addEventListener("load", handleLoad);

      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          alignItems: "center",
        }}
      >
        <MdArrowBackIosNew
          onClick={() => navigate(-1)}
          style={{ color: "black", fontSize: "26px", cursor: "pointer" }}
        />
        <button
          style={{
            cursor: "pointer",
            backgroundColor: "#d81d4a",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: "4px",
            fontWeight: "600",
            fontSize: "14px",
            transition: "background-color 0.2s",
          }}
          onClick={printReceipt}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#b5173e")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#d81d4a")}
        >
          PRINT RECEIPT
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <div
          id="thermal-receipt"
          ref={receiptRef}
          style={{
            width: "80mm",
            backgroundColor: "white",
            padding: "8mm",
            fontFamily: "'Courier New', monospace",
            fontSize: "12px",
            lineHeight: "1.4",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "4px",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "4px",
                fontFamily: "'Imperial Script', cursive",
                letterSpacing: "1px",
              }}
            >
              DailyDish
            </div>
            <div style={{ fontSize: "11px" }}>Bangalore, Karnataka</div>
            <div style={{ fontSize: "11px" }}>GSTIN: 29AAMCC3615N1Z6</div>
            <div
              style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}
            ></div>
          </div>

          {/* Order Info */}
          <div style={{ marginBottom: "10px" }}>
            <table style={{ width: "100%", fontSize: "11px" }}>
              <tbody>
                {item?.addressType === "School" && (
                  <>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Student Details :</td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "2px 0",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        {item?.studentClass}, {item?.studentSection}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Student Name:</td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "2px 0",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        {item?.studentName}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td style={{ padding: "2px 0" }}>Order #:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.orderid || "-"}
                  </td>
                </tr>
                {/* <tr>
                  <td style={{ padding: "2px 0" }}>Type:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>{item?.orderdelivarytype || "-"}</td>
                </tr> */}
                <tr>
                  <td style={{ padding: "2px 0" }}>Booking Date:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.createdAt
                      ? `${moment(item.createdAt).format("DD-MM-YYYY")}`
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Booking Slot:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.slot ? item?.slot : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Delivery Date:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.updatedAt
                      ? moment(item.updatedAt).format("DD-MM-YYYY hh:mm A")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Customer:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.username || "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Phone No:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.Mobilenumber}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Customer Type:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.customerType || "Normal"}
                  </td>
                </tr>

                {item?.riderId ? (
                  <tr>
                    <td style={{ padding: "2px 0" }}>Rider:</td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      {item?.riderId?.name}
                    </td>
                  </tr>
                ) : (
                  ""
                )}
                <tr>
                  <td
                    colSpan={2}
                    style={{ textAlign: "right", padding: "2px 0" }}
                  >
                    {item?.delivarylocation ? `${item.delivarylocation}` : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}
            ></div>
          </div>

          {/* Items Table */}
          <div>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr
                  style={{
                    fontWeight: "bold",
                    borderBottom: "1px dashed #000",
                  }}
                >
                  <td
                    style={{
                      width: "40%",
                      textAlign: "left",
                      padding: "4px 2px",
                      border: "0.5px solid #555",
                    }}
                  >
                    Item
                  </td>
                  <td
                    style={{
                      width: "15%",
                      textAlign: "center",
                      padding: "4px 2px",
                      border: "0.5px solid #555",
                    }}
                  >
                    Qty
                  </td>
                  <td
                    style={{
                      width: "25%",
                      textAlign: "right",
                      padding: "4px 2px",
                      border: "0.5px solid #555",
                    }}
                  >
                    Price
                  </td>
                  <td
                    style={{
                      width: "20%",
                      textAlign: "right",
                      padding: "4px 2px",
                      border: "0.5px solid #555",
                    }}
                  >
                    Amount
                  </td>
                </tr>
              </thead>
              <tbody>
                {item?.allProduct?.map((items, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        textAlign: "left",
                        padding: "4px 2px",
                        wordBreak: "break-word",
                        border: "0.5px solid #555",
                      }}
                    >
                      {items?.foodItemId?.foodname || "-"}{" "}
                      <span className="fw-bolder">
                        {" "}
                        {items?.foodItemId?.foodcategory})
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "4px 2px",
                        border: "0.5px solid #555",
                      }}
                    >
                      {items?.quantity || 0}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "4px 2px",
                        border: "0.5px solid #555",
                      }}
                    >
                      ₹{" "}
                      {items?.totalPrice
                        ? Number(items.totalPrice / items?.quantity).toFixed(2)
                        : "0.00"}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "4px 2px",
                        border: "0.5px solid #555",
                      }}
                    >
                      ₹{" "}
                      {items?.totalPrice
                        ? Number(items.totalPrice).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}
            ></div>
          </div>

          {/* Totals */}
          <div>
            <table style={{ width: "100%", fontSize: "11px" }}>
              <tbody>
                {/* 1. Item Total (Before Tax) */}

                <tr>
                  <td style={{ textAlign: "left", padding: "2px 0" }}>
                    Item Total (Excl. Tax):
                  </td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    ₹{subtotal.toFixed(2)}
                  </td>
                </tr>

                  {/* Delivery */}
                <tr>
                  <td style={{ textAlign: "left", padding: "2px 0" }}>
                    Delivery:
                  </td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.deliveryCharge <= 0
                      ? "Free"
                      : `₹ ${Number(item.deliveryCharge).toFixed(2)}`}
                  </td>
                </tr>

                {/* 2. Tax Amount */}
                <tr>
                  <td style={{ textAlign: "left", padding: "2px 0" }}>
                    Tax ({item?.taxPercentage || 5}%):
                  </td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    ₹ {item?.tax ? Number(item.tax).toFixed(2) : "0.00"}
                  </td>
                </tr>

                {/* 3. Subtotal (Inclusive - Optional, or just keep as total order value) */}
                {/* If you want to show the inclusive subtotal sum explicitly before delivery/discounts: */}

              

                <tr>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "2px 0",
                      borderTop: "1px dotted #ccc",
                    }}
                  >
                    Order Value (Inc. Tax):
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "2px 0",
                      borderTop: "1px dotted #ccc",
                      fontWeight: "bold",
                    }}
                  >
                    ₹
                    {(
                      subtotal +
                      (item?.tax || 0) +
                      (item?.deliveryCharge || 0)
                    ).toFixed(2)}
                  </td>
                </tr>

                {/* Cutlery */}
                {item?.Cutlery > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>
                      Cutlery:
                    </td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      ₹ {Number(item.Cutlery).toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Discounts */}
                {item?.coupon > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>
                      Discount:
                    </td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      -₹ {Number(item.coupon).toFixed(2)}
                    </td>
                  </tr>
                )}
                {item?.preorderDiscount > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>
                      Preorder Discount:
                    </td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      -₹ {Number(item.preorderDiscount).toFixed(2)}
                    </td>
                  </tr>
                )}
                {item?.discountWallet > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>
                      Wallet Used:
                    </td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      -₹ {Number(item.discountWallet).toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* <tr>
                      <td
                        style={{
                          textAlign: "left",
                          padding: "2px 0",
                          borderTop: "1px dotted #ccc",
                        }}
                      >
                        Total:
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "2px 0",
                          borderTop: "1px dotted #ccc",
                        }}
                      >
                        ₹{((subtotal || 0) + (item?.tax || 0) + (item?.deliveryCharge || 0) - (item.preorderDiscount || 0)).toFixed(2)}
                      </td>
                    </tr> */}

                {/* Final Total */}
                <tr
                  style={{ borderTop: "1px dashed #000", fontWeight: "bold" }}
                >
                  <td style={{ textAlign: "left", padding: "6px 0 2px" }}>
                    TOTAL PAID:
                  </td>
                  <td style={{ textAlign: "right", padding: "6px 0 2px" }}>
                    ₹{" "}
                    {item?.allTotal ? Number(item.allTotal).toFixed(2) : "0.00"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{ marginTop: "15px", textAlign: "center", fontSize: "10px" }}
          >
            <div>Invoice #: {item?.orderid || "-"}</div>
            <div style={{ marginTop: "6px", fontWeight: "600" }}>
              Thank you for your order!
            </div>
            <div>Visit us again soon</div>
            <div
              style={{
                borderTop: "1px dashed #000",
                marginTop: "10px",
                paddingTop: "10px",
              }}
            >
              {moment().format("DD-MM-YYYY hh:mm A")}
            </div>
          </div>
        </div>
      </div>

      {/* Add print-specific styles */}
      <style type="text/css" media="print">
        {`
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
          }
          
          #thermal-receipt {
            width: 100%;
            box-shadow: none;
            padding: 8mm;
            font-size: 12px;
            line-height: 1.4;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }

          .items-table th, .items-table td {
            padding: 4px 2px;
            border: 0.5px solid #555;
          }

          .items-table th {
            font-weight: bold;
            border-bottom: 1px dashed #000;
          }
        `}
      </style>
    </>
  );
}

export default ThermalInvoice;
