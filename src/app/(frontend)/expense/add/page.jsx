

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Form, Button, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle, FaTrash, FaRupeeSign } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave as faSaveIcon } from '@fortawesome/free-solid-svg-icons';

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
    id: Date.now().toString(),
    amount: '',
    description: '',
    subexpense: []
  }]);

  // Function to add new expense item at any level
  const addExpense = (level, parentId, subId) => {
    if (level === 'main') {
      setExpenseItems(prev => [...prev, {
        id: Date.now().toString(),
        amount: '',
        description: '',
        subexpense: []
      }]);
    } else if (level === 'sub') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              subexpense: [...(item.subexpense || []), {
                id: Date.now().toString(),
                amount: '',
                description: '',
                addExpense: []
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
                      addExpense: [...(sub.addExpense || []), {
                        id: Date.now().toString(),
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

  // Function to update expense item
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
              subexpense: [...(item.subexpense || [])].map(sub => 
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
              subexpense: [...(item.subexpense || [])].map(sub => 
                sub.id === subId
                  ? {
                      ...sub,
                      addExpense: [...(sub.addExpense || [])].map(add => 
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



  // Function to remove subexpense item
  const removeSubExpense = (parentId, subIndex) => {
    setExpenseItems(prev => prev.map(item => 
      item.id === parentId 
        ? {
            ...item,
            subexpense: [...(item.subexpense || [])].filter((_, i) => i !== subIndex)
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
            subexpense: [...(item.subexpense || [])].map(sub => 
              sub.id === subId
                ? {
                    ...sub,
                    addExpense: [...(sub.addExpense || [])].filter((_, i) => i !== addIndex)
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



  // Calculate totals
  const totalExpense = expenseItems.reduce((sum, item) => {
    const subTotal = (item.subexpense || []).reduce((subSum, sub) => {
      const addTotal = (sub.addExpense || []).reduce((addSum, add) => addSum + (parseFloat(add.amount) || 0), 0);
      return subSum + (parseFloat(sub.amount) || 0) + addTotal;
    }, 0);
    return sum + (parseFloat(item.amount) || 0) + subTotal;
  }, 0);

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

    // Validate amounts
    const mainAmount = parseFloat(form.initialBalance);
    
    // Check if total main expenses exceed initial balance
    const totalMainExpenses = expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    if (totalMainExpenses > mainAmount) {
      setError('Total main expenses cannot exceed initial balance');
      setIsSubmitting(false);
      return;
    }

    // Validate sub and additional expenses
    for (const item of expenseItems) {
      const mainAmount = parseFloat(item.amount);
      
      // Check sub expenses
      const totalSubExpenses = item.subexpense.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
      if (totalSubExpenses > mainAmount) {
        setError('Total sub expenses cannot exceed main expense amount');
        setIsSubmitting(false);
        return;
      }

      // Check additional expenses for each sub expense
      for (const sub of item.subexpense) {
        const subAmount = parseFloat(sub.amount);
        const totalAddExpenses = sub.addExpense.reduce((sum, add) => sum + (parseFloat(add.amount) || 0), 0);
        if (totalAddExpenses > subAmount) {
          setError('Total additional expenses cannot exceed sub expense amount');
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      const payload = {
        nameOfExpense: form.name,
        initialBalanceAmount: parseFloat(form.initialBalance),
        addExpenseItems: expenseItems.map(item => ({
          amount: parseFloat(item.amount) || 0,
          description: item.description,
          subexpense: item.subexpense.map(sub => ({
            amount: parseFloat(sub.amount) || 0,
            description: sub.description,
            addExpense: sub.addExpense.map(add => ({
              amount: parseFloat(add.amount) || 0,
              description: add.description
            }))
          }))
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
        router.push('/expense');
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
    <div className="min-vh-100">
      
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center mb-4">Add Expense</h2>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="mb-3">
                {success}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="name">
                    <Form.Label>Expense Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Enter expense name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="initialBalance">
                    <Form.Label>Initial Balance</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        placeholder="Enter initial balance"
                        value={form.initialBalance}
                        onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <h3 className="mt-4">Expense Items</h3>
              <div className="border rounded p-3">
                {expenseItems.map((item, index) => (
                  <div key={item.id} className="mb-3">
                    <InputGroup className="mb-2">
                      <InputGroup.Text>
                        <FaRupeeSign />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateExpense('main', item.id, '', '', 'amount', e.target.value)}
                        required
                      />
                      <InputGroup.Text>
                        <FaPlus />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateExpense('main', item.id, '', '', 'description', e.target.value)}
                        required
                      />
                      <Button
                        variant="outline-danger"
                        onClick={() => removeExpenseItem(index)}
                        className="ms-2"
                      >
                        <FaTrash />
                      </Button>
                    </InputGroup>

                    {(item.subexpense || []).map((sub, subIndex) => (
                      <div key={sub.id} className="ms-4 border-start ps-3">
                        <InputGroup className="mb-2">
                          <InputGroup.Text>
                            <FaRupeeSign />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            placeholder="Sub Amount"
                            value={sub.amount}
                            onChange={(e) => updateExpense('sub', item.id, sub.id, '', 'amount', e.target.value)}
                            required
                          />
                          <InputGroup.Text>
                            <FaPlus />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Sub Description"
                            value={sub.description}
                            onChange={(e) => updateExpense('sub', item.id, sub.id, '', 'description', e.target.value)}
                            required
                          />
                          <Button
                            variant="outline-danger"
                            onClick={() => removeSubExpense(item.id, subIndex)}
                            className="ms-2"
                          >
                            <FaTrash />
                          </Button>
                        </InputGroup>

                        {(sub.addExpense || []).map((add, addIndex) => (
                          <div key={add.id} className="ms-4 border-start ps-3">
                            <InputGroup className="mb-2">
                              <InputGroup.Text>
                                <FaRupeeSign />
                              </InputGroup.Text>
                              <Form.Control
                                type="number"
                                placeholder="Additional Amount"
                                value={add.amount}
                                onChange={(e) => updateExpense('add', item.id, sub.id, add.id, 'amount', e.target.value)}
                                required
                              />
                              <InputGroup.Text>
                                <FaPlus />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                placeholder="Additional Description"
                                value={add.description}
                                onChange={(e) => updateExpense('add', item.id, sub.id, add.id, 'description', e.target.value)}
                                required
                              />
                              <Button
                                variant="outline-danger"
                                onClick={() => removeAddExpense(item.id, sub.id, addIndex)}
                                className="ms-2"
                              >
                                <FaTrash />
                              </Button>
                            </InputGroup>
                          </div>
                        ))}

                        <Button
                          variant="outline-primary"
                          onClick={() => addExpense('add', item.id, sub.id)}
                          className="ms-4 mb-2"
                        >
                          <FaPlus /> Add Additional Expense
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline-primary"
                      onClick={() => addExpense('sub', item.id, '')}
                      className="ms-4 mb-2"
                    >
                      <FaPlus /> Add Sub Expense
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline-primary"
                  onClick={() => addExpense('main', '', '')}
                  className="mt-3"
                >
                  <FaPlus /> Add Main Expense
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faSaveIcon} className="me-2" />
                  )}
                  Save Expense
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddExpense;
