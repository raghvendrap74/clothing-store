"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateProfile } from "@/redux/slices/authSlice";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCamera, FaTrash, FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";

// Define interfaces for type safety
interface Profile {
  full_name?: string;
  phone_number?: string;
  address?: string;
  gender?: string;
  spoken_language?: string;
  date_of_birth?: string;
  occupation?: string;
  my_business_name?: string;
  pin_code?: string;
  city?: string;
  state?: string;
  marital_status?: string;
  number_of_kids?: number | null;
  monthly_income?: number | null;
  profile_picture?: string | null;
  educations?: Education[];
  workplaces?: Workplace[];
}

interface User {
  email?: string;
  profile?: Profile;
}

interface AuthState {
  auth: {
    user: User | null;
    loading: boolean;
    error: string | null;
  };
}

interface FormData {
  full_name: string;
  phone_number: string;
  address: string;
  gender: string;
  spoken_language: string;
  date_of_birth: string;
  occupation: string;
  my_business_name: string;
  pin_code: string;
  city: string;
  state: string;
  marital_status: string;
  number_of_kids: string;
  monthly_income: string;
}

interface Education {
  id: number;
  school_college_name: string;
  subject: string;
  end_year: number | string;
}

interface EducationForm {
  school_college_name: string;
  subject: string;
  end_year: string;
}

interface Workplace {
  id: number;
  workplace_name: string;
  position: string;
  start_date: string;
  end_date?: string | null;
}

interface WorkplaceForm {
  workplace_name: string;
  position: string;
  start_date: Date | null;
  end_date: Date | null;
}

const BASE_URL = "http://127.0.0.1:8000";

const ProfileSection: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: AuthState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetched = useRef<boolean>(false);
  const [activeTab, setActiveTab] = useState<"basic" | "bio" | "settings">("basic");

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone_number: "",
    address: "",
    gender: "not_specified",
    spoken_language: "",
    date_of_birth: "",
    occupation: "",
    my_business_name: "",
    pin_code: "",
    city: "",
    state: "",
    marital_status: "",
    number_of_kids: "",
    monthly_income: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [deleteProfilePicture, setDeleteProfilePicture] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [educations, setEducations] = useState<Education[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [educationForm, setEducationForm] = useState<EducationForm>({
    school_college_name: "",
    subject: "",
    end_year: "",
  });
  const [workplaceForm, setWorkplaceForm] = useState<WorkplaceForm>({
    workplace_name: "",
    position: "",
    start_date: null,
    end_date: null,
  });
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [editingWorkplaceId, setEditingWorkplaceId] = useState<number | null>(null);

  useEffect(() => {
    console.log("Profile Data:", user?.profile);
    if (!user?.profile && !hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchUserProfile());
    } else if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name || "",
        phone_number: user.profile.phone_number || "",
        address: user.profile.address || "",
        gender: user.profile.gender || "not_specified",
        spoken_language: user.profile.spoken_language || "",
        date_of_birth: user.profile.date_of_birth || "",
        occupation: user.profile.occupation || "",
        my_business_name: user.profile.my_business_name || "",
        pin_code: user.profile.pin_code || "",
        city: user.profile.city || "",
        state: user.profile.state || "",
        marital_status: user.profile.marital_status || "",
        number_of_kids:
          user.profile.number_of_kids != null && user.profile.number_of_kids !== undefined
            ? user.profile.number_of_kids.toString()
            : "",
        monthly_income:
          user.profile.monthly_income != null && user.profile.monthly_income !== undefined
            ? user.profile.monthly_income.toString()
            : "",
      });
      setDateOfBirth(user.profile.date_of_birth ? new Date(user.profile.date_of_birth) : null);
      setPreview(
        user.profile.profile_picture
          ? `${BASE_URL}${user.profile.profile_picture}`
          : null
      );
      setEducations(user.profile.educations || []);
      setWorkplaces(user.profile.workplaces || []);
    }
  }, [user?.profile, dispatch]);

  useEffect(() => {
    console.log("Form Data:", formData);
    console.log("Profile Picture URL:", user?.profile?.profile_picture);
  }, [formData, user?.profile?.profile_picture]);

  const calculateProgress = (): number => {
    const fields: (string | null)[] = [
      formData.full_name,
      formData.phone_number,
      formData.address,
      formData.gender !== "not_specified" ? formData.gender : "",
      formData.spoken_language,
      formData.date_of_birth,
      formData.occupation,
      formData.my_business_name,
      formData.pin_code,
      formData.city,
      formData.state,
      preview,
    ];
    const filled = fields.filter((f) => f).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "pin_code") {
      if (value && !/^\d{0,6}$/.test(value)) {
        toast.error("Pin Code must be a 6-digit number");
        return;
      }
    }
    if (name === "number_of_kids" || name === "monthly_income") {
      if (value && !/^\d*$/.test(value)) {
        toast.error(`${name === "number_of_kids" ? "Number of Kids" : "Monthly Income"} must be a number`);
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setDateOfBirth(date);
    setFormData((prev) => ({
      ...prev,
      date_of_birth: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    setProfilePicture(null);
    setPreview(null);
    setDeleteProfilePicture(true);
    toast.success("Profile picture deleted. Save to confirm.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
      setDeleteProfilePicture(false);
    }
  };

  const handleBasicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    [
      "full_name", "phone_number", "address", "gender", "spoken_language",
      "date_of_birth", "occupation", "my_business_name", "pin_code", "city", "state"
    ].forEach((key) => {
      if (formData[key as keyof FormData]) data.append(key, formData[key as keyof FormData]);
    });
    if (profilePicture) {
      data.append("profile_picture", profilePicture);
    }
    if (deleteProfilePicture && !profilePicture) {
      data.append("delete_profile_picture", "true");
    }

    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success("Basic info updated successfully!");
      dispatch(fetchUserProfile());
    } catch (err) {
      toast.error("Failed to update profile: " + (err || "Unknown error"));
    }
  };

  const handleBioSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    ["marital_status", "number_of_kids", "monthly_income"].forEach((key) => {
      if (formData[key as keyof FormData]) data.append(key, formData[key as keyof FormData]);
    });

    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success("Bio info updated successfully!");
      dispatch(fetchUserProfile());
    } catch (err) {
      toast.error("Failed to update bio: " + (err || "Unknown error"));
    }
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "end_year" && value && !/^\d{0,4}$/.test(value)) {
      toast.error("End Year must be a 4-digit number");
      return;
    }
    setEducationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkplaceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkplaceDateChange = (date: Date | null, field: "start_date" | "end_date") => {
    setWorkplaceForm((prev) => ({ ...prev, [field]: date }));
  };

  const handleEducationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!educationForm.school_college_name || !educationForm.subject || !educationForm.end_year) {
      toast.error("All education fields are required");
      return;
    }
    try {
      if (editingEducationId) {
        const response = await axios.put<Education>(
          `${BASE_URL}/api/users/education/${editingEducationId}/`,
          educationForm,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setEducations((prev) =>
          prev.map((edu) => (edu.id === editingEducationId ? response.data : edu))
        );
        toast.success("Education updated successfully!");
      } else {
        const response = await axios.post<Education>(
          `${BASE_URL}/api/users/education/`,
          educationForm,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setEducations((prev) => [...prev, response.data]);
        toast.success("Education added successfully!");
      }
      setEducationForm({ school_college_name: "", subject: "", end_year: "" });
      setEditingEducationId(null);
      dispatch(fetchUserProfile());
    } catch (err: any) {
      toast.error("Failed to save education: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const handleWorkplaceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workplaceForm.workplace_name || !workplaceForm.position || !workplaceForm.start_date) {
      toast.error("Workplace name, position, and start date are required");
      return;
    }
    const data = {
      workplace_name: workplaceForm.workplace_name,
      position: workplaceForm.position,
      start_date: workplaceForm.start_date ? workplaceForm.start_date.toISOString().split("T")[0] : "",
      end_date: workplaceForm.end_date ? workplaceForm.end_date.toISOString().split("T")[0] : null,
    };
    try {
      if (editingWorkplaceId) {
        const response = await axios.put<Workplace>(
          `${BASE_URL}/api/users/workplace/${editingWorkplaceId}/`,
          data,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setWorkplaces((prev) =>
          prev.map((wp) => (wp.id === editingWorkplaceId ? response.data : wp))
        );
        toast.success("Workplace updated successfully!");
      } else {
        const response = await axios.post<Workplace>(
          `${BASE_URL}/api/users/workplace/`,
          data,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setWorkplaces((prev) => [...prev, response.data]);
        toast.success("Workplace added successfully!");
      }
      setWorkplaceForm({ workplace_name: "", position: "", start_date: null, end_date: null });
      setEditingWorkplaceId(null);
      dispatch(fetchUserProfile());
    } catch (err: any) {
      toast.error("Failed to save workplace: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm({
      school_college_name: edu.school_college_name,
      subject: edu.subject,
      end_year: edu.end_year.toString(),
    });
    setEditingEducationId(edu.id);
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/api/users/education/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setEducations((prev) => prev.filter((edu) => edu.id !== id));
      toast.success("Education deleted successfully!");
      dispatch(fetchUserProfile());
    } catch (err: any) {
      toast.error("Failed to delete education: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const handleEditWorkplace = (wp: Workplace) => {
    setWorkplaceForm({
      workplace_name: wp.workplace_name,
      position: wp.position,
      start_date: wp.start_date ? new Date(wp.start_date) : null,
      end_date: wp.end_date ? new Date(wp.end_date) : null,
    });
    setEditingWorkplaceId(wp.id);
  };

  const handleDeleteWorkplace = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/api/users/workplace/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setWorkplaces((prev) => prev.filter((wp) => wp.id !== id));
      toast.success("Workplace deleted successfully!");
      dispatch(fetchUserProfile());
    } catch (err: any) {
      toast.error("Failed to delete workplace: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const getHeading = (): string => {
    if (formData.full_name) return formData.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "My Profile";
  };

  const LANGUAGES: { value: string; label: string }[] = [
    { value: "", label: "Select Language" },
    { value: "EN", label: "English" },
    { value: "HI", label: "Hindi" },
    { value: "TA", label: "Tamil" },
    { value: "TE", label: "Telugu" },
    { value: "ML", label: "Malayalam" },
    { value: "KN", label: "Kannada" },
    { value: "BN", label: "Bengali" },
    { value: "GU", label: "Gujarati" },
    { value: "MR", label: "Marathi" },
    { value: "PA", label: "Punjabi" },
    { value: "OR", label: "Odia" },
    { value: "AS", label: "Assamese" },
    { value: "UR", label: "Urdu" },
    { value: "SA", label: "Sanskrit" },
    { value: "KS", label: "Kashmiri" },
    { value: "NE", label: "Nepali" },
    { value: "BO", label: "Bodo" },
    { value: "DO", label: "Dogri" },
    { value: "KO", label: "Konkani" },
    { value: "MA", label: "Maithili" },
    { value: "MN", label: "Manipuri" },
    { value: "SN", label: "Santali" },
    { value: "SI", label: "Sindhi" },
    { value: "TU", label: "Tulu" },
    { value: "BH", label: "Bhojpuri" },
    { value: "OT", label: "Others" },
  ];

  const INDIAN_STATES: { value: string; label: string }[] = [
    { value: "", label: "Select State" },
    { value: "AN", label: "Andaman and Nicobar Islands" },
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AR", label: "Arunachal Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "CH", label: "Chandigarh" },
    { value: "CT", label: "Chhattisgarh" },
    { value: "DL", label: "Delhi" },
    { value: "DN", label: "Dadra and Nagar Haveli and Daman and Diu" },
    { value: "GA", label: "Goa" },
    { value: "GJ", label: "Gujarat" },
    { value: "HR", label: "Haryana" },
    { value: "HP", label: "Himachal Pradesh" },
    { value: "JK", label: "Jammu and Kashmir" },
    { value: "JH", label: "Jharkhand" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "LA", label: "Ladakh" },
    { value: "LD", label: "Lakshadweep" },
    { value: "MP", label: "Madhya Pradesh" },
    { value: "MH", label: "Maharashtra" },
    { value: "MN", label: "Manipur" },
    { value: "ML", label: "Meghalaya" },
    { value: "MZ", label: "Mizoram" },
    { value: "NL", label: "Nagaland" },
    { value: "OR", label: "Odisha" },
    { value: "PY", label: "Puducherry" },
    { value: "PB", label: "Punjab" },
    { value: "RJ", label: "Rajasthan" },
    { value: "SK", label: "Sikkim" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TG", label: "Telangana" },
    { value: "TR", label: "Tripura" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "UT", label: "Uttarakhand" },
    { value: "WB", label: "West Bengal" },
    { value: "OT", label: "Others" },
  ];

  const MARITAL_STATUSES: { value: string; label: string }[] = [
    { value: "", label: "Select Marital Status" },
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!user?.profile) {
    return <div className="p-6">No profile data available.</div>;
  }

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-semibold">👤 {getHeading()}</h2>

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "basic" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic Info
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "bio" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("bio")}
        >
          Bio
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "settings" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Profile Completion: {calculateProgress()}%
            </label>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
          <form onSubmit={handleBasicSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div
                className="relative w-24 h-24 overflow-hidden rounded-full group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200">
                    No Image
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4 transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="text-white hover:text-blue-300"
                    title="Upload Image"
                  >
                    <FaCamera size={20} />
                  </button>
                  {preview && (
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="text-white hover:text-red-300"
                      title="Delete Image"
                    >
                      <FaTrash size={20} />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Rajesh Sharma"
              />
            </div>
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., +91 9876543210"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email (read-only)</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md cursor-not-allowed"
              />
            </div>
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="not_specified">Not Specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {/* Spoken Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Spoken Language</label>
              <select
                name="spoken_language"
                value={formData.spoken_language}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Teacher, Farmer, Entrepreneur"
              />
            </div>
            {/* My Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">My Business Name</label>
              <input
                type="text"
                name="my_business_name"
                value={formData.my_business_name}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Sharma Textiles"
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <DatePicker
                selected={dateOfBirth}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholderText="Select date"
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
              />
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="e.g., 123, MG Road, Sector 15"
              />
            </div>
            {/* Pin Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pin Code</label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 110001"
              />
            </div>
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Delhi"
              />
            </div>
            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Saving..." : "Save Basic Info"}
            </button>
          </form>
        </div>
      )}

      {/* Bio Tab */}
      {activeTab === "bio" && (
        <div className="space-y-8">
          {/* Bio Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Personal Info</h3>
            <form onSubmit={handleBioSubmit} className="space-y-6">
              {/* Marital Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {MARITAL_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Number of Kids */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Kids</label>
                <input
                  type="text"
                  name="number_of_kids"
                  value={formData.number_of_kids}
                  onChange={handleChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 2"
                />
              </div>
              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Income (INR)</label>
                <input
                  type="text"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? "Saving..." : "Save Personal Info"}
              </button>
            </form>
          </div>

          {/* Education Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Education</h3>
            {/* Education List */}
            {educations.length > 0 ? (
              <div className="mb-6 space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
                    <div>
                      <p className="font-medium">{edu.school_college_name}</p>
                      <p className="text-sm text-gray-600">{edu.subject}</p>
                      <p className="text-sm text-gray-600">Ended: {edu.end_year}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEducation(edu)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-gray-500">No education entries added.</p>
            )}
            {/* Education Form */}
            <form onSubmit={handleEducationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School/College Name</label>
                <input
                  type="text"
                  name="school_college_name"
                  value={educationForm.school_college_name}
                  onChange={handleEducationChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., IIT Delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={educationForm.subject}
                  onChange={handleEducationChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Year</label>
                <input
                  type="text"
                  name="end_year"
                  value={educationForm.end_year}
                  onChange={handleEducationChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 2020"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? "Saving..." : editingEducationId ? "Update Education" : "Add Education"}
              </button>
            </form>
          </div>

          {/* Workplace Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Workplace</h3>
            {/* Workplace List */}
            {workplaces.length > 0 ? (
              <div className="mb-6 space-y-4">
                {workplaces.map((wp) => (
                  <div key={wp.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
                    <div>
                      <p className="font-medium">{wp.workplace_name}</p>
                      <p className="text-sm text-gray-600">{wp.position}</p>
                      <p className="text-sm text-gray-600">
                        {wp.start_date} - {wp.end_date || "Present"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditWorkplace(wp)}
                        className="text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-110"
                        title="Edit Workplace"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkplace(wp.id)}
                        className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-110"
                        title="Delete Workplace"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-gray-500">No workplace entries added.</p>
            )}
            {/* Workplace Form */}
            <form onSubmit={handleWorkplaceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Workplace Name</label>
                <input
                  type="text"
                  name="workplace_name"
                  value={workplaceForm.workplace_name}
                  onChange={handleWorkplaceChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Tata Consultancy Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  name="position"
                  value={workplaceForm.position}
                  onChange={handleWorkplaceChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <DatePicker
                  selected={workplaceForm.start_date}
                  onChange={(date: Date | null) => handleWorkplaceDateChange(date, "start_date")}
                  dateFormat="yyyy-MM-dd"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholderText="Select start date"
                  maxDate={new Date()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date (optional)</label>
                <DatePicker
                  selected={workplaceForm.end_date}
                  onChange={(date: Date | null) => handleWorkplaceDateChange(date, "end_date")}
                  dateFormat="yyyy-MM-dd"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholderText="Select end date"
                  maxDate={new Date()}
                  isClearable
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? "Saving..." : editingWorkplaceId ? "Update Workplace" : "Add Workplace"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <p className="text-gray-500">Settings section coming soon!</p>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;