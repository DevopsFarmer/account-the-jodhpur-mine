

//page client-transaction.jsx
'use client'; // This directive marks the component as a Client Component in Next.js
// Import necessary React hooks and components from 'react' and 'next/navigation'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import Bootstrap components for layout, forms, buttons, alerts, and spinners
import { Container, Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';

// Import icons from various libraries for a richer UI
import { TbTransactionRupee, TbPlus, TbCreditCard, TbTrashFilled } from 'react-icons/tb';
import { FaSave, FaExclamationTriangle, FaUserTie, FaMapMarkerAlt, FaCoins, FaPencilAlt, FaUndo } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';

// Import a custom Header component (assuming it exists in '../components/Header')
import Header from '../components/Header';

// Main functional component for adding client transactions
const ClientTransaction = () => {
  // Initialize the Next.js router for navigation
  const router = useRouter();

  // State variables to manage component data and UI states:
  const [clients, setClients] = useState([]); // Stores the list of available clients
  const [loadingClients, setLoadingClients] = useState(true); // Indicates if client data is currently being loaded
  const [submitting, setSubmitting] = useState(false); // Indicates if the form is currently being submitted

  // Form state to hold the values of input fields.
  const [form, setForm] = useState({
    clientName: '',
    query_license: '',
    near_village: '',
    description: '',
    paymentstatus: 'pending', // Default payment status
  });

  // State for dynamically added 'Client's Working Stages' (payments/work done by the client)
  const [workingStagesClient, setWorkingStagesClient] = useState([{ work: '', amount: '' }]);

  // State to store any error messages
  const [error, setError] = useState('');
  // State to store any success messages
  const [success, setSuccess] = useState('');

  // Helper Functions for Unique Options
  const getUniqueClientNames = () => {
    const names = clients.filter((client) => client.clientName && client.clientName.trim() !== '')
      .map((client) => client.clientName);
    return [...new Set(names)];
  };

  const getUniqueQueryLicenses = () => {
    const licenses = clients.filter((client) => client.query_license && client.query_license.trim() !== '')
      .map((client) => client.query_license);
    return [...new Set(licenses)];
  };

  const getUniqueNearVillages = () => {
    const villages = clients.filter((client) => client.near_village && client.near_village.trim() !== '')
      .map((client) => client.near_village);
    return [...new Set(villages)];
  };

  // --- useEffect Hook: Fetch All Client Accounts ---
  // This runs once on component mount to fetch the list of clients.
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const res = await fetch('/api/client-accounts?limit=100000');
        if (res.ok) {
          const data = await res.json();
          setClients(data?.docs || []);
        } else {
          console.error('Failed to fetch clients:', res.status, res.statusText);
          setError('Failed to load client data. Please try again.');
          setClients([]);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Network error while fetching clients.');
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []); // Empty dependency array means this runs once on mount

  // --- Event Handlers ---

  // Handles changes for the main form fields
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // Updates a specific 'Client's Working Stage' field (work or amount)
  const updateStageClient = (index, field, value) => {
    const updated = [...workingStagesClient];
    updated[index][field] = value;
    setWorkingStagesClient(updated);
  };

  // Adds a new empty row for 'Client's Working Stages'
  const addStageClient = () => {
    setWorkingStagesClient([...workingStagesClient, { work: '', amount: '' }]);
  };

  // Removes a specific row from 'Client's Working Stages'
  const removeStageClient = (index) => {
    if (workingStagesClient.length > 1) {
      setWorkingStagesClient(workingStagesClient.filter((_, i) => i !== index));
    }
  };

  // --- Calculation Functions ---

  // Calculates the total amount from 'Client's Working Stages'
  const getTotalAmountClient = () => {
    const workTotalClient = workingStagesClient.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    return workTotalClient;
  };

  // Resets the entire form to its initial empty state
  const handleReset = () => {
    setForm({
      clientName: '',
      query_license: '',
      near_village: '',
      description: '',
      paymentstatus: 'pending',
    });
    setWorkingStagesClient([{ work: '', amount: '' }]);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Step 1: Basic field presence check
    if (!form.clientName || !form.query_license || !form.near_village) {
      setError("Please fill in all required fields: Client Name, Query License, and Near Village.");
      return;
    }

    // Step 2: Try to find the client that matches all 3 fields
    const matchedClient = clients.find((client) =>
      (client.clientName === form.clientName || client.id === form.clientName) &&
      (client.query_license === form.query_license || client.id === form.query_license) &&
      (client.near_village === form.near_village || client.id === form.near_village)
    );

    // Step 3: If no exact match is found, check individual mismatches and show custom errors
    if (!matchedClient) {
      const clientMatch = clients.some((client) => client.clientName === form.clientName || client.id === form.clientName);
      const licenseMatch = clients.some((client) => client.query_license === form.query_license || client.id === form.query_license);
      const villageMatch = clients.some((client) => client.near_village === form.near_village || client.id === form.near_village);

      if (licenseMatch && villageMatch && !clientMatch) {
        setError("Client Name is incorrect for the selected Query License and Near Village.");
      } else if (clientMatch && licenseMatch && !villageMatch) {
        setError("Near Village is incorrect for the selected Client Name and Query License.");
      } else if (clientMatch && villageMatch && !licenseMatch) {
        setError("Query License is incorrect for the selected Client Name and Near Village.");
      } else if (clientMatch && !licenseMatch && !villageMatch) {
        setError("Both Query License and Near Village are incorrect for the selected Client Name.");
      } else if (!clientMatch && licenseMatch && !villageMatch) {
        setError("Client Name and Near Village are incorrect for the selected Query License.");
      } else if (!clientMatch && !licenseMatch && villageMatch) {
        setError("Client Name and Query License are incorrect for the selected Near Village.");
      } else {
        setError("The provided Client Name, Query License, and Near Village do not match any known client.");
      }
      setTimeout(() => handleReset(), 3000);
      return;
    }

    // Step 4: Prepare payload using the matched client
    setSubmitting(true);

    const payload = {
      clientName: matchedClient.id, // Use client ID for database
      query_license: matchedClient.id, // Use client ID for database
      near_village: matchedClient.id, // Use client ID for database
      // These fields remain as they were, assuming they are set this way for transactions initiated from this form
      totalAmount: 0,
      totalAmountclient: getTotalAmountClient(),
      remainingAmount: 0 ,
      workingStage: [],
      workingStageclient: workingStagesClient.map((s) => ({
        workingStageclient: s.work,
        workingDescriptionclient: s.amount,
      })),
      description: form.description,
      clientCreatedAt: new Date().toISOString(),
      clientUpdatedAt: new Date().toISOString(),
      paymentstatus: "pending", // Always pending for submissions from this form
    };

    // Step 5: Submit data to API
    try {
      const res = await fetch("/api/client-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Client transaction saved successfully!");
        setTimeout(() => {
          handleReset();
          router.push("/dashboard");
        }, 1000);
      } else {
        const result = await res.json();
        console.error("API Error:", result);
        setError(result.message || "Failed to save transaction. Please check your inputs.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Main Component JSX ---
  return (
    <>
      <Header />

      <Container className="mt-3 px-3 px-sm-4 px-md-5 py-4 bg-light rounded-4 shadow-sm mx-auto" style={{ maxWidth: '900px' }}>
        <h4 className="text-center mb-4 fs-3 fw-bold text-danger">
          <TbTransactionRupee className="fs-1 mb-1 me-2" /> Client Transaction Submission
        </h4>
        <hr className="mb-4" />

        {loadingClients && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <div className="fw-semibold mt-2">Loading Client List...</div>
          </div>
        )}

        {!loadingClients && clients.length === 0 && (
          <Alert variant="info" className="text-center fw-semibold">
            <FaExclamationTriangle className="me-2" />
            No client accounts found. Please contact support.
          </Alert>
        )}

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="text-center fw-semibold">
            <FaExclamationTriangle className="me-2" /> {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')} className="text-center fw-semibold">
            {success}
          </Alert>
        )}

        {!loadingClients && clients.length > 0 && (
          <Form onSubmit={handleSubmit}>
            {/* Client Information Section */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-warning text-dark fw-bold fs-5 d-flex align-items-center">
                <FaUserTie className="me-2" /> Client Details
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">
                        Client Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        list="client-options"
                        name="clientName"
                        value={form.clientName}
                        onChange={handleFormChange}
                        placeholder="Select or type Client Name"
                        required
                        className="p-2"
                      />
                      {form.clientName.length >= 2 && (
                        <datalist id="client-options">
                          {getUniqueClientNames()
                            .filter(name => name.toLowerCase().includes(form.clientName.toLowerCase()))
                            .slice(0, 10)
                            .map((clientName, index) => (
                              <option key={`client-${index}`} value={clientName} />
                            ))}
                        </datalist>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">
                        <TbCreditCard className="me-1" /> Query License
                        <span className="text-danger ms-1">*</span>
                      </Form.Label>
                      <Form.Control
                        list="query-license-options"
                        name="query_license"
                        value={form.query_license}
                        onChange={handleFormChange}
                        placeholder="Select or type Query License"
                        required
                        className="p-2"
                      />
                      {form.query_license.length >= 2 && (
                        <datalist id="query-license-options">
                          {getUniqueQueryLicenses()
                            .filter(name => name.toLowerCase().includes(form.query_license.toLowerCase()))
                            .slice(0, 10)
                            .map((queryLicense, index) => (
                              <option key={`query-license-${index}`} value={queryLicense} />
                            ))}
                        </datalist>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">
                        <FaMapMarkerAlt className="me-1" /> Village
                        <span className="text-danger ms-1">*</span>
                      </Form.Label>
                      <Form.Control
                        list="near-village-options"
                        name="near_village"
                        value={form.near_village}
                        onChange={handleFormChange}
                        placeholder="Select or type Village"
                        required
                        className="p-2"
                      />
                      {form.near_village.length >= 2 && (
                        <datalist id="near-village-options">
                          {getUniqueNearVillages()
                            .filter(name => name.toLowerCase().includes(form.near_village.toLowerCase()))
                            .slice(0, 10)
                            .map((village, index) => (
                              <option key={`village-${index}`} value={village} />
                            ))}
                        </datalist>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Client's Working Stages Section */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-success text-white fw-bold fs-5 d-flex align-items-center justify-content-between">
                <div>
                  <FontAwesomeIcon icon={faMoneyCheckDollar} className="me-2" /> Your Payments/Stages
                </div>
                <Button
                  variant="light"
                  onClick={addStageClient}
                  className="fw-bold text-dark d-flex align-items-center px-3 py-1 rounded-pill"
                >
                  <TbPlus className="me-1" size={25} /> Add Payment
                </Button>
              </Card.Header>
              <Card.Body>
                {workingStagesClient.map((stage, index) => (
                  <Row key={`client-stage-${index}`} className="mb-3 align-items-center g-2">
                    <Col xs={12} md={6}>
                      <Form.Control
                        placeholder="Payment Description (e.g., Advance, Installment)"
                        value={stage.work}
                        onChange={(e) => updateStageClient(index, 'work', e.target.value)}
                        className="p-2"
                      />
                    </Col>
                    <Col xs={8} md={4}>
                      <Form.Control
                        type="number"
                        placeholder="₹ Amount Paid"
                        value={stage.amount}
                        onChange={(e) => updateStageClient(index, 'amount', e.target.value)}
                        className="p-2"
                      />
                    </Col>
                    <Col xs={4} md={2} className="d-flex justify-content-end">
                      <Button
                        variant="danger"
                        onClick={() => removeStageClient(index)}
                        disabled={workingStagesClient.length === 1}
                        className="w-100 fw-bold d-flex align-items-center justify-content-center"
                      >
                        <TbTrashFilled className="d-none d-md-inline me-1" /> Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
              </Card.Body>
            </Card>

            {/* Credit Summary Section - Only Client Paid Amount visible and read-only */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
              <Card.Header className="bg-dark text-white fw-bold fs-5 d-flex align-items-center">
                <FaCoins className="me-2" /> Your Payment Summary
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <label className="fw-bold fs-5">
                    Total Amount You Paid <FontAwesomeIcon icon={faIndianRupeeSign} />
                  </label>
                  <input
                    type="text"
                    value={getTotalAmountClient().toFixed(2)}
                    readOnly
                    className="form-control bg-white fw-bold p-2 text-success"
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Optional Description Field */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold fs-5">
                <FaPencilAlt className="me-1" /> Description (Optional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Add any additional notes or details about your payment..."
                className="p-2"
              />
            </Form.Group>

            {/* Submit & Reset Buttons */}
            <div className="text-center mt-5">
              <Button
                type="submit"
                variant="success"
                className="fw-bold px-4 py-2 me-3 rounded-pill d-inline-flex align-items-center justify-content-center"
                disabled={submitting || loadingClients || clients.length === 0}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2 fs-5" /> Submit Payment
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="px-4 py-2 fw-bold rounded-pill d-inline-flex align-items-center justify-content-center"
                onClick={handleReset}
                disabled={submitting}
              >
                <FaUndo className="me-2 fs-5" /> Reset Form
              </Button>
            </div>
          </Form>
        )}
      </Container>
    </>
  );
};

export default AddClientTransaction;