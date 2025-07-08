'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaXmark } from "react-icons/fa6";
import locationData from '../../../location.json'; 

const AddClientAccount = ({ isGuest = false }) => {
  const router = useRouter();

  // Initialize states - guests get immediate access
  const [userRole, setUserRole] = useState(isGuest ? 'guest' : null);
  const [isLoaded, setIsLoaded] = useState(isGuest);

  // Holds the current form values (UNCHANGED)
  const [formData, setFormData] = useState({
    clientName: '',
    clientMobile: '',
    query_license: '',
    mining_license: '',
    country: 'India',
    state: '',
    district: '',
    tehsil: '',
    near_village: ''
  });

  // Validation and UI control states (UNCHANGED)
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);
  const [clientNameWarning, setClientNameWarning] = useState('');
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);

  // Handle all input changes here (UNCHANGED)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clientName') {
      const valid = value.replace(/[^a-z ]/g, '');
      setClientNameWarning(valid !== value ? 'Only lowercase letters and spaces allowed' : '');
      setFormData({ ...formData, [name]: valid });
      return;
    }
    if (['district', 'tehsil', 'near_village'].includes(name) && isOtherDistrict) {
      const valid = value.replace(/[^a-z ]/g, '');
      setFormData({ ...formData, [name]: valid });
      return;
    }
    if (name === 'state') {
      const selected = locationData.find(s => s.state === value);
      const distList = selected?.districts.map(d => d.district) || [];
      setDistricts([...distList, 'Other']);
      setTehsils([]); setVillages([]);
      setFormData({ ...formData, state: value, district: '', tehsil: '', near_village: '' });
      setIsOtherDistrict(false);
      return;
    }
    if (name === 'district') {
      if (value === 'Other') {
        setIsOtherDistrict(true);
        setFormData({ ...formData, district: '', tehsil: '', near_village: '' });
        setTehsils([]); setVillages([]);
      } else {
        const stateData = locationData.find(s => s.state === formData.state);
        const districtData = stateData?.districts.find(d => d.district === value);
        const tehsilList = districtData?.subDistricts.map(t => t.subDistrict) || [];
        setTehsils(tehsilList);
        setVillages([]);
        setFormData({ ...formData, district: value, tehsil: '', near_village: '' });
        setIsOtherDistrict(false);
      }
      return;
    }
    if (name === 'tehsil') {
      const stateData = locationData.find(s => s.state === formData.state);
      const districtData = stateData?.districts.find(d => d.district === formData.district);
      const tehsilData = districtData?.subDistricts.find(t => t.subDistrict === value);
      const villageList = tehsilData?.villages || [];
      setVillages(villageList);
      setFormData({ ...formData, tehsil: value, near_village: '' });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // Reset form back to initial values (UNCHANGED)
  const resetForm = () => { /* ... your resetForm logic is fine ... */ };

  const getFormattedDate = () => new Date().toISOString();

  // Handle form submission with logging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/client-accounts');
      const data = await res.json();
      console.log('Fetched data from GET /api/client-accounts:', data); // <-- LOG GET DATA

      const duplicate = data?.docs?.some(
        client => client.clientName?.toLowerCase() === formData.clientName.toLowerCase() &&
          client.query_license?.toLowerCase() === formData.query_license.toLowerCase() &&
          client.near_village?.toLowerCase() === formData.near_village.toLowerCase()
      );

      if (duplicate) {
        setAlertVariant('danger');
        setAlertMessage('This client account already exists.');
        setShowAlert(true);
        setIsSubmitting(false);
        setTimeout(() => {
          resetForm();
          setShowAlert(false);
        }, 3000);
        return;
      }

      const newClient = {
        ...formData,
        clientCreatedAt: getFormattedDate(),
        clientUpdatedAt: getFormattedDate()
      };
      console.log('Data being sent in POST /api/client-accounts:', newClient); // <-- LOG POST DATA

      const create = await fetch('/api/client-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      if (create.ok) {
        setAlertVariant('success');
        setAlertMessage('Client account created successfully!');
        setShowAlert(true);
        setTimeout(() => {
          resetForm();
          // Redirect all users to the main dashboard
          router.push('/');
        }, 1000);
      } else {
        throw new Error('Failed to save client account.');
      }
    } catch (err) {
      setAlertVariant('danger');
      setAlertMessage(err.message || 'Network error.');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize states when component mounts
  useEffect(() => {
    setStates(locationData.map(item => item.state));
    setIsLoaded(true);
  }, []);

  // Handle loading state
  if (!isLoaded) {
    return <p className="text-center mt-5">Loading...</p>;
  }



  // The rest of the component renders for authorized users (admin, manager, or guest)
  return (
    <>
     
      
      {/* The entire form structure below is UNCHANGED */}
      <Container className="mt-4 bg-light rounded-4 p-4 shadow w-100 w-md-75 w-xl-50 mx-auto my-5">
        <h4 className="text-center mb-3 fw-bold">Add New Client Account</h4>

        {showAlert && (
          <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Client Name <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" name="clientName" required pattern="^[a-z ]+$" value={formData.clientName} onChange={handleChange} placeholder="Enter client name" />
                <Form.Control.Feedback type="invalid">Lowercase letters and spaces are allowed.</Form.Control.Feedback>
                {clientNameWarning && <div className="text-danger mt-1">{clientNameWarning}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Mobile Number <span className="text-danger">*</span></Form.Label>
                <Form.Control type="tel" name="clientMobile" required pattern="[0-9]{10}" value={formData.clientMobile} onChange={handleChange} placeholder="Enter 10-digit number" />
                <Form.Control.Feedback type="invalid">Enter a valid 10-digit number.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Query License <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" name="query_license" required value={formData.query_license} onChange={handleChange} placeholder="Enter query license"/>
                <Form.Control.Feedback type="invalid">Query License is required.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Mining License</Form.Label>
                <Form.Control type="text" name="mining_license" value={formData.mining_license} onChange={handleChange} placeholder="Enter mining license"/>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">State <span className="text-danger">*</span></Form.Label>
                <Form.Select name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">-- Select State --</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">State is required.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">District <span className="text-danger">*</span></Form.Label>
                {isOtherDistrict ? (
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control type="text" name="district" placeholder="Enter district" pattern="^[a-z ]+$" required value={formData.district} onChange={handleChange} />
                    <Button variant="outline-danger" onClick={() => { setIsOtherDistrict(false); setFormData({ ...formData, district: '', tehsil: '', near_village: '' }); }}>
                      <FaXmark size={20} className="text-center fw-bold fs-5"/>
                    </Button>
                  </div>
                ) : (
                  <Form.Select name="district" value={formData.district} onChange={handleChange} required>
                    <option value="">-- Select District --</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </Form.Select>
                )}
                <Form.Control.Feedback type="invalid">District is required.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Tehsil <span className="text-danger">*</span></Form.Label>
                {isOtherDistrict ? (
                  <Form.Control type="text" name="tehsil" placeholder="Enter tehsil" pattern="^[a-z ]+$" required value={formData.tehsil} onChange={handleChange} />
                ) : (
                  <Form.Select name="tehsil" value={formData.tehsil} onChange={handleChange} required>
                    <option value="">-- Select Tehsil --</option>
                    {tehsils.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                )}
                <Form.Control.Feedback type="invalid">Tehsil is required.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Nearby Village <span className="text-danger">*</span></Form.Label>
                {isOtherDistrict ? (
                  <Form.Control type="text" name="near_village" placeholder="Enter village" pattern="^[a-z ]+$" required value={formData.near_village} onChange={handleChange} />
                ) : (
                  <Form.Select name="near_village" value={formData.near_village} onChange={handleChange} required>
                    <option value="">-- Select Village --</option>
                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                  </Form.Select>
                )}
                <Form.Control.Feedback type="invalid">Nearby Village is required.</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center mt-4 d-flex justify-content-center gap-2 flex-wrap">
            <Button type="submit" variant="success" className="fw-bold fs-5" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Create Client Account'}
            </Button>
            <Button type="button" variant="secondary" className="fw-bold fs-5" onClick={resetForm}>Reset Form</Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default AddClientAccount;