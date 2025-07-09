'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import locationData from '../../../location.json';

const AddClientAccount = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    clientName: '',
    clientMobile: '',
    query_license: '',
    mining_license: '',
    country: 'India',
    state: 'Rajasthan',
    district: 'Jodhpur',
    tehsil: 'Jodhpur',
    near_village: ''
  });

  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [villages, setVillages] = useState([]);

  useEffect(() => {
    const allVillages = locationData.sub_districts?.[0]?.villages || [];
    setVillages(allVillages);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientMobile: '',
      query_license: '',
      mining_license: '',
      country: 'India',
      state: '',
      district: '',
      near_village: ''
    });
    setValidated(false);
  };

  const getFormattedDate = () => new Date().toISOString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/client-accounts');
      const data = await res.json();

      const duplicate = data?.docs?.some(
        client =>
          client.clientName?.toLowerCase() === formData.clientName.toLowerCase() &&
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

  return (
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
              <Form.Control
                type="text"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Enter client name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold fs-5">Mobile Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                name="clientMobile"
                required
                pattern="[0-9]{10}"
                value={formData.clientMobile}
                onChange={handleChange}
                placeholder="Enter 10-digit number"
              />
              <Form.Control.Feedback type="invalid">Enter a valid 10-digit number.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold fs-5">Query License <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="query_license"
                required
                value={formData.query_license}
                onChange={handleChange}
                placeholder="Enter query license"
              />
              <Form.Control.Feedback type="invalid">Query License is required.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold fs-5">Mining License</Form.Label>
              <Form.Control
                type="text"
                name="mining_license"
                value={formData.mining_license}
                onChange={handleChange}
                placeholder="Enter mining license"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold fs-5">Nearby Village <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="near_village"
                value={formData.near_village}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Village --</option>
                {villages.map((village) => (
                  <option key={village} value={village}>
                    {village}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Nearby Village is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center mt-4 d-flex justify-content-center gap-2 flex-wrap">
          <Button type="submit" variant="success" className="fw-bold fs-5" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Create Client Account'}
          </Button>
          <Button type="button" variant="secondary" className="fw-bold fs-5" onClick={resetForm}>
            Reset Form
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddClientAccount;
