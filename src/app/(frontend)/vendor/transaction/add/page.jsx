

'use client'; // This directive marks the component as a Client Component in Next.js
// Import necessary React hooks and components from 'react' and 'next/navigation'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import locationData from '../../../India-state-city-subDistrict-village.json';
import { FaCalendarAlt } from 'react-icons/fa';
// Import Bootstrap components for layout, forms, buttons, alerts, and spinners
import { Container, Form, Button, Row, Col, Alert, Spinner, Card, Badge } from 'react-bootstrap';

// Import icons from various libraries for a richer UI
import { TbTransactionRupee, TbPlus, TbCreditCard, TbTrashFilled } from 'react-icons/tb';
import { FaSave, FaExclamationTriangle, FaUserTie, FaMapMarkerAlt, FaCoins, FaPencilAlt, FaUndo, FaClock } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndianRupeeSign, faScrewdriverWrench, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';


// Main functional component for adding vendor transactions
const AddVendorTransaction = () => {
  // Initialize the Next.js router for navigation
  const router = useRouter();

  // State variables to manage component data and UI states
  const [userRole, setUserRole] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [villages, setVillages] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);

  useEffect(() => {
    // Extract states from location data
    const allStates = locationData.map(state => state.state);
    setStates(allStates);
  }, []);


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

  // Form state aligned with VendorTransactions collection
  const [form, setForm] = useState({
    vendorName: '',
    query_license: '',
    near_village: '',
    description: '',
    paymentstatus: 'pending',
  });

  // Working stages aligned with collection schema for 'our' side (company's work/expenses related to vendor)
  const [workingStages, setWorkingStages] = useState([{
    workingStage: '',
    workingDescription: '',
    workstatus: 'incomplete'
  }]);

  // Vendor's working stages aligned with collection schema (vendor's charges/payments)
  const [workingStagesVendor, setWorkingStagesVendor] = useState([{
    workingStagevendor: '',
    workingDescriptionvendor: '',
    stageDate: ''
  }]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper Functions for Unique Options
  const getUniqueVendorNames = () => {
    const names = vendors.filter((vendor) => vendor.vendorName && vendor.vendorName.trim() !== '')
      .map((vendor) => vendor.vendorName);
    return [...new Set(names)];
  };

  const getUniqueQueryLicenses = () => {
    const licenses = vendors.filter((vendor) => vendor.query_license && vendor.query_license.trim() !== '')
      .map((vendor) => vendor.query_license);
    return [...new Set(licenses)];
  };

  const getUniqueNearVillages = () => {
    const villages = vendors.filter((vendor) => vendor.near_village && vendor.near_village.trim() !== '')
      .map((vendor) => vendor.near_village);
    return [...new Set(villages)];
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

      if (role !== 'admin' && role !== 'manager') {
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/api/logout';
        }, 1500);
      }
    }
  }, [router]);

  // useEffect Hook: Fetch All Vendor Accounts
  useEffect(() => {
    const fetchVendors = async () => {
      if (userRole === 'admin' || userRole === 'manager') {
        setLoadingVendors(true);
        try {
          const res = await fetch('/api/vendor?limit=100000'); // Assuming a similar API endpoint for vendors
          if (res.ok) {
            const data = await res.json();
            setVendors(data?.docs || []);
            console.log(data.docs);
          } else {
            console.error('Failed to fetch vendors:', res.status, res.statusText);
            setError('Failed to load vendor data. Please try again.');
            setVendors([]);
          }
        } catch (err) {
          console.error('Error fetching vendors:', err);
          setError('Network error while fetching vendors.');
          setVendors([]);
        } finally {
          setLoadingVendors(false);
        }
      }
    };

    if (userRole) {
      fetchVendors();
    }
  }, [userRole]);

  // Event Handlers
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // Updated to match collection schema field names for our side
  const updateStage = (index, field, value) => {
    const updated = [...workingStages];
    updated[index][field] = value;
    setWorkingStages(updated);
  };

  // Updated to match collection schema field names for vendor side
  const updateStageVendor = (index, field, value) => {
    const updated = [...workingStagesVendor];
    updated[index][field] = value;
    setWorkingStagesVendor(updated);
  };

  const addStage = () => {
    setWorkingStages([...workingStages, {
      workingStage: '',
      workingDescription: '',
      workstatus: 'incomplete'
    }]);
  };

  const addStageVendor = () => {
    setWorkingStagesVendor([
      ...workingStagesVendor,
      { workingStagevendor: '', workingDescriptionvendor: '', stageDate: '' }
    ]);
  };

  const removeStage = (index) => {
    if (workingStages.length > 1) {
      setWorkingStages(workingStages.filter((_, i) => i !== index));
    }
  };

  const removeStageVendor = (index) => {
    if (workingStagesVendor.length > 1) {
      setWorkingStagesVendor(workingStagesVendor.filter((_, i) => i !== index));
    }
  };

  // Calculation Functions - Updated to use correct field names
  const getTotalAmount = () => {
    // This is "totalAmount" in VendorTransactions.ts, representing 'our' cost
    const workTotal = workingStages.reduce((sum, s) => sum + (parseFloat(s.workingDescription) || 0), 0);
    return workTotal;
  };

  const getTotalAmountVendor = () => {
    // This is "totalAmountvendor" in VendorTransactions.ts, representing what vendor charges us
    const workTotalVendor = workingStagesVendor.reduce((sum, s) => sum + (parseFloat(s.workingDescriptionvendor) || 0), 0);
    return workTotalVendor;
  };

  const getRemainingAmount = () => {
    // Remaining amount might be (our total cost) - (vendor's total charges)
    // Or it could be (vendor's charges) - (our payments to vendor), depending on business logic.
    // Assuming it's the difference between what we spend and what the vendor charges us.
    return getTotalAmount() - getTotalAmountVendor();
  };

  const handleReset = () => {
    setForm({
      vendorName: '',
      query_license: '',
      near_village: '',
      description: '',
      paymentstatus: 'pending',
    });
    setWorkingStages([{
      workingStage: '',
      workingDescription: '',
      workstatus: 'incomplete'
    }]);
    setWorkingStagesVendor([{ workingStagevendor: '', workingDescriptionvendor: '', stageDate: '' }]);
    setError('');
    setSuccess('');
  };

  // Form Submission Handler - Updated payload structure for VendorTransactions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.vendorName || !form.query_license || !form.near_village) {
      setError("Please fill in all required fields: Vendor Name, Query License, and Near Village.");
      return;
    }

    const matchedVendor = vendors.find((vendor) =>
      (vendor.vendorName === form.vendorName || vendor.id === form.vendorName) &&
      (vendor.query_license === form.query_license || vendor.id === form.query_license) &&
      (vendor.near_village === form.near_village || vendor.id === form.near_village)
    );

    if (!matchedVendor) {
      const vendorMatch = vendors.some((vendor) => vendor.vendorName === form.vendorName || vendor.id === form.vendorName);
      const licenseMatch = vendors.some((vendor) => vendor.query_license === form.query_license || vendor.id === form.query_license);
      const villageMatch = vendors.some((vendor) => vendor.near_village === form.near_village || vendor.id === form.near_village);

      if (licenseMatch && villageMatch && !vendorMatch) {
        setError("Vendor Name is incorrect for the selected Query License and Near Village.");
      } else if (vendorMatch && licenseMatch && !villageMatch) {
        setError("Near Village is incorrect for the selected Vendor Name and Query License.");
      } else if (vendorMatch && villageMatch && !licenseMatch) {
        setError("Query License is incorrect for the selected Vendor Name and Near Village.");
      } else if (vendorMatch && !licenseMatch && !villageMatch) {
        setError("Both Query License and Near Village are incorrect for the selected Vendor Name.");
      } else if (!vendorMatch && licenseMatch && !villageMatch) {
        setError("Vendor Name and Near Village are incorrect for the selected Query License.");
      } else if (!vendorMatch && !licenseMatch && villageMatch) {
        setError("Vendor Name and Query License are incorrect for the selected Near Village.");
      } else {
        setError("The provided Vendor Name, Query License, and Near Village do not match any known vendor.");
      }
      setTimeout(() => handleReset(), 3000);
      return;
    }

    setSubmitting(true);

    // Updated payload to match VendorTransactions collection schema
    const payload = {
      vendorName: matchedVendor.id, // Relationship field, stores ID
      query_license: matchedVendor.id, // Relationship field, stores ID
      near_village: matchedVendor.id, // Relationship field, stores ID
      totalAmount: getTotalAmount(), // Our side's total amount
      totalAmountvendor: getTotalAmountVendor(), // Vendor's side total amount
      remainingAmount: getRemainingAmount(),
      workingStage: workingStages.map((s) => ({
        workingStage: s.workingStage,
        workingDescription: s.workingDescription,
        workstatus: s.workstatus
      })),
      workingStagevendor: workingStagesVendor.map((s) => ({
        workingStagevendor: s.workingStagevendor,
        workingDescriptionvendor: s.workingDescriptionvendor,
        stageDate: s.stageDate,
      })),
      description: form.description,
      vendorCreatedAt: new Date().toISOString(), // Renamed for clarity
      vendorUpdatedAt: new Date().toISOString(), // Renamed for clarity
      paymentstatus: "pending", // Default value
    };

    try {
      // Assuming a new API endpoint for vendor transactions
      const res = await fetch("/api/vendor-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Vendor transaction saved successfully!");
        setTimeout(() => {
          handleReset();
          router.push("/vendor/transaction"); // Redirect to vendor transactions view
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

  if (userRole !== 'admin' && userRole !== 'manager') {
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
          <TbTransactionRupee className="fs-1 mb-1 me-2" /> Add Vendor Transaction
        </h4>
        <hr className="mb-4" />

        {loadingVendors && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <div className="fw-semibold mt-2">Loading Vendor List...</div>
          </div>
        )}

        {!loadingVendors && vendors.length === 0 && (
          <Alert variant="info" className="text-center fw-semibold">
            <FaExclamationTriangle className="me-2" />
            No vendor accounts found. Please add a vendor first to create a transaction.
            <Button variant="info" className="ms-2 btn-sm" onClick={() => router.push('/vendor/account/add')}>
              Add Vendor Now
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

        {!loadingVendors && vendors.length > 0 && (
          <Form onSubmit={handleSubmit}>
            {/* Vendor Information Section */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-warning text-dark fw-bold fs-5 d-flex align-items-center">
                <FaUserTie className="me-2" /> Vendor Details
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold fs-5">
                        Vendor Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        list="vendor-options"
                        name="vendorName"
                        value={form.vendorName}
                        onChange={handleFormChange}
                        placeholder="Select or type Vendor Name"
                        required
                        className="p-2"
                      />
                      {form.vendorName.length >= 2 && (
                        <datalist id="vendor-options">
                          {getUniqueVendorNames()
                            .filter(name => name.toLowerCase().includes(form.vendorName.toLowerCase()))
                            .slice(0, 10)
                            .map((vendorName, index) => (
                              <option key={`vendor-${index}`} value={vendorName} />
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
                  <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" /> Our Working Stages (Our Costs)
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
                {workingStages.map((stage, index) => (
                  <div key={`our-stage-${index}`} className="mb-4 p-3 border rounded bg-light">
                    <Row className="mb-3 align-items-center g-2">
                      <Col xs={12} md={5}>
                        <Form.Label className="fw-bold small">Work Description</Form.Label>
                        <Form.Control
                          placeholder="e.g., Land Survey, Documentation"
                          value={stage.workingStage}
                          onChange={(e) => updateStage(index, 'workingStage', e.target.value)}
                          className="p-2"
                        />
                      </Col>
                      <Col xs={8} md={4}>
                        <Form.Label className="fw-bold small">Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="₹ Amount"
                          value={stage.workingDescription}
                          onChange={(e) => updateStage(index, 'workingDescription', e.target.value)}
                          className="p-2"
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

            {/* Vendor's Working Stages Section - Updated field names */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-success text-white fw-bold fs-5 d-flex align-items-center justify-content-between">
                <div>
                  <FontAwesomeIcon icon={faMoneyCheckDollar} className="me-2" /> Vendor's Stages (Vendor Charges)
                </div>
                <Button
                  variant="light"
                  onClick={addStageVendor}
                  className="fw-bold text-dark d-flex align-items-center px-3 py-1 rounded-pill"
                >
                  <TbPlus className="me-1" size={25} /> Add Stage
                </Button>
              </Card.Header>
              <Card.Body>
                {workingStagesVendor.map((stage, index) => (
                  <Row key={`vendor-stage-${index}`} className="mb-3 align-items-center g-2">
                    <Col xs={12} md={4}>
                      <Form.Control
                        placeholder="Vendor Service Description (e.g., Material Supply, Labor)"
                        value={stage.workingStagevendor}
                        onChange={(e) => updateStageVendor(index, 'workingStagevendor', e.target.value)}
                        className="p-2"
                      />
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Control
                        type="number"
                        placeholder="₹ Vendor Charged Amount"
                        value={stage.workingDescriptionvendor}
                        onChange={(e) => updateStageVendor(index, 'workingDescriptionvendor', e.target.value)}
                        className="p-2"
                      />
                    </Col>
                           <Col xs={12} md={3} className="mb-3">
                      <Form.Label className="fw-bold">
                        <FaCalendarAlt className="me-2" />
                        Stage Date <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        placeholder="Stage Date"
                        value={stage.stageDate}
                        onChange={(e) => updateStageClient(index, 'stageDate', e.target.value)}
                        className="p-2"
                        required
                      />
                    </Col>
                    {/* <Col xs={8} md={3}>
                      <Form.Control
                        type="date"
                        placeholder="Stage Date"
                        value={stage.stageDate}
                        onChange={(e) => updateStageVendor(index, 'stageDate', e.target.value)}
                        className="p-2"
                        required
                      />
                    </Col> */}
                    <Col xs={4} md={2} className="d-flex justify-content-end">
                      <Button
                        variant="danger"
                        onClick={() => removeStageVendor(index)}
                        disabled={workingStagesVendor.length === 1}
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
                        Total Vendor Charged Amount (<FontAwesomeIcon icon={faIndianRupeeSign} />)
                      </Form.Label>
                      <Form.Control
                        value={getTotalAmountVendor().toFixed(2)}
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
                disabled={submitting || loadingVendors || vendors.length === 0}
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

export default AddVendorTransaction;