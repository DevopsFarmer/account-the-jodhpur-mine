
'use client';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Form, Row, Col, InputGroup, Button, Spinner, Alert } from "react-bootstrap";
import { FaPlus, FaTrash, FaRupeeSign } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScrewdriverWrench, faSave as faSaveIcon } from '@fortawesome/free-solid-svg-icons';
import { FaAlignJustify } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';



const EditExpense = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // State variables
  const [expense, setExpense] = useState(null);
  const [initialBalance, setInitialBalance] = useState("");
  const [expenseItems, setExpenseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // For displaying errors to the user
  const [userRole, setUserRole] = useState(null); // To store the user's role

  // 1. Client-side Role-Based Access Control
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/api/logout"); 
        return; 
      }
      try {
        const parsedUser = JSON.parse(userData);
        const role = parsedUser.role;
        setUserRole(role);

        if (role !== "admin") {
          setTimeout(() => {
            localStorage.clear()
            window.location.href = '/api/logout'
          }, 1500); 
        } else {
          fetchExpense();
        }
      } catch (e) {
        console.error("Failed to parse user data or check role:", e);
        setTimeout(() => {
          localStorage.clear()
          window.location.href = '/api/logout'
        }, 1500); 
      }
    }
  }, [router, id]); 

  // Load expense data from Payload backend
  const fetchExpense = async () => {
    setLoading(true);
    setError(null); 
    try {
      const res = await fetch(`/api/expense/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Expense not found.");
        } else if (res.status === 403) {
          throw new Error("You are not authorized to view this expense.");
        }
        throw new Error(`Failed to load expense: ${res.statusText}`);
      }
      const data = await res.json();
      setExpense(data);
      setInitialBalance(data.initialBalanceAmount !== undefined ? data.initialBalanceAmount : "");
      setExpenseItems(data.addExpenseItems && Array.isArray(data.addExpenseItems) ? data.addExpenseItems : []);
    } catch (err) {
      console.error("Failed to load expense:", err);
      setError(err.message || "Failed to load expense data.");
    } finally {
      setLoading(false);
    }
  };

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

  const removeMainExpense = (index) => {
    setExpenseItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

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

  const addExpense = (level, parentId, subId) => {
    if (level === 'main') {
      setExpenseItems(prev => [...prev, {
        id: Date.now().toString(),
        amount: '',
        date:'',
        description: '',
        subexpense: []
      }]);
    } else if (level === 'sub') {
      setExpenseItems(prev => prev.map(item => 
        item.id === parentId 
          ? {
              ...item,
              subexpense: [...item.subexpense, {
                id: Date.now().toString(),
                amount: '',
                date:'',
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
                      addExpense: [...sub.addExpense, {
                        id: Date.now().toString(),
                        amount: '',
                        date:'',
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

  // Save the updated data to Payload CMS
  const saveChanges = async () => {
    setSaving(true);
    setError(null);

    // Basic validation
    if (isNaN(parseFloat(initialBalance)) || parseFloat(initialBalance) < 0) {
      setError("Initial Balance must be a non-negative number.");
      setSaving(false);
      return;
    }
    // Validate each expense item's amount and description
    const hasInvalidExpenseItem = expenseItems.some(item =>
      !item.description.trim() || isNaN(parseFloat(item.amount)) || parseFloat(item.amount) < 0
    );

    if (hasInvalidExpenseItem) {
      setError("All expense items must have a description and a non-negative number for the amount.");
      setSaving(false);
      return;
    }

    const updatedExpense = {
      ...expense, 
      initialBalanceAmount: parseFloat(initialBalance),
      addExpenseItems: expenseItems.map(item => ({
        description: item.description.trim(),
        amount: parseFloat(item.amount),
        date:item.date,
        subexpense: item.subexpense.map(sub => ({
          description: sub.description.trim(),
          amount: parseFloat(sub.amount),
          date:sub.date,
          addExpense: sub.addExpense.map(add => ({
            description: add.description.trim(),
            amount: parseFloat(add.amount),
            date:add.date,
          }))
        }))
      })),
      expenseUpdatedAt: new Date().toISOString(), 
    };

    try {
      const res = await fetch(`/api/expense/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify(updatedExpense),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save changes.");
      }

      router.push("/expense"); 
    } catch (error) {
      console.error("Error saving:", error);
      setError(error.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && userRole === "admin") {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading expense data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
      
        <Container className="mt-5">
          <Alert variant="danger">
            <h4>Error:</h4>
            <p>{error}</p>
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
          </Alert>
        </Container>
      </>
    );
  }

  if (userRole !== "admin") {
    return null; 
  }

  return (
    <div className="min-vh-100">
   
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center mb-4">Edit Expense</h2>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <Form onSubmit={(e) => e.preventDefault()}>
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
                        value={expense?.nameOfExpense || 'N/A'}
                        readOnly
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
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
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
                     <div className="row g-2">
                      <div className="col-12 col-md-4">
                        <InputGroup>
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
                        </InputGroup>
                      </div>
                      <div className="col-12 col-md-4">
                        <InputGroup>
                          <InputGroup.Text>
                            <FaCalendarAlt />
                          </InputGroup.Text>
                          <Form.Control
                            type="date"
                            placeholder="date"
                            value={item.date}
                            onChange={(e) => updateExpense('main', item.id, '', '', 'date', e.target.value)}
                            required
                          />
                        </InputGroup>
                      </div>
                      <div className="col-12 col-md-4">
                        <InputGroup>
                          <InputGroup.Text>
                            <FaAlignJustify />
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
                      </div>
                    </div>

                    {item.subexpense.map((sub, subIndex) => (
                      <div key={sub.id} className="ms-4 border-start ps-3">
                          <div className="row g-2">
                          <div className="col-12 col-md-4">
                            <InputGroup>
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
                            </InputGroup>
                          </div>
                          <div className="col-12 col-md-4">
                            <InputGroup>
                              <InputGroup.Text>
                                <FaCalendarAlt />
                              </InputGroup.Text>
                              <Form.Control
                                type="date"
                                placeholder="date"
                                value={sub.date}
                                onChange={(e) => updateExpense('sub', item.id, sub.id, '', 'date', e.target.value)}
                                required
                              />
                            </InputGroup>
                          </div>
                          <div className="col-12 col-md-4">
                            <InputGroup>
                              <InputGroup.Text>
                                <FaAlignJustify />
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
                          </div>
                        </div>

                        {sub.addExpense.map((add, addIndex) => (
                          <div key={add.id} className="ms-4 border-start ps-3">
                            <div className="row g-2">
                              <div className="col-12 col-md-4">
                                <InputGroup>
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
                                </InputGroup>
                              </div>
                              <div className="col-12 col-md-4">
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FaCalendarAlt />
                                  </InputGroup.Text>
                                  <Form.Control
                                    type="date"
                                    placeholder="date"
                                    value={add.date}
                                    onChange={(e) => updateExpense('add', item.id, sub.id, add.id, 'date', e.target.value)}
                                    required
                                  />
                                </InputGroup>
                              </div>
                              <div className="col-12 col-md-4">
                                <InputGroup>
                                  <InputGroup.Text>
                                    <FaAlignJustify />
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
                            </div>
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
                  variant="primary"
                  onClick={saveChanges}
                  className="mt-3"
                  disabled={saving}
                >
                  {saving ? (
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
                  Save Changes
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditExpense;