"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import navItems from "./navItems";
import { Container, Navbar, Nav, Button, NavDropdown, Offcanvas } from "react-bootstrap";
import "./styles.css";

const Header = () => {
  const [role, setRole] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const user = typeof window !== "undefined" && localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setRole(parsed?.role || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/api/logout";
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="pb-3">
      <Container fluid className="text-capitalize">
        <Link href="/" className="d-flex align-items-center">
          <img src="/png.png" alt="Logo" className="navbar-logo" />
        </Link>

        <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={() => setShow(!show)} />

        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          className="bg-dark text-white"
          show={show}
          onHide={() => setShow(false)}
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="fs-5 fw-bold">Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="flex-grow-1 pe-3 text-capitalize fw-bold fs-5">
              {(navItems[role] || []).map((section, i) =>
                section.title ? (
                  <NavDropdown title={section.title} key={i} id={`nav-${i}`}>
                    {section.links.map((item, j) => (
                      <NavDropdown.Item as={Link} href={item.href} key={j} onClick={() => setShow(false)}>
                        {item.label}
                      </NavDropdown.Item>
                    ))}
                  </NavDropdown>
                ) : (
                  section.links.map((item, j) => (
                    <Nav.Link
                      as={Link}
                      href={item.href}
                      key={j}
                      className="text-white"
                      onClick={() => setShow(false)}
                    >
                      {item.label}
                    </Nav.Link>
                  ))
                )
              )}
            </Nav>

            <div className="my-2">
              <Button variant="outline-light" onClick={handleLogout} className="w-100 fs-6 fw-bold">
                Logout
              </Button>
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Header;
