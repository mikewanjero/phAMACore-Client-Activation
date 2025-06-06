/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useImperativeHandle, forwardRef } from "react";
import { Form, Button, InputGroup, Accordion, Table } from "react-bootstrap";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ActivationForm = forwardRef(
  (
    {
      deleteUploadedFiles,
      errors,
      formData,
      handleChange,
      handleFileUpload,
      handleSubmit,
      passwordVisible,
      phoneNumber,
      setErrors,
      setPasswordVisible,
      setPhoneNumber,
      termsChecked,
      uploadedFiles,
    },
    ref
  ) => {
    const validateForm = () => {
      const newErrors = {};

      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.username.trim())
        newErrors.username = "Username is required";
      if (!formData.password.trim())
        newErrors.password = "Password is required";
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        newErrors.phoneNumber = "Phone number is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Expose validateForm() to parent
    useImperativeHandle(ref, () => ({
      validateForm,
    }));

    return (
      <Form
        className="form-elements"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="input-column">
          <Form.Group controlId="email" className="flex-grow-1">
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "is-invalid" : ""}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          {/* <Form.Group controlId="businessEmail" className="flex-grow-1">
            <Form.Control
              type="email"
              name="businessEmail"
              placeholder="Business Email (optional)"
              value={formData.businessEmail}
              onChange={handleChange}
            />
          </Form.Group> */}
        </div>

        <div className="input-column">
          <Form.Group controlId="username" className="flex-grow-1">
            <Form.Control
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
              className={errors.username ? "is-invalid" : ""}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="phone" className="flex-grow-1">
            <PhoneInput
              country={"ke"}
              value={phoneNumber}
              onChange={(phone) => {
                setPhoneNumber(phone);
                setErrors({ ...errors, phoneNumber: "" });
              }}
              inputClass={`form-control phone-input ${
                errors.phoneNumber ? "is-invalid" : ""
              }`}
              containerClass="phone-container"
              buttonClass="phone-dropdown-btn"
            />
            {errors.phoneNumber && (
              <div className="text-danger">{errors.phoneNumber}</div>
            )}
          </Form.Group>
        </div>

        <Form.Group controlId="password">
          <InputGroup>
            <Form.Control
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              className={errors.password ? "is-invalid" : ""}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <BsEyeSlashFill /> : <BsEyeFill />}
            </Button>
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        {/* Accordion - File Uploads */}
        <Accordion>
          <Accordion.Item eventKey={0}>
            <Accordion.Header>
              Upload Training Sheet |{" "}
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "0.7rem",
                  marginLeft: "4px",
                }}
              >
                3 files max
              </span>
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "0.7rem",
                  marginLeft: "2px",
                }}
              >
                | Single Upload
              </span>
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group controlId="trainingSheet">
                <Form.Control
                  type="file"
                  name="trainingSheet"
                  multiple
                  accept=".xls,.xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileUpload}
                  placeholder={uploadedFiles ? "" : "Select a file..."}
                />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey={1} className="mt-3">
            <Accordion.Header>
              Upload Master Document
              <span
                style={{
                  fontSize: "0.8rem",
                  marginLeft: "2px",
                }}
              >
                (Optional)
              </span>
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group controlId="masterDoc">
                <Form.Control
                  type="file"
                  name="masterDoc"
                  multiple
                  accept=".xls,.xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileUpload}
                  placeholder={uploadedFiles ? "" : "Select a file..."}
                />
                <div className="mt-2"></div>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="mt-2">
          <h5>Uploaded Files</h5>
          {uploadedFiles.length > 0 ? (
            <Table bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file, index) => (
                  <tr key={`file-${file.fileName}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{file.originalFileName}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => deleteUploadedFiles(file.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-muted p-3 border rounded">
              No files uploaded (yet).
            </div>
          )}
        </div>

        <div className="d-flex w-100 mt-auto">
          <Button
            className="activate-btn"
            disabled={!termsChecked}
            type="submit"
          >
            Activate My Account
          </Button>
        </div>
      </Form>
    );
  }
);

ActivationForm.displayName = "ActivationForm";

export default ActivationForm;
