import React, { useState } from "react";
import { candidateService } from "../services/api";
import DocumentUpload from "../components/DocumentUpload";

const CandidateForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    residentialAddress: {
      street1: "",
      street2: "",
    },
    permanentAddress: {
      street1: "",
      street2: "",
    },
    sameAsResidential: false,
  });

  const [documents, setDocuments] = useState([
    { fileName: "", fileType: "", file: null },
    { fileName: "", fileType: "", file: null },
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    // Personal info validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const age = calculateAge(formData.dob);
      if (age < 18) {
        newErrors.dob = "Must be at least 18 years old";
      }
    }

    // Address validation
    if (!formData.residentialAddress.street1.trim()) {
      newErrors.residentialStreet1 = "Residential street 1 is required";
    }
    if (!formData.residentialAddress.street2.trim()) {
      newErrors.residentialStreet2 = "Residential street 2 is required";
    }

    if (!formData.sameAsResidential) {
      if (!formData.permanentAddress.street1.trim()) {
        newErrors.permanentStreet1 = "Permanent street 1 is required";
      }
      if (!formData.permanentAddress.street2.trim()) {
        newErrors.permanentStreet2 = "Permanent street 2 is required";
      }
    }

    // Document validation
    if (documents.length < 2) {
      newErrors.documents = "At least 2 documents are required";
    } else {
      documents.forEach((doc, index) => {
        if (!doc.fileName.trim()) {
          newErrors[`doc${index}FileName`] = "File name is required";
        }
        if (!doc.fileType) {
          newErrors[`doc${index}FileType`] = "Type is required";
        }
        if (!doc.file) {
          newErrors[`doc${index}File`] = "File is required";
        } else {
          // Validate file type matches selection
          const fileExtension = doc.file.name.split(".").pop().toLowerCase();
          const isValidFileType =
            (doc.fileType === "image" &&
              ["jpg", "jpeg", "png", "gif"].includes(fileExtension)) ||
            (doc.fileType === "pdf" && fileExtension === "pdf");

          if (!isValidFileType) {
            newErrors[`doc${index}File`] =
              `File type doesn't match selection. Expected ${doc.fileType}`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "sameAsResidential") {
      setFormData((prev) => ({
        ...prev,
        sameAsResidential: checked,
        permanentAddress: checked
          ? { ...prev.residentialAddress }
          : { street1: "", street2: "" },
      }));
    } else if (name.includes("Address")) {
      const [addressType, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formData.sameAsResidential && name.includes("residentialAddress")) {
      setFormData((prev) => ({
        ...prev,
        residentialAddress: {
          ...prev.residentialAddress,
          [name.split(".")[1]]: value,
        },
        permanentAddress: {
          ...prev.permanentAddress,
          [name.split(".")[1]]: value,
        },
      }));
      return;
    }
  };

  const handleDocumentChange = (updatedDocuments) => {
    setDocuments(updatedDocuments);
  };

  const handleAddDocument = () => {
    setDocuments([...documents, { fileName: "", fileType: "", file: null }]);
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("dob", formData.dob);
      formDataToSend.append(
        "residentialAddress",
        JSON.stringify(formData.residentialAddress),
      );

      if (!formData.sameAsResidential) {
        formDataToSend.append(
          "permanentAddress",
          JSON.stringify(formData.permanentAddress),
        );
      }

      formDataToSend.append("sameAsResidential", formData.sameAsResidential);

      // Add documents
      const documentsData = documents.map((doc) => ({
        fileName: doc.fileName,
        fileType: doc.fileType,
      }));
      formDataToSend.append("documents", JSON.stringify(documentsData));

      // Add files
      documents.forEach((doc) => {
        if (doc.file) {
          formDataToSend.append("files", doc.file);
        }
      });

      const response = await candidateService.createCandidate(formDataToSend);

      if (response.success) {
        setSuccessMessage("Candidate submitted successfully!");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          dob: "",
          residentialAddress: { street1: "", street2: "" },
          permanentAddress: { street1: "", street2: "" },
          sameAsResidential: false,
        });
        setDocuments([
          { fileName: "", fileType: "", file: null },
          { fileName: "", fileType: "", file: null },
        ]);
      }
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const backendErrors = {};

        error.errors.forEach((msg) => {
          if (msg.includes("First name")) backendErrors.firstName = msg;
          else if (msg.includes("Last name")) backendErrors.lastName = msg;
          else if (msg.includes("email")) backendErrors.email = msg;
          else if (msg.includes("18")) backendErrors.dob = msg;
          else if (msg.includes("Residential street1"))
            backendErrors.residentialStreet1 = msg;
          else if (msg.includes("Residential street2"))
            backendErrors.residentialStreet2 = msg;
          else if (msg.includes("Permanent street1"))
            backendErrors.permanentStreet1 = msg;
          else if (msg.includes("Permanent street2"))
            backendErrors.permanentStreet2 = msg;
          else if (msg.includes("documents")) backendErrors.documents = msg;
        });

        setErrors(backendErrors);
      } else {
        setErrors({ submit: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            MERN STACK MACHINE TEST
          </h1>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dob ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Residential Address */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Residential Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street 1 *
                  </label>
                  <input
                    type="text"
                    name="residentialAddress.street1"
                    value={formData.residentialAddress.street1}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.residentialStreet1
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.residentialStreet1 && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.residentialStreet1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street 2 *
                  </label>
                  <input
                    type="text"
                    name="residentialAddress.street2"
                    value={formData.residentialAddress.street2}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.residentialStreet2
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.residentialStreet2 && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.residentialStreet2}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div className="border-b pb-6">
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="sameAsResidential"
                    checked={formData.sameAsResidential}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Same as Residential Address
                  </span>
                </label>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Permanent Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street 1 {!formData.sameAsResidential && "*"}
                  </label>
                  <input
                    type="text"
                    name="permanentAddress.street1"
                    value={formData.permanentAddress.street1}
                    onChange={handleInputChange}
                    disabled={formData.sameAsResidential}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.permanentStreet1
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${formData.sameAsResidential ? "bg-gray-100" : ""}`}
                  />
                  {errors.permanentStreet1 && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.permanentStreet1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street 2 {!formData.sameAsResidential && "*"}
                  </label>
                  <input
                    type="text"
                    name="permanentAddress.street2"
                    value={formData.permanentAddress.street2}
                    onChange={handleInputChange}
                    disabled={formData.sameAsResidential}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.permanentStreet2
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${formData.sameAsResidential ? "bg-gray-100" : ""}`}
                  />
                  {errors.permanentStreet2 && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.permanentStreet2}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents */}
            <DocumentUpload
              documents={documents}
              onDocumentChange={handleDocumentChange}
              onAddDocument={handleAddDocument}
              onRemoveDocument={handleRemoveDocument}
              errors={errors}
            />

            {errors.documents && (
              <p className="text-red-500 text-sm">{errors.documents}</p>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-md font-medium text-white transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;
