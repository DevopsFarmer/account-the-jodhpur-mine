'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaXmark } from "react-icons/fa6";
import locationData from '../../../India-state-city-subDistrict-village.json';

const AddVendorAccount = () => {
  const router = useRouter();

 // Initialize states - guests get immediate access


  // Holds the current form values
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorMobile: '',
    query_license: '',
    mining_license: '',
    country: 'India',
    state: '',
    district: '',
    tehsil: '',
    near_village: ''
  });

  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);
  const [vendorNameWarning, setVendorNameWarning] = useState('');
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const role = parsed.role;
        setUserRole(role);
        if (role !== 'admin' && role !== 'manager') {
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/api/logout';
          }, 1500);
        }
      } catch (err) {
        console.error('Invalid user data:', err);
      }
    }
    setStates(locationData.map(item => item.state));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vendorName') {
      const words = value.split(' ');
      const titleCase = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      setFormData(prev => ({ ...prev, [name]: titleCase }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  
    if (['district', 'tehsil', 'near_village'].includes(name) && isOtherDistrict) {
      const valid = value.replace(/[^a-z ]/g, '');
      setFormData(prev => ({ ...prev, [name]: valid }));
      return;
    }
  
    if (name === 'state') {
      const selected = locationData.find(s => s.state === value);
      const distList = selected?.districts.map(d => d.district) || [];
      setDistricts([...distList, 'Other']);
      setTehsils([]);
      setVillages([]);
      setFormData(prev => ({ ...prev, state: value, district: '', tehsil: '', near_village: '' }));
      setIsOtherDistrict(false);
      return;
    }
  
    if (name === 'district') {
      if (value === 'Other') {
        setIsOtherDistrict(true);
        setFormData(prev => ({ ...prev, district: value, tehsil: '', near_village: '' }));
        setTehsils([]);
        setVillages([]);
      } else {
        const stateData = locationData.find(s => s.state === formData.state);
        const districtData = stateData?.districts.find(d => d.district === value);
        const tehsilList = districtData?.subDistricts.map(t => t.subDistrict) || [];
        setTehsils(tehsilList);
        setVillages([]);
        setFormData(prev => ({ ...prev, district: value, tehsil: '', near_village: '' }));
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
      setFormData(prev => ({ ...prev, tehsil: value, near_village: '' }));
      return;
    }
  
    // setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const resetForm = () => { /* ... your resetForm logic is fine ... */ };


  const getFormattedDate = () => new Date().toISOString();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vendor');
      const data = await res.json();

      const duplicate = data?.docs?.some(
        vendor => vendor.vendorName?.toLowerCase() === formData.vendorName.toLowerCase() &&
          vendor.query_license?.toLowerCase() === formData.query_license.toLowerCase() &&
          vendor.near_village?.toLowerCase() === formData.near_village.toLowerCase()
      );

      if (duplicate) {
        setAlertVariant('danger');
        setAlertMessage('This vendor account already exists.');
        setShowAlert(true);
        setIsSubmitting(false);
        setTimeout(() => {
          resetForm();
          setShowAlert(false);
        }, 3000);
        return;
      }

      const newVendor = {
        ...formData,
        vendorCreatedAt: getFormattedDate(),
        vendorUpdatedAt: getFormattedDate()
      };

      const create = await fetch('/api/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });

      if (create.ok) {
        setAlertVariant('success');
        setAlertMessage('Vendor account created successfully!');
        setShowAlert(true);
        setTimeout(() => {
          resetForm();
          router.push('/vendor/account');
        }, 1000);
      } else {
        throw new Error('Failed to save vendor account.');
      }
    } catch (err) {
      setAlertVariant('danger');
      setAlertMessage(err.message || 'Network error.');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
     
      <Container className="mt-4 bg-light rounded-4 p-4 shadow w-100 w-md-75 w-xl-50 mx-auto my-5">
        <h4 className="text-center mb-3 fw-bold">Add New Vendor Account</h4>

        {showAlert && (
          <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            {/* Left Column */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Vendor Name <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" name="vendorName"  value={formData.vendorName} onChange={handleChange} placeholder="Enter vendor name" />
              </Form.Group>

  

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Mobile Number <span className="text-danger">*</span></Form.Label>
                <Form.Control type="tel" name="vendorMobile" required pattern="[0-9]{10}" value={formData.vendorMobile} onChange={handleChange} placeholder="Enter 10-digit number" />
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

            {/* Right Column */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">State <span className="text-danger">*</span></Form.Label>
                <Form.Select name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">-- Select State --</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">State is required.</Form.Control.Feedback>
              </Form.Group>

              {/* District Input OR Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">District <span className="text-danger">*</span></Form.Label>
                {isOtherDistrict ? (
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control type="text" name="district" placeholder="Enter district" pattern="^[a-z ]+$" required value={formData.district} onChange={handleChange} />
                    <Button variant="outline-danger" onClick={() => {
                      setIsOtherDistrict(false);
                      setFormData({ ...formData, district: '', tehsil: '', near_village: '' });
                    }}>
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

              {/* Tehsil Field */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5">Tehsil</Form.Label>
                {isOtherDistrict ? (
                  <Form.Control type="text" name="tehsil" placeholder="Enter tehsil" pattern="^[a-z ]+$" value={formData.tehsil} onChange={handleChange} />
                ) : (
                  <Form.Select name="tehsil" value={formData.tehsil} onChange={handleChange}>
                    <option value="">-- Select Tehsil --</option>
                    {tehsils.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                )}
              </Form.Group>

              {/* Village Field */}
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
              {isSubmitting ? 'Processing...' : 'Create Vendor Account'}
            </Button>
            <Button type="button" variant="secondary" className="fw-bold fs-5" onClick={resetForm}>Reset Form</Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default AddVendorAccount;