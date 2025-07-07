

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

  const [expenseItems, setExpenseItems] = useState([{
    id: '',
    amount: '',
    description: '',
    subexpense: [{
      id: '',
      amount: '',
      description: '',
      addExpense: [{
        id: '',
        amount: '',
        description: ''
      }]
    }]
  }]);

  // Function to add new expense item at any level
  const addExpense = (level, parentId, subId) => {
    if (level === 'main') {
      setExpenseItems(prev => [...prev, {
        id: '',
        amount: '',
        description: '',
        subexpense: [{
          id: '',
          amount: '',
          description: '',
          addExpense: [{
            id: '',
            amount: '',
            description: ''
          }]
        }]
      }]);
    } else if (level === 'sub') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              subexpense: [...item.subexpense, {
                id: '',
                amount: '',
                description: '',
                addExpense: [{
                  id: '',
                  amount: '',
                  description: ''
                }]
              }]
            }
          : item
      ));
    } else if (level === 'add') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              subexpense: item.subexpense.map(sub => 
                sub.id === subId
                  ? {
                      ...sub,
                      addExpense: [...sub.addExpense, {
                        id: '',
                        amount: '',
                        description: ''
                      }]
                    }
                  : sub
              )
            }
          : item
      ));
    }
  };

  // Function to update any expense item at any level
  const updateExpense = (level, parentId, subId, addId, field, value) => {
    if (level === 'main') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              [field]: value
            }
          : item
      ));
    } else if (level === 'sub') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              subexpense: item.subexpense.map(sub => 
                sub.id === subId
                  ? {
                      ...sub,
                      [field]: value
                    }
                  : sub
              )
            }
          : item
      ));
    } else if (level === 'add') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              subexpense: item.subexpense.map(sub => 
                sub.id === subId
                  ? {
                      ...sub,
                      addExpense: sub.addExpense.map(add => 
                        add.id === addId
                          ? {
                              ...add,
                              [field]: value
                            }
                          : add
                      )
                    }
                  : sub
              )
            }
          : item
      ));
    }
  };

  // Function to remove main expense item
  // Function to remove main expense item by index
  const removeMainExpense = (index) => {
    setExpenseItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  // Function to remove subexpense item
  const removeSubExpense = (parentId, subIndex) => {
    setExpenseItems(prev => prev.map(item => 
      item.id === parentId 
        ? {
            ...item,
            subexpense: item.subexpense.filter((_, i) => i !== subIndex)
          }
        : item
    ));
  };

  // Function to remove add expense item
  const removeAddExpense = (parentId, subId, addIndex) => {
    setExpenseItems(prev => prev.map(item => 
      item.id === parentId 
        ? {
            ...item,
            subexpense: item.subexpense.map(sub => 
              sub.id === subId
                ? {
                    ...sub,
                    addExpense: sub.addExpense.filter((_, i) => i !== addIndex)
                  }
                : sub
            )
          }
        : item
    ));
  };

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
              onClick={() => {
                addExpense('main', '', '');
                // Focus on the description field after adding
                setTimeout(() => {
                  const inputs = document.querySelectorAll('input[type="text"][placeholder="Main Item description"]');
                  const lastInput = inputs[inputs.length - 1];
                  if (lastInput) {
                    lastInput.focus();
                  }
                }, 100);
              }}
              className="w-25 fs-5 fw-bold text-capitalize text-center justify-content-center align-items-center d-flex gap-1"
            >
              <FaPlus className="me-1 fw-bold fs-6" size={30}/> Add Main Item
            </Button>
          </div>

          {expenseItems.map((mainItem, mainIndex) => (
            <div key={mainItem.id} className="border rounded mb-3 p-3">
              <Row className="my-2 align-items-center">
                <Col sm={5} className="pb-3 pb-md-0">
                  <Form.Control
                    placeholder="Main Item description"
                    value={mainItem.description}
                    onChange={(e) => updateExpense('main', mainItem.id, '', '', 'description', e.target.value)}
                  />
                </Col>
                <Col sm={4} className="pb-3 pb-md-0">
                  <InputGroup>
                    <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="₹ Amount"
                      value={mainItem.amount}
                      onChange={(e) => updateExpense('main', mainItem.id, '', '', 'amount', e.target.value)}
                      min="0"
                    />
                  </InputGroup>
                </Col>
                <Col sm={3} className="pb-3 pb-md-0 d-flex gap-2">
                  <Button
                    variant="warning"
                    onClick={() => {
                      addExpense('sub', mainItem.id, '');
                      // Focus on the sub item description after adding
                      setTimeout(() => {
                        const inputs = document.querySelectorAll('input[type="text"][placeholder="Sub Item description"]');
                        const lastInput = inputs[inputs.length - 1];
                        if (lastInput) {
                          lastInput.focus();
                        }
                      }, 100);
                    }}
                    className="w-50 fw-bold text-white"
                  >
                    <FaPlus className="me-1" /> Add Sub Item
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => removeMainExpense(mainIndex)}
                    disabled={expenseItems.length === 1}
                    className="w-50 fw-bold text-white"
                  >
                    <FaTrash className="me-1" /> Remove
                  </Button>
                </Col>
              </Row>

              {/* Subexpenses */}
              {mainItem.subexpense.map((subItem, subIndex) => (
                <div key={subItem.id} className="border rounded mb-3 p-3 ms-3">
                  <Row className="my-2 align-items-center">
                    <Col sm={5} className="pb-3 pb-md-0">
                      <Form.Control
                        placeholder="Sub Item description"
                        value={subItem.description}
                        onChange={(e) => updateExpense('sub', mainItem.id, subItem.id, '', 'description', e.target.value)}
                      />
                    </Col>
                    <Col sm={4} className="pb-3 pb-md-0">
                      <InputGroup>
                        <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                        <Form.Control
                          type="number"
                          placeholder="₹ Amount"
                          value={subItem.amount}
                          onChange={(e) => updateExpense('sub', mainItem.id, subItem.id, '', 'amount', e.target.value)}
                          min="0"
                        />
                      </InputGroup>
                    </Col>
                    <Col sm={3} className="pb-3 pb-md-0 d-flex gap-2">
                      <Button
                        variant="warning"
                        onClick={() => {
                          addExpense('add', mainItem.id, subItem.id);
                          // Focus on the add expense description after adding
                          setTimeout(() => {
                            const inputs = document.querySelectorAll('input[type="text"][placeholder="Additional Expense description"]');
                            const lastInput = inputs[inputs.length - 1];
                            if (lastInput) {
                              lastInput.focus();
                            }
                          }, 100);
                        }}
                        className="w-50 fw-bold text-white"
                      >
                        <FaPlus className="me-1" /> Add Expense
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => removeSubExpense(mainItem.id, subIndex)}
                        className="w-50 fw-bold text-white"
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    </Col>
                  </Row>

                  {/* Add Expenses */}
                  {subItem.addExpense.map((addExpense, addIndex) => (
                    <div key={addExpense.id} className="border rounded mb-3 p-3 ms-3">
                      <Row className="my-2 align-items-center">
                        <Col sm={5} className="pb-3 pb-md-0">
                          <Form.Control
                            placeholder="Additional Expense description"
                            value={addExpense.description}
                            onChange={(e) => updateExpense('add', mainItem.id, subItem.id, addExpense.id, 'description', e.target.value)}
                          />
                        </Col>
                        <Col sm={4} className="pb-3 pb-md-0">
                          <InputGroup>
                            <InputGroup.Text><FaRupeeSign /></InputGroup.Text>
                            <Form.Control
                              type="number"
                              placeholder="₹ Amount"
                              value={addExpense.amount}
                              onChange={(e) => updateExpense('add', mainItem.id, subItem.id, addExpense.id, 'amount', e.target.value)}
                              min="0"
                            />
                          </InputGroup>
                        </Col>
                        <Col sm={3} className="pb-3 pb-md-0">
                          <Button
                            variant="danger"
                            onClick={() => removeAddExpense(mainItem.id, subItem.id, addIndex)}
                            className="w-100 fw-bold text-white"
                          >
                            <FaTrash className="me-1" /> Remove
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              ))}
            </div>
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
