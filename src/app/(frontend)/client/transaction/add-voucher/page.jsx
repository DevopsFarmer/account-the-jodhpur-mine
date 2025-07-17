"use client";
 
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import Bootstrap components
import { Container, Form, Button, Row, Col, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import locationData from '../../../India-state-city-subDistrict-village.json'; 

// Import icons
import { TbTransactionRupee, TbCreditCard, TbPlus } from 'react-icons/tb';
import { FaSave, FaExclamationTriangle, FaUserTie, FaCoins, FaPencilAlt, FaUndo, FaClock } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign, faScrewdriverWrench, faXmark } from '@fortawesome/free-solid-svg-icons';

// Main functional component for adding a client voucher
const AddClientVoucher = () => {
  const router = useRouter();

  // State variables
  const [userRole, setUserRole] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [form, setForm] = useState({
    clientName: '',
    query_license: '',
    state: '',
    district: '',
    tehsil: '',
    near_village: '',
    description: '',
  });

  // 1. State for managing dynamic working stages
  const [workingStages, setWorkingStages] = useState([{
    workDescription: '',
    amount: '',
    workstatus: 'incomplete'
  }]);

  // Initialize states from location data
  useEffect(() => {
    const allStates = locationData.map(state => state.state);
    setStates(allStates);
  }, []);

  // Handle location form changes
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    
    if (['district', 'tehsil', 'near_village'].includes(name) && isOtherDistrict) {
      setForm(prev => ({ ...prev, [name]: value }));
      return;
    }

    if (name === 'state') {
      const selected = locationData.find(s => s.state === value);
      setDistricts(selected?.districts.map(d => d.district) || []);
      setTehsils([]);
      setVillages([]);
      setForm(prev => ({ ...prev, state: value, district: '', tehsil: '', near_village: '' }));
      setIsOtherDistrict(false);
    } else if (name === 'district') {
      const stateData = locationData.find(s => s.state === form.state);
      const districtData = stateData?.districts.find(d => d.district === value);
      setTehsils(districtData?.subDistricts.map(t => t.subDistrict) || []);
      setVillages([]);
      setForm(prev => ({ ...prev, district: value, tehsil: '', near_village: '' }));
      setIsOtherDistrict(false);
    } else if (name === 'tehsil') {
      const stateData = locationData.find(s => s.state === form.state);
      const districtData = stateData?.districts.find(d => d.district === form.district);
      const tehsilData = districtData?.subDistricts.find(t => t.subDistrict === value);
      setVillages(tehsilData?.villages || []);
      setForm(prev => ({ ...prev, tehsil: value, near_village: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle general form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clientName') {
      const titleCase = value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      setForm(prev => ({ ...prev, [name]: titleCase }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // 2. Functions to manage dynamic stages
  const addStage = () => {
    setWorkingStages(prev => [{ workDescription: '', amount: '', workstatus: 'incomplete' }, ...prev]);
  };

  const removeStage = (index) => {
    if (workingStages.length > 1) {
      setWorkingStages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateStage = (index, field, value) => {
    const updated = [...workingStages];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingStages(updated);
  };

  // Autocomplete helpers
  const getUniqueClientNames = () => [...new Set(clients.map(c => c.clientName).filter(Boolean))];
  const getUniqueQueryLicenses = () => [...new Set(clients.map(c => c.query_license).filter(Boolean))];

  // Access Control & Data Fetching
  useEffect(() => {
    const role = JSON.parse(localStorage.getItem('user'))?.role;
    setUserRole(role);
    if (!['admin', 'manager', 'guest'].includes(role)) {
      setTimeout(() => {
        localStorage.clear();
        router.push('/api/logout');
      }, 1500);
    } else {
      fetchClients();
    }
  }, [router]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch('/api/client-accounts?limit=100000');
      if (res.ok) {
        setClients((await res.json()).docs || []);
      } else {
        setError('Failed to load client data.');
      }
    } catch (err) {
      setError('Network error while fetching clients.');
    } finally {
      setLoadingClients(false);
    }
  };

  // Calculation & Reset
  const getTotalAmount = () => {
    return workingStages.reduce((total, stage) => total + (parseFloat(stage.amount) || 0), 0);
  };

  const handleReset = () => {
    setForm({ clientName: '', query_license: '', state: '', district: '', tehsil: '', near_village: '', description: '' });
    setWorkingStages([{ workDescription: '', amount: '', workstatus: 'incomplete' }]);
    setError('');
    setSuccess('');
    setIsOtherDistrict(false);
    setDistricts([]);
    setTehsils([]);
    setVillages([]);
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (!form.clientName || !form.state || !form.district || !form.tehsil || !form.near_village) {
      setError("Please fill in all required fields: Client Name and Location details.");
      return;
    }

    // 4. Update validation logic for dynamic stages
    const validStages = workingStages.filter(stage => stage.workDescription.trim() !== '' && (parseFloat(stage.amount) || 0) > 0);
    if (validStages.length === 0) {
        setError("Please add at least one valid work stage with a description and an amount greater than zero.");
        return;
    }
  
    const matchedClient = clients.find((client) => 
      client.clientName === form.clientName &&
      client.state === form.state &&
      client.district === form.district &&
      client.tehsil === form.tehsil &&
      client.near_village === form.near_village
    );
  
    if (!matchedClient) {
      setError("The provided client details do not match any known client record. Please verify all fields.");
      return;
    }
  
    setSubmitting(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user?.role || 'guest';
    const now = new Date();
    const totalAmount = getTotalAmount();
  
    // 4. Update payload to send the array of working stages
    const payload = {
      clientName: matchedClient.id,
      query_license: matchedClient.id,
      state: matchedClient.id,
      district: matchedClient.id,
      tehsil: matchedClient.id,
      near_village: matchedClient.id,
      workingStage: validStages.map(stage => ({
        workingStage: stage.workDescription,
        workingDescription: stage.amount.toString(),
        workstatus: 'incomplete'
      })),
      workingStageclient: [],
      totalAmount: totalAmount,
      totalAmountclient: 0,
      remainingAmount: totalAmount,
      description: form.description || '',
      paymentstatus: 'pending',
      source: userRole,
      clientCreatedAt: now.toISOString(),
      clientUpdatedAt: now.toISOString()
    };
  
    try {
      const res = await fetch("/api/client-transaction", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload),
      });
  
      const responseData = await res.json();
  
      if (!res.ok) {
        console.error('Server responded with error:', responseData);
        const errorMessage = responseData.errors ? 
          Object.values(responseData.errors).map(err => err.msg || err).join('. ') : 
          (responseData.message || 'Failed to create voucher');
        throw new Error(errorMessage);
      }
  
      setSuccess("Voucher created successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1000);
  
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred while creating the voucher.");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Conditional Rendering
  if (userRole === null) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!['admin', 'manager', 'guest'].includes(userRole)) {
    return (
      <Container className="mt-5"><Alert variant="danger"><FaExclamationTriangle /> Access Denied. Redirecting...</Alert></Container>
    );
  }

  return (
    <Container className="mt-3 px-3 px-sm-4 py-4 bg-light rounded-4 shadow-sm mx-auto" style={{ maxWidth: '900px' }}>
      <h4 className="text-center mb-4 fs-3 fw-bold text-danger">
        <TbTransactionRupee className="fs-1 mb-1 me-2" /> Add Client Voucher
      </h4>
      <hr className="mb-4" />

      {loadingClients && <div className="text-center my-4"><Spinner /><p>Loading Clients...</p></div>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {!loadingClients && (
        <Form onSubmit={handleSubmit}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-warning text-dark fw-bold fs-5"><FaUserTie /> Client Details</Card.Header>
             <Card.Body>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">Client Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control list="client-options" name="clientName" value={form.clientName} onChange={handleFormChange} placeholder="Select or type Client Name" required className="p-2" />
                      {form.clientName.length >= 2 && (
                        <datalist id="client-options">
                          {getUniqueClientNames().filter(name => name.toLowerCase().includes(form.clientName.toLowerCase())).slice(0, 10).map((clientName, index) => (<option key={`client-${index}`} value={clientName} />))}
                        </datalist>
                      )}
                    </Form.Group>
                
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5"><TbCreditCard className="me-1" /> Query License</Form.Label>
                      <Form.Control list="query-license-options" name="query_license" value={form.query_license} onChange={handleFormChange} placeholder="Select or type Query License" className="p-2" />
                      {form.query_license.length >= 2 && (
                        <datalist id="query-license-options">
                          {getUniqueQueryLicenses().filter(license => license.toLowerCase().includes(form.query_license.toLowerCase())).slice(0, 10).map((license, index) => (<option key={`license-${index}`} value={license} />))}
                        </datalist>
                      )}
                    </Form.Group>
               
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">State <span className="text-danger">*</span></Form.Label>
                          <Form.Select name="state" value={form.state} onChange={handleLocationChange} required>
                            <option value="">-- Select State --</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">District <span className="text-danger">*</span></Form.Label>
                          {isOtherDistrict ? (
                            <div className="d-flex align-items-center gap-2">
                              <Form.Control type="text" name="district" placeholder="Enter district" required value={form.district} onChange={handleLocationChange} />
                              <Button variant="outline-danger" onClick={() => { setIsOtherDistrict(false); setForm({ ...form, district: '', tehsil: '', near_village: '' }); }}>
                                <FontAwesomeIcon icon={faXmark} />
                              </Button>
                            </div>
                          ) : (
                            <Form.Select name="district" value={form.district} onChange={handleLocationChange} required>
                              <option value="">-- Select District --</option>
                              {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </Form.Select>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">Tehsil <span className="text-danger">*</span></Form.Label>
                          {isOtherDistrict ? (
                            <Form.Control type="text" name="tehsil" placeholder="Enter tehsil" required value={form.tehsil} onChange={handleFormChange} />
                          ) : (
                            <Form.Select name="tehsil" value={form.tehsil} onChange={handleLocationChange} required>
                              <option value="">-- Select Tehsil --</option>
                              {tehsils.map(t => <option key={t} value={t}>{t}</option>)}
                            </Form.Select>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold fs-5">Nearby Village <span className="text-danger">*</span></Form.Label>
                          {isOtherDistrict ? (
                            <Form.Control type="text" name="near_village" placeholder="Enter village" required value={form.near_village} onChange={handleFormChange} />
                          ) : (
                            <Form.Select name="near_village" value={form.near_village} onChange={handleLocationChange} required>
                              <option value="">-- Select Village --</option>
                              {villages.map(v => <option key={v} value={v}>{v}</option>)}
                            </Form.Select>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
          </Card>
          
          {/* 3. Updated UI for Dynamic Stages */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-primary text-white fw-bold fs-5 d-flex justify-content-between align-items-center">
              <span><FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" /> Our Working Stages</span>
              <Button variant="light" onClick={addStage} size="sm" className="fw-bold text-primary">
                <TbPlus className="me-1" /> Add Stage
              </Button>
            </Card.Header>
            <Card.Body>
              {workingStages.map((stage, index) => (
                <div key={index} className="p-3 border rounded bg-light mb-3">
                  <Row className="align-items-end g-3">
                    <Col xs={12} md={5}>
                      <Form.Label className="fw-bold">Work Description <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" value={stage.workDescription} onChange={e => updateStage(index, 'workDescription', e.target.value)} placeholder="Enter work stage description" required />
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Label className="fw-bold">Amount <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="number" min="0" value={stage.amount} onChange={e => updateStage(index, 'amount', e.target.value)} placeholder="Enter amount" required />
                    </Col>
                    <Col xs={6} md={2}>
                      <Form.Label className="fw-bold">Status</Form.Label>
                      <div><Badge bg="warning" className="p-2 fs-6 w-100"><FaClock className="me-1" /> Incomplete</Badge></div>
                    </Col>
                    <Col xs={6} md={2}>
                      <Button variant="danger" className="w-100" onClick={() => removeStage(index)} disabled={workingStages.length === 1}>
                        Remove
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>


          <Card className="mb-4 border-0 shadow-sm bg-light">
            <Card.Header className="bg-dark text-white fw-bold fs-5"><FaCoins className="me-2" /> Transaction Summary</Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label className="fw-bold fs-5">Total Amount (<FontAwesomeIcon icon={faIndianRupeeSign} />)</Form.Label>
                <Form.Control value={getTotalAmount().toFixed(2)} readOnly className="bg-white fw-bold p-2 text-danger fs-5" />
              </Form.Group>
            </Card.Body>
          </Card>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold fs-5"><FaPencilAlt className="me-1" /> Description (Optional)</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleFormChange} placeholder="Add any additional notes or details about this transaction..." />
          </Form.Group>

          <div className="text-center mt-5">
            <Button type="submit" variant="success" className="fw-bold px-4 py-2 me-3 rounded-pill" disabled={submitting || loadingClients}>
              {submitting ? <><Spinner size="sm" /> Saving...</> : <><FaSave /> Save Transaction</>}
            </Button>
            <Button variant="secondary" className="fw-bold px-4 py-2 rounded-pill" onClick={handleReset} disabled={submitting}>
              <FaUndo /> Reset Form
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default AddClientVoucher;