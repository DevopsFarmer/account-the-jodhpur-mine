"use client"; // Enables client-side features like localStorage and router
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Modal, Form, InputGroup, Spinner, Alert, Badge, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FaEye, FaSearch, FaRupeeSign, FaClipboard, FaWrench, FaFilePdf, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaAngleLeft, FaAngleRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { PencilSquare } from "react-bootstrap-icons";
import Header from "../components/Header";
import axios from "axios"; // Import axios for API calls

// Helper function to format date as DD/MM/YYYY
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

// Helper function to format time as HH:MM:SS AM/PM
const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });

const ViewVendorTransaction = () => {
  const router = useRouter();

  // States for authentication, data, filters, modals, and UI
  const [userRole, setUserRole] = useState(null);
  const [allVendorTransactions, setAllVendorTransactions] = useState([]); // All transactions fetched
  const [filteredVendorTransactions, setFilteredVendorTransactions] = useState([]); // Transactions after applying filters
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVendorTransaction, setSelectedVendorTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(""); // Error message displayed using Alert

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

  // Fetch vendor transactions if authorized
  useEffect(() => {
    const fetchData = async () => {
      if (userRole === "admin" || userRole === "manager") {
        setIsLoading(true);
        try {
          // Fetch all transactions to enable client-side filtering and pagination
          const res = await axios.get("/api/vendor-transaction?limit=100000");
          setAllVendorTransactions(res.data.docs || []);
          setFilteredVendorTransactions(res.data.docs || []); // Initially set filtered to all
        } catch (err) {
          console.error("API Error:", err);
          setError("Error fetching vendor transactions. Please try again.");
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

    const results = allVendorTransactions.filter(transaction => {
      const vendorName = transaction.vendorName?.vendorName?.toLowerCase() || "";
      const transactionDate = new Date(transaction.vendorCreatedAt);

      const matchesName = vendorName.includes(searchTerm);
      const afterStartDate = !startDateObj || transactionDate >= startDateObj;
      const beforeEndDate = !endDateObj || transactionDate <= endDateObj;

      return matchesName && afterStartDate && beforeEndDate;
    });

    setFilteredVendorTransactions(results);
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
    if (typeof window === 'undefined' || !selectedVendorTransaction) return;

    try {
      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById("pdf-content");
      if (!element) return;

      // Create a new div to hold the content for PDF generation
      const pdfContentWrapper = document.createElement('div');
      pdfContentWrapper.innerHTML = element.innerHTML;

      // Apply inline styles to the wrapper for consistent layout
      pdfContentWrapper.style.padding = '20px';
      pdfContentWrapper.style.fontFamily = 'Arial, sans-serif';
      pdfContentWrapper.style.fontSize = '12px';

      // Adjust specific elements within the wrapper for PDF
      const tables = pdfContentWrapper.querySelectorAll('table');
      tables.forEach(table => {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
      });
      const cells = pdfContentWrapper.querySelectorAll('th, td');
      cells.forEach(cell => {
        cell.style.padding = '8px';
        cell.style.border = '1px solid #ddd';
      });

      const opt = {
        margin: 0.5,
        filename: `Vendor_Transaction_${selectedVendorTransaction.vendorName?.vendorName || "Details"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: true,
          scrollY: 0,
          windowWidth: pdfContentWrapper.scrollWidth,
          windowHeight: pdfContentWrapper.scrollHeight
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait"
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(pdfContentWrapper).save();

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Toggle payment status function
  const togglePaymentStatus = async (id) => {
    try {
      // Find the transaction to get current status
      const transactionToUpdate = allVendorTransactions.find(txn => txn.id === id);
      if (!transactionToUpdate) return;

      const newStatus = transactionToUpdate.paymentstatus === "pending" ? "paid" : "pending";

      // Update on the server
      await fetch(`/api/vendor-transaction/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentstatus: newStatus }),
      });

      // Update the allVendorTransactions state
      const updatedAllVendorTransactions = allVendorTransactions.map(txn =>
        txn.id === id ? { ...txn, paymentstatus: newStatus } : txn
      );

      // Update the filteredVendorTransactions state while preserving the current filter
      const updatedFilteredVendorTransactions = filteredVendorTransactions.map(txn =>
        txn.id === id ? { ...txn, paymentstatus: newStatus } : txn
      );

      setAllVendorTransactions(updatedAllVendorTransactions);
      setFilteredVendorTransactions(updatedFilteredVendorTransactions);

      // Update selectedVendorTransaction if it's the one being modified
      if (selectedVendorTransaction && selectedVendorTransaction.id === id) {
        setSelectedVendorTransaction({ ...selectedVendorTransaction, paymentstatus: newStatus });
      }

    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to update payment status. Please try again.");
    }
  };

  // Toggle work status function for individual work stages
  const toggleWorkStatus = async (transactionId, stageIndex) => {
    try {
      // Find the transaction
      const transactionToUpdate = allVendorTransactions.find(txn => txn.id === transactionId);
      if (!transactionToUpdate || !transactionToUpdate.workingStage) return;

      // Create a copy of the working stages array
      const updatedWorkingStage = [...transactionToUpdate.workingStage];

      // Toggle the status of the specific stage
      const currentStatus = updatedWorkingStage[stageIndex]?.workstatus || "incomplete";
      const newStatus = currentStatus === "incomplete" ? "complete" : "incomplete";

      updatedWorkingStage[stageIndex] = {
        ...updatedWorkingStage[stageIndex],
        workstatus: newStatus
      };

      // Update on the server
      await fetch(`/api/vendor-transaction/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingStage: updatedWorkingStage }),
      });

      // Update the allVendorTransactions state
      const updatedAllVendorTransactions = allVendorTransactions.map(txn =>
        txn.id === transactionId ? { ...txn, workingStage: updatedWorkingStage } : txn
      );

      // Update the filteredVendorTransactions state
      const updatedFilteredVendorTransactions = filteredVendorTransactions.map(txn =>
        txn.id === transactionId ? { ...txn, workingStage: updatedWorkingStage } : txn
      );

      setAllVendorTransactions(updatedAllVendorTransactions);
      setFilteredVendorTransactions(updatedFilteredVendorTransactions);

      // Update selectedVendorTransaction if it's the one being modified
      if (selectedVendorTransaction && selectedVendorTransaction.id === transactionId) {
        setSelectedVendorTransaction({ ...selectedVendorTransaction, workingStage: updatedWorkingStage });
      }

    } catch (error) {
      console.error("Error updating work status:", error);
      setError("Failed to update work status. Please try again.");
    }
  };

  // Get current page items for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredVendorTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendorTransactions.length / itemsPerPage);

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

  // Show spinner while loading or unauthorized
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
      <Header />
      <Container className="mt-4 mb-5">
        <h4 className="text-center mb-4">
          <FaClipboard /> View All Vendor Transactions
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
              <Form.Label>Vendor Name</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={searchName}
                  onChange={handleSearch}
                  placeholder="Search by vendor name..."
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
                <th>Vendor Name</th>
                <th>Created At</th>
                <th>Total Amount(<FaRupeeSign />)</th>
                <th>Received Amount(<FaRupeeSign />)</th>
                <th>Remaining Amount(<FaRupeeSign />)</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((txn, index) => (
                  <tr key={txn.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{txn.vendorName?.vendorName || "N/A"}</td>
                    <td>
                      {formatDate(txn.vendorCreatedAt)}
                      <br />
                      <small>
                        <span className="fw-semibold">{formatTime(txn.vendorCreatedAt)}</span>
                      </small>
                    </td>
                    <td>
                      <FaRupeeSign />{txn.totalAmount?.toFixed(2)}
                    </td>
                    <td>
                      <FaRupeeSign />{txn.totalAmountvendor?.toFixed(2)}
                    </td>
                    <td>
                      <FaRupeeSign />{txn.remainingAmount?.toFixed(2) || (txn.totalAmount - txn.totalAmountvendor).toFixed(2)}
                    </td>
                    <td>
                      <Button
                        variant={txn.paymentstatus === "pending" ? "danger" : "success"}
                        onClick={() => togglePaymentStatus(txn.id)}
                        className="rounded-pill text-capitalize fw-bold fs-6"
                      >
                        {txn.paymentstatus}
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Button
                          variant="info"
                          onClick={() => {
                            setSelectedVendorTransaction(txn);
                            setShowModal(true);
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="warning"
                          onClick={() => router.push(`/editvendor-transaction/${txn.id}`)}
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
                    No vendor transactions found.
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
              <span className="fs-5">Vendor Transaction Details</span>
              <Button
                variant="outline-warning"
                size="sm"
                className="ms-auto rounded-pill fw-bold fs-6 text-center justify-content-center align-items-center d-flex gap-1 text-dark"
                onClick={downloadPDF}
                title="Download as PDF"
              >
                <FaFilePdf className="me-1" />PDF
              </Button>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body id="pdf-content" className="px-3 py-2">
            {selectedVendorTransaction && (
              <div>
                {/* Vendor Info */}
                <Row className="g-3 mb-3">
                  <Col xs={12} sm={6}>
                    <p>
                      <FaUser className="me-2 text-secondary" />
                      <strong>Vendor Name:</strong> {selectedVendorTransaction.vendorName?.vendorName || "N/A"}
                    </p>
                    <p>
                      <FaWrench className="me-2 text-secondary" />
                      <strong>Query License:</strong> {selectedVendorTransaction.query_license?.query_license || "N/A"}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="me-2 text-secondary" />
                      <strong>Nearby Village:</strong> {selectedVendorTransaction.near_village?.near_village || "N/A"}
                    </p>
                  </Col>
                  <Col xs={12} sm={6}>
                    <p>
                      <FaCalendarAlt className="me-2 text-secondary" />
                      <strong>Created At:</strong> {formatDate(selectedVendorTransaction.vendorCreatedAt)} {formatTime(selectedVendorTransaction.vendorCreatedAt)}
                    </p>
                    <p>
                      <FaCalendarAlt className="me-2 text-secondary" />
                      <strong>Last Updated At:</strong> {formatDate(selectedVendorTransaction.vendorUpdatedAt)} {formatTime(selectedVendorTransaction.vendorUpdatedAt)}
                    </p>
                  </Col>
                </Row>

                {/* Amount Summary */}
                <Row className="g-3 text-center mb-3">
                  <Col xs={12} md={4}>
                    <div className="bg-light rounded shadow-sm p-2">
                      <p className="mb-1 fw-bold text-dark">Total Amount</p>
                      <p className="text-success">
                        <FaRupeeSign /> {selectedVendorTransaction.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="bg-light rounded shadow-sm p-2">
                      <p className="mb-1 fw-bold text-dark">Received Amount</p>
                      <p className="text-primary">
                        <FaRupeeSign /> {selectedVendorTransaction.totalAmountvendor?.toFixed(2)}
                      </p>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="bg-light rounded shadow-sm p-2">
                      <p className="mb-1 fw-bold text-dark">Remaining Amount</p>
                      <p className="text-danger">
                        <FaRupeeSign /> {selectedVendorTransaction.remainingAmount?.toFixed(2) || (selectedVendorTransaction.totalAmount - selectedVendorTransaction.totalAmountvendor).toFixed(2)}
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
                        variant={selectedVendorTransaction.paymentstatus === "pending" ? "danger" : "success"}
                        onClick={() => togglePaymentStatus(selectedVendorTransaction.id)}
                        className="rounded-pill text-capitalize fw-bold fs-6 ms-2"
                        size="sm"
                      >
                        {selectedVendorTransaction.paymentstatus}
                      </Button>
                    </p>
                    <p>
                      <strong>Transaction Description:</strong> {selectedVendorTransaction.description || "N/A"}
                    </p>
                  </Col>
                </Row>

                {/* Working Stage Table */}
                <hr />
                <h6 className="text-secondary mb-3">
                  <FaWrench className="me-2" />Work Progress Stages
                </h6>
                <div className="table-responsive">
                  <Table bordered hover className="text-center align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>S.No</th>
                        <th>Company Stage</th>
                        <th>Company Description</th>
                        <th>Work Status</th>
                        <th>Vendor Stage</th>
                        <th>Vendor Description</th>
                        <th>Stage Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({
                        length: Math.max(
                          selectedVendorTransaction.workingStage?.length || 0,
                          selectedVendorTransaction.workingStagevendor?.length || 0
                        )
                      }).map((_, index) => {
                        const companyStage = selectedVendorTransaction.workingStage?.[index];
                        const vendorStage = selectedVendorTransaction.workingStagevendor?.[index];
                        const workStatus = companyStage?.workstatus || "incomplete";

                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{companyStage?.workingStage || "N/A"}</td>
                            <td>{companyStage?.workingDescription || "N/A"}</td>
                            <td>
                              <Button
                                variant={workStatus === "incomplete" ? "danger" : "success"}
                                onClick={() => toggleWorkStatus(selectedVendorTransaction.id, index)}
                                className="rounded-pill text-capitalize fw-bold"
                                size="sm"
                                disabled={!companyStage}
                              >
                                {workStatus === "incomplete" ? (
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
                            <td>{vendorStage?.workingStagevendor || "N/A"}</td>
                            <td>{vendorStage?.workingDescriptionvendor || "N/A"}</td>
                            <td>
                              {vendorStage?.stageDate ? (
                                <div>
                                  <div className="fw-bold text-primary">
                                    {new Date(vendorStage.stageDate).toLocaleDateString('en-GB')}
                                  </div>
                                  <small className="text-muted">
                                    {new Date(vendorStage.stageDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </small>
                                </div>
                              ) : companyStage?.stageDate ? (
                                <div>
                                  <div className="fw-bold text-primary">
                                    {new Date(companyStage.stageDate).toLocaleDateString('en-GB')}
                                  </div>
                                  <small className="text-muted">
                                    {new Date(companyStage.stageDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
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

export default ViewVendorTransaction;