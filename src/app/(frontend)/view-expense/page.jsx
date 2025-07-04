//View All The Expenses page
// 'use client'; // required for localStorage and router
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {Container,Table,Form,InputGroup,Button,Modal,Row,Col,} from 'react-bootstrap';
// import Header from "../components/Header"
// import { FaRupeeSign, FaEye, FaEdit, FaSearch } from 'react-icons/fa';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faClipboard } from '@fortawesome/free-solid-svg-icons';

// const ViewExpense = () => {
//   const router = useRouter();

//   // All expenses from localStorage
//   const [expenses, setExpenses] = useState([]);

//   // Filter state
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredExpenses, setFilteredExpenses] = useState([]);

//   // For modal view
//   const [selectedExpense, setSelectedExpense] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // Load data from localStorage on mount
//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem('expenses') || '[]');
//     setExpenses(stored);
//     setFilteredExpenses(stored);
//   }, []);

//   // Filter by name whenever search term changes
//   useEffect(() => {
//     const result = expenses.filter((item) =>
//       item.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredExpenses(result);
//   }, [searchTerm, expenses]);

//   // Handle modal open
//   const handleView = (expense) => {
//     setSelectedExpense(expense);
//     setShowModal(true);
//   };

//   // Navigate to edit page
//   const handleEdit = (id) => {
//     console.log(`the edit id is ${id}`);
//     router.push(`/edit-expense/${id}`);
//   };

//   return (
//     <>
//       <Header />

//       <Container fluid className="py-4 px-3">
//         {/* Page Title and Search Bar */}
//         <Row className="align-items-center mb-4">
//           <Col xs={12} md={6} className="text-center text-md-start mb-2 mb-md-0">
//             <h4 className="fw-bold text-capitalize">
//               <FontAwesomeIcon icon={faClipboard} className="me-2" />
//               View All The Expenses
//             </h4>
//           </Col>
//           <Col xs={12} md={6}>
//             <InputGroup>
//               <InputGroup.Text><FaSearch /></InputGroup.Text>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by expense name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </InputGroup>
//           </Col>
//         </Row>

//         {/* Responsive Table */}
//         <div className="table-responsive">
//           <Table striped bordered hover responsive className="text-center align-middle fs-6 border-dark">
//             <thead className="table-dark">
//               <tr>
//                 <th>S.No</th>
//                 <th>Name</th>
//                 <th>Date</th>
//                 <th>Initial (<FaRupeeSign />)</th>
//                 <th>Total (<FaRupeeSign />)</th>
//                 <th>Remaining (<FaRupeeSign />)</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredExpenses.length > 0 ? (
//                 filteredExpenses.map((expense, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{expense.name}</td>
//                     <td>{expense.date}</td>
//                     <td><FaRupeeSign /> {expense.initialBalance.toFixed(2)}</td>
//                     <td><FaRupeeSign /> {expense.totalExpense.toFixed(2)}</td>
//                     <td><FaRupeeSign /> {expense.remainingAmount.toFixed(2)}</td>
//                     <td>
//                       <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
//                         <Button
//                           variant="info"
//                           size="sm"
//                           onClick={() => handleView(expense)}
//                         >
//                           <FaEye />
//                         </Button>
//                         <Button
//                           variant="warning"
//                           size="sm"
//                           onClick={() => handleEdit(index)}
//                         >
//                           <FaEdit />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center text-secondary fw-semibold">
//                     No expenses found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </div>
//       </Container>

