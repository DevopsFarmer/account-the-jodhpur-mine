//pages/viewvendor-account.jsx
// 'use client'; // Important for client-side logic like localStorage
// import React, { useEffect, useState } from 'react';
// import {Container,Table,Button,Modal,Card,Row,Col,Form,Badge,InputGroup,} from 'react-bootstrap';
// import { FaEye, FaTrash, FaSearch } from 'react-icons/fa';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faClipboard } from '@fortawesome/free-solid-svg-icons';
// import Header from '../components/Header';

// const ViewVendorAccount = () => {
//   const [vendorAccounts, setVendorAccounts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredVendorAccounts, setFilteredVendorAccounts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedVendorAccount, setSelectedVendorAccount] = useState(null);

//   // Load from localStorage on component mount
//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem('vendorAccounts') || '[]');
//     setVendorAccounts(stored);
//     setFilteredVendorAccounts(stored);
//   }, []);

//   // Search handler
//   const handleSearch = (e) => {
//     const term = e.target.value.toLowerCase();
//     setSearchTerm(term);
//     const results = vendorAccounts.filter((acc) =>
//       acc.name.toLowerCase().includes(term)
//     );
//     setFilteredVendorAccounts(results);
//   };

//   // Delete vendor
//   const deleteVendorAccount = (indexToDelete) => {
//     const updated = vendorAccounts.filter((_, i) => i !== indexToDelete);
//     setVendorAccounts(updated);
//     setFilteredVendorAccounts(updated);
//     localStorage.setItem('vendorAccounts', JSON.stringify(updated));
//   };

//   // Toggle status (Active/Inactive)
//   const toggleStatus = (index) => {
//     const updated = [...vendorAccounts];
//     updated[index].status = !updated[index].status;
//     setVendorAccounts(updated);
//     setFilteredVendorAccounts(updated);
//     localStorage.setItem('vendorAccounts', JSON.stringify(updated));
//   };

//   // View account in modal
//   const handleView = (account) => {
//     setSelectedVendorAccount(account);
//     setShowModal(true);
//   };

//   return (
//     <>
//       <Header />
//       <Container className="mt-4 text-capitalize">
//         {/* 🔍 Title and Search */}
//         <Row className="mb-4 justify-content-between align-items-center px-2">
//           <Col xs={12} md={6} className="mb-3 mb-md-0 text-center text-md-start">
//             <h4 className="fw-bold">
//               <FontAwesomeIcon icon={faClipboard} /> View All Vendor's Account
//             </h4>
//           </Col>
//           <Col xs={12} md={6}>
//             <InputGroup>
//               <InputGroup.Text><FaSearch /></InputGroup.Text>
//               <Form.Control
//                 type="text"
//                 placeholder="Search Vendor's By Name"
//                 value={searchTerm}
//                 onChange={handleSearch}
//               />
//             </InputGroup>
//           </Col>
//         </Row>

//         {/* 📋 Vendor Table */}
//         <Table
//           striped
//           bordered
//           hover
//           responsive
//           className="text-center align-middle table-striped border-dark"
//         >
//           <thead className="table-dark">
//             <tr>
//               <th>S.No</th>
//               <th>Name</th>
//               <th>Mobile</th>
//               <th>Query License</th>
//               <th>Mining License</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredVendorAccounts.length > 0 ? (
//               filteredVendorAccounts.map((account, index) => (
//                 <tr key={index}>
//                   <td>{index + 1}</td>
//                   <td>{account.name}</td>
//                   <td>{account.mobile}</td>
//                   <td>{account.queryLicense}</td>
//                   <td>{account.miningLicense}</td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant={account.status ? 'success' : 'danger'}
//                       onClick={() => toggleStatus(index)}
//                     >
//                       {account.status ? 'Active' : 'Inactive'}
//                     </Button>
//                   </td>
//                   <td>
//                     <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
//                       <Button
//                         size="sm"
//                         variant="info"
//                         onClick={() => handleView(account)}
//                       >
//                         <FaEye />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="warning"
//                         onClick={() => deleteVendorAccount(index)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="text-center text-muted fs-5">
//                   No Vendor accounts found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>

