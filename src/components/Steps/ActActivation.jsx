import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ActivationForm from "./ActivationForm";
import ActivationToast from "./ActivationToast";
import TermsSection from "../Subscription/TermsSection";
import PackageInfo from "../Subscription/PackageInfo";
import phamacoreLogo from "../../assets/images/phamacoreLogo.png";
import { useParams } from "react-router-dom";

const API_URL = "http://20.164.20.36:86";
const API_HEADER = {
  accesskey: "R0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9",
  // "Content-Type": "multipart/form-data",
};

const ActActivation = () => {
  // Form state and handlers
  const formRef = useRef(null);
  const { id } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [toastData, setToastData] = useState({ message: "", type: "success" });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Company details
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    companyID: "",
  });
  const [packageInfo, setPackageInfo] = useState({
    name: "",
    branches: "",
    users: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setToast = (message, type = "success") => {
    setToastData({ message, type });
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    if (!formRef.current || !formRef.current.validateForm()) {
      setToast("Please fill in all the required fields!", "danger");
      return;
    }

    setLoading(true);
    try {
      // Proceed with API submission
      const response = await axios.post(
        `${API_URL}/api/client/ActivateClient`,
        formData,
        phoneNumber,
        id,
        companyDetails.companyName,
        {
          headers: {
            ...API_HEADER,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLoading(false);
      console.log("Upload Response:", response.data);
      setToast("Account activated successfully!");
    } catch (error) {
      setLoading(false);
      console.error("Error activating account:", error);
      setToast("Activation failed! Try again.", "danger");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileUpload = async (e) => {
    const { files } = e.target;
    const formData = new FormData();
    // Append files to FormData
    // for (let i = 0; i < files.length; i++) formData.append('File', files[i][0]);
    formData.append("File", files[0]);

    // Validate file type
    // const validFileTypes = [0, 1];
    const validFileTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/pdf",
    ];
    let fileType = files[0].type;
    let fileTypeInt =
      files[0].type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      files[0].type === "application/vnd.ms-excel"
        ? 1
        : 0;

    formData.append("FileType", fileTypeInt);
    formData.append("Cuscode", "LWWDYC");
    console.log("fileType", fileType);
    console.log("files", files);
    // Check if the file type is valid
    if (!validFileTypes.includes(fileType)) {
      setToast("Invalid file type! Please upload a valid file.", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/client/UploadFile`, {
        method: "POST",
        headers: API_HEADER,
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        console.log("File(s) uploaded successfully: ", data);
        setToast("File(s) uploaded successfully!", "success");

        fetchUploadedFiles(companyDetails.companyID);
      } else {
        const data = await response.json();
        console.log("Error uploading file:", data);
        setToast("Failed to upload file(s)!", "danger");
      }
    } catch (error) {
      console.log(error);
      setToast("Error uploading file(s)!", "danger");
    }
  };

  const fetchUploadedFiles = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/client/GetUploadedFiles`,
        {
          params: { cusCode: id },
          headers: {
            accesskey:
              "R0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9",
          },
        }
      );

      if (response.data.success) {
        console.log("Uploaded files:", response.data.data);
        setUploadedFiles(response.data.data);
      }
    } catch (error) {
      console.error("Error displaying uploaded files:", error);
      setToast("Failed to display uploaded files!", "danger");
    }
  };

  const GetClientByUserNameOrEmail = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/GetClientByUserNameOrEmail/${localStorage.getItem(
          "username"
        )}`,
        {
          headers: {
            accesskey:
              "R0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9",
          },
        }
      );

      console.log("clientDetails", response.data);

      const {
        psCompanyName: companyName,
        psCusCode: companyID,
        psBranchCount: branches,
        psUserCount: users,
      } = response.data;

      setCompanyDetails({ companyName, companyID });
      setPackageInfo((prev) => ({ ...prev, branches, users }));
      fetchUploadedFiles(response.data.psCusCode);
      GetPackageName(response.data.psCusCode);
    } catch (error) {
      console.error("Error displaying client details:", error);
      setToast("Error displaying client details:", "danger");
    }
  };

  const GetPackageName = async (cusCode) => {
    console.log("Cuscode:", cusCode);
    try {
      const response = await axios.get(
        `${API_URL}/api/packages/clientpackage/${cusCode}`,
        {
          headers: { ...API_HEADER },
        }
      );

      console.log("Package Details", response.data);

      const { packageName: name } = response.data.data;

      setPackageInfo((prev) => ({ ...prev, name }));
      fetchUploadedFiles(response.data.psCusCode);
    } catch (error) {
      console.error("Error displaying package name:", error);
      setToast("Failed to display package name!", "danger");
    }
  };
  useEffect(() => {
    GetClientByUserNameOrEmail();
  }, []);

  const deleteUploadedFiles = async (
    Id,
    cusCode = companyDetails.companyID
  ) => {
    try {
      const response = await axios.delete(`${API_URL}/api/client/DeleteFile`, {
        headers: API_HEADER,
        data: {
          id: Id,
          cusCode: cusCode,
        },
      });
      console.log(response.data);
      setToast(`${response.data.message}`, "success");

      fetchUploadedFiles(companyDetails.companyID);
    } catch (error) {
      console.error("Error removing file:", error);
      setToast("Failed to delete file!", "danger");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-content">
          {/* Header */}
          <div className="d-flex flex-column align-items-center mb-3">
            <img
              src={phamacoreLogo}
              alt="logo"
              className="img-fluid d-flex justify-content-center m-auto"
              width={160}
            />
            <h2 className="fw-bold mt-4" style={{ color: "#c58c4f" }}>
              phAMACore<sup>™</sup>Cloud
            </h2>
          </div>
          <h6>{localStorage.getItem("username")}</h6>
          <div className="form-header">
            <h5 className="fw-bold">Complete the Account Activation</h5>
            <p className="text-secondary" style={{ fontSize: 12 }}>
              Fill in the details to activate your account.
            </p>
          </div>

          <div className="form-sections">
            <div className="form-inputs">
              <h5 className="text-danger fw-bold">Activate Subscription</h5>
              <ActivationForm
                ref={formRef}
                deleteUploadedFiles={deleteUploadedFiles}
                error={error}
                errors={errors}
                formData={formData}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                handleFileUpload={handleFileUpload}
                phoneNumber={phoneNumber}
                passwordVisible={passwordVisible}
                setError={setError}
                setErrors={setErrors}
                setPasswordVisible={setPasswordVisible}
                setPhoneNumber={setPhoneNumber}
                setTermsChecked={setTermsChecked}
                termsChecked={termsChecked}
                uploadedFiles={uploadedFiles}
              />
            </div>

            {/* Divider line */}
            <div className="section-divider"></div>

            {/* Right side: Package & Terms */}
            <div className="form-details">
              {companyDetails.companyName && companyDetails.companyID && (
                <div className="company-info">
                  <h3>
                    {loading
                      ? `${companyDetails.companyName} - ${companyDetails.companyID}`
                      : "Details not Fetched"}
                  </h3>
                </div>
              )}
              <PackageInfo packageInfo={packageInfo} setToast={setToast} />
              <TermsSection
                termsChecked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast message */}
      <ActivationToast
        showToast={showToast}
        setShowToast={setShowToast}
        toastType={toastData.type}
        toastMessage={toastData.message}
      />
    </div>
  );
};

export default ActActivation;
