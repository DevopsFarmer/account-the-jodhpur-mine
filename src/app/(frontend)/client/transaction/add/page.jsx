"use client";
 
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import Bootstrap components for layout, forms, buttons, alerts, and spinners
import { Container, Form, Button, Row, Col, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import locationData from '../../../India-state-city-subDistrict-village.json'; 
// Import icons from various libraries for a richer UI
import { TbTransactionRupee, TbPlus, TbCreditCard, TbTrashFilled } from 'react-icons/tb';
import { FaSave, FaExclamationTriangle, FaUserTie, FaMapMarkerAlt, FaCoins, FaPencilAlt, FaUndo, FaClock } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign, faScrewdriverWrench, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';


// Main functional component for adding client transactions
const AddClientTransaction = () => {
  // Initialize the Next.js router for navigation
  const router = useRouter();

  // State variables to manage component data and UI states
  const [userRole, setUserRole] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
 

  // Initialize states from location data
  useEffect(() => {
    // Extract states from location data
    const allStates = locationData.map(state => state.state);
    setStates(allStates);
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (['district', 'tehsil', 'near_village'].includes(name) && isOtherDistrict) {
      const valid = value.replace(/[^a-z ]/g, '');
      setForm(prev => ({ ...prev, [name]: valid }));
      return;
    }

    if (name === 'state') {
      const selected = locationData.find(s => s.state === value);
      const distList = selected?.districts.map(d => d.district) || [];
      setDistricts([...distList, 'Other']);
      setTehsils([]);
      setVillages([]);
      setForm(prev => ({ ...prev, state: value, district: '', tehsil: '', near_village: '' }));
      setIsOtherDistrict(false);
      return;
    }

    if (name === 'district') {
      if (value === 'Other') {
        setIsOtherDistrict(true);
        setForm(prev => ({ ...prev, district: value, tehsil: '', near_village: '' }));
        setTehsils([]);
        setVillages([]);
      } else {
        const stateData = locationData.find(s => s.state === form.state);
        const districtData = stateData?.districts.find(d => d.district === value);
        const tehsilList = districtData?.subDistricts.map(t => t.subDistrict) || [];
        setTehsils(tehsilList);
        setVillages([]);
        setForm(prev => ({ ...prev, district: value, tehsil: '', near_village: '' }));
        setIsOtherDistrict(false);
      }
      return;
    }

    if (name === 'tehsil') {
      const stateData = locationData.find(s => s.state === form.state);
      const districtData = stateData?.districts.find(d => d.district === form.district);
      const tehsilData = districtData?.subDistricts.find(t => t.subDistrict === value);
      const villageList = tehsilData?.villages || [];
      setVillages(villageList);
      setForm(prev => ({ ...prev, tehsil: value, near_village: '' }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Form state aligned with ClientTransactions collection
  const [form, setForm] = useState({
    clientName: '',
    query_license: '',
    near_village: '',
    description: '',
    paymentstatus: 'pending',
  });

  // Working stages aligned with collection schema
  const [workingStages, setWorkingStages] = useState([{ 
    workingStage: '', 
    workingDescription: '', 
    workstatus: 'incomplete',
  }]);

  // Client working stages aligned with collection schema
  const [workingStagesClient, setWorkingStagesClient] = useState([{ 
    workingStageclient: '', 
    workingDescriptionclient: '', 
    stageDate: ''
  }]);

  const [error, setError] = useState('');
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



  // useEffect Hook: Client-Side Access Control
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      let role = null;
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          role = parsedUser.role;
          setUserRole(role);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }

      if (role !== 'admin' && role !== 'manager' && role !== 'guest') {
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/api/logout';
        }, 1500);
      }
    }
  }, [router]);

  // useEffect Hook: Fetch All Client Accounts
  useEffect(() => {
    const fetchClients = async () => {
      if (userRole === 'admin' || userRole === 'manager' || userRole === 'guest') {
        setLoadingClients(true);
        try {
          const res = await fetch('/api/client-accounts?limit=100000');
          if (res.ok) {
            const data = await res.json();
            setClients(data?.docs || []);
            console.log(data.docs);
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
      }
    };

    if (userRole) {
      fetchClients();
    }
  }, [userRole]);

  // Event Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Convert client name to title case
    if (name === 'clientName') {
      const words = value.split(' ');
      const titleCase = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      setForm(prev => ({ ...prev, [name]: titleCase }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Updated to match collection schema field names
  const updateStage = (index, field, value) => {
    const updated = [...workingStages];
    updated[index][field] = value;
    setWorkingStages(updated);
  };

  const updateStageClient = (index, field, value) => {
    const updated = [...workingStagesClient];
    updated[index][field] = value;
    setWorkingStagesClient(updated);
  };

  const addStage = () => {
    setWorkingStages([...workingStages, { 
      workingStage: '', 
      workingDescription: '', 
      workstatus: 'incomplete',
    }]);
  };

  const addStageClient = () => {
    setWorkingStagesClient([...workingStagesClient, { 
      workingStageclient: '', 
      workingDescriptionclient: '', 
      stageDate: ''
    }]);
  };

  const removeStage = (index) => {
    if (workingStages.length > 1) {
      setWorkingStages(workingStages.filter((_, i) => i !== index));
    }
  };

  const removeStageClient = (index) => {
    if (workingStagesClient.length > 1) {
      setWorkingStagesClient(workingStagesClient.filter((_, i) => i !== index));
    }
  };

  // Calculation Functions - Updated to use correct field names
  const getTotalAmount = () => {
    const workTotal = workingStages.reduce((sum, s) => sum + (parseFloat(s.workingDescription) || 0), 0);
    return workTotal;
  };

  const getTotalAmountClient = () => {
    const workTotalClient = workingStagesClient.reduce((sum, s) => sum + (parseFloat(s.workingDescriptionclient) || 0), 0);
    return workTotalClient;
  };

  const getRemainingAmount = () => {
    return getTotalAmount() - getTotalAmountClient();
  };

  const handleReset = () => {
    setForm({
      clientName: '',
      query_license: '',
      state: '',
      district: '',
      tehsil: '',
      near_village: '',
      description: '',
      paymentstatus: 'pending',
    });
    setWorkingStages([{ 
      workingStage: '', 
      workingDescription: '', 
      workstatus: 'incomplete',
    }]);
    setWorkingStagesClient([{ 
      workingStageclient: '', 
      workingDescriptionclient: '', 
      stageDate: ''
    }]);
    setError('');
    setSuccess('');
  };

  // Form Submission Handler - Updated payload structure
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.clientName || !form.query_license || !form.state || !form.district || !form.tehsil || !form.near_village) {
      setError("Please fill in all required fields: Client Name, Query License, State, District, Tehsil, and Near Village.");
      return;
    }

    const matchedClient = clients.find((client) =>
      (client.clientName === form.clientName || client.id === form.clientName) &&
      (client.query_license === form.query_license || client.id === form.query_license) &&
      (client.state === form.state || client.id === form.state) &&
      (client.district === form.district || client.id === form.district) &&
      (client.tehsil === form.tehsil || client.id === form.tehsil) &&
      (client.near_village === form.near_village || client.id === form.near_village)
    );

    if (!matchedClient) {
      const clientMatch = clients.some((client) => client.clientName === form.clientName || client.id === form.clientName);
      const licenseMatch = clients.some((client) => client.query_license === form.query_license || client.id === form.query_license);
      const stateMatch = clients.some((client) => client.state === form.state || client.id === form.state);
      const districtMatch = clients.some((client) => client.district === form.district || client.id === form.district);
      const tehsilMatch = clients.some((client) => client.tehsil === form.tehsil || client.id === form.tehsil);
      const villageMatch = clients.some((client) => client.near_village === form.near_village || client.id === form.near_village);

      if (licenseMatch && villageMatch && !clientMatch && !stateMatch && !districtMatch && !tehsilMatch) {
        setError("Client Name is incorrect for the selected Query License and Near Village.");
      } else if (clientMatch && licenseMatch && !villageMatch && !stateMatch && !districtMatch && !tehsilMatch) {
        setError("Near Village is incorrect for the selected Client Name and Query License.");
      } else if (clientMatch && villageMatch && !licenseMatch && !stateMatch && !districtMatch && !tehsilMatch) {
        setError("Query License is incorrect for the selected Client Name and Near Village.");
      } else if (clientMatch && !licenseMatch && !villageMatch && !stateMatch && !districtMatch && !tehsilMatch) {
        setError("Both Query License and Near Village are incorrect for the selected Client Name.");
      } else if (!clientMatch && licenseMatch && !villageMatch && !stateMatch && !districtMatch && !tehsilMatch) {
        setError("Client Name and Near Village are incorrect for the selected Query License.");
      } else if (!clientMatch && !licenseMatch && villageMatch && !stateMatch && !districtMatch && !tehsilMatch) {
        setError("Client Name and Query License are incorrect for the selected Near Village.");
      } else {
        setError("The provided Client Name, Query License, and Near Village do not match any known client.");
      }
      setTimeout(() => handleReset(), 3000);
      return;
    }

    setSubmitting(true);

    // Get user role from localStorage or default to 'guest'
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user?.role || 'guest';

    // Updated payload to match ClientTransactions collection schema
    const payload = {
      clientName: matchedClient.id,
      query_license: matchedClient.id,
      state: matchedClient.id,
      district: matchedClient.id,
      tehsil: matchedClient.id,
      near_village: matchedClient.id,
      totalAmount: getTotalAmount(),
      totalAmountclient: getTotalAmountClient(),
      remainingAmount: getRemainingAmount(),
      workingStage: workingStages.map((s) => ({
        workingStage: s.workingStage,
        workingDescription: s.workingDescription,
        workstatus: s.workstatus,
      })),
      workingStageclient: workingStagesClient.map((s) => ({
        workingStageclient: s.workingStageclient,
        workingDescriptionclient: s.workingDescriptionclient,
        stageDate: s.stageDate
      })),
      description: form.description,
      clientCreatedAt: new Date().toISOString(),
      clientUpdatedAt: new Date().toISOString(),
      paymentstatus: "pending",
      createdBy: userRole, // Add createdBy field with user role
      source: 'manager' // Marking this as a manager submission
    };

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
          router.push("/client/transaction/view");
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

  // Conditional Rendering
  if (userRole === null) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="fw-semibold mt-2">Checking authorization...</p>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'guest') {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger" className="fw-semibold">
          <FaExclamationTriangle className="me-2" />
          You do not have permission to access this page. Redirecting...
        </Alert>
      </Container>
    );
  }

  return (
    <>
   

      <Container className="mt-3 px-3 px-sm-4 px-md-5 py-4 bg-light rounded-4 shadow-sm mx-auto" style={{ maxWidth: '900px' }}>
        <h4 className="text-center mb-4 fs-3 fw-bold text-danger">
          <TbTransactionRupee className="fs-1 mb-1 me-2" /> Add Client Transaction
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
            No client accounts found. Please add a client first to create a transaction.
            <Button variant="info" className="ms-2 btn-sm" onClick={() => router.push('/client/account/add')}>
              Add Client Now
            </Button>
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
                  <Col md={12} className="mb-3">
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
                            .filter(license =>
                              license.toLowerCase().includes(form.query_license.toLowerCase())
                            )
                            .slice(0, 10)
                            .map((license, index) => (
                              <option key={`license-${index}`} value={license} />
                            ))}
                        </datalist>
                      )}
                    </Form.Group>
               
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">State <span className="text-danger">*</span></Form.Label>
                          <Form.Select name="state" value={form.state} onChange={handleChange} required>
                            <option value="">-- Select State --</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">State is required.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">District <span className="text-danger">*</span></Form.Label>
                          {isOtherDistrict ? (
                            <div className="d-flex align-items-center gap-2">
                              <Form.Control type="text" name="district" placeholder="Enter district" pattern="^[a-z ]+$" required value={form.district} onChange={handleChange} />
                              <Button variant="outline-danger" onClick={() => { setIsOtherDistrict(false); setForm({ ...form, district: '', tehsil: '', near_village: '' }); }}>
                                <FaXmark size={20} className="text-center fw-bold fs-5"/>
                              </Button>
                            </div>
                          ) : (
                            <Form.Select name="district" value={form.district} onChange={handleChange} required>
                              <option value="">-- Select District --</option>
                              {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </Form.Select>
                          )}
                          <Form.Control.Feedback type="invalid">District is required.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">Tehsil <span className="text-danger">*</span></Form.Label>
                          {isOtherDistrict ? (
                            <Form.Control type="text" name="tehsil" placeholder="Enter tehsil" pattern="^[a-z ]+$" required value={form.tehsil} onChange={handleChange} />
                          ) : (
                            <Form.Select name="tehsil" value={form.tehsil} onChange={handleChange} required>
                              <option value="">-- Select Tehsil --</option>
                              {tehsils.map(t => <option key={t} value={t}>{t}</option>)}
                            </Form.Select>
                          )}
                          <Form.Control.Feedback type="invalid">Tehsil is required.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">Nearby Village <span className="text-danger">*</span></Form.Label>
                          {isOtherDistrict ? (
                            <Form.Control type="text" name="near_village" placeholder="Enter village" pattern="^[a-z ]+$" required value={form.near_village} onChange={handleChange} />
                          ) : (
                            <Form.Select name="near_village" value={form.near_village} onChange={handleChange} required>
                              <option value="">-- Select Village --</option>
                              {villages.map(v => <option key={v} value={v}>{v}</option>)}
                            </Form.Select>
                          )}
                          <Form.Control.Feedback type="invalid">Nearby Village is required.</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Our Working Stages Section - Updated with Work Status */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white fw-bold fs-5 d-flex align-items-center justify-content-between">
                <div>
                  <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" /> Our Working Stages
                </div>
                <Button
                  variant="light"
                  onClick={addStage}
                  className="fw-bold text-dark d-flex align-items-center px-3 py-1 rounded-pill"
                >
                  <TbPlus className="me-1" size={25} /> Add Stage
                </Button>
              </Card.Header>
              <Card.Body>
                {workingStages.map((stage, idx) => (
                  <div key={idx} className="mb-4 p-3 border rounded bg-light">
                    <Row className="mb-3 align-items-center g-2">
                      <Col xs={12} md={5}>
                        <Form.Label className="fw-bold small">Work Description</Form.Label>
                        <Form.Control
                          type="text"
                          value={stage.workingStage}
                          onChange={e => updateStage(idx, 'workingStage', e.target.value)}
                          placeholder="Enter work stage"
                          required
                        />
                      </Col>
                      <Col xs={8} md={4}>
                        <Form.Label className="fw-bold small">Amount</Form.Label>
                        <Form.Control
                          type="number"
                          value={stage.workingDescription}
                          onChange={e => updateStage(idx, 'workingDescription', e.target.value)}
                          placeholder="Enter amount"
                          required
                        />
                      </Col>
                      <Col xs={4} md={3}>
                        <Form.Label className="fw-bold small">Work Status</Form.Label>
                        <div className="d-flex align-items-center">
                          <Badge 
                            bg="warning" 
                            className="me-2 p-2 d-flex align-items-center"
                            style={{ fontSize: '0.85rem' }}
                          >
                            <FaClock className="me-1" />
                            {stage.workstatus.charAt(0).toUpperCase() + stage.workstatus.slice(1)}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} className="d-flex justify-content-end">
                        <Button
                          variant="danger"
                          onClick={() => removeStage(index)}
                          disabled={workingStages.length === 1}
                          className="fw-bold d-flex align-items-center justify-content-center"
                          size="sm"
                        >
                          <TbTrashFilled className="me-1" /> Remove Stage
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Client's Working Stages Section - Updated field names */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-success text-white fw-bold fs-5 d-flex align-items-center justify-content-between">
                <div>
                  <FontAwesomeIcon icon={faMoneyCheckDollar} className="me-2" /> Client's Stages
                </div>
                <Button
                  variant="light"
                  onClick={addStageClient}
                  className="fw-bold text-dark d-flex align-items-center px-3 py-1 rounded-pill"
                >
                  <TbPlus className="me-1" size={25} /> Add Stage
                </Button>
              </Card.Header>
              <Card.Body>
                {workingStagesClient.map((stage, index) => (
                      <Row key={`client-stage-${index}`} className="mb-3 align-items-center g-2">
                        <Col xs={12} md={4}>
                          <Form.Control
                            placeholder="Client Payment Description (e.g., Advance, Installment)"
                            value={stage.workingStageclient}
                            onChange={(e) => updateStageClient(index, 'workingStageclient', e.target.value)}
                            className="p-2"
                          />
                        </Col>
                        <Col xs={8} md={3}>
                          <Form.Control
                            type="number"
                            placeholder="₹ Client Paid Amount"
                            value={stage.workingDescriptionclient}
                            onChange={(e) => updateStageClient(index, 'workingDescriptionclient', e.target.value)}
                            className="p-2"
                          />
                        </Col>
                        <Col xs={8} md={3}>
                          <Form.Control
                            type="date"
                            placeholder="Stage Date"
                            value={stage.stageDate}
                            onChange={(e) => updateStageClient(index, 'stageDate', e.target.value)}
                            className="p-2"
                            required
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

            {/* Transaction Summary Section */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
              <Card.Header className="bg-dark text-white fw-bold fs-5 d-flex align-items-center">
                <FaCoins className="me-2" /> Transaction Summary
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">
                        Total Amount Our Side (<FontAwesomeIcon icon={faIndianRupeeSign} />)
                      </Form.Label>
                      <Form.Control
                        value={getTotalAmount().toFixed(2)}
                        readOnly
                        className="bg-white fw-bold p-2 text-danger"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">
                        Total Client Paid Amount (<FontAwesomeIcon icon={faIndianRupeeSign} />)
                      </Form.Label>
                      <Form.Control
                        value={getTotalAmountClient().toFixed(2)}
                        readOnly
                        className="bg-white fw-bold p-2 text-success"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold fs-5">
                    Remaining Amount (<FontAwesomeIcon icon={faIndianRupeeSign} />)
                  </Form.Label>
                  <Form.Control
                    value={getRemainingAmount().toFixed(2)}
                    readOnly
                    className="bg-white fw-bold p-2 text-primary"
                  />
                </Form.Group>
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
                placeholder="Add any additional notes or details about this transaction..."
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
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2 fs-5" /> Save Transaction
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