//         {/* 👁️ View Modal */}
//         <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
//           <Modal.Header closeButton>
//             <Modal.Title>Vendor Details</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {selectedVendorAccount && (
//               <Card className="shadow-sm border-0">
//                 <Card.Body>
//                   <Row className="mb-3">
//                     <Col xs={12} md={6}>
//                       <strong>Name:</strong> {selectedVendorAccount.name}
//                     </Col>
//                     <Col xs={12} md={6}>
//                       <strong>Mobile:</strong> {selectedVendorAccount.mobile}
//                     </Col>
//                   </Row>
//                   <Row className="mb-3">
//                     <Col xs={12} md={6}>
//                       <strong>Query License:</strong> {selectedVendorAccount.queryLicense}
//                     </Col>
//                     <Col xs={12} md={6}>
//                       <strong>Mining License:</strong> {selectedVendorAccount.miningLicense}
//                     </Col>
//                   </Row>
//                   <Row className="mb-3">
//                     <Col xs={12} md={6}>
//                       <strong>Village:</strong> {selectedVendorAccount.village}
//                     </Col>
//                     <Col xs={12} md={6}>
//                       <strong>Tehsil:</strong> {selectedVendorAccount.tehsil}
//                     </Col>
//                   </Row>
//                   <Row className="mb-3">
//                     <Col xs={12} md={4}>
//                       <strong>District:</strong> {selectedVendorAccount.district}
//                     </Col>
//                     <Col xs={12} md={4}>
//                       <strong>State:</strong> {selectedVendorAccount.state}
//                     </Col>
//                     <Col xs={12} md={4}>
//                       <strong>Country:</strong> {selectedVendorAccount.country}
//                     </Col>
//                   </Row>
//                   <Row className="border-top pt-3">
//                     <Col>
//                       <strong>Status:</strong>
//                       <Badge
//                         bg={selectedVendorAccount.status ? 'success' : 'danger'}
//                         className="ms-2 px-3 py-2 fs-6"
//                       >
//                         {selectedVendorAccount.status ? 'Active' : 'Inactive'}
//                       </Badge>
//                     </Col>
//                   </Row>
//                   <Row className="border-top pt-3 mt-2">
//                     <Col>
//                       <strong>Created At:</strong> {selectedVendorAccount.createdAt}
//                     </Col>
//                   </Row>
//                 </Card.Body>
//               </Card>
//             )}
//           </Modal.Body>
//         </Modal>
//       </Container>
//     </>
//   );
// };
// export default ViewVendorAccount;

'use client'; // Enables client-side interactivity in Next.js

import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Modal, Card, Row, Col, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaTrash, FaSearch, FaClipboard } from 'react-icons/fa'; // Using FaClipboard from react-icons
import Header from '../components/Header'; // Reusing the Header component
import axios from 'axios'; // Importing axios for easier API calls

// Helper function to format date to DD/MM/YYYY
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // British format = DD/MM/YYYY
};

// Helper function to format time to HH:MM:SS AM/PM
const formatTime = (dateString) => {
  const time = new Date(dateString);
  return time.toLocaleTimeString('en-US'); // US format = HH:MM:SS AM/PM
};

