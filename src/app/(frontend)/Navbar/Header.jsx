

"use client"; 
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Container, Navbar, Nav, Button, NavDropdown, Offcanvas, } from "react-bootstrap";
import "./styles.css";

const Header = () => {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
  } 

  useEffect(() => {
    let Userdata;
    let Token;
    if (typeof window !== "undefined") {
      Userdata = localStorage.getItem("user");
      Token = localStorage.getItem("token");
    } else {
      Userdata = null;
      Token = null;
    }
    let UserRole;
    if (Userdata) {
      const parsedUser = JSON.parse(Userdata); 
      UserRole = parsedUser.role ? parsedUser.role : ""; 
      setRole(UserRole);
    }

  }, []);

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/api/logout'
  }

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="pb-3">
      <Container fluid className="text-capitalize">

        <Link href="/" className="d-flex align-items-center">
          <img src="/png.png" alt="Aruna Logo" className="navbar-logo" />
        </Link>
        <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={() => setShow(!show)} />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          className="bg-dark text-white"
          show={show}
          onHide={handleClose}
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title id="offcanvasNavbarLabel" className="fs-5 fw-bold">
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="flex-grow-1 pe-3 text-capitalize fw-bold fs-5 justify-content-md-start align-items-md-center">
              {role === "admin" && (
                <>
                  <NavDropdown title="Client Accounts" id="admin-client-acc">
                    <NavDropdown.Item as={Link} href="/client/account/add" onClick={handleClose}>
                      Add Client Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/client/account/view" onClick={handleClose}>
                      View Client Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Client Transactions" id="admin-client-trans">
                  <NavDropdown.Item as={Link} href="/client/transaction/add" onClick={handleClose}>
                      Add Client Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/client/transaction/view" onClick={handleClose}>
                      View Client Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/client/transaction/voucher" onClick={handleClose}>
                      Voucher Client Transaction
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Accounts" id="admin-vendor-acc">
                  <NavDropdown.Item as={Link} href="/vendor/account/add" onClick={handleClose}>
                      Add Vendor Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/vendor/account" onClick={handleClose}>
                      View Vendor Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Transactions" id="admin-vendor-trans">
                    <NavDropdown.Item as={Link} href="/vendor/transaction/add" onClick={handleClose}>
                      Add Vendor Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/vendor/transaction" onClick={handleClose}>
                      View Vendor Transaction
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Expense" id="admin-expense">
                    <NavDropdown.Item as={Link} href="/expense/add" onClick={handleClose}>
                      Add Expense
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/expense" onClick={handleClose}>
                      View Expense
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}

              {role === "manager" && (
                <>
                  <NavDropdown title="Client Accounts" id="manager-client-acc">
                    <NavDropdown.Item as={Link} href="/client/account/add" onClick={handleClose}>
                      Add Client Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/client/account/view" onClick={handleClose}>
                      View Client Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Client Transactions" id="manager-client-trans">
                    <NavDropdown.Item as={Link} href="/client/transaction/add" onClick={handleClose}>
                      Add Client Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/client/transaction/view" onClick={handleClose}>
                      View Client Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/client/transaction/voucher" onClick={handleClose}>
                      Voucher Client Transaction
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Accounts" id="manager-vendor-acc">
                    <NavDropdown.Item as={Link} href="/vendor/account/add" onClick={handleClose}>
                      Add Vendor Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/vendor/account" onClick={handleClose}>
                      View Vendor Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Transactions" id="manager-vendor-trans">
                    <NavDropdown.Item as={Link} href="/vendor/transaction/add" onClick={handleClose}>
                      Add Vendor Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/vendor/transaction" onClick={handleClose}>
                      View Vendor Transaction
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}
              {role === "guest" && (
                <Nav.Link as={Link} href="/client/transaction" className="text-white" active onClick={handleClose}>
                  Add Client Transaction
                </Nav.Link>
              )}
            </Nav>

            <div className="my-2">
              <Button variant="outline-light" onClick={handleLogout}  className="w-100 w-lg-auto fs-6 fw-bold text-capitalize text-center justify-content-center align-items-center">
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