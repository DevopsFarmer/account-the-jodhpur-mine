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
  FaTags,
  FaHashtag,
  FaHome,
  FaPhoneAlt
} from "react-icons/fa";
import { PencilSquare } from "react-bootstrap-icons";

import axios from "axios";

// Helper functions for date and time formatting
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: "Asia/Kolkata" });

// --- PDF Helper Functions ---
const loadJsPDF = async () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.jspdf) return resolve(window.jspdf);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => window.jspdf ? resolve(window.jspdf) : reject(new Error('jsPDF failed to load'));
    script.onerror = () => reject(new Error('Failed to load jsPDF script'));
    document.head.appendChild(script);
  });
};

const loadAutoTable = async () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.jspdf?.jsPDF?.API?.autoTable) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load AutoTable plugin'));
    document.head.appendChild(script);
  });
};

const VoucherClientTransaction = () => {
  const router = useRouter();

  // Component states
  const [userRole, setUserRole] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatusLoadingId, setPaymentStatusLoadingId] = useState(null);
  const [workStatusLoadingId, setWorkStatusLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Data Fetching and Transformation ---
  useEffect(() => {
    const role = JSON.parse(localStorage.getItem("user"))?.role;
    setUserRole(role);
    if (!['admin', 'manager'].includes(role)) {
      setError("Unauthorized access. Redirecting...");
      setTimeout(() => (window.location.href = "/api/logout"), 1500);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/client-transaction?limit=100000");
        if (!res.data || !Array.isArray(res.data.docs)) {
          throw new Error("Invalid response format from server");
        }
        
        const guestTransactions = res.data.docs
          .filter(tx => tx.source === 'guest')
          .map(tx => {
            const clientData = typeof tx.clientName === 'object' && tx.clientName !== null 
              ? tx.clientName
              : { id: tx.clientName, clientName: tx.clientName, clientMobile: 'N/A' };
            
            return {
              ...tx,
              clientName: clientData,
              clientMobile: clientData.clientMobile,
              query_license: typeof tx.query_license === 'object' ? tx.query_license : clientData,
              state: typeof tx.state === 'object' ? tx.state : clientData,
              district: typeof tx.district === 'object' ? tx.district : clientData,
              tehsil: typeof tx.tehsil === 'object' ? tx.tehsil : clientData,
              near_village: typeof tx.near_village === 'object' ? tx.near_village : clientData,
            };
          });
        
        setAllTransactions(guestTransactions);
        setFilteredTransactions(guestTransactions);
      } catch (err) {
        console.error("API Error (voucher):", err);
        setError(`Failed to load voucher transactions: ${err.message}.`);
      } finally {
        setIsLoading(false);
      }
    };

    if (role) {
        fetchData();
    }
  }, [userRole]);

  // --- Filtering Logic ---
  const applyFilters = (name, start, end) => {
    const searchTerm = name.toLowerCase();
    const startDateObj = start ? new Date(start) : null;
    const endDateObj = end ? new Date(end) : null;
    if (endDateObj) endDateObj.setHours(23, 59, 59, 999);

    const results = allTransactions.filter((transaction) => {
      const clientName = transaction.clientName?.clientName?.toLowerCase() || "";
      const transactionDate = new Date(transaction.clientCreatedAt);
      const matchesName = clientName.includes(searchTerm);
      const afterStartDate = !startDateObj || transactionDate >= startDateObj;
      const beforeEndDate = !endDateObj || transactionDate <= endDateObj;
      return matchesName && afterStartDate && beforeEndDate;
    });

    setFilteredTransactions(results);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchName(e.target.value);
    applyFilters(e.target.value, startDate, endDate);
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    applyFilters(searchName, e.target.value, endDate);
  };
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    applyFilters(searchName, startDate, e.target.value);
  };
  
  // --- Action Handlers (Toggle Status) ---
  const togglePaymentStatus = async (id) => {
    setPaymentStatusLoadingId(id);
    try {
      const txToUpdate = allTransactions.find((tx) => tx.id === id);
      if (!txToUpdate) return;
      const newStatus = txToUpdate.paymentstatus === "pending" ? "received" : "pending";
      await fetch(`/api/client-transaction/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentstatus: newStatus }) });
      const update = txs => txs.map(tx => tx.id === id ? { ...tx, paymentstatus: newStatus } : tx);
      setAllTransactions(update);
      setFilteredTransactions(update);
      if (selectedTransaction?.id === id) setSelectedTransaction(prev => ({ ...prev, paymentstatus: newStatus }));
    } catch (error) {
      setError("Failed to update payment status.");
    } finally {
      setPaymentStatusLoadingId(null);
    }
  };

  const toggleWorkStatus = async (transactionId, stageIndex) => {
    setWorkStatusLoadingId({ transactionId, stageIndex });
    try {
      const txToUpdate = allTransactions.find((tx) => tx.id === transactionId);
      if (!txToUpdate || !txToUpdate.workingStage) return;
      const updatedWorkingStage = [...txToUpdate.workingStage];
      const newStatus = updatedWorkingStage[stageIndex].workstatus === "incomplete" ? "complete" : "incomplete";
      updatedWorkingStage[stageIndex] = { ...updatedWorkingStage[stageIndex], workstatus: newStatus };
      await fetch(`/api/client-transaction/${transactionId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workingStage: updatedWorkingStage }) });
      const update = txs => txs.map(tx => tx.id === transactionId ? { ...tx, workingStage: updatedWorkingStage } : tx);
      setAllTransactions(update);
      setFilteredTransactions(update);
      if (selectedTransaction?.id === transactionId) setSelectedTransaction(prev => ({ ...prev, workingStage: updatedWorkingStage }));
    } catch (error) {
      setError("Failed to update work status.");
    } finally {
      setWorkStatusLoadingId(null);
    }
  };

  // --- PDF Generation ---
  const downloadPDF = async () => {
    if (!selectedTransaction) return;
    setIsPdfLoading(true);

    try {
      await loadJsPDF();
      await loadAutoTable();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let startY = margin;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(33, 37, 41);
      doc.text("Client Voucher", pageWidth / 2, startY, { align: "center" });
      startY += 30;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - margin, startY, { align: "right" });
      startY += 10;

      doc.setDrawColor(180);
      doc.line(margin, startY, pageWidth - margin, startY);
      startY += 20;

      // Client Info Table
      const clientInfo = [
        ["Client Name", selectedTransaction.clientName?.clientName || "N/A"],
        ["Mobile", selectedTransaction.clientMobile || "N/A"],
        ["Voucher No", selectedTransaction.voucherNo || "N/A"],
        ["Mining License", selectedTransaction.query_license?.query_license || "N/A"],
        
        ["Created At", `${formatDate(selectedTransaction.clientCreatedAt)} ${formatTime(selectedTransaction.clientCreatedAt)}`]

      ];
      // In the downloadPDF function, replace the Village row with:
["Complete Location", [
  selectedTransaction.state?.state || 'N/A',
  selectedTransaction.district?.district || 'N/A', 
  selectedTransaction.tehsil?.tehsil || 'N/A',
  selectedTransaction.near_village?.near_village || 'N/A'
].join(' • ')]
      doc.autoTable({
        startY,
        body: clientInfo,
        theme: 'grid',
        head: [],
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150 } }
      });

      startY = doc.lastAutoTable.finalY + 20;

      // Work Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 37, 41);
      doc.text("Work & Payment Summary", margin, startY);
      startY += 10;

      doc.autoTable({
        startY,
        head: [['Work Description', 'Status', 'Amount']],
        body: selectedTransaction.workingStage?.map(stage => [
          stage.workingStage || 'N/A',
          stage.workstatus === "complete" ? "Complete" : "Incomplete",
          parseFloat(stage.workingDescription || 0).toFixed(2),
        ]) || [],
        foot: [[
          { content: 'Total Amount', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: selectedTransaction.totalAmount?.toFixed(2) || '0.00', styles: { halign: 'right', fontStyle: 'bold' } }
        ]],
        theme: 'striped',
        headStyles: { fillColor: [52, 58, 64], textColor: 255 },
        footStyles: { fillColor: [222, 226, 230], textColor: 0 },
        columnStyles: { 2: { halign: 'right' } },
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });

      doc.save(`Voucher-${selectedTransaction.voucherNo || 'details'}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // --- Pagination and Rendering ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const renderPagination = () => (
      <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
          {currentPage > 1 && <Button onClick={() => setCurrentPage(currentPage - 1)}><FaAngleLeft /> Prev</Button>}
          {currentPage < totalPages && <Button onClick={() => setCurrentPage(currentPage + 1)}>Next <FaAngleRight /></Button>}
      </div>
  );

  if (isLoading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (userRole && !['admin', 'manager'].includes(userRole)) return <Container className="text-center mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <>
      <Container className="mt-4 mb-5">
        <h4 className="text-center mb-4"><FaClipboard /> View All Client Voucher Transactions</h4>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="text-center fw-semibold">{error}</Alert>}

        <Form className="mb-4">
          <Row className="gy-3">
            <Col xs={12} md={4}><InputGroup><Form.Control type="text" value={searchName} onChange={handleSearch} placeholder="Search by client name..."/><InputGroup.Text><FaSearch /></InputGroup.Text></InputGroup></Col>
            <Col xs={6} md={4}><Form.Control type="date" value={startDate} onChange={handleStartDateChange} /></Col>
            <Col xs={6} md={4}><Form.Control type="date" value={endDate} onChange={handleEndDateChange} /></Col>
          </Row>
        </Form>

        <div className="table-responsive">
          <Table className="table-bordered table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>S.No</th><th>Voucher No</th><th>Client Name</th><th>Created At</th><th>Total Amount (<FaRupeeSign />)</th><th>Payment Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((txn, index) => (
                  <tr key={txn.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="fw-bold">{txn.voucherNo || "N/A"}</td>
                    <td>{txn.clientName?.clientName || "N/A"}</td>
                    <td>{formatDate(txn.clientCreatedAt)}<br/><small className="fw-semibold">{formatTime(txn.clientCreatedAt)}</small></td>
                    <td><FaRupeeSign />{txn.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td><Button variant={txn.paymentstatus === "pending" ? "danger" : "success"} onClick={() => togglePaymentStatus(txn.id)} className="rounded-pill text-capitalize fw-bold" disabled={paymentStatusLoadingId === txn.id}>{paymentStatusLoadingId === txn.id ? <Spinner as="span" animation="border" size="sm"/> : txn.paymentstatus}</Button></td>
                    <td><div className="d-flex flex-wrap justify-content-center gap-2"><Button variant="info" onClick={() => { setSelectedTransaction(txn); setShowModal(true); }}><FaEye /></Button><Button variant="warning" onClick={() => router.push(`/client/transaction/edit/${txn.id}`)}><PencilSquare /></Button></div></td>
                  </tr>
                ))
              ) : (<tr><td colSpan={7} className="fw-semibold text-secondary">No voucher transactions found.</td></tr>)}
            </tbody>
          </Table>
        </div>

        {renderPagination()}

        // Replace the existing Modal section in your VoucherClientTransaction component with this updated version

<Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
  <Modal.Header closeButton className="bg-dark text-white">
    <Modal.Title className="d-flex align-items-center"><FaClipboard className="me-2" />Voucher Details</Modal.Title>
    <Button variant="outline-light" size="sm" className="ms-auto" onClick={downloadPDF} disabled={isPdfLoading}>{isPdfLoading ? <Spinner animation="border" size="sm" /> : <><FaFilePdf className="me-1" /> Download PDF</>}</Button>
  </Modal.Header>
  <Modal.Body className="bg-light p-4">
    {selectedTransaction && (
      <>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="card-title text-primary mb-1"><FaUser className="me-2" />{selectedTransaction.clientName?.clientName || "N/A"}</h5>
                <div className="text-muted small"><FaPhoneAlt className="me-1" /> {selectedTransaction.clientMobile || 'N/A'}</div>
              </div>
              <div className="text-end">
                <div className="text-muted small">Mining License</div>
                <div className="fw-bold">{selectedTransaction.query_license?.query_license || 'N/A'}</div>
              </div>
            </div>
            <hr/>
            <Row className="gy-3">
              <Col xs={12} sm={6} md={4} className="d-flex align-items-center">
                <FaHashtag className="text-secondary me-2 fs-5"/>
                <div>
                  <div className="text-muted small">Voucher No</div>
                  <div className="fw-bold">{selectedTransaction.voucherNo || 'N/A'}</div>
                </div>
              </Col>
              <Col xs={12} className="d-flex align-items-center">
                <FaMapMarkerAlt className="text-secondary me-2 fs-5"/>
                <div>
                  <div className="text-muted small">Complete Location</div>
                  <div className="fw-bold">
                    {[
                      selectedTransaction.state?.state || 'N/A',
                      selectedTransaction.district?.district || 'N/A', 
                      selectedTransaction.tehsil?.tehsil || 'N/A',
                      selectedTransaction.near_village?.near_village || 'N/A'
                    ].join(' • ')}
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Created Date</div>
                <div className="fw-bold">{formatDate(selectedTransaction.clientCreatedAt)}</div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="text-muted small">Payment Status</div>
                <Badge bg={selectedTransaction.paymentstatus === "pending" ? "danger" : "success"} className="p-2 fs-6">{selectedTransaction.paymentstatus}</Badge>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header className="fw-bold">Transaction Summary</Card.Header>
          <Card.Body>
            <h6 className="text-secondary mb-3"><FaWrench className="me-2"/>Work Stage</h6>
            <Table bordered responsive>
              <thead className="table-light"><tr><th>Work Description</th><th>Amount (₹)</th><th>Status</th></tr></thead>
              <tbody>{selectedTransaction.workingStage?.map((stage, index) => (<tr key={index}><td>{stage.workingStage || "N/A"}</td><td className="text-end">{parseFloat(stage.workingDescription)?.toFixed(2) || '0.00'}</td><td className="text-center"><Button variant={stage.workstatus === "incomplete" ? "danger" : "success"} size="sm" className="rounded-pill text-capitalize fw-bold" style={{minWidth: '120px'}} onClick={() => toggleWorkStatus(selectedTransaction.id, index)} disabled={workStatusLoadingId?.transactionId === selectedTransaction.id}>{workStatusLoadingId?.transactionId === selectedTransaction.id && workStatusLoadingId?.stageIndex === index ? <Spinner size="sm" /> : <>{stage.workstatus === "incomplete" ? <FaTimesCircle className="me-1"/> : <FaCheckCircle className="me-1"/>} {stage.workstatus}</>}</Button></td></tr>))}</tbody>
            </Table>
            <div className="text-end bg-white p-3 rounded mt-3 border"><span className="fw-bold text-dark me-2">TOTAL AMOUNT:</span><span className="fs-4 fw-bolder text-danger"><FaRupeeSign /> {selectedTransaction.totalAmount?.toFixed(2) || '0.00'}</span></div>
            {selectedTransaction.description && (<div className="mt-3"><strong className="text-muted">Notes:</strong><p className="border-start border-3 border-secondary ps-2 fst-italic bg-white p-2 rounded">{selectedTransaction.description}</p></div>)}
          </Card.Body>
        </Card>
      </>
    )}
  </Modal.Body>
</Modal>
      </Container>
    </>
  );
};

export default VoucherClientTransaction;