const ViewVendorAccount = () => {
  // State to hold all vendor accounts fetched from the API
  const [vendorAccounts, setVendorAccounts] = useState([]);
  // State to hold vendor accounts after applying search filter
  const [filteredVendorAccounts, setFilteredVendorAccounts] = useState([]);
  // State to store the user's search input
  const [searchTerm, setSearchTerm] = useState('');
  // State to control the loading spinner visibility
  const [loading, setLoading] = useState(true);
  // State to store and display any error messages
  const [error, setError] = useState('');
  // State to control the visibility of the detailed view modal
  const [showModal, setShowModal] = useState(false);
  // State to store the vendor account data to be displayed in the modal
  const [selectedVendorAccount, setSelectedVendorAccount] = useState(null);

  // useEffect hook to fetch vendor data when the component first loads
  useEffect(() => {
    const fetchVendorAccounts = async () => {
      try {
        // Make GET request to the vendor API endpoint
        const response = await axios.get('/api/vendor');
        // Payload CMS usually returns data in a 'docs' array
        const data = response.data.docs || [];
        setVendorAccounts(data); // Update the main vendor accounts list
        setFilteredVendorAccounts(data); // Initialize filtered list with all accounts
      } catch (err) {
        // If there's an error, set the error message
        setError('Failed to load vendor accounts. Please try again.');
        console.error('Error fetching vendors:', err);
      } finally {
        // Always stop loading, whether success or error
        setLoading(false);
      }
    };

    fetchVendorAccounts(); // Call the fetch function
  }, []); // Empty dependency array means this runs once on component mount

  // Function to handle changes in the search input field
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase(); // Get input value and convert to lowercase
    setSearchTerm(value); // Update search term state

    // Filter the vendor accounts based on the search term
    const results = vendorAccounts.filter(
      (vendor) =>
        vendor.vendorName?.toLowerCase().includes(value) || // Search by vendor name
        vendor.vendorMobile?.includes(value) || // Search by vendor mobile
        vendor.query_license?.toLowerCase().includes(value) || // Search by query license
        vendor.mining_license?.toLowerCase().includes(value) // Search by mining license
    );
    setFilteredVendorAccounts(results); // Update the filtered list
  };

  // Function to handle deleting a vendor account
  const deleteVendorAccount = async (vendorId) => {
    // Ask for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this vendor account?')) {
      try {
        // Make DELETE request to the API endpoint with the vendor ID
        await axios.delete(`/api/vendor/${vendorId}`);
        // If deletion is successful, update the state by removing the deleted vendor
        const updatedList = vendorAccounts.filter((v) => v.id !== vendorId);
        setVendorAccounts(updatedList);
        setFilteredVendorAccounts(updatedList);
      } catch (error) {
        // If there's an error during deletion, show an alert
        alert('Error deleting vendor account. Please try again.');
        console.error('Error deleting vendor:', error);
      }
    }
  };

  // Function to handle viewing a vendor's detailed information in a modal
  const handleView = (vendor) => {
    setSelectedVendorAccount(vendor); // Set the selected vendor data
    setShowModal(true); // Open the modal
  };

  return (
    <>
      <Header /> {/* Renders the common Header component */}

      <Container fluid className="py-3 text-capitalize"> {/* Main container for the page */}
        {/* Page Title and Search Bar Section */}
        <Row className="text-center align-items-center mb-3">
          <Col xs={12} md={6}>
            <h4 className="fw-bold">
              <FaClipboard className="me-2" /> {/* Clipboard icon */}
              View All Vendor's Accounts
            </h4>
          </Col>
          <Col xs={12} md={6} className="mt-2 mt-md-0">
            <InputGroup className="mx-auto w-75">
              <InputGroup.Text>
                <FaSearch /> {/* Search icon */}
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by Name, Mobile, License" // Placeholder text for search
                value={searchTerm}
                onChange={handleSearch} // Call handleSearch when input changes
              />
            </InputGroup>
          </Col>
        </Row>

        {/* Conditional Rendering: Loading, Error, or Table */}
        {loading ? ( // Show spinner if data is still loading
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading vendor accounts...</p>
          </div>
        ) : error ? ( // Show error alert if there was an error fetching data
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : (
          // Display the table if data is loaded successfully
          <div className="table-responsive">
            <Table className="table-bordered table-hover text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Query License</th>
                  <th>Mining License</th>
                  <th>Created Date</th>
                  <th>Created Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendorAccounts.length > 0 ? ( // Check if there are accounts to display
                  filteredVendorAccounts.map((vendor, index) => (
                    <tr key={vendor.id}>
                      <td>{index + 1}</td>
                      <td>{vendor.vendorName}</td>
                      <td>{vendor.vendorMobile}</td>
                      <td>{vendor.query_license||"-"}</td>
                      <td>{vendor.mining_license||"-"}</td>
                      <td>{formatDate(vendor.createdAt)}</td> {/* Formatted creation date */}
                      <td>{formatTime(vendor.createdAt)}</td> {/* Formatted creation time */}
                      <td>
                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                          <Button variant="info" onClick={() => handleView(vendor)}>
                            <FaEye className="fs-5 fw-bold" /> {/* View icon */}
                          </Button>
                          <Button variant="danger" onClick={() => deleteVendorAccount(vendor.id)}>
                            <FaTrash className="fs-5 fw-bold" /> {/* Delete icon */}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Display message if no vendor accounts are found after filtering
                  <tr>
                    <td colSpan="8" className="text-secondary fw-bold fs-5">
                      No Vendor Accounts Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* Modal for displaying detailed Vendor Account Information */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Vendor Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendorAccount && ( // Only render if a vendor account is selected
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6}>
                    <strong>Name:</strong> {selectedVendorAccount.vendorName}
                  </Col>
                  <Col md={6}>
                    <strong>Mobile:</strong> {selectedVendorAccount.vendorMobile}
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <strong>Query License:</strong> {selectedVendorAccount.query_license||"-"}
                  </Col>
                  <Col md={6}>
                    <strong>Mining License:</strong> {selectedVendorAccount.mining_license||"-"}
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <strong>Village:</strong> {selectedVendorAccount.near_village||"-"}
                  </Col>
                  <Col md={6}>
                    <strong>Tehsil:</strong> {selectedVendorAccount.tehsil||"-"}
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <strong>District:</strong> {selectedVendorAccount.district||"-"}
                  </Col>
                  <Col md={6}>
                    <strong>State:</strong> {selectedVendorAccount.state||"-"}
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <strong>Country:</strong> {selectedVendorAccount.country||"-"}
                  </Col>
                  <Col md={6}>
                    <strong>Created Date:</strong> {formatDate(selectedVendorAccount.createdAt)}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <strong>Created Time:</strong> {formatTime(selectedVendorAccount.createdAt)}
                  </Col>
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

