// 'use client'; // Required for client-side code like useState and useRouter
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
// import Header from '../components/Header'; // Adjust path based on your file structure
// const AddClientAccount = () => {
//   const router = useRouter(); // For navigating after successful form submission

//   // 🔧 This is our form data state. It holds all the input values.
//   const [formData, setFormData] = useState({
//     clientName: '',
//     clientMobile: '',
//     query_license: '',
//     mining_license: '',
//     near_village: '',
//     tehsil: '',
//     district: '',
//     state: '',
//     country: ''
//   });

//   const [validated, setValidated] = useState(false); // For form validation UI
//   const [showAlert, setShowAlert] = useState(false); // For showing alert message
//   const [alertMessage, setAlertMessage] = useState(''); // Message text
//   const [alertVariant, setAlertVariant] = useState('success'); // success / danger
//   const [isSubmitting, setIsSubmitting] = useState(false); // To disable button while processing

//   // 💡 Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // 🧠 Update the formData object with new input
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   // 💡 Reset all fields
//   const resetForm = () => {
//     setFormData({
//       clientName: '',
//       clientMobile: '',
//       query_license: '',
//       mining_license: '',
//       near_village: '',
//       tehsil: '',
//       district: '',
//       state: '',
//       country: ''
//     });
//     setValidated(false);
//   };

//   // 🧠 Format the current date/time for clientCreatedAt
//   const getFormattedDate = () => {
//     const now = new Date();
//     return now.toISOString(); // ISO format for Payload date field
//   };

//   // 💡 Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Prevent page reload
//     const form = e.currentTarget;
//     setValidated(true); // Show form validation styles

//     // ✅ Check if the form is valid
//     if (form.checkValidity() === false) {
//       e.stopPropagation(); // Prevent submission if form is invalid
//       return;
//     }

//     setIsSubmitting(true); // Disable button while submitting

//     // ✅ Prepare data to send to Payload CMS
//     const newClient = {
//       ...formData,
//       clientCreatedAt: getFormattedDate(),
//       clientUpdatedAt: getFormattedDate(),
//     };

//     try {
//       const response = await fetch('/api/client-accounts', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(newClient)
//       });

//       if (response.ok) {
//         setAlertVariant('success');
//         setAlertMessage('Client account created successfully!');
//         setShowAlert(true);
//         setTimeout(() => {
//           setShowAlert(false);
//           resetForm();
//           router.push('/viewclient-account'); // Navigate to View page
//         }, 2000);
//       } else {
//         const error = await response.json();
//         setAlertVariant('danger');
//         setAlertMessage(error.message || 'Something went wrong.');
//         setShowAlert(true);
//         setIsSubmitting(false);
//       }
//     } catch (err) {
//       setAlertVariant('danger');
//       setAlertMessage('Network error. Please try again.');
//       setShowAlert(true);
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <Header />
//       <Container className="mt-4 bg-light rounded-4 p-4 shadow shadow-info shadow-5 rounded-5 w-100 w-sm-100 w-md-75 w-lg-75 w-xl-75 w-xxl-50 mx-auto my-5 ">
//         <h4 className="mb-3 text-center fw-bold fs-4">Add New Client Account</h4>

//         {/* Alert message box */}
//         {showAlert && (
//           <Alert
//             variant={alertVariant}
//             dismissible
//             onClose={() => setShowAlert(false)}
//           >
//             {alertMessage}
//           </Alert>
//         )}

//         {/* Client Form */}
//         <Form noValidate validated={validated} onSubmit={handleSubmit}>
//           <Row>
//             {/* Left side inputs */}
//             <Col md={6}>
//               <Form.Group className="mb-3" controlId="clientName">
//                 <Form.Label className="fw-bold">Client's Name <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="clientName"
//                   required
//                   value={formData.clientName}
//                   onChange={handleChange}
//                   placeholder="Enter full name"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Client name is required.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="clientMobile">
//                 <Form.Label className="fw-bold">Client's Mobile Number <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="tel"
//                   name="clientMobile"
//                   required
//                   pattern="[0-9]{10}"
//                   value={formData.clientMobile}
//                   onChange={handleChange}
//                   placeholder="10-digit mobile number"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Enter valid 10-digit mobile number.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="query_license">
//                 <Form.Label className="fw-bold"> Client's Query License <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="query_license"
//                   required
//                   value={formData.query_license}
//                   onChange={handleChange}
//                   placeholder="Enter query license"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Query license is required.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="mining_license">
//                 <Form.Label className="fw-bold"> Client's Mining License <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="mining_license"
//                   required
//                   value={formData.mining_license}
//                   onChange={handleChange}
//                   placeholder="Enter mining license"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Mining license is required.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="near_village">
//                 <Form.Label className="fw-bold"> Client's Nearby Village <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="near_village"
//                   required
//                   value={formData.near_village}
//                   onChange={handleChange}
//                   placeholder="Enter village"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Nearby village is required.
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </Col>

//             {/* Right side inputs */}
//             <Col md={6}>
//               <Form.Group className="mb-3" controlId="tehsil">
//                 <Form.Label className="fw-bold"> Client's Tehsil <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="tehsil"
//                   required
//                   value={formData.tehsil}
//                   onChange={handleChange}
//                   placeholder="Enter tehsil"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Tehsil is required.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="district">
//                 <Form.Label className="fw-bold"> Client's District <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="district"
//                   required
//                   value={formData.district}
//                   onChange={handleChange}
//                   placeholder="Enter district"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   District is required.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="state">
//                 <Form.Label className="fw-bold"> Client's State <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="state"
//                   required
//                   value={formData.state}
//                   onChange={handleChange}
//                   placeholder="Enter state"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   State is required.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="country">
//                 <Form.Label className="fw-bold"> Client's Country <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="country"
//                   required
//                   value={formData.country}
//                   onChange={handleChange}
//                   placeholder="Enter country"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Country is required.
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </Col>
//           </Row>

