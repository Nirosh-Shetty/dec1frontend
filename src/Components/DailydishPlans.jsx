import { MapPin, Target, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DailyDishPlans() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div style={styles.safeArea} className="plans-safe-area">
      <main style={styles.scrollView}>
        <header style={styles.stickyWrap}>
          <div style={styles.headerRow}>
            <button
              onClick={handleBack}
              style={styles.backBtn}
              className="plans-back-btn"
            >
              <img
                src="/Assets/checkoutback.svg"
                alt="Back"
                style={styles.backIcon}
              />
            </button>
            <div style={styles.centerWrap} className="plans-center-wrap">
              <h1 style={styles.mainTitle} className="plans-main-title">
                How DailyDish Plans Work
              </h1>
              <p style={styles.subtitle} className="plans-subtitle">
                Pick your meals ahead. Confirm before we cook. Eat on time.
              </p>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {/* The Three Steps Section */}
          <section style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>The Three Steps</h2>

            <div style={styles.tableContainer} className="plans-table">
              <div style={styles.tableHeader} className="plans-table-header">
                <div style={{ ...styles.tableCol, ...styles.stepCol }}>
                  Step
                </div>
                <div style={{ ...styles.tableCol, ...styles.whatCol }}>
                  What You Do
                </div>
                <div style={{ ...styles.tableCol, ...styles.whatCol }}>
                  Lunch
                </div>
                <div style={{ ...styles.tableCol, ...styles.whatCol }}>
                  Dinner
                </div>
              </div>

              <div style={styles.tableRow} className="plans-table-row">
                <div
                  style={{ ...styles.tableCol, ...styles.stepColContent }}
                  data-label="Step"
                >
                  <span style={styles.stepNumber}>1</span>
                  <span style={styles.stepText}>Plan</span>
                </div>
                <div style={styles.tableCol} data-label="What You Do">
                  Choose date + session + meal from menu
                </div>
                <div style={styles.tableCol} data-label="Lunch">
                  Pick lunch for any day
                </div>
                <div style={styles.tableCol} data-label="Dinner">
                  Pick dinner for any day
                </div>
              </div>

              <div style={styles.tableRow} className="plans-table-row">
                <div
                  style={{ ...styles.tableCol, ...styles.stepColContent }}
                  data-label="Step"
                >
                  <span style={styles.stepNumber}>2</span>
                  <span style={styles.stepText}>Confirm</span>
                </div>
                <div style={styles.tableCol} data-label="What You Do">
                  Lock in your order before cutoff
                </div>
                <div style={styles.tableCol} data-label="Lunch">
                  By <span className="fw-bold">10:00 AM</span> on delivery day
                </div>
                <div style={styles.tableCol} data-label="Dinner">
                  By <span className="fw-bold">5:00 PM</span> on delivery day
                </div>
              </div>

              <div style={styles.tableRow} className="plans-table-row">
                <div
                  style={{ ...styles.tableCol, ...styles.stepColContent }}
                  data-label="Step"
                >
                  <span style={styles.stepNumber}>3</span>
                  <span style={styles.stepText}>Receive</span>
                </div>
                <div style={styles.tableCol} data-label="What You Do">
                  Food arrives at your chosen address
                </div>
                <div style={styles.tableCol} data-label="Lunch">
                  12:00 – 1:30 PM
                </div>
                <div style={styles.tableCol} data-label="Dinner">
                  7:30 – 8:30 PM
                </div>
              </div>
            </div>

            <div style={styles.noteBox}>
              <p style={styles.noteText}>
                Pick as many days ahead as you want. No lock-in.
              </p>
            </div>
          </section>

          {/* Where You Get It Section */}
          <section style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Where You Get It</h2>
            <div
              style={styles.instructionRow}
              className="plans-instruction-row"
            >
              <div style={styles.iconWrapper}>
                <MapPin size={22} color="#2c2c2c" strokeWidth={2.5} />
              </div>
              <div style={styles.instructionBlock}>
                <p style={styles.instructionTitle}>
                  Open the map on the website
                </p>
                <p style={styles.instructionBody}>
                  Pin your delivery location (Home, PG/Apartment, School,
                  Work—anywhere). We'll deliver to that address during the time
                  window above.
                </p>
              </div>
            </div>

            <div
              style={styles.instructionRow}
              className="plans-instruction-row"
            >
              <div style={styles.iconWrapper}>
                <Target size={22} color="#2c2c2c" strokeWidth={2.5} />
              </div>
              <div style={styles.instructionBlock}>
                <p style={styles.instructionTitle}>
                  Flexible Delivery Addresses
                </p>
                <p style={styles.instructionBody}>
                  Different meals can go to different addresses. Choose when you
                  confirm.
                </p>
              </div>
            </div>
          </section>

          {/* Cancel Anytime Section */}
          <section style={{ ...styles.sectionCard, ...styles.cancelSection }}>
            <h2 style={styles.sectionTitle}>Cancel Anytime</h2>
            <div style={styles.cancelContent} className="plans-cancel-content">
              <div style={styles.cancelIcon}>
                <HelpCircle size={32} color="#2c2c2c" strokeWidth={2.5} />
              </div>
              <div style={styles.cancelText}>
                <p style={styles.cancelQuestion}>
                  Before the cutoff time? Changed your mind?
                </p>
                <div style={styles.cancelAction}>
                  <span style={styles.cancelActionText}>Cancel.</span>
                  <span style={styles.cancelActionHighlight}>
                    {" "}
                    Money goes to your wallet to use later.
                  </span>
                </div>
                <p style={styles.cancelFinal}>That's it.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .plans-table {
            grid-template-columns: 1fr !important;
            border: none !important;
            background-color: transparent !important;
          }
          
          .plans-table-header {
            display: none !important;
          }
          
          .plans-table-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 4px;
            margin-bottom: 20px;
            padding: 16px;
            border: 1px solid #e8e8e8 !important;
            border-radius: 12px;
            background-color: #ffffff !important;
          }
          
          .plans-table-row > div {
            padding: 8px 0 !important;
            border-right: none !important;
            border-bottom: 1px solid #e8e8e8 !important;
            background-color: transparent !important;
          }
          
          .plans-table-row > div:last-child {
            border-bottom: none !important;
          }
          
          .plans-table-row > div::before {
            content: attr(data-label);
            font-weight: 700;
            font-size: 12px;
            color: #6b6b6b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            display: block;
          }
          
          .plans-instruction-row {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 12px !important;
          }
          
          .plans-cancel-content {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
          }
        }
        
        @media (max-width: 576px) {
          .plans-instruction-row > div:first-child {
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
          }
        }
        
        @media (min-width: 800px) {
          .plans-safe-area-wrapper {
            width: 30%;
            margin: 0 auto;
          }
        }

        @media screen and (max-width: 799px) {
          .plans-safe-area {
            width: 100% !important;
          }
        }

        @media screen and (max-width: 480px) {
          .plans-main-title {
            font-size: 21px !important;
            line-height: 24px !important;
            margin-bottom: 6px !important;
          }
          
          .plans-subtitle {
            font-size: 13px !important;
            line-height: 16px !important;
          }
          
          .plans-center-wrap {
            padding-left: 50px !important;
            padding-right: 15px !important;
          }
          
          .plans-back-btn {
            padding: 6px !important;
          }
        }

        @media screen and (max-width: 360px) {
          .plans-main-title {
            font-size: 18px !important;
            line-height: 22px !important;
          }
          
          .plans-subtitle {
            font-size: 12px !important;
            line-height: 15px !important;
          }
          
          .plans-center-wrap {
            padding-left: 45px !important;
            padding-right: 10px !important;
          }
        }

        /* Tablet styles for 820x1120 resolution */
        @media screen and (min-width: 800px) and (max-width: 900px) {
          .plans-safe-area {
            width: 100% !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f8f6f0;
            color: #2c2c2c;
            min-height: 100vh;
            margin: 0 auto;
          }

          .plans-main-title {
            font-size: 32px !important;
            line-height: 38px !important;
            margin-bottom: 10px !important;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: white;
            text-align: center;
          }

          .plans-subtitle {
            font-size: 18px !important;
            line-height: 24px !important;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.95);
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
          }

          .plans-center-wrap {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 10px !important;
            padding-left: 70px !important;
            padding-right: 24px !important;
          }

          .plans-back-btn {
            background: none;
            border: none;
            padding: 10px !important;
            cursor: pointer;
            z-index: 2;
            flex-shrink: 0;
          }

          .plans-back-btn img {
            width: 32px !important;
            height: 32px !important;
            filter: brightness(0) invert(1);
            -webkit-transform: scaleX(-1);
            transform: scaleX(-1);
          }

          .plans-table {
            display: grid !important;
            grid-template-columns: 0.9fr 1.3fr 1fr 1fr !important;
            border: 1px solid #e8e8e8 !important;
            border-radius: 18px !important;
            overflow: hidden;
            margin-bottom: 24px;
            background-color: #ffffff !important;
          }

          .plans-table-header {
            display: contents !important;
          }

          .plans-table-row {
            display: contents !important;
          }

          .plans-table-row > div {
            padding: 18px 14px !important;
            font-size: 16px !important;
            line-height: 22px !important;
            border-right: 1px solid #e8e8e8 !important;
            background-color: #ffffff !important;
            border-bottom: none !important;
          }

          .plans-table-row > div::before {
            display: none !important;
          }

          .plans-table-row > div:first-child {
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
            font-weight: 600;
            color: #6b8e23;
            background-color: rgba(107, 142, 35, 0.05) !important;
          }

          .plans-table-row > div:first-child span:first-child {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 38px !important;
            height: 38px !important;
            background: linear-gradient(135deg, #e6b800 0%, #d4a700 100%);
            color: #2c2c2c;
            border-radius: 50%;
            font-size: 18px !important;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(230, 184, 0, 0.3);
          }

          .plans-table-row > div:first-child span:last-child {
            font-size: 17px !important;
          }

          .plans-instruction-row {
            display: flex !important;
            align-items: flex-start !important;
            gap: 20px !important;
            margin-bottom: 28px;
            flex-direction: row !important;
            text-align: left !important;
          }

          .plans-instruction-row > div:first-child {
            width: 54px !important;
            height: 54px !important;
            min-width: 54px !important;
            background: linear-gradient(135deg, #e6b800 0%, #d4a700 100%);
            border-radius: 18px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 12px rgba(230, 184, 0, 0.25);
          }

          .plans-instruction-row > div:first-child svg {
            width: 26px !important;
            height: 26px !important;
          }

          .plans-instruction-row > div:last-child {
            flex: 1;
          }

          .plans-instruction-row > div:last-child p:first-child {
            font-size: 18px !important;
            font-weight: 700;
            line-height: 24px !important;
            margin-bottom: 10px !important;
            color: #2c2c2c;
          }

          .plans-instruction-row > div:last-child p:last-child {
            font-size: 16px !important;
            font-weight: 400;
            line-height: 22px !important;
            color: #6b6b6b;
            margin: 0;
          }

          .plans-cancel-content {
            display: flex !important;
            align-items: flex-start !important;
            gap: 28px !important;
            flex-direction: row !important;
            text-align: left !important;
          }

          .plans-cancel-content > div:first-child {
            width: 80px !important;
            height: 80px !important;
            min-width: 80px !important;
            background: linear-gradient(135deg, #e6b800 0%, #d4a700 100%);
            border-radius: 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 16px rgba(230, 184, 0, 0.3);
          }

          .plans-cancel-content > div:first-child svg {
            width: 38px !important;
            height: 38px !important;
          }

          .plans-cancel-content > div:last-child {
            flex: 1;
          }

          .plans-cancel-content > div:last-child p:first-child {
            font-size: 20px !important;
            font-weight: 600;
            color: #2c2c2c;
            margin-bottom: 18px !important;
          }

          .plans-cancel-content > div:last-child > div {
            font-size: 18px !important;
            margin-bottom: 14px;
          }

          .plans-cancel-content > div:last-child > div span:first-child {
            font-weight: 600;
            color: #2c2c2c;
          }

          .plans-cancel-content > div:last-child > div span:last-child {
            font-weight: 700;
            color: #6b8e23;
          }

          .plans-cancel-content > div:last-child p:last-child {
            font-size: 22px !important;
            font-weight: 700;
            color: #2c2c2c;
            margin: 0;
            font-style: italic;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  safeArea: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#f8f6f0",
    color: "#2c2c2c",
    minHeight: "100vh",
    width: "30%",
    margin: "0 auto",
  },
  scrollView: {
    paddingBottom: "20px",
  },
  stickyWrap: {
    backgroundColor: "#6b8e23",
    borderRadius: "0 0 24px 24px",
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
    padding: "16px 0 32px 0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "16px 12px",
    position: "relative",
  },
  backBtn: {
    background: "none",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    zIndex: 2,
    flexShrink: 0,
  },
  backIcon: {
    width: "28px",
    height: "28px",
    filter: "brightness(0) invert(1)",
    WebkitTransform: "scaleX(-1)",
    transform: "scaleX(-1)",
  },
  centerWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "8px",
    paddingLeft: "60px", // Add space for back button
    paddingRight: "20px",
  },
  mainTitle: {
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: "32px",
    letterSpacing: "-0.5px",
    color: "white",
    marginBottom: "8px",
    textAlign: "center",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "20px",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    maxWidth: "500px",
    margin: "0 auto",
  },
  content: {
    padding: "24px 16px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 2px 16px rgba(0, 0, 0, 0.06)",
    border: "1px solid #f0f0f0",
  },
  cancelSection: {
    backgroundColor: "#f8fff0",
    border: "2px solid #e8f5e0",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: "28px",
    letterSpacing: "-0.5px",
    color: "#6b8e23",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e8e8e8",
    margin: "0 0 24px 0",
  },
  tableContainer: {
    display: "grid",
    gridTemplateColumns: "0.8fr 1.2fr 1fr 1fr",
    border: "1px solid #e8e8e8",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  tableHeader: {
    display: "contents",
  },
  tableRow: {
    display: "contents",
  },
  tableCol: {
    padding: "16px 12px",
    fontSize: "14px",
    lineHeight: "20px",
    borderRight: "1px solid #e8e8e8",
    backgroundColor: "#ffffff",
  },
  stepCol: {
    fontWeight: 700,
    fontSize: "14px",
    padding: "16px 12px",
    textAlign: "left",
    background: "linear-gradient(135deg, #6b8e23 0%, #5a7a1e 100%)",
    color: "white",
  },
  whatCol: {
    fontWeight: 600,
    color: "#6b8e23",
    background: "linear-gradient(135deg, #6b8e23 0%, #5a7a1e 100%)",
    color: "white",
  },
  stepColContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: 600,
    color: "#6b8e23",
    backgroundColor: "rgba(107, 142, 35, 0.05)",
  },
  stepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #e6b800 0%, #d4a700 100%)",
    color: "#2c2c2c",
    borderRadius: "50%",
    fontSize: "16px",
    fontWeight: 700,
    boxShadow: "0 2px 8px rgba(230, 184, 0, 0.3)",
  },
  stepText: {
    fontSize: "15px",
  },
  noteBox: {
    background:
      "linear-gradient(135deg, rgba(230, 184, 0, 0.12) 0%, rgba(230, 184, 0, 0.08) 100%)",
    borderLeft: "4px solid #e6b800",
    padding: "16px 20px",
    borderRadius: "12px",
    marginTop: "8px",
  },
  noteText: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#2c2c2c",
    margin: 0,
  },
  instructionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    background: "linear-gradient(135deg, #e6b800 0%, #d4a700 100%)",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(230, 184, 0, 0.25)",
  },
  instructionBlock: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: "20px",
    marginBottom: "8px",
    color: "#2c2c2c",
    margin: "0 0 8px 0",
  },
  instructionBody: {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "20px",
    color: "#6b6b6b",
    margin: 0,
  },
  cancelContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "24px",
  },
  cancelIcon: {
    width: "70px",
    height: "70px",
    minWidth: "70px",
    background: "linear-gradient(135deg, #e6b800 0%, #d4a700 100%)",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 16px rgba(230, 184, 0, 0.3)",
  },
  cancelText: {
    flex: 1,
  },
  cancelQuestion: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#2c2c2c",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  cancelAction: {
    fontSize: "16px",
    marginBottom: "12px",
  },
  cancelActionText: {
    fontWeight: 600,
    color: "#2c2c2c",
  },
  cancelActionHighlight: {
    fontWeight: 700,
    color: "#6b8e23",
  },
  cancelFinal: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#2c2c2c",
    margin: 0,
    fontStyle: "italic",
  },
};