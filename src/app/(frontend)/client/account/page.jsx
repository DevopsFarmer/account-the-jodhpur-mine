"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {Container, Row, Col, Table, Button, Form,InputGroup, Spinner, Alert, Modal, Card} from "react-bootstrap";
import {FaEye, FaTrash, FaSearch, FaClipboard,FaAngleLeft, FaAngleRight} from "react-icons/fa";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata"
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata"
  });

const ViewClientAccount = () => {
  const router = useRouter();

  const [userRole, setUserRole] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountToConfirmDelete, setAccountToConfirmDelete] = useState(null);
  const [message, setMessage] = useState("");

  // Auth check
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserRole(parsed.role);
        if (parsed.role !== "admin" && parsed.role !== "manager") {
          setError("You do not have permission. Redirecting...");
          setTimeout(() => {
            localStorage.clear();
            router.push("/api/logout");
          }, 1500);
        }
      } catch (err) {
        setError("Login again.");
      }
    } else {
      setUserRole("unauthorized");
    }
  }, []);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      if (userRole === "admin" || userRole === "manager") {
        setLoading(true);
        try {
          const res = await axios.get("/api/client-accounts?limit=10000");
          setAllAccounts(res.data.docs);
          setFilteredAccounts(res.data.docs);
        } catch (err) {
          setError("Failed to fetch client accounts.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAccounts();
  }, [userRole]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1);
    const filtered = allAccounts.filter((acc) =>
      acc.clientName?.toLowerCase().includes(value)
    );
    setFilteredAccounts(filtered);
  };

  // Delete account function
  const deleteAccount = async (id) => {
    try {
      await axios.delete(`/api/client-accounts/${id}`);
      const updated = allAccounts.filter((acc) => acc.id !== id);
      setAllAccounts(updated);
      const filtered = updated.filter((acc) =>
        acc.clientName?.toLowerCase().includes(searchTerm)
      );
      setFilteredAccounts(filtered);
      setMessage("Account deleted successfully.");
    } catch {
      setMessage("Failed to delete account.");
    } finally {
      setAccountToConfirmDelete(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const confirmDelete = (acc) => {
    setAccountToConfirmDelete(acc);
    setMessage(`Are you sure you want to delete the account for "${acc.clientName}"?`);
  };

  const cancelDelete = () => {
    setAccountToConfirmDelete(null);
    setMessage("");
  };

  const handleView = (acc) => {
    setSelectedAccount(acc);
    setShowModal(true);
  };

  const currentItems = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const renderPagination = () => {
    const pages = [];
    if (currentPage > 1) {
      pages.push(<Button key="prev" onClick={() => setCurrentPage(currentPage - 1)}><FaAngleLeft /> Prev</Button>);
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
      pages.push(<Button key="next" onClick={() => setCurrentPage(currentPage + 1)}>Next <FaAngleRight /></Button>);
    }
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
      <Container fluid className="py-3">
        <Row className="mb-3 text-center align-items-center">
          <Col xs={12} md={6}>
            <h4><FaClipboard className="me-2" />View Client Accounts</h4>
          </Col>
          <Col xs={12} md={6}>
            <InputGroup style={{ maxWidth: 400 }} className="mx-auto">
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by Client name"
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Col>
        </Row>

        {/* ✅ Global delete confirmation message */}
        {message && (
          <Row className="mb-3">
            <Col xs={12} md={{ span: 10, offset: 1 }}>
              <Alert variant={accountToConfirmDelete ? "warning" : message.toLowerCase().includes("success") ? "success" : "danger"}
                className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 p-3 shadow-sm rounded text-center text-md-start">
                <div className="flex-grow-1">
                  <p className="mb-0 fw-bold fs-5">{message}</p>
                </div>

                {accountToConfirmDelete && (
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Button variant="danger" className="fw-semibold px-3" onClick={() => deleteAccount(accountToConfirmDelete.id)}>Confirm</Button>
                    <Button variant="outline-secondary" className="fw-semibold px-3" onClick={cancelDelete}>Cancel</Button>
                  </div>
                )}
              </Alert>
            </Col>
          </Row>
        )}


        <div className="table-responsive">
          <Table bordered hover className="text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Query License</th>
                <th>Village</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((acc, i) => (
                  <tr key={acc.id}>
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>{acc.clientName}</td>
                    <td>{acc.clientMobile}</td>
                    <td>{acc.query_license}</td>
                    <td>{acc.near_village}</td>
                    <td>{formatDate(acc.clientCreatedAt)}</td>
                    <td>{formatTime(acc.clientCreatedAt)}</td>
                    <td className="d-flex gap-2 justify-content-center flex-wrap">
                      <Button variant="info" onClick={() => handleView(acc)}><FaEye /></Button>
                      <Button variant="danger" onClick={() => confirmDelete(acc)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-secondary fw-bold">No results found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {renderPagination()}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Client Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAccount && (
            <Card>
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6}><strong>Name:</strong> {selectedAccount.clientName}</Col>
                  <Col md={6}><strong>Mobile:</strong> {selectedAccount.clientMobile}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Query License:</strong> {selectedAccount.query_license}</Col>
                  <Col md={6}><strong>Mining License:</strong> {selectedAccount.mining_license || "NA"}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Village:</strong> {selectedAccount.near_village}</Col>
                  <Col md={6}><strong>Tehsil:</strong> {selectedAccount.tehsil || "NA"}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>District:</strong> {selectedAccount.district || "NA"}</Col>
                  <Col md={6}><strong>State:</strong> {selectedAccount.state || "NA"}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Country:</strong> {selectedAccount.country || "NA"}</Col>
                  <Col md={6}><strong>Created At:</strong> {formatDate(selectedAccount.clientCreatedAt)} {formatTime(selectedAccount.clientCreatedAt)}</Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewClientAccount;