//           {/* Submit and Reset buttons */}
//           <div className="text-center d-flex justify-content-center gap-2 flex-wrap mt-3">
//             <Button
//               type="submit"
//               variant="success"
//               className="fw-bold px-4 rounded-3"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? 'Processing...' : 'Create Client Account'}
//             </Button>
//             <Button
//               type="button"
//               variant="secondary"
//               className="fw-bold px-4 rounded-3"
//               onClick={resetForm}
//             >
//               Reset Form
//             </Button>
//           </div>
//         </Form>
//       </Container>
//     </>
//   );
// };
// export default AddClientAccount;
'use client'; // Required for client-side hooks like useState and useRouter

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Header from '../components/Header'; // Adjust this path as per your project structure

const AddClientAccount = () => {
  const router = useRouter(); // Helps in navigating to another page after form submission

  // 🔧 This object will hold the user's form input data
  const [formData, setFormData] = useState({
    clientName: '',
    clientMobile: '',
    query_license: '',
    mining_license: '',
    near_village: '',
    tehsil: '',
    district: '',
    state: '',
    country: ''
  });

  const [validated, setValidated] = useState(false); // For Bootstrap validation styling
  const [showAlert, setShowAlert] = useState(false); // To control the visibility of the alert
  const [alertMessage, setAlertMessage] = useState(''); // Text message inside alert
  const [alertVariant, setAlertVariant] = useState('success'); // 'success' or 'danger'
  const [isSubmitting, setIsSubmitting] = useState(false); // Button disabled while processing

  // 💡 Handle changes for any form field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 💡 Reset the form fields
  const resetForm = () => {
    setFormData({
      clientName: '',
      clientMobile: '',
      query_license: '',
      mining_license: '',
      near_village: '',
      tehsil: '',
      district: '',
      state: '',
      country: ''
    });
    setValidated(false);
  };

  // 🕓 Create ISO timestamp for date fields
  const getFormattedDate = () => {
    const now = new Date();
    return now.toISOString(); // Format accepted by Payload CMS
  };

  // ✅ Submit handler for the form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    const form = e.currentTarget;
    setValidated(true); // Apply validation UI styles

    // Check for required fields
    if (form.checkValidity() === false) {
      e.stopPropagation(); // Stop if validation fails
      return;
    }

    setIsSubmitting(true); // Disable button and show loader

    // Prepare new client data with timestamps
    const newClient = {
      ...formData,
      clientCreatedAt: getFormattedDate(),
      clientUpdatedAt: getFormattedDate(),
    };

    try {
      const response = await fetch('/api/client-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newClient)
      });

      if (response.ok) {
        setAlertVariant('success');
        setAlertMessage('Client account created successfully!');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          resetForm();
          router.push('/viewclient-account');
        }, 2000);
      } else {
        const error = await response.json();
        setAlertVariant('danger');
        setAlertMessage(error.message || 'Something went wrong.');
        setShowAlert(true);
        setIsSubmitting(false);
      }
    } catch (err) {
      setAlertVariant('danger');
      setAlertMessage('Network error. Please try again.');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-4 bg-light rounded-4 p-4 shadow w-100 w-md-75 w-xl-50 mx-auto my-5">
        <h4 className="mb-3 text-center fw-bold fs-4">Add New Client Account</h4>

        {/* Alert for success or error */}
        {showAlert && (
          <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}

        {/* Begin form */}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="clientName">
                <Form.Label className="fw-bold">Client's Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="clientName"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
                <Form.Control.Feedback type="invalid">
                  Client name is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="clientMobile">
                <Form.Label className="fw-bold">Client's Mobile Number <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  name="clientMobile"
                  required
                  pattern="[0-9]{10}"
                  value={formData.clientMobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
                <Form.Control.Feedback type="invalid">
                  Enter valid 10-digit mobile number.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="query_license">
                <Form.Label className="fw-bold">Client's Query License</Form.Label>
                <Form.Control
                  type="text"
                  name="query_license"
                  value={formData.query_license}
                  onChange={handleChange}
                  placeholder="Enter query license"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="mining_license">
                <Form.Label className="fw-bold">Client's Mining License</Form.Label>
                <Form.Control
                  type="text"
                  name="mining_license"
                  value={formData.mining_license}
                  onChange={handleChange}
                  placeholder="Enter mining license"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="near_village">
                <Form.Label className="fw-bold">Nearby Village</Form.Label>
                <Form.Control
                  type="text"
                  name="near_village"
                  value={formData.near_village}
                  onChange={handleChange}
                  placeholder="Enter nearby village"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="tehsil">
                <Form.Label className="fw-bold">Tehsil</Form.Label>
                <Form.Control
                  type="text"
                  name="tehsil"
                  value={formData.tehsil}
                  onChange={handleChange}
                  placeholder="Enter tehsil"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="district">
                <Form.Label className="fw-bold">District</Form.Label>
                <Form.Control
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="state">
                <Form.Label className="fw-bold">State</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="country">
                <Form.Label className="fw-bold">Country</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Form Actions */}
          <div className="text-center d-flex justify-content-center gap-2 flex-wrap mt-3">
            <Button
              type="submit"
              variant="success"
              className="fw-bold px-4 rounded-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Create Client Account'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="fw-bold px-4 rounded-3"
              onClick={resetForm}
            >
              Reset Form
            </Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default AddClientAccount;

