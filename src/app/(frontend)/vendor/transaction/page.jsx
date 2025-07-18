"use client"; 
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Modal, Form, InputGroup, Spinner, Alert, Badge, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FaEye, FaSearch, FaRupeeSign, FaClipboard, FaWrench, FaFilePdf, FaUser,FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaAngleLeft, FaAngleRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { PencilSquare } from "react-bootstrap-icons";
import axios from "axios"; 

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

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

  const [userRole, setUserRole] = useState(null);
  const [allVendorTransactions, setAllVendorTransactions] = useState([]); 
  const [filteredVendorTransactions, setFilteredVendorTransactions] = useState([]); 
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVendorTransaction, setSelectedVendorTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(""); 

  const itemsPerPage = 10; 
  const [currentPage, setCurrentPage] = useState(1); 

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

  useEffect(() => {
    const fetchData = async () => {
      if (userRole === "admin" || userRole === "manager") {
        setIsLoading(true);
        try {
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
    setCurrentPage(1); 
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);
    applyFilters(value, startDate, endDate);
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    applyFilters(searchName, value, endDate);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    applyFilters(searchName, startDate, value);
  };

  const downloadPDF = async () => {
    if (typeof window === "undefined" || !selectedVendorTransaction) return;
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
      doc.text("Vendor Transaction Report", pageWidth / 2, startY + 50, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`For: ${selectedVendorTransaction.vendorName?.vendorName || "N/A"}`, pageWidth / 2, startY + 68, { align: "center" });
      doc.setDrawColor(200);
      doc.line(margin, startY + 85, pageWidth - margin, startY + 85);
      startY = 100;
      doc.autoTable({
        body: [
          [{ content: "Query License:", styles: { fontStyle: 'bold' } }, selectedVendorTransaction.query_license?.query_license || "N/A"],
          [{ content: "Nearby Village:", styles: { fontStyle: 'bold' } }, selectedVendorTransaction.near_village?.near_village || "N/A"],
          [{ content: "Payment Status:", styles: { fontStyle: 'bold' } }, selectedVendorTransaction.paymentstatus?.charAt(0).toUpperCase() + selectedVendorTransaction.paymentstatus?.slice(1) || "N/A"],
        ],
        startY: startY, theme: 'plain', styles: { fontSize: 10, cellPadding: 3 }, tableWidth: (pageWidth / 2) - margin, margin: { left: margin },
      });
      doc.autoTable({
        body: [
          [{ content: "Created At:", styles: { fontStyle: 'bold' } }, `${formatDate(selectedVendorTransaction.vendorCreatedAt)}`],
          [{ content: "Last Updated At:", styles: { fontStyle: 'bold' } }, `${formatDate(selectedVendorTransaction.vendorUpdatedAt)}`],
          [{ content: "Transaction Desc:", styles: { fontStyle: 'bold' } }, selectedVendorTransaction.description || "N/A"],
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
        body: [[
          `${(Number(selectedVendorTransaction.totalAmount) || 0).toFixed(2)}`,
          `${(Number(selectedVendorTransaction.totalAmountvendor) || 0).toFixed(2)}`,
          `${(
            Number(selectedVendorTransaction.remainingAmount) ||
            (Number(selectedVendorTransaction.totalAmount) - Number(selectedVendorTransaction.totalAmountvendor)) || 0
          ).toFixed(2)}`
        ]],
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
        { header: "Vendor Stage", dataKey: "vStage" },
        { header: "Vendor Desc.", dataKey: "vDesc" },
        { header: "Date", dataKey: "date" },
      ];
      const tableRows = Array.from({ length: Math.max(selectedVendorTransaction.workingStage?.length || 0, selectedVendorTransaction.workingStagevendor?.length || 0) })
        .map((_, index) => ({
          sn: index + 1,
          cStage: selectedVendorTransaction.workingStage?.[index]?.workingStage || "N/A",
          cDesc: selectedVendorTransaction.workingStage?.[index]?.workingDescription || "N/A",
          status: selectedVendorTransaction.workingStage?.[index]?.workstatus || "incomplete",
          vStage: selectedVendorTransaction.workingStagevendor?.[index]?.workingStagevendor || "N/A",
          vDesc: selectedVendorTransaction.workingStagevendor?.[index]?.workingDescriptionvendor || "N/A",
          date: selectedVendorTransaction.workingStagevendor?.[index]?.stageDate ? formatDate(selectedVendorTransaction.workingStagevendor[index].stageDate) : "No date",
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
          vStage: { cellWidth: 70 },
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
      doc.save(`Vendor_Transaction_${selectedVendorTransaction.vendorName?.vendorName || "Details"}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const togglePaymentStatus = async (id) => {
    try {
      const transactionToUpdate = allVendorTransactions.find(txn => txn.id === id);
      if (!transactionToUpdate) return;

      const newStatus = transactionToUpdate.paymentstatus === "pending" ? "paid" : "pending";

      await fetch(`/api/vendor-transaction/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentstatus: newStatus }),
      });

      const updatedAllVendorTransactions = allVendorTransactions.map(txn =>
        txn.id === id ? { ...txn, paymentstatus: newStatus } : txn
      );
      const updatedFilteredVendorTransactions = filteredVendorTransactions.map(txn =>
        txn.id === id ? { ...txn, paymentstatus: newStatus } : txn
      );

      setAllVendorTransactions(updatedAllVendorTransactions);
      setFilteredVendorTransactions(updatedFilteredVendorTransactions);

      if (selectedVendorTransaction && selectedVendorTransaction.id === id) {
        setSelectedVendorTransaction({ ...selectedVendorTransaction, paymentstatus: newStatus });
      }

    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to update payment status. Please try again.");
    }
  };

    const toggleWorkStatus = async (transactionId, stageIndex) => {
    try {
      const transactionToUpdate = allVendorTransactions.find(txn => txn.id === transactionId);
      if (!transactionToUpdate || !transactionToUpdate.workingStage) return;
      const updatedWorkingStage = [...transactionToUpdate.workingStage];

      const currentStatus = updatedWorkingStage[stageIndex]?.workstatus || "incomplete";
      const newStatus = currentStatus === "incomplete" ? "complete" : "incomplete";

      updatedWorkingStage[stageIndex] = {
        ...updatedWorkingStage[stageIndex],
        workstatus: newStatus
      };

      await fetch(`/api/vendor-transaction/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingStage: updatedWorkingStage }),
      });

      const updatedAllVendorTransactions = allVendorTransactions.map(txn =>
        txn.id === transactionId ? { ...txn, workingStage: updatedWorkingStage } : txn
      );
      const updatedFilteredVendorTransactions = filteredVendorTransactions.map(txn =>
        txn.id === transactionId ? { ...txn, workingStage: updatedWorkingStage } : txn
      );

      setAllVendorTransactions(updatedAllVendorTransactions);
      setFilteredVendorTransactions(updatedFilteredVendorTransactions);

      if (selectedVendorTransaction && selectedVendorTransaction.id === transactionId) {
        setSelectedVendorTransaction({ ...selectedVendorTransaction, workingStage: updatedWorkingStage });
      }

    } catch (error) {
      console.error("Error updating work status:", error);
      setError("Failed to update work status. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/vendor-transaction/${transactionToDelete.id}`);
      if (response.status === 200) {
        setAllVendorTransactions(prev => prev.filter(txn => txn.id !== transactionToDelete.id));
        setFilteredVendorTransactions(prev => prev.filter(txn => txn.id !== transactionToDelete.id));
        setShowDeleteModal(false);
        setError("");
        setTransactionToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const confirmDelete = (txn) => {
    setTransactionToDelete(txn);
    setShowDeleteModal(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredVendorTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendorTransactions.length / itemsPerPage);

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

  if (isLoading || userRole === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
        <span className="ms-2">Loading Please Wait...</span>
      </div>
    );
  }

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
          <FaClipboard /> View All Vendor Transactions
        </h4>

        {error && (
          <Alert variant="danger" className="text-center fw-semibold">
            {error}
          </Alert>
        )}

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
                          onClick={() => router.push(`/vendor/transaction/edit/${txn.id}`)}
                        >
                          <PencilSquare />
                        </Button>
                         {/* <Button variant="danger" onClick={() => confirmDelete(txn)}><FaTrash /></Button> */}
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
                    {/* <p>
                      <FaWrench className="me-2 text-secondary" />
                      <strong>Query License:</strong> {selectedVendorTransaction.query_license?.query_license || "N/A"}
                    </p> */}
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

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCancelDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Transaction</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this transaction?
            <ul className="mt-3">
              <li><strong>Vendor:</strong> {transactionToDelete?.vendorName?.vendorName}</li>
              <li><strong>Query License:</strong> {transactionToDelete?.query_license?.query_license}</li>
              <li><strong>Amount:</strong> ₹{transactionToDelete?.totalAmount}</li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelDelete}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default ViewVendorTransaction;