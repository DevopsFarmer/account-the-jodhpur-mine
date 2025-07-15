"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Badge,
  Card,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import {
  FaEye,
  FaSearch,
  FaRupeeSign,
  FaClipboard,
  FaWrench,
  FaFilePdf,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaAngleLeft,
  FaAngleRight,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner, // Added for loading indicator
} from "react-icons/fa";
import { PencilSquare } from "react-bootstrap-icons";

import axios from "axios";

// Helper function to format date as DD/MM/YYYY
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

// Helper function to format time as HH:MM:SS AM/PM
const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

const VoucherClientTransaction = () => {
  const router = useRouter();

  // States for authentication, data, filters, modals, and UI
  const [userRole, setUserRole] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]); // All transactions fetched
  const [filteredTransactions, setFilteredTransactions] = useState([]); // Transactions after applying filters
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(""); // Error message displayed using Alert

  // States for individual button loading
  const [paymentStatusLoadingId, setPaymentStatusLoadingId] = useState(null);
  const [workStatusLoadingId, setWorkStatusLoadingId] = useState(null); // Stores { transactionId, stageIndex }

  // Pagination states
  const itemsPerPage = 10; // Number of transactions per page is 10
  const [currentPage, setCurrentPage] = useState(1); // Current page number

  // Validate user role using localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        if (user.role !== "admin" && user.role !== "manager") {
          throw new Error("Unauthorized");
        }
      } catch {
        localStorage.clear();
        setError("Unauthorized access. Redirecting...");
        setTimeout(() => (window.location.href = "/api/logout"), 1500);
        return;
      }
    } else {
      setError("Session expired. Redirecting...");
      localStorage.clear();
      setTimeout(() => (window.location.href = "/api/logout"), 1500);
    }
    setIsLoading(false);
  }, []);

  // Fetch client transactions if authorized
  useEffect(() => {
    const fetchData = async () => {
      if (userRole === "admin" || userRole === "manager") {
        setIsLoading(true);
        setError("");
        try {
          console.log("Fetching transactions for voucher page...");
          const res = await axios.get("/api/client-transaction?limit=100000");
          console.log("Raw API response (voucher):", res.data);
          
          if (!res.data || !Array.isArray(res.data.docs)) {
            throw new Error("Invalid response format from server");
          }
          
          const guestTransactions = res.data.docs.filter(tx => {
            console.log("Voucher transaction source:", tx.source, "Transaction ID:", tx.id);
            return tx.source === 'guest';
          });
          
          console.log("Guest transactions:", guestTransactions);
          
          if (guestTransactions.length === 0) {
            console.warn("No guest transactions found. Total transactions:", res.data.docs.length);
          }
          
          setAllTransactions(guestTransactions);
          setFilteredTransactions(guestTransactions);
        } catch (err) {
          console.error("API Error (voucher):", err);
          console.error("Error details (voucher):", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setError(`Failed to load voucher transactions: ${err.message}. Please check the console for more details.`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [userRole]);

  // Function to apply filters by name and date range
  const applyFilters = (name, start, end) => {
    const searchTerm = name.toLowerCase();
    const startDateObj = start ? new Date(start) : null;
    const endDateObj = end ? new Date(end) : null;

    if (endDateObj) {
      endDateObj.setHours(23, 59, 59, 999);
    }

    const results = allTransactions.filter((transaction) => {
      const clientName = transaction.clientName?.clientName?.toLowerCase() || "";
      const transactionDate = new Date(transaction.clientCreatedAt);

      const matchesName = clientName.includes(searchTerm);
      const afterStartDate = !startDateObj || transactionDate >= startDateObj;
      const beforeEndDate = !endDateObj || transactionDate <= endDateObj;

      return matchesName && afterStartDate && beforeEndDate;
    });

    setFilteredTransactions(results);
    setCurrentPage(1); // Reset to first page after applying filters
  };

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);
    applyFilters(value, startDate, endDate);
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    applyFilters(searchName, value, endDate);
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    applyFilters(searchName, startDate, value);
  };

  // Function to download PDF
  const downloadPDF = async () => {
    if (typeof window === "undefined" || !selectedTransaction) return;

    try {
      // Load jsPDF and AutoTable dynamically
      if (!window.jspdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        await new Promise((resolve, reject) => {
          script.onload = () => window.jspdf ? resolve() : reject(new Error('jsPDF failed to load'));
          script.onerror = () => reject(new Error('Failed to load jsPDF script'));
          document.head.appendChild(script);
        });
      }
      if (!window.jspdf.jsPDF.API.autoTable) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
        await new Promise((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load AutoTable plugin'));
          document.head.appendChild(script);
        });
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let startY = 0;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Client Transaction Report", pageWidth / 2, startY + 50, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`For: ${selectedTransaction.clientName?.clientName || "N/A"}`, pageWidth / 2, startY + 68, { align: "center" });
      doc.setDrawColor(200);
      doc.line(margin, startY + 85, pageWidth - margin, startY + 85);
      startY = 100;
      doc.autoTable({
      body: [
        [{ content: "Query License:", styles: { fontStyle: 'bold' } }, selectedTransaction.query_license?.query_license || "N/A"],
        [{ content: "Nearby Village:", styles: { fontStyle: 'bold' } }, selectedTransaction.near_village?.near_village || "N/A"],
        [{ content: "Payment Status:", styles: { fontStyle: 'bold' } }, selectedTransaction.paymentstatus?.charAt(0).toUpperCase() + selectedTransaction.paymentstatus?.slice(1) || "N/A"],
      ],
      startY: startY, theme: 'plain', styles: { fontSize: 10, cellPadding: 3 }, tableWidth: (pageWidth / 2) - margin, margin: { left: margin },
    });
    doc.autoTable({
      body: [
        [{ content: "Created At:", styles: { fontStyle: 'bold' } }, `${formatDate(selectedTransaction.clientCreatedAt)}`],
        [{ content: "Last Updated At:", styles: { fontStyle: 'bold' } }, `${formatDate(selectedTransaction.clientUpdatedAt)}`],
        [{ content: "Transaction Desc:", styles: { fontStyle: 'bold' } }, selectedTransaction.description || "N/A"],
      ],
      startY: startY, theme: 'plain', styles: { fontSize: 10, cellPadding: 3 }, tableWidth: (pageWidth / 2) - margin, margin: { left: pageWidth / 2 },
    });
    startY = doc.autoTable.previous.finalY + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Financial Summary", margin, startY);
    startY += 15;
    doc.autoTable({
      head: [['Total Amount', 'Received Amount', 'Remaining Amount']],
      body: [[`₹ ${selectedTransaction.totalAmount?.toFixed(2) || '0.00'}`, `₹ ${selectedTransaction.totalAmountclient?.toFixed(2) || '0.00'}`, `₹ ${(selectedTransaction.remainingAmount || (selectedTransaction.totalAmount - selectedTransaction.totalAmountclient)).toFixed(2)}`]],
      startY: startY, theme: 'grid',
      headStyles: { fontStyle: 'bold', halign: 'center', fillColor: [230, 230, 230], textColor: 0 },
      bodyStyles: { fontSize: 11, halign: 'center' },
    });
    startY = doc.autoTable.previous.finalY + 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Work Progress Stages", margin, startY);
    startY += 20;
    const tableColumns = [
      { header: "#", dataKey: "sn" },
      { header: "Company Stage", dataKey: "cStage" },
      { header: "Company Desc.", dataKey: "cDesc" },
      { header: "Status", dataKey: "status" },
      { header: "Client Stage", dataKey: "clStage" },
      { header: "Client Desc.", dataKey: "clDesc" },
      { header: "Date", dataKey: "date" },
    ];
    const tableRows = Array.from({ length: Math.max(selectedTransaction.workingStage?.length || 0, selectedTransaction.workingStageclient?.length || 0) })
      .map((_, index) => ({
        sn: index + 1,
        cStage: selectedTransaction.workingStage?.[index]?.workingStage || "N/A",
        cDesc: selectedTransaction.workingStage?.[index]?.workingDescription || "N/A",
        status: selectedTransaction.workingStage?.[index]?.workstatus || "incomplete",
        clStage: selectedTransaction.workingStageclient?.[index]?.workingStageclient || "N/A",
        clDesc: selectedTransaction.workingStageclient?.[index]?.workingDescriptionclient || "N/A",
        date: selectedTransaction.workingStageclient?.[index]?.stageDate ? formatDate(selectedTransaction.workingStageclient[index].stageDate) : "No date",
      }));
    doc.autoTable({
      columns: tableColumns,
      body: tableRows,
      startY: startY,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
      bodyStyles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        sn: { cellWidth: 25, halign: 'center' },
        cStage: { cellWidth: 70 },
        clStage: { cellWidth: 70 },
        status: { cellWidth: 60, halign: 'center' },
        date: { cellWidth: 60, halign: 'center' },
      },
      didDrawCell: (data) => {
        if (data.column.dataKey === 'status' && data.cell.section === 'body') {
          const text = data.cell.text[0]?.toLowerCase();
          let fillColor;
          if (text === 'complete') fillColor = [211, 255, 211];
          else if (text === 'incomplete') fillColor = [255, 211, 211];
          if (fillColor) {
            doc.setFillColor(...fillColor);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(0);
            doc.text(data.cell.text, data.cell.x + data.cell.padding('left'), data.cell.y + data.cell.height / 2, { baseline: 'middle' });
          }
        }
      },
      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'center' }
        );
      }
    });
    doc.save(`Transaction_${selectedTransaction.clientName?.clientName || "Details"}_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

  // Toggle payment status function
  const togglePaymentStatus = async (id) => {
    setPaymentStatusLoadingId(id); // Set loading for this transaction
    try {
      // Find the transaction to get current status
      const transactionToUpdate = allTransactions.find((txn) => txn.id === id);
      if (!transactionToUpdate) return;

      const newStatus =
        transactionToUpdate.paymentstatus === "pending" ? "Received" : "pending";

      // Update on the server
      await fetch(`/api/client-transaction/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentstatus: newStatus }),
      });

      // Update the allTransactions state
      const updatedAllTransactions = allTransactions.map((txn) =>
        txn.id === id ? { ...txn, paymentstatus: newStatus } : txn
      );

      // Update the filteredTransactions state while preserving the current filter
      const updatedFilteredTransactions = filteredTransactions.map((txn) =>
        txn.id === id ? { ...txn, paymentstatus: newStatus } : txn
      );

      setAllTransactions(updatedAllTransactions);
      setFilteredTransactions(updatedFilteredTransactions);

      // Update selectedTransaction if it's the one being modified
      if (selectedTransaction && selectedTransaction.id === id) {
        setSelectedTransaction({ ...selectedTransaction, paymentstatus: newStatus });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to update payment status. Please try again.");
    } finally {
      setPaymentStatusLoadingId(null); // Clear loading
    }
  };

  // Toggle work status function for individual work stages
  const toggleWorkStatus = async (transactionId, stageIndex) => {
    setWorkStatusLoadingId({ transactionId, stageIndex }); // Set loading for this specific stage
    try {
      // Find the transaction
      const transactionToUpdate = allTransactions.find(
        (txn) => txn.id === transactionId
      );
      if (!transactionToUpdate || !transactionToUpdate.workingStage) return;

      // Create a copy of the working stages array
      const updatedWorkingStage = [...transactionToUpdate.workingStage];

      // Toggle the status of the specific stage
      const currentStatus = updatedWorkingStage[stageIndex]?.workstatus || "incomplete";
      const newStatus = currentStatus === "incomplete" ? "complete" : "incomplete";

      updatedWorkingStage[stageIndex] = {
        ...updatedWorkingStage[stageIndex],
        workstatus: newStatus,
      };

      // Update on the server
      await fetch(`/api/client-transaction/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingStage: updatedWorkingStage }),
      });

      // Update the allTransactions state
      const updatedAllTransactions = allTransactions.map((txn) =>
        txn.id === transactionId ? { ...txn, workingStage: updatedWorkingStage } : txn
      );

      // Update the filteredTransactions state
      const updatedFilteredTransactions = filteredTransactions.map((txn) =>
        txn.id === transactionId ? { ...txn, workingStage: updatedWorkingStage } : txn
      );

      setAllTransactions(updatedAllTransactions);
      setFilteredTransactions(updatedFilteredTransactions);

      // Update selectedTransaction if it's the one being modified
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction({ ...selectedTransaction, workingStage: updatedWorkingStage });
      }
    } catch (error) {
      console.error("Error updating work status:", error);
      setError("Failed to update work status. Please try again.");
    } finally {
      setWorkStatusLoadingId(null); // Clear loading
    }
  };

  // Get current page items for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Render pagination buttons
  const renderPagination = () => {
    const pages = [];

    if (currentPage > 1) {
      pages.push(
        <Button key="prev" onClick={() => setCurrentPage(currentPage - 1)}>
          <FaAngleLeft /> Prev
        </Button>
      );
    }

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? "dark" : "outline-primary"}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        pages.push(<span key={`ellipsis-${i}`} className="mx-2">...</span>);
      }
    }

    if (currentPage < totalPages) {
      pages.push(
        <Button key="next" onClick={() => setCurrentPage(currentPage + 1)}>
          Next <FaAngleRight />
        </Button>
      );
    }

    return <div className="d-flex flex-wrap gap-2 justify-content-center my-3">{pages}</div>;
  };

  // Show spinner while initial loading or unauthorized
  if (isLoading || userRole === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
        <span className="ms-2">Loading Please Wait...</span>
      </div>
    );
  }

  // Display unauthorized message if not admin or manager
  if (userRole !== "admin" && userRole !== "manager") {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">
          <FaClipboard className="me-2" /> {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>

      <Container className="mt-4 mb-5">
        <h4 className="text-center mb-4">
          <FaClipboard /> View All Client Voucher Transactions
        </h4>

        {/* Show error using Alert */}
        {error && (
          <Alert variant="danger" className="text-center fw-semibold">
            {error}
          </Alert>
        )}

        {/* Search & Date Filter */}
        <Form className="mb-4">
          <Row className="gy-3">
            <Col xs={12} md={4}>
              <Form.Label>Client Name</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={searchName}
                  onChange={handleSearch}
                  placeholder="Search by client name..."
                />
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={6} md={4}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </Col>
            <Col xs={6} md={4}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </Col>
          </Row>
        </Form>

        {/* Responsive Table */}
        <div className="table-responsive">
          <Table className="table-bordered table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Voucher No</th>
                <th>Client Name</th>
                <th>Created At</th>
                <th>Received Amount(<FaRupeeSign />)</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((txn, index) => (
                  <tr key={txn.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="fw-bold">{txn.voucherNo || "N/A"}</td>
                    <td>{txn.clientName?.clientName || "N/A"}</td>
                    <td>
                      {formatDate(txn.clientCreatedAt)}
                      <br />
                      <small>
                        <span className="fw-semibold">
                          {formatTime(txn.clientCreatedAt)}
                        </span>
                      </small>
                    </td>
                    <td>
                      <FaRupeeSign />
                      {txn.totalAmountclient?.toFixed(2)}
                    </td>
                    <td>
                      <Button
                        variant={txn.paymentstatus === "pending" ? "danger" : "success"}
                        onClick={() => togglePaymentStatus(txn.id)}
                        className="rounded-pill text-capitalize fw-bold fs-6"
                        disabled={paymentStatusLoadingId === txn.id} // Disable button while loading
                      >
                        {paymentStatusLoadingId === txn.id ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-1"
                          />
                        ) : (
                          txn.paymentstatus
                        )}
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Button
                          variant="info"
                          onClick={() => {
                            setSelectedTransaction(txn);
                            setShowModal(true);
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="warning"
                          onClick={() => router.push(`/client/transaction/edit/${txn.id}`)}
                        >
                          <PencilSquare />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="fw-semibold text-secondary">
                    No client transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Transaction Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
          <Modal.Header closeButton className="bg-light border-bottom">
            <Modal.Title className="d-flex align-items-center gap-2">
              <FaClipboard className="text-primary" />
              <span className="fs-5">Client Transaction Details</span>
              <Button
                variant="outline-warning"
                size="sm"
                className="ms-auto rounded-pill fw-bold fs-6 text-center justify-content-center align-items-center d-flex gap-1 text-dark"
                onClick={downloadPDF}
                title="Download as PDF"
              >
                <FaFilePdf className="me-1" />
                PDF
              </Button>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body id="pdf-content" className="px-3 py-2">
            {selectedTransaction && (
              <div>
                {/* Client Info */}
                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <p>
                      <FaUser className="me-2 text-secondary" />
                      <strong>Client Name:</strong>{" "}
                      {selectedTransaction.clientName?.clientName || "N/A"}
                    </p>
                    <p>
                      <FaWrench className="me-2 text-secondary" />
                      <strong>Query License:</strong>{" "}
                      {selectedTransaction.query_license?.query_license || "N/A"}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="me-2 text-secondary" />
                      <strong>State:</strong>{" "}
                      {selectedTransaction.state?.state || "N/A"}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="me-2 text-secondary" />
                      <strong>District:</strong>{" "}
                      {selectedTransaction.district?.district || "N/A"}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="me-2 text-secondary" />
                      <strong>Tehsil:</strong>{" "}
                      {selectedTransaction.tehsil?.tehsil || "N/A"}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="me-2 text-secondary" />
                      <strong>Nearby Village:</strong>{" "}
                      {selectedTransaction.near_village?.near_village || "N/A"}
                    </p>
                  </Col>
                  <Col xs={12} sm={6}>
                    <p>
                      <FaCalendarAlt className="me-2 text-secondary" />
                      <strong>Created At:</strong>{" "}
                      {formatDate(selectedTransaction.clientCreatedAt)}{" "}
                      {formatTime(selectedTransaction.clientCreatedAt)}
                    </p>
                    <p>
                      <FaCalendarAlt className="me-2 text-secondary" />
                      <strong>Last Updated At:</strong>{" "}
                      {formatDate(selectedTransaction.clientUpdatedAt)}{" "}
                      {formatTime(selectedTransaction.clientUpdatedAt)}
                    </p>
                  </Col>
                </Row>

                {/* Amount Summary */}
                <Row className="g-3 text-center mb-3">
                  <Col xs={12} md={4}>
                    <div className="bg-light rounded shadow-sm p-2">
                      <p className="mb-1 fw-bold text-dark">Total Amount</p>
                      <p className="text-success">
                        <FaRupeeSign />{" "}
                        {selectedTransaction.totalAmountclient?.toFixed(2)}
                      </p>
                    </div>
                  </Col>
                </Row>

                {/* Payment Status & Description */}
                <Row className="mb-3">
                  <Col xs={12}>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      <Button
                        variant={
                          selectedTransaction.paymentstatus === "pending"
                            ? "danger"
                            : "success"
                        }
                        onClick={() => togglePaymentStatus(selectedTransaction.id)}
                        className="rounded-pill text-capitalize fw-bold fs-6 ms-2"
                        size="sm"
                        disabled={paymentStatusLoadingId === selectedTransaction.id}
                      >
                        {paymentStatusLoadingId === selectedTransaction.id ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-1"
                          />
                        ) : (
                          selectedTransaction.paymentstatus
                        )}
                      </Button>
                    </p>
                    <p>
                      <strong>Transaction Description:</strong>{" "}
                      {selectedTransaction.description || "N/A"}
                    </p>
                  </Col>
                </Row>

                {/* Working Stage Table */}
                <hr />
                <h6 className="text-secondary mb-3">
                  <FaWrench className="me-2" />
                  Work Progress Stages
                </h6>
                <div className="table-responsive">
                  <Table bordered hover className="text-center align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>S.No</th>
                        <th>Work Status</th>
                        <th>Client Stage</th>
                        <th>Client Description</th>
                        <th>Stage Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({
                        length: Math.max(
                          selectedTransaction.workingStage?.length || 0,
                          selectedTransaction.workingStageclient?.length || 0
                        ),
                      }).map((_, index) => {
                        const companyStage = selectedTransaction.workingStage?.[index];
                        const clientStage = selectedTransaction.workingStageclient?.[index];
                        const workStatus = companyStage?.workstatus || "incomplete";
                        const isStageLoading =
                          workStatusLoadingId &&
                          workStatusLoadingId.transactionId === selectedTransaction.id &&
                          workStatusLoadingId.stageIndex === index;

                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <Button
                                variant={workStatus === "incomplete" ? "danger" : "success"}
                                onClick={() => toggleWorkStatus(selectedTransaction.id, index)}
                                className="rounded-pill text-capitalize fw-bold d-flex align-items-center justify-content-center mx-auto"
                                size="sm"
                                style={{ minWidth: '120px' }}
                                disabled={isStageLoading}
                              >
                                {isStageLoading ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-1"
                                  />
                                ) : workStatus === "incomplete" ? (
                                  <>
                                    <FaTimesCircle className="me-1" />
                                    Incomplete
                                  </>
                                ) : (
                                  <>
                                    <FaCheckCircle className="me-1" />
                                    Complete
                                  </>
                                )}
                              </Button>
                              {!companyStage && (
                                <small className="d-block text-muted mt-1">No stage data</small>
                              )}
                            </td>
                            <td>{clientStage?.workingStageclient || "N/A"}</td>
                            <td>{clientStage?.workingDescriptionclient || "N/A"}</td>
                            <td>
                              {clientStage?.stageDate ? (
                                <div>
                                  <div className="fw-bold text-primary">
                                    {formatDate(clientStage.stageDate)}
                                  </div>
                                  <small className="text-muted">
                                    {formatTime(clientStage.stageDate)}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">No date</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default VoucherClientTransaction;