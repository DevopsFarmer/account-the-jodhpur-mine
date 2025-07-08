
'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation"; 
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';

import '../styles.css';

const LoginForm = () => {
  const router = useRouter();
  // User input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password show/hide toggle
  const [showPassword, setShowPassword] = useState(false);

  // Error and loading feedback
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show/hide password
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Submit form function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        setError(data.message || 'Login failed.')
      }
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred.')
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container fluid className="login-container d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={7} lg={5} xl={4}>
          <div className="login-box p-4 p-md-5 rounded shadow-lg">
            <div className="text-center mb-4">
              <h2 className="text-warning fw-bold">JODHPUR MINES</h2>
              <p className="text-white mb-0">Financial Ledger System</p>
            </div>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Email */}
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="text-white text-uppercase small">Username</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter username (e.g., john.doe)"
                    value={email.split('@')[0]} // Show only username part
                    required
                    onChange={(e) => {
                      const username = e.target.value.toLowerCase().trim();
                      if (username.includes('@')) {
                        setEmail(username);
                      } else {
                        setEmail(`${username}@gmail.com`);
                      }
                    }}
                    aria-label="Username"
                  />
                  {/* <InputGroup.Text>@gmail.com</InputGroup.Text> */}
                </InputGroup>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label className="text-white text-uppercase small">Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type='password'
                    placeholder="Enter your password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={toggleShowPassword}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <div className="mb-4 text-center">
                <small className="text-muted text-white-50">
                  Forgot Password? Contact System Administrator
                </small>
              </div>

              <Button
                type="submit"
                className="w-100 ledger-button text-dark fw-bold bg-warning d-flex justify-content-center align-items-center gap-2"
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                    Logging in...
                  </>
                ) : (
                  <>
                    ACCESS LEDGER SYSTEM <FaArrowRight />
                  </>
                )}
              </Button>
            </Form>

            <hr className="fw-bold text-muted mb-0 mt-5" />
            <footer className="mt-4 text-center text-muted text-wrap small text-white-50">
              &copy; 2025 Jodhpur Mining Corporation. All rights reserved.
            </footer>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;