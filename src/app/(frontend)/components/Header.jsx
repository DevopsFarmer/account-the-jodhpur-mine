

"use client"; // Required for using localStorage and useRouter in Next.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Navigation hook in Next.js
import { Container, Navbar, Nav, Button, NavDropdown, Offcanvas, } from "react-bootstrap";

const Header = () => {
  const router = useRouter(); // Allows programmatic navigation (e.g., after logout)
  const [role, setRole] = useState(""); // Role: 'admin' or 'manager' or 'guest'

  // Read role from localStorage only after component loads (client-side)
  useEffect(() => {
    let Userdata;
    let Token;
    // Check if we are in the browser environment (not server-side)
    if (typeof window !== "undefined") {
      // Try to get the saved user data from localStorage
      Userdata = localStorage.getItem("user");
      Token = localStorage.getItem("token");
    } else {
      // If not in browser, user data is null
      Userdata = null;
      Token = null;
    }
    // Set the user's role based on the data we got from localStorage If user data exists, parse it from JSON and get the role If there is no role or no user data, default to "guest"
    let UserRole;
    if (Userdata) {
      const parsedUser = JSON.parse(Userdata); // Convert string to object
      UserRole = parsedUser.role ? parsedUser.role : ""; // Get role or set to "guest"
      //console.log("User Role:", UserRole);
      setRole(UserRole);
    }

  }, []);

  // Handle logout by removing login info and redirecting to login page
  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/api/logout'
  }

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="mb-3">
      <Container fluid className="text-capitalize">

        {/* Brand name: always visible */}
        <Navbar.Brand as={Link} href="/dashboard" className="fs-5 fw-bold">
          JODHPUR MINES
        </Navbar.Brand>

        {/* Toggle button for mobile menu */}
        <Navbar.Toggle aria-controls="offcanvasNavbar" />

        {/* Offcanvas menu (responsive) */}
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          className="bg-dark text-white"
        >
          {/* Header for offcanvas menu */}
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title id="offcanvasNavbarLabel" className="fs-5 fw-bold">
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>

          {/* Body of offcanvas menu */}
          <Offcanvas.Body>
            <Nav className="flex-grow-1 pe-3 text-capitalize fw-bold fs-5 justify-content-md-start align-items-md-center">
              {/* Admin Role Menus */}
              {role === "admin" && (
                <>
                  <NavDropdown title="Client Accounts" id="admin-client-acc">
                    <NavDropdown.Item as={Link} href="/addclient-account">
                      Add Client Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewclient-account">
                      View Client Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Client Transactions" id="admin-client-trans">
                    <NavDropdown.Item as={Link} href="/addclient-transaction">
                      Add Client Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewclient-transaction">
                      View Client Transaction
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Accounts" id="admin-vendor-acc">
                    <NavDropdown.Item as={Link} href="/addvendor-account">
                      Add Vendor Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewvendor-account">
                      View Vendor Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Transactions" id="admin-vendor-trans">
                    <NavDropdown.Item as={Link} href="/addvendor-transaction">
                      Add Vendor Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewvendor-transaction">
                      View Vendor Transaction
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Expense" id="admin-expense">
                    <NavDropdown.Item as={Link} href="/add-expense">
                      Add Expense
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/view-expense">
                      View Expense
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}

              {/* Manager Role Menus */}
              {role === "manager" && (
                <>
                  <NavDropdown title="Client Accounts" id="manager-client-acc">
                    <NavDropdown.Item as={Link} href="/addclient-account">
                      Add Client Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewclient-account">
                      View Client Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Client Transactions" id="manager-client-trans">
                    <NavDropdown.Item as={Link} href="/addclient-transaction">
                      Add Client Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewclient-transaction">
                      View Client Transaction
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Accounts" id="manager-vendor-acc">
                    <NavDropdown.Item as={Link} href="/addvendor-account">
                      Add Vendor Account
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewvendor-account">
                      View Vendor Account
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Vendor Transactions" id="manager-vendor-trans">
                    <NavDropdown.Item as={Link} href="/addvendor-transaction">
                      Add Vendor Transaction
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} href="/viewvendor-transaction">
                      View Vendor Transaction
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              )}
              {/* Client Role Menu Bar */}
              {role === "guest" && (
                <Nav.Link as={Link} href="/client-transaction" className="text-white" active>
                  Add Client Transaction
                </Nav.Link>
              )}
            </Nav>

            {/* Logout button: full width on mobile, auto width on large screens */}
            <div className="my-2">
              <Button variant="outline-light" onClick={handleLogout} className="w-100 w-lg-auto fs-6 fw-bold text-capitalize text-center justify-content-center align-items-center">
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