//       {/* Modal to View Full Expense */}
//       <Modal
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Expense Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedExpense && (
//             <>
//               <Row className="mb-2">
//                 <Col xs={12} md={6}><strong>Name:</strong> {selectedExpense.name}</Col>
//                 <Col xs={12} md={6}><strong>Date:</strong> {selectedExpense.date}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col xs={12} md={6}><strong>Time:</strong> {selectedExpense.time}</Col>
//                 <Col xs={12} md={6}>
//                   <strong>Initial Balance:</strong> <FaRupeeSign /> {selectedExpense.initialBalance.toFixed(2)}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col xs={12} md={6}>
//                   <strong>Total Expense:</strong> <FaRupeeSign /> {selectedExpense.totalExpense.toFixed(2)}
//                 </Col>
//                 <Col xs={12} md={6}>
//                   <strong>Remaining:</strong> <FaRupeeSign /> {selectedExpense.remainingAmount.toFixed(2)}
//                 </Col>
//               </Row>

//               {selectedExpense.expenseItems.length > 0 && (
//                 <div className="pt-3 border-top border-2 mt-3">
//                   <h6 className="text-primary">Expense Items:</h6>
//                   <ul className="ps-3">
//                     {selectedExpense.expenseItems.map((item, idx) => (
//                       <li key={idx} className="fw-semibold text-capitalize">
//                         {item.description} - <FaRupeeSign /> {item.amount.toFixed(2)}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };
// export default ViewExpense;

// // View Expense page
// 'use client'; // Required for using hooks like useEffect and useRouter in Next.js
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Container, Table, Form, InputGroup, Button, Modal, Row, Col, Spinner, Alert } from 'react-bootstrap';
// import Header from '../components/Header';
// import { FaRupeeSign, FaEye, FaEdit, FaSearch } from 'react-icons/fa';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faClipboard } from '@fortawesome/free-solid-svg-icons';
// // Function to format date as DD/MM/YYYY
// const formatDate = (dateString) => {
//   if (!dateString) return '';
//   const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: "Asia/Kolkata" };
//   return new Date(dateString).toLocaleDateString('en-GB', options);
// };
// // Function to format time as HH:MM:SS AM/PM
// const formatTime = (dateString) => {
//   if (!dateString) return '';
//   const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: "Asia/Kolkata" };
//   return new Date(dateString).toLocaleTimeString('en-US', options);
// };
// const ViewExpense = () => {
//   const router = useRouter();

//   // State to hold the current user's role
//   const [userRole, setUserRole] = useState(null);

//   // Store all expenses from backend
//   const [expenses, setExpenses] = useState([]);

//   // Filtered expenses for search results
//   const [filteredExpenses, setFilteredExpenses] = useState([]);

//   // Search keyword entered by user
//   const [searchTerm, setSearchTerm] = useState('');

//   // For modal visibility and selected data
//   const [showModal, setShowModal] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState(null);

//   // Loading state during fetch
//   const [loading, setLoading] = useState(true);

//   // State for any error messages
//   const [error, setError] = useState(null);

