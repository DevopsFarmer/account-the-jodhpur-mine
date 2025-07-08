
'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Modal, Card, Row, Col, Form,InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaTrash, FaSearch, FaClipboard, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: "Asia/Kolkata" };
  try {
    return new Date(dateString).toLocaleDateString('en-GB', options);
  } catch {
    return "Invalid Date";
  }
};

const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: "Asia/Kolkata" };
  try {
    return new Date(dateString).toLocaleTimeString('en-US', options);
  } catch {
    return "Invalid Time";
  }
};

const ViewVendorAccount = () => {
  const router = useRouter();

  const [userRole, setUserRole] = useState(null);
  const [allVendorAccounts, setAllVendorAccounts] = useState([]);
  const [filteredVendorAccounts, setFilteredVendorAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVendorAccount, setSelectedVendorAccount] = useState(null);

  // 🔁 New delete confirmation states
  const [vendorToConfirmDelete, setVendorToConfirmDelete] = useState(null);
  const [message, setMessage] = useState('');

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserRole(parsed.role);
        if (parsed.role !== "admin" && parsed.role !== "manager") {
          setError("You do not have permission to access this page. Redirecting...");
          setTimeout(() => {
            localStorage.clear();
            router.push("/api/logout");
          }, 1500);
        } else {
          setLoading(false);
        }
      } catch {
        setError("Login again.");
      }
    }
  }, [router]);

  useEffect(() => {
    if (userRole === "admin" || userRole === "manager") {
      const fetchVendors = async () => {
        setLoading(true);
        try {
          const response = await axios.get("/api/vendor?limit=10000");
          const data = response.data.docs || [];
          setAllVendorAccounts(data);
          setFilteredVendorAccounts(data);
        } catch {
          setError("Failed to load vendor accounts. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchVendors();
    }
  }, [userRole]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1);
    const filtered = allVendorAccounts.filter((vendor) =>
      vendor.vendorName?.toLowerCase().includes(value) ||
      vendor.vendorMobile?.includes(value) ||
      vendor.query_license?.toLowerCase().includes(value) ||
      vendor.mining_license?.toLowerCase().includes(value)
    );
    setFilteredVendorAccounts(filtered);
  };

  const confirmDelete = (vendor) => {
    setVendorToConfirmDelete(vendor);
    setMessage(`Are you sure you want to delete the account for "${vendor.vendorName}"?`);
  };

  const cancelDelete = () => {
    setVendorToConfirmDelete(null);
    setMessage('');
  };

  const deleteVendorAccount = async (vendorId) => {
    try {
      await axios.delete(`/api/vendor/${vendorId}`);
      const updatedAll = allVendorAccounts.filter((v) => v.id !== vendorId);
      setAllVendorAccounts(updatedAll);

      const updatedFiltered = updatedAll.filter(
        (vendor) =>
          vendor.vendorName?.toLowerCase().includes(searchTerm) ||
          vendor.vendorMobile?.includes(searchTerm) ||
          vendor.query_license?.toLowerCase().includes(searchTerm) ||
          vendor.mining_license?.toLowerCase().includes(searchTerm)
      );
      setFilteredVendorAccounts(updatedFiltered);
      setMessage("Vendor account deleted successfully.");
    } catch (error) {
      console.error('Error deleting vendor:', error);
      setMessage("Failed to delete vendor account. Please try again.");
    } finally {
      setVendorToConfirmDelete(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleView = (vendor) => {
    setSelectedVendorAccount(vendor);
    setShowModal(true);
  };

  const totalPages = Math.ceil(filteredVendorAccounts.length / itemsPerPage);
  const currentVendors = filteredVendorAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    const pages = [];

    if (currentPage > 1) pages.push(<Button key="prev" onClick={() => setCurrentPage(currentPage - 1)}><FaAngleLeft /> Prev</Button>);
    if (currentPage > 2) pages.push(<span key="start-ellipsis">...</span>);

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? "dark" : "outline-primary"}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      }
    }

    if (currentPage < totalPages - 1) pages.push(<span key="end-ellipsis">...</span>);
    if (currentPage < totalPages) pages.push(<Button key="next" onClick={() => setCurrentPage(currentPage + 1)}>Next <FaAngleRight /></Button>);

    return <div className="d-flex flex-wrap gap-2 justify-content-center my-3">{pages}</div>;
  };

  if (loading || userRole === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
        <p className="ms-2">Loading...</p>
      </div>
    );
  }

  if (userRole !== "admin" && userRole !== "manager") {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger"><FaClipboard className="me-2" /> {error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="py-3 text-capitalize">
        <Row className="text-center align-items-center mb-3">
          <Col xs={12} md={6}>
            <h4 className="fw-bold">
              <FaClipboard className="me-2" />
              View All Vendor's Accounts
            </h4>
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className="mx-auto w-75">
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by Name, Mobile, License"
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Col>
        </Row>

        {/* ✅ Message / Confirmation Alert */}
        {message && (
          <Row className="mb-3">
            <Col xs={12} md={{ span: 10, offset: 1 }}>
              <Alert
                variant={
                  vendorToConfirmDelete ? "warning" :
                    message.toLowerCase().includes("success") ? "success" : "danger"
                }
                className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 p-3 shadow-sm rounded text-center text-md-start"
              >
                <div className="flex-grow-1">
                  <p className="mb-0 fw-bold fs-5">{message}</p>
                </div>
                {vendorToConfirmDelete && (
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Button variant="danger" onClick={() => deleteVendorAccount(vendorToConfirmDelete.id)}>
                      Confirm
                    </Button>
                    <Button variant="outline-secondary" onClick={cancelDelete}>
                      Cancel
                    </Button>
                  </div>
                )}
              </Alert>
            </Col>
          </Row>
        )}

        <div className="table-responsive">
          <Table className="table-bordered table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Query License</th>
                <th>Nearby Village</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVendors.length > 0 ? (
                currentVendors.map((vendor, index) => (
                  <tr key={vendor.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{vendor.vendorName || "N/A"}</td>
                    <td>{vendor.vendorMobile || "N/A"}</td>
                    <td>{vendor.query_license || "NA"}</td>
                    <td>{vendor.near_village || "NA"}</td>
                    <td>{formatDate(vendor.createdAt)}</td>
                    <td>{formatTime(vendor.createdAt)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <Button variant="info" onClick={() => handleView(vendor)}><FaEye /></Button>
                        <Button variant="danger" onClick={() => confirmDelete(vendor)}><FaTrash /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-secondary fw-bold fs-5">No Vendor Accounts Found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {renderPagination()}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Vendor Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendorAccount && (
            <Card>
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6}><strong>Name:</strong> {selectedVendorAccount.vendorName}</Col>
                  <Col md={6}><strong>Mobile:</strong> {selectedVendorAccount.vendorMobile}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Query License:</strong> {selectedVendorAccount.query_license}</Col>
                  <Col md={6}><strong>Mining License:</strong> {selectedVendorAccount.mining_license || "NA"}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Nearby Village:</strong> {selectedVendorAccount.near_village || "NA"}</Col>
                  <Col md={6}><strong>Tehsil:</strong> {selectedVendorAccount.tehsil || "NA"}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>District:</strong> {selectedVendorAccount.district || "NA"}</Col>
                  <Col md={6}><strong>State:</strong> {selectedVendorAccount.state || "NA"}</Col>
                </Row>
                <Row>
                  <Col md={6}><strong>Country:</strong> {selectedVendorAccount.country || "NA"}</Col>
                  <Col md={6}><strong>Created At:</strong> {formatDate(selectedVendorAccount.createdAt)} {formatTime(selectedVendorAccount.createdAt)}</Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewVendorAccount;


