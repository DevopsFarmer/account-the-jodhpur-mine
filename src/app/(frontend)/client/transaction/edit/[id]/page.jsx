"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { TbTransactionRupee, TbPlus } from "react-icons/tb";
import { FaSave, FaExclamationTriangle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign, faScrewdriverWrench, faMoneyCheckDollar, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

const EditClientTransaction = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id; // Get the transaction ID from the URL

  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // For initial data fetch and role check
  const [submitting, setSubmitting] = useState(false); // For form submission

  // Main form state, initialized with empty strings
  const [form, setForm] = useState({
    clientName: "", // Display name
    query_license: "", // Display value
    near_village: "", // Display value
    description: "",
    paymentstatus: "", // Display value
    totalAmount: "", // This will correspond to our working stages total
    totalAmountclient: "", // This will correspond to client working stages total
    remainingAmount: "", // Calculated field
  });

  // State to store actual IDs for relationship fields (for PATCH payload)
  const [clientId, setClientId] = useState("");
  const [queryLicenseId, setQueryLicenseId] = useState("");
  const [nearVillageId, setNearVillageId] = useState("");

  // Working stages for our side (matching collection schema)
  const [workingStages, setWorkingStages] = useState([{ 
    workingStage: "", 
    workingDescription: "",
    workstatus: "incomplete" // Default value as per schema
  }]);
  
  // Working stages for the client side (matching collection schema)
  const [workingStagesClient, setWorkingStagesClient] = useState([{ 
    workingStageclient: "", 
    workingDescriptionclient: "" 
  }]);

  // State for read-only creation date
  const [clientCreatedAt, setClientCreatedAt] = useState("");
  const [clientUpdatedAt, setClientUpdatedAt] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Client-Side Access Control
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      let role = null;
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          role = parsedUser.role;
          setUserRole(role);
        } catch (parseError) {
          console.error("Error parsing user data from localStorage in EditClientTransaction:", parseError);
        }
      }

      if (role !== 'admin' && role !== 'manager') {
        console.warn(`Unauthorized access attempt to EditClientTransaction by user with role: ${role || 'undefined'}. Redirecting...`);
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/api/logout';
        }, 1500);
      }
    }
  }, [router]);

  // 2. Fetch existing transaction data
  useEffect(() => {
    // Only proceed to fetch data if transactionId exists and userRole is determined to be authorized
    if (transactionId && (userRole === 'admin' || userRole === 'manager')) {
      const fetchTransaction = async () => {
        try {
          const res = await fetch(`/api/client-transaction/${transactionId}`);
          const data = await res.json();

          if (res.ok) {
            // Populate form fields with fetched data
            setForm({
              clientName: data.clientName?.clientName || "",
              query_license: data.query_license?.query_license || "",
              near_village: data.near_village?.near_village || "",
              description: data.description || "",
              paymentstatus: data.paymentstatus || "pending",
              totalAmount: data.totalAmount?.toString() || "",
              totalAmountclient: data.totalAmountclient?.toString() || "",
              remainingAmount: data.remainingAmount?.toString() || "",
            });

            // Set actual IDs for PATCH request
            setClientId(data.clientName?.id || data.clientName?._id || "");
            setQueryLicenseId(data.query_license?.id || data.query_license?._id || "");
            setNearVillageId(data.near_village?.id || data.near_village?._id || "");

            // Set working stages; if none exist, initialize with one empty stage
            setWorkingStages(data.workingStage?.length > 0 ?
              data.workingStage.map(s => ({ 
                workingStage: s.workingStage || '', 
                workingDescription: s.workingDescription || '',
                workstatus: s.workstatus || 'incomplete'
              })) :
              [{ workingStage: "", workingDescription: "", workstatus: "incomplete" }]
            );

            setWorkingStagesClient(data.workingStageclient?.length > 0 ?
              data.workingStageclient.map(s => ({ 
                workingStageclient: s.workingStageclient || '', 
                workingDescriptionclient: s.workingDescriptionclient || '' 
              })) :
              [{ workingStageclient: "", workingDescriptionclient: "" }]
            );

            setClientCreatedAt(data.clientCreatedAt);
            setClientUpdatedAt(data.clientUpdatedAt);
          } else {
            setError(data.message || "Error loading transaction data.");
            console.error("Failed to fetch transaction:", data);
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError("Failed to load transaction. Please check your network connection.");
        } finally {
          setLoading(false);
        }
      };

      fetchTransaction();
    } else if (userRole && userRole !== 'admin' && userRole !== 'manager') {
      setLoading(false);
    }
  }, [transactionId, userRole]);

  // Handle changes in main form input fields (only for editable fields)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // Handle changes within a specific working stage input (Our Side)
  const updateStage = (index, field, value) => {
    const updated = [...workingStages];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingStages(updated);
  };

  // Add a new empty working stage row (Our Side)
  const addStage = () => {
    setWorkingStages([...workingStages, { 
      workingStage: "", 
      workingDescription: "",
      workstatus: "incomplete" // Default value
    }]);
  };

  // Remove a working stage row (Our Side) by its index
  const removeStage = (index) => {
    if (workingStages.length > 1) {
      const updated = workingStages.filter((_, i) => i !== index);
      setWorkingStages(updated);
    }
  };

  // Handle changes within a specific working stage input (Client Side)
  const updateStageClient = (index, field, value) => {
    const updated = [...workingStagesClient];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingStagesClient(updated);
  };

  // Add a new empty working stage row (Client Side)
  const addStageClient = () => {
    setWorkingStagesClient([...workingStagesClient, { 
      workingStageclient: "", 
      workingDescriptionclient: "" 
    }]);
  };

  // Remove a working stage row (Client Side) by its index
  const removeStageClient = (index) => {
    if (workingStagesClient.length > 1) {
      const updated = workingStagesClient.filter((_, i) => i !== index);
      setWorkingStagesClient(updated);
    }
  };

  // Calculate totalAmount (from our working stages)
  const getTotalAmount = () => {
    const workTotal = workingStages.reduce((sum, s) => sum + (parseFloat(s.workingDescription) || 0), 0);
    return workTotal;
  };

  // Calculate totalAmountclient (from client's working stages)
  const getTotalAmountClient = () => {
    const workTotalClient = workingStagesClient.reduce((sum, s) => sum + (parseFloat(s.workingDescriptionclient) || 0), 0);
    return workTotalClient;
  };

  // Calculate the remaining amount (Our Total Amount - Client Total Amount)
  const getRemainingAmount = () => {
    return getTotalAmount() - getTotalAmountClient();
  };

  // Handle form submission to update the client transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // Construct the payload for the PATCH request to the backend
    const payload = {
      clientName: clientId,
      query_license: queryLicenseId,
      near_village: nearVillageId,
      paymentstatus: form.paymentstatus,
      clientCreatedAt: clientCreatedAt,
      clientUpdatedAt: new Date().toISOString(),
      totalAmount: getTotalAmount(),
      totalAmountclient: getTotalAmountClient(),
      remainingAmount: getRemainingAmount(),
      workingStage: workingStages.map((s) => ({
        workingStage: s.workingStage,
        workingDescription: s.workingDescription,
        workstatus: s.workstatus // Include workstatus in payload
      })),
      workingStageclient: workingStagesClient.map((s) => ({
        workingStageclient: s.workingStageclient,
        workingDescriptionclient: s.workingDescriptionclient,
      })),
      description: form.description,
    };

    try {
      const res = await fetch(`/api/client-transaction/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Client transaction updated successfully!");
        setTimeout(() => {
          setSuccess("");
          router.push("/client/transaction/view");
        }, 1000);
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to update transaction. Please try again.");
        console.error("API error:", errData);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setError("An unexpected error occurred. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading spinner while initial data or user role is being determined
  if (loading || userRole === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="fw-semibold my-2 ms-2">Loading Please Wait...</p>
      </div>
    );
  }

  // Display unauthorized message if user role is not admin or manager
  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <>
        <Container className="mt-5 text-center">
          <Alert variant="danger" className="fw-semibold">
            <FaExclamationTriangle className="me-2" />
            You do not have permission to access this page. Redirecting...
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
     
      <Container className="mt-3 px-3 px-sm-4 py-4 bg-light rounded-4 shadow-sm w-100 w-md-75 mx-auto">
        <h4 className="text-center mb-4 fs-4 fw-bold text-danger">
          <TbTransactionRupee className="fs-1 mb-1" /> Edit Client Transaction
        </h4>

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

        <Form onSubmit={handleSubmit}>
          {/* Read-only Client Name */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold fs-5 text-center text-wrap text-capitalize">Client Name</Form.Label>
            <Form.Control value={form.clientName} readOnly className="bg-light" />
          </Form.Group>

          {/* Read-only Query License and Near Village */}
          <Row className="my-4">
            <Col sm={6} className="pb-3 pb-md-0">
              <Form.Label className="fw-bold fs-5 text-center text-wrap text-capitalize">Query License</Form.Label>
              <Form.Control value={form.query_license} readOnly className="bg-light" />
            </Col>
            <Col sm={6}>
              <Form.Label className="fw-bold fs-5 text-center text-wrap text-capitalize">Nearby Village</Form.Label>
              <Form.Control value={form.near_village} readOnly className="bg-light" />
            </Col>
          </Row>

          <hr className="my-2" />

          {/* Client Created At and Payment Status */}
          <Row className="my-4">
            <Col sm={4} className="pb-3 pb-md-0">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5 text-center text-wrap text-capitalize">Transaction Created At</Form.Label>
                <Form.Control value={clientCreatedAt ? `${formatDate(clientCreatedAt)} at ${formatTime(clientCreatedAt)}` : 'Never'} readOnly className="bg-light" />
              </Form.Group>
            </Col>
            <Col sm={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-5 text-center text-wrap text-capitalize">Transaction Updated At</Form.Label>
                <Form.Control value={clientUpdatedAt ? `${formatDate(clientUpdatedAt)} at ${formatTime(clientUpdatedAt)}` : 'Never'} readOnly className="bg-light" />
              </Form.Group>
            </Col>
            <Col sm={4}>
              <Form.Label className="fw-bold fs-5 text-center text-wrap text-capitalize">Transaction Payment Status</Form.Label>
              <div className={`p-2 rounded text-center fw-bold text-uppercase ${form.paymentstatus === 'paid' ? 'bg-success text-white' : form.paymentstatus === 'pending' ? 'bg-warning text-dark' : 'bg-danger text-white'}`}>
                {form.paymentstatus || 'N/A'}
              </div>
            </Col>
          </Row>

          <hr className="my-2" />

          {/* Section for Dynamic Working Stages (Our Side) */}
          <div className="d-flex justify-content-between align-items-center my-4">
            <h5 className="fw-bold text-dark fs-5">
              <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" />
              Our Working Stages
            </h5>
            <Button variant="primary" onClick={addStage} className="w-25 fs-6 fw-bold text-white text-capitalize text-center justify-content-center align-items-center d-flex gap-1">
              <TbPlus className="me-1 fw-bold fs-5" size={35} /> Add Stage
            </Button>
          </div>

          {workingStages.map((stage, index) => (
            <div key={`our-stage-${index}`} className="border rounded p-3 mb-3 bg-white">
              <Row className="align-items-center">
                <Col sm={4} className="pb-3 pb-md-0">
                  <Form.Label className="fw-semibold">Work Description</Form.Label>
                  <Form.Control
                    placeholder="Work Description"
                    value={stage.workingStage}
                    onChange={(e) => updateStage(index, 'workingStage', e.target.value)}
                  />
                </Col>
                <Col sm={3} className="pb-3 pb-md-0">
                  <Form.Label className="fw-semibold">Amount</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Work Details/Amount"
                    value={stage.workingDescription}
                    onChange={(e) => updateStage(index, 'workingDescription', e.target.value)}
                  />
                </Col>
                <Col sm={2} className="pb-3 pb-md-0">
                  <Form.Label className="fw-semibold">Work Status</Form.Label>
                  <div className={`p-2 rounded text-center fw-bold text-uppercase text-xs ${stage.workstatus === 'complete' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    {stage.workstatus}
                  </div>
                </Col>
                <Col sm={3} className="pb-3 pb-md-0">
                  <Form.Label className="fw-semibold">Action</Form.Label>
                  <Button 
                    variant="danger" 
                    onClick={() => removeStage(index)} 
                    disabled={workingStages.length === 1} 
                    className="w-100 fw-bold text-white"
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <hr className="my-2" />

          {/* Section for Dynamic Working Stages (Client Side) */}
          <div className="d-flex justify-content-between align-items-center my-4">
            <h5 className="fw-bold text-dark fs-5">
              <FontAwesomeIcon icon={faMoneyCheckDollar} className="me-2" />
              Client Working Stages
            </h5>
            <Button variant="primary" onClick={addStageClient} className="w-25 fs-6 fw-bold text-white text-capitalize text-center justify-content-center align-items-center d-flex gap-1">
              <TbPlus className="me-1 fw-bold fs-5" size={35} /> Add Stage
            </Button>
          </div>

          {workingStagesClient.map((stage, index) => (
            <Row key={`client-stage-${index}`} className="my-2 align-items-center">
              <Col sm={5} className="pb-3 pb-md-0">
                <Form.Control
                  placeholder="Client Work Description"
                  value={stage.workingStageclient}
                  onChange={(e) => updateStageClient(index, 'workingStageclient', e.target.value)}
                />
              </Col>
              <Col sm={4} className="pb-3 pb-md-0">
                <Form.Control
                  type="text"
                  placeholder="Work Details/Amount"
                  value={stage.workingDescriptionclient}
                  onChange={(e) => updateStageClient(index, 'workingDescriptionclient', e.target.value)}
                />
              </Col>
              <Col sm={3} className="pb-3 pb-md-0">
                <Button variant="danger" onClick={() => removeStageClient(index)} disabled={workingStagesClient.length === 1} className="w-75 fw-bold text-white">
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          {/* Calculated Totals: Read-only fields */}
          <Row className="my-4">
            {/* <Col sm={6} className="pb-3 pb-md-0">
              <Form.Label className="fw-bold fs-5">Total Amount (Our Side) (<FontAwesomeIcon icon={faIndianRupeeSign} />)</Form.Label>
              <Form.Control value={getTotalAmount().toFixed(2)} readOnly className="bg-white" />
            </Col> */}
            <Col sm={6} className="pb-3 pb-md-0">
              <Form.Label className="fw-bold fs-5">Total Amount (Client Side) (<FontAwesomeIcon icon={faIndianRupeeSign} />)</Form.Label>
              <Form.Control value={getTotalAmountClient().toFixed(2)} readOnly className="bg-white" />
            </Col>
          </Row>

          {/* <Row className="my-4">
            <Col sm={12} className="pb-3 pb-md-0">
              <Form.Label className="fw-bold fs-5">Remaining Amount (<FontAwesomeIcon icon={faIndianRupeeSign} />)</Form.Label>
              <Form.Control value={getRemainingAmount().toFixed(2)} readOnly className="bg-white" />
            </Col>
          </Row> */}

          {/* Description Textarea */}
          <Form.Group className="my-4">
            <Form.Label className="fw-bold fs-5">Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Add any optional notes or remarks about this transaction"
            />
          </Form.Group>

          {/* Action Buttons: Save Changes and Go Back */}
          <div className="d-flex flex-column flex-md-row gap-3 justify-content-center mt-4 flex-wrap align-items-center">
            <Button
              type="submit"
              className="px-4 fw-bold rounded-3"
              variant="success"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving changes...
                </>
              ) : (
                <>
                  <FaSave className="me-2 fs-5" /> Save Changes
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="px-4 fw-bold rounded-3"
              onClick={() => router.push("/client/transaction/view")}
            >
              Go Back
            </Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default EditClientTransaction;