//   // Effect to check user role on component mount for authorization
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       try {
//         const userData = localStorage.getItem('user');
//         if (userData) {
//           const parsedUser = JSON.parse(userData);
//           setUserRole(parsedUser.role);
//           // Only allow 'admin' to access this page
//           if (parsedUser.role !== 'admin') {
//             setTimeout(() => {
//               localStorage.clear()
//               window.location.href = '/api/logout'
//             }, 1000);
//           }
//         } else {
//           setTimeout(() => {
//             localStorage.clear()
//             window.location.href = '/api/logout'
//           }, 1000);
//         }
//       } catch (e) {
//         console.error("Failed to parse user data from localStorage:", e);
//         setTimeout(() => {
//           localStorage.clear()
//           window.location.href = '/api/logout'
//         }, 1000);
//       }
//     }
//   }, [router]); // Depend on router to ensure it's available

//   // Fetch expenses from Payload CMS backend API on mount, only if userRole is 'admin'
//   useEffect(() => {
//     // Only fetch if userRole is explicitly 'admin'
//     if (userRole === 'admin') {
//       const fetchExpenses = async () => {
//         setLoading(true);
//         setError(null); // Clear previous errors
//         try {
//           const response = await fetch('/api/expense'); // Make GET request
//           if (!response.ok) {
//             // Handle non-200 responses (e.g., 404, 500)
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to fetch expenses');
//           }
//           const data = await response.json(); // Parse JSON data
//           console.log(data);
//           const expenses = data.docs || []; // Extract expenses from response
//           setExpenses(expenses); // Store in state
//           setFilteredExpenses(expenses); // Initially show all
//         } catch (err) {
//           console.error('Failed to fetch expenses:', err);
//           setError(`Error fetching expenses: ${err.message}. Please try again.`);
//         } finally {
//           setLoading(false); // Stop loading after fetch
//         }
//       };

//       fetchExpenses();
//     }
//   }, [userRole]); // Rerun when userRole changes

//   // When user types in search bar, filter expenses
//   useEffect(() => {
//     const filtered = expenses.filter((expense) =>
//       expense.nameOfExpense.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredExpenses(filtered);
//   }, [searchTerm, expenses]);

//   // Open modal with selected expense details
//   const handleView = (expense) => {
//     setSelectedExpense(expense);
//     setShowModal(true);
//   };

//   // Navigate to edit page with expense ID
//   const handleEdit = (id) => {
//     router.push(`/edit-expense/${id}`);
//   };

//   // If userRole is not yet determined or not an admin, show loading or redirect message
//   if (userRole === null || userRole !== 'admin') {
//     return (
//       <>
//         <Header />
//         <Container fluid className="py-3 text-center">
//           <Spinner animation="border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </Spinner>
//           <p className="mt-2">Checking access permissions...</p>
//         </Container>
//       </>
//     );
//   }

//   // If userRole is admin, render the page
//   return (
//     <>
//       <Header />

//       <Container fluid className="py-3 text-capitalize">
//         {/* Heading and Search */}
//         <Row className="text-center align-items-center mb-3">
//           <Col xs={12} md={6}>
//             <h4 className="fw-bold">
//               <FontAwesomeIcon icon={faClipboard} className="me-2" />
//               View All The Expenses
//             </h4>
//           </Col>
//           <Col xs={12} md={6} className="mt-2 mt-md-0">
//             <InputGroup className="mx-auto w-75">
//               <InputGroup.Text><FaSearch /></InputGroup.Text>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by expense name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </InputGroup>
//           </Col>
//         </Row>

//         {/* Display error message if any */}
//         {error && <Alert variant="danger" className="text-center">{error}</Alert>}

//         {/* Table Section */}
//         <div className="table-responsive">
//           {loading ? (
//             <div className="text-center">
//               <Spinner animation="border" />
//               <p className="mt-2">Loading expenses...</p>
//             </div>
//           ) : (
//             <Table bordered hover responsive className="text-center align-middle fs-6 border-dark">
//               <thead className="table-dark">
//                 <tr>
//                   <th>S.No</th>
//                   <th>Name of Expense</th>
//                   <th>Date of creation</th>
//                   <th>Time of creation</th>
//                   <th>Initial Amount (<FaRupeeSign />)</th>
//                   <th>Total Expense (<FaRupeeSign />)</th>
//                   <th>Remaining Amount (<FaRupeeSign />)</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredExpenses.length > 0 ? (
//                   filteredExpenses.map((expense, index) => {
//                     // Calculate total and remaining for each expense item
//                     const total = expense.addExpenseItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
//                     const remaining = (expense.initialBalanceAmount || 0) - total;

//                     return (
//                       <tr key={expense.id}>
//                         <td>{index + 1}</td>
//                         <td>{expense.nameOfExpense}</td>
//                         <td>{formatDate(expense.expenseCreatedAt)}</td>
//                         <td>{formatTime(expense.expenseCreatedAt)}</td>
//                         <td><FaRupeeSign /> {expense.initialBalanceAmount?.toFixed(2) || '0.00'}</td>
//                         <td><FaRupeeSign /> {total.toFixed(2)}</td>
//                         <td><FaRupeeSign /> {remaining.toFixed(2)}</td>
//                         <td>
//                           <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
//                             <Button variant="info" onClick={() => handleView({ ...expense, totalExpense: total, remainingAmount: remaining })}>
//                               <FaEye />
//                             </Button>
//                             <Button variant="warning" onClick={() => handleEdit(expense.id)}>
//                               <FaEdit />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className="text-secondary fw-semibold">
//                       No expenses found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           )}
//         </div>
//       </Container>

//       {/* Expense Modal View */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Expense Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedExpense && (
//             <>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Name of Expense:</strong> {selectedExpense.nameOfExpense}</Col>
//                 <Col md={6}><strong>Initial Amount:</strong> <FaRupeeSign /> {selectedExpense.initialBalanceAmount?.toFixed(2) || '0.00'}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Last Updated Date:</strong> {formatDate(selectedExpense.expenseUpdatedAt)}</Col>
//                 <Col md={6}><strong>Last Updated Time:</strong> {formatTime(selectedExpense.expenseUpdatedAt)}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Total Expense:</strong> <FaRupeeSign /> {selectedExpense.totalExpense?.toFixed(2) || '0.00'}</Col>
//                 <Col md={6}><strong>Remaining Amount:</strong> <FaRupeeSign /> {selectedExpense.remainingAmount?.toFixed(2) || '0.00'}</Col>
//               </Row>

//               {/* Show expense items */}
//               {selectedExpense.addExpenseItems?.length > 0 && (
//                 <div className="pt-3 border-top border-2 mt-3">
//                   <h6 className="text-primary">Expense Items:</h6>
//                   <ul className="ps-3">
//                     {selectedExpense.addExpenseItems.map((item, idx) => (
//                       <li key={idx} className="fw-semibold text-capitalize">
//                         {item.description} - <FaRupeeSign /> {item.amount?.toFixed(2) || '0.00'}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };

// export default ViewExpense;


'use client'; // Required for using hooks like useEffect and useRouter in Next.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Table, Form, InputGroup, Button, Modal, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import Header from '../components/Header';
import { FaRupeeSign, FaEye, FaEdit, FaSearch, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Function to format date as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: "Asia/Kolkata" };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

// Function to format time as HH:MM:SS AM/PM
const formatTime = (dateString) => {
  if (!dateString) return '';
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: "Asia/Kolkata" };
  return new Date(dateString).toLocaleTimeString('en-US', options);
};

