

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Form, Button, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import Header from '../components/Header';
import { TbTransactionRupee } from 'react-icons/tb';
import { FaPlus, FaExclamationTriangle, FaTrash, FaRupeeSign } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScrewdriverWrench, faSave as faSaveIcon } from '@fortawesome/free-solid-svg-icons';

const AddExpense = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    initialBalance: '',

  });

  const [expenseItems, setExpenseItems] = useState([{ description: '', amount: '' }]);

  // Authorization check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserRole(parsedUser.role);
          if (parsedUser.role !== 'admin') {
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/api/logout';
            }, 1500);
          } else {
            setLoading(false);
          }
        } else {
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/api/logout';
          }, 1500);
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/api/logout';
        }, 1500);
      }
    }
  }, [router]);

  // Update expense item fields
  const updateExpenseItem = (index, field, value) => {
    const updated = [...expenseItems];
    updated[index][field] = value;
    setExpenseItems(updated);
  };

  // Add new expense item
  const addExpenseItem = () => {
    setExpenseItems([...expenseItems, { description: '', amount: '' }]);
  };

  // Remove expense item
  const removeExpenseItem = (index) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter((_, i) => i !== index));
    }
  };

  // Calculate totals
  const totalExpense = expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const remainingAmount = parseFloat(form.initialBalance || 0) - totalExpense;

  // Reset form
  const handleReset = () => {
    setForm({
      name: '',
      initialBalance: '',
    });
    setExpenseItems([{ description: '', amount: '' }]);
    setError('');
    setSuccess('');
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!form.name || !form.initialBalance) {
      setError('Please fill all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        nameOfExpense: form.name,
        initialBalanceAmount: parseFloat(form.initialBalance),
        addExpenseItems: expenseItems.map(item => ({
          description: item.description,
          amount: parseFloat(item.amount) || 0,
        })),
        expenseCreatedAt: new Date().toISOString(),
        expenseUpdatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save expense');
      }

      setSuccess('Expense saved successfully!');
      setTimeout(() => {
        handleReset();
        router.push('/view-expense');
      }, 1000);
    } catch (err) {
      console.error("Error saving expense:", err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading || userRole === null) {
    return (
      <>
        <Header />
        <Container className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 fw-semibold">Verifying access...</p>
        </Container>
      </>
    );
  }

  // Unauthorized access
  if (userRole !== 'admin') {
    return (
      <>
        <Container className="py-5 text-center">
          <Alert variant="danger" className="fw-semibold">
            <FaExclamationTriangle className="me-2" />
            You don't have permission to access this page
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt-3 px-3 px-sm-4 py-4 bg-light rounded-4 shadow-sm w-100 w-md-75 mx-auto">
        <h4 className="text-center mb-4 fs-4 fw-bold text-danger">
          <TbTransactionRupee className="fs-1 mb-1" /> Add New Expense
        </h4>

        {error && (
          <Alert variant="danger" className="text-center fw-semibold">
            <FaExclamationTriangle className="me-2" /> {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="text-center fw-semibold">
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Expense Name */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold fs-5">
              Expense Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Enter expense name"
              required
            />
          </Form.Group>

          {/* Initial Balance */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold fs-5">
              Initial Balance <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
              <Form.Control
                type="number"
                name="initialBalance"
                value={form.initialBalance}
                onChange={(e) => setForm({...form, initialBalance: e.target.value})}
                placeholder="Enter initial balance"
                required
                min="0"
              />
            </InputGroup>
          </Form.Group>

          {/* Expense Items Section - Structured like Working Stages */}
          <div className="d-flex justify-content-between align-items-center my-4">
            <h5 className="fw-bold text-dark fs-5">
              <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" />
              Expense Items
            </h5>
            <Button 
              variant="warning" 
              onClick={addExpenseItem}
              className="w-25 fs-5 fw-bold text-capitalize text-center justify-content-center align-items-center d-flex gap-1"
            >
              <FaPlus className="me-1 fw-bold fs-6" size={30}/> Add Items
            </Button>
          </div>

          {expenseItems.map((item, index) => (
            <Row key={index} className="my-2 align-items-center">
              <Col sm={5} className="pb-3 pb-md-0">
                <Form.Control
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateExpenseItem(index, 'description', e.target.value)}
                />
              </Col>
              <Col sm={4} className="pb-3 pb-md-0">
                <InputGroup>
                  <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="₹ Amount"
                    value={item.amount}
                    onChange={(e) => updateExpenseItem(index, 'amount', e.target.value)}
                    min="0"
                  />
                </InputGroup>
              </Col>
              <Col sm={3} className="pb-3 pb-md-0">
                <Button
                  variant="danger"
                  onClick={() => removeExpenseItem(index)}
                  disabled={expenseItems.length === 1}
                  className="w-75 fw-bold text-white"
                >
                  <FaTrash className="me-1" /> Remove
                </Button>
              </Col>
            </Row>
          ))}

          {/* Financial Summary */}
          <Row className="my-4 border-top pt-3">
            <Col sm={6} className="pb-3 pb-md-0">
              <Form.Label className="fw-bold fs-5">Total Expense (<FaRupeeSign />)</Form.Label>
              <Form.Control 
                value={totalExpense.toFixed(2)} 
                readOnly 
                className={`bg-white fw-bold ${totalExpense < 0 ? 'text-dark' : 'text-danger'}`}
              />
            </Col>
            <Col sm={6} className="pb-3 pb-md-0">
              <Form.Label className="fw-bold fs-5">Remaining Balance (<FaRupeeSign />)</Form.Label>
              <Form.Control 
                value={remainingAmount.toFixed(2)} 
                readOnly 
                className={`bg-white fw-bold ${remainingAmount < 0 ? 'text-dark' : 'text-success'}`}
              />
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="text-center">
            <Button 
              type="submit" 
              variant="success" 
              className="fw-bold px-4 py-2 me-2" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving Expense...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSaveIcon} className="me-1 fs-5" /> Save Expense
                </>
              )}
            </Button>
            <Button 
              variant="secondary" 
              className="px-4 py-2 fw-bold" 
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default AddExpense;
