
"use client"; 
import React from "react"; 
import { Container, Row, Col, Card, Navbar, Nav, Button } from "react-bootstrap";

import { FaExchangeAlt, FaWallet, FaReceipt } from "react-icons/fa"; 

import { useRouter } from "next/navigation"; 
import "./styles.css"; 

const Dashboard = () => {
  const router = useRouter();

  let Userdata;
  let Token;
  if (typeof window !== "undefined") {
    Userdata = localStorage.getItem("user");
    Token = localStorage.getItem("token");
  } else {
    Userdata = null;
    Token = null;
    Userdata = null;
    Token = null;
  }

  let UserRole;
  if (Userdata) {
    const parsedUser = JSON.parse(Userdata); // Convert string to object
    UserRole = parsedUser.role ? parsedUser.role : ""; // Get role or set to "client"
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <div className="min-vh-100" style={{
      backgroundColor: '#1a237e',
      backgroundImage: 'linear-gradient(135deg,rgb(10, 10, 10) 0%,rgb(26, 72, 139) 100%)',
     
    }}>
      <Container className="text-center py-4" > 
        <h2 className="fw-bold text-warning">JODHPUR MINES</h2>
        <p className="text-light fs-5 fw-medium">
          Financial Management System Dashboard
        </p>
      </Container>

      <Container fluid className="pb-5" style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}> 
        <Row className="gx-4 gy-4 d-flex flex-wrap justify-content-center">
          {UserRole === "manager" && (
            <>
              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-warning text-dark w-100 shadow  cursor-pointer hover:bg-dark hover:text-warning hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/client/transaction")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaExchangeAlt size={60} className="mb-3 text-dark hover:text-warning" />
                    <Card.Title className="fs-5 fw-bold">Clients Transaction</Card.Title>
                    <Card.Text className="fs-6 fw-bold">View all client transactions</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-dark text-warning w-100 shadow  cursor-pointer hover:bg-warning hover:text-dark hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/vendor/transaction")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaExchangeAlt size={60} className="mb-3 text-warning hover:text-dark" />
                    <Card.Title className="fs-5 fw-bold">Vendor Transactions</Card.Title>
                    <Card.Text className="fs-6 fw-bold">View all vendor transactions</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-warning text-dark w-100 shadow  cursor-pointer hover:bg-dark hover:text-warning hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/client/account")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaWallet size={60} className="mb-3 text-dark hover:text-warning" />
                    <Card.Title className="fs-5 fw-bold">Client Accounts</Card.Title>
                    <Card.Text className="fs-6 fw-bold">Manage client accounts</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-dark text-warning w-100 shadow  cursor-pointer hover:bg-warning hover:text-dark hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/vendor/account")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaWallet size={60} className="mb-3 text-warning hover:text-dark" />
                    <Card.Title className="fs-5 fw-bold">Vendor Accounts</Card.Title>
                    <Card.Text className="fs-6 fw-bold">Manage vendor accounts</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}

          {(UserRole === "admin") && (
            <>
              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-warning text-dark w-100 shadow  cursor-pointer hover:bg-dark hover:text-warning hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/client/transaction")} >
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaExchangeAlt size={60} className="mb-3 text-dark hover:text-warning" />
                    <Card.Title className="fs-5 fw-bold">Clients Transaction</Card.Title>
                    <Card.Text className="fs-6 fw-bold">View all client transactions</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-dark text-warning w-100 shadow  cursor-pointer hover:bg-warning hover:text-dark hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/vendor/transaction")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaExchangeAlt size={60} className="mb-3 text-warning hover:text-dark" />
                    <Card.Title className="fs-5 fw-bold">Vendor Transactions</Card.Title>
                    <Card.Text className="fs-6 fw-bold">View all vendor transactions</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-warning text-dark w-100 shadow  cursor-pointer hover:bg-dark hover:text-warning hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/client/account")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaWallet size={60} className="mb-3 text-dark hover:text-warning" />
                    <Card.Title className="fs-5 fw-bold">Client Accounts</Card.Title>
                    <Card.Text className="fs-6 fw-bold">Manage client accounts</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-dark text-warning w-100 shadow  cursor-pointer hover:bg-warning hover:text-dark hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/vendor/account")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaWallet size={60} className="mb-3 text-warning hover:text-dark" />
                    <Card.Title className="fs-5 fw-bold">Vendor Accounts</Card.Title>
                    <Card.Text className="fs-6 fw-bold">Manage vendor accounts</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center w-100 shadow border-4 border-warning cursor-pointer"
                  style={{ backgroundColor: "navy" }} text="warning" onClick={() => router.push("/expense")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaReceipt size={65} className="mb-3 text-warning" />
                    <Card.Title className="fs-3 fw-bold">Expenses</Card.Title>
                    <Card.Text className="fs-6 fw-bold">Track and manage expenses</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}

          {UserRole === "guest" && (
            <>
              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
                <Card className="text-center bg-warning text-dark w-100 shadow  cursor-pointer hover:bg-dark hover:text-warning hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/client/transaction")}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaReceipt size={65} className="mb-3 text-dark hover:text-warning" />
                    <Card.Title className="fs-3 fw-bold">Client Transaction</Card.Title>
                    <Card.Text className="fs-6 fw-bold">Add a client transactions</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4} lg={2} className="d-flex">
  <Card className="text-center bg-warning text-dark w-100 shadow  cursor-pointer hover:bg-dark hover:text-warning hover:shadow-lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => router.push("/client/account/add")}>  
    <Card.Body className="d-flex flex-column align-items-center">
      <FaWallet size={60} className="mb-3 text-dark hover:text-warning" />
      <Card.Title className="fs-5 fw-bold">Add Account</Card.Title>
      <Card.Text className="fs-6 fw-bold">Create a new account</Card.Text>
    </Card.Body>
  </Card>
</Col>
            </>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;