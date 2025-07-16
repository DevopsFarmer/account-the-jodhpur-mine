"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaExchangeAlt, FaWallet, FaReceipt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import "./styles.css";

const cardStyles = {
  base: "text-center w-100 shadow cursor-pointer",
  transition: { cursor: "pointer", transition: "all 0.3s ease" },
};

const Dashboard = () => {
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        setRole(parsed?.role || "");
      }
    }
  }, []);

  const handleClick = (path) => router.push(path);

  const cardData = {
    admin: [
      { icon: <FaExchangeAlt size={60} />, title: "Clients Transaction", text: "View all client transactions", path: "/client/transaction/add", bg: "bg-warning", textColor: "text-dark" },
      { icon: <FaExchangeAlt size={60} />, title: "Vendor Transactions", text: "View all vendor transactions", path: "/vendor/transaction", bg: "bg-dark", textColor: "text-warning" },
      { icon: <FaWallet size={60} />, title: "Client Accounts", text: "Manage client accounts", path: "/client/account", bg: "bg-warning", textColor: "text-dark" },
      { icon: <FaWallet size={60} />, title: "Vendor Accounts", text: "Manage vendor accounts", path: "/vendor/account", bg: "bg-dark", textColor: "text-warning" },
      { icon: <FaReceipt size={65} />, title: "Expenses", text: "Track and manage expenses", path: "/expense", bg: "", textColor: "text-warning", customBg: "navy", border: "border-4 border-warning" },
    ],
    manager: [
      { icon: <FaExchangeAlt size={60} />, title: "Clients Transaction", text: "View all client transactions", path: "/client/transaction/add", bg: "bg-warning", textColor: "text-dark" },
      { icon: <FaExchangeAlt size={60} />, title: "Vendor Transactions", text: "View all vendor transactions", path: "/vendor/transaction", bg: "bg-dark", textColor: "text-warning" },
      { icon: <FaWallet size={60} />, title: "Client Accounts", text: "Manage client accounts", path: "/client/account", bg: "bg-warning", textColor: "text-dark" },
      { icon: <FaWallet size={60} />, title: "Vendor Accounts", text: "Manage vendor accounts", path: "/vendor/account", bg: "bg-dark", textColor: "text-warning" },
    ],
    guest: [
      { icon: <FaReceipt size={65} />, title: "Client Transaction", text: "Add a client transaction", path: "/client/transaction/add-voucher", bg: "bg-warning", textColor: "text-dark" },
      { icon: <FaWallet size={60} />, title: "Add Account", text: "Create a new account", path: "/client/account/add", bg: "bg-warning", textColor: "text-dark" },
    ],
  };

  const renderCards = (items) =>
    items.map((item, i) => (
      <Col xs={12} sm={6} md={4} lg={2} className="d-flex" key={i}>
        <Card
          className={`${cardStyles.base} ${item.bg} ${item.textColor} ${item.border || ""}`}
          style={{ ...cardStyles.transition, backgroundColor: item.customBg }}
          onClick={() => handleClick(item.path)}
        >
          <Card.Body className="d-flex flex-column align-items-center">
            {item.icon}
            <Card.Title className="fs-5 fw-bold">{item.title}</Card.Title>
            <Card.Text className="fs-6 fw-bold">{item.text}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    ));

  return (
    <div className="min-vh-100" style={{
      backgroundColor: '#1a237e',
      backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #1a488b 100%)',
    }}>
      <Container className="text-center py-4">
        <h2 className="fw-bold text-warning">JODHPUR MINES</h2>
        <p className="text-light fs-5 fw-medium">Financial Management System Dashboard</p>
      </Container>

      <Container fluid className="pb-5" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Row className="gx-4 gy-4 d-flex flex-wrap justify-content-center">
          {renderCards(cardData[role] || [])}
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