const ViewExpense = () => {
  const router = useRouter();

  // State to hold the current user's role
  const [userRole, setUserRole] = useState(null);

  // Store all expenses from backend
  const [allExpenses, setAllExpenses] = useState([]);

  // Filtered expenses for search results
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Search keyword entered by user
  const [searchTerm, setSearchTerm] = useState('');

  // For modal visibility and selected data
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Loading state during fetch
  const [loading, setLoading] = useState(true);

  // State for any error messages
  const [error, setError] = useState(null);

  // Pagination states
  const itemsPerPage = 10; // Number of rows per page is 10
  const [currentPage, setCurrentPage] = useState(1); // Current page number

  // Effect to check user role on component mount for authorization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserRole(parsedUser.role);
          // Only allow 'admin' to access this page
          if (parsedUser.role !== 'admin') {
            setError("You do not have permission. Redirecting...");
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/api/logout';
            }, 1500);
          }
        } else {
          setError("No user data found. Redirecting...");
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/api/logout';
          }, 1500);
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
        setError("Error processing user data. Please try logging in again.");
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/api/logout';
        }, 1500);
      }
    }
  }, []); // No router dependency needed here as we are doing a full page redirect

  // Fetch expenses from Payload CMS backend API on mount, only if userRole is 'admin'
  useEffect(() => {
    // Only fetch if userRole is explicitly 'admin'
    if (userRole === 'admin') {
      const fetchExpenses = async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
          const response = await axios.get('/api/expense?limit=10000'); // Make GET request, fetch all
          const expenses = response.data.docs || []; // Extract expenses from response
          setAllExpenses(expenses); // Store in state
          setFilteredExpenses(expenses); // Initially show all
        } catch (err) {
          console.error('Failed to fetch expenses:', err);
          setError(`Error fetching expenses: ${err.message || 'Please try again.'}`);
        } finally {
          setLoading(false); // Stop loading after fetch
        }
      };
      fetchExpenses();
    }
  }, [userRole]); // Rerun when userRole changes

  // When user types in search bar, filter expenses
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1); // Always go to page 1 after search

    const filtered = allExpenses.filter((expense) =>
      expense.nameOfExpense.toLowerCase().includes(value)
    );
    setFilteredExpenses(filtered);
  };

  // Open modal with selected expense details
  const handleView = (expense) => {
    // Calculate total and remaining for the selected expense before showing in modal
    const total = expense.addExpenseItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const remaining = (expense.initialBalanceAmount || 0) - total;
    setSelectedExpense({ ...expense, totalExpense: total, remainingAmount: remaining });
    setShowModal(true);
  };

  // Navigate to edit page with expense ID
  const handleEdit = (id) => {
    router.push(`/edit-expense/${id}`);
  };

  // Get current page items for pagination
  const currentItems = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  // Render pagination buttons
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

  // Show loading spinner or redirect message if user role is not determined or not admin
  if (loading || userRole === null) {
    return (
      <>
        <Header />
        <Container fluid className="py-3 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Checking access permissions...</p>
        </Container>
      </>
    );
  }

  // Show error message if unauthorized
  if (userRole !== 'admin') {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger"><FontAwesomeIcon icon={faClipboard} className="me-2" /> {error}</Alert>
      </Container>
    );
  }

  // If userRole is admin, render the page
  return (
    <>
      <Header />

      <Container fluid className="py-3 text-capitalize">
        {/* Heading and Search */}
        <Row className="text-center align-items-center mb-3">
          <Col xs={12} md={6}>
            <h4 className="fw-bold">
              <FontAwesomeIcon icon={faClipboard} className="me-2" />
              View All The Expenses
            </h4>
          </Col>
          <Col xs={12} md={6} className="mt-2 mt-md-0">
            <InputGroup className="mx-auto w-75">
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by expense name..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Col>
        </Row>

        {/* Display error message if any */}
        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

        {/* Table Section */}
        <div className="table-responsive">
          <Table bordered hover responsive className="text-center align-middle fs-6 border-dark">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Name of Expense</th>
                <th>Date of creation</th>
                <th>Time of creation</th>
                <th>Initial Amount (<FaRupeeSign />)</th>
                <th>Total Expense (<FaRupeeSign />)</th>
                <th>Remaining Amount (<FaRupeeSign />)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((expense, index) => {
                  // Calculate total and remaining for each expense item
                  const total = expense.addExpenseItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                  const remaining = (expense.initialBalanceAmount || 0) - total;

                  return (
                    <tr key={expense.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{expense.nameOfExpense}</td>
                      <td>{formatDate(expense.expenseCreatedAt)}</td>
                      <td>{formatTime(expense.expenseCreatedAt)}</td>
                      <td><FaRupeeSign /> {expense.initialBalanceAmount?.toFixed(2) || '0.00'}</td>
                      <td><FaRupeeSign /> {total.toFixed(2)}</td>
                      <td><FaRupeeSign /> {remaining.toFixed(2)}</td>
                      <td>
                        <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                          <Button variant="info" onClick={() => handleView(expense)}>
                            <FaEye />
                          </Button>
                          <Button variant="warning" onClick={() => handleEdit(expense.id)}>
                            <FaEdit />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-secondary fw-semibold">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </Container>

      {/* Expense Modal View */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Expense Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExpense && (
            <Card>
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6}><strong>Name of Expense:</strong> {selectedExpense.nameOfExpense}</Col>
                  <Col md={6}><strong>Initial Amount:</strong> <FaRupeeSign /> {selectedExpense.initialBalanceAmount?.toFixed(2) || '0.00'}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Last Updated Date:</strong> {formatDate(selectedExpense.expenseUpdatedAt)}</Col>
                  <Col md={6}><strong>Last Updated Time:</strong> {formatTime(selectedExpense.expenseUpdatedAt)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><strong>Total Expense:</strong> <FaRupeeSign /> {selectedExpense.totalExpense?.toFixed(2) || '0.00'}</Col>
                  <Col md={6}><strong>Remaining Amount:</strong> <FaRupeeSign /> {selectedExpense.remainingAmount?.toFixed(2) || '0.00'}</Col>
                </Row>

                {/* Show expense items */}
                {selectedExpense.addExpenseItems?.length > 0 && (
                  <div className="pt-3 border-top border-2 mt-3">
                    <h6 className="text-primary">Expense Items:</h6>
                    <ul className="ps-3">
                      {selectedExpense.addExpenseItems.map((item, idx) => (
                        <li key={idx} className="fw-semibold text-capitalize">
                          {item.description} - <FaRupeeSign /> {item.amount?.toFixed(2) || '0.00'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewExpense;
