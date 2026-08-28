"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [registerState, setRegisterState] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) return "First Name is required.";
    if (!lastName.trim()) return "Last Name is required.";
    if (!sex) return "Sex is required.";
    if (!birthDate) return "Birth Date is required.";
    if (!gradeLevel.trim()) return "Grade Level is required.";
    if (!section.trim()) return "Section is required.";
    if (!schoolName.trim()) return "School Name is required.";
    if (!schoolAddress.trim()) return "School Address is required.";
    if (!email.trim()) return "Email is required.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one symbol.";
    if (!agree) return "You must agree to the Data Privacy Policy.";
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setRegisterState(true);
    setMessage(null);

    try {
      // ✅ GAMITIN NATIN ANG SUPABASE AUTH. ILALAGAY NATIN ANG LAHAT NG DATA SA OPTIONS.DATA PARA SA TRIGGER
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            sex: sex,
            birth_date: birthDate,
            grade_level: gradeLevel,
            section: section,
            school_name: schoolName,
            school_address: schoolAddress,
            role: "user",
          },
        },
      });

      if (authError) {
        setMessage(authError.message);
        return;
      }

      const user = authData.user;
      if (!user) {
        setMessage("User creation failed.");
        return;
      }

      // ✅ PAGKATAPOS MAG-REGISTER, I-REDIRECT SA LOGIN
      setMessage("Registration successful! Please confirm your email or login.");
      setRegisterState(false);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setMessage("Failed to register.");
      setRegisterState(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* LEFT SIDE: AF-NEXUS Design */}
        <div className="hidden w-1/3 flex-col justify-between bg-gradient-to-br from-blue-800 to-blue-950 p-10 md:flex">
          <div>
            <p className="text-sm font-bold tracking-wide text-white/80 uppercase">
              AF-NEXUS
            </p>
            <h1 className="mt-4 text-4xl font-bold text-white">Smarter School Management Starts Here</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Create your AF-NEXUS account to access an integrated platform for managing student records, school forms, classroom assessments, and administrative workflows—all in one secure and efficient system.
            </p>
          </div>
          
          <div className="mt-10 flex items-center justify-center">
            <img 
              src="/adviser-illustration.png" 
              alt="Registration Illustration"
              className="h-48 w-auto object-contain"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Registration Form + Privacy Policy */}
        <div className="w-full p-8 md:w-2/3 md:p-10">
          <h2 className="text-2xl font-bold text-blue-900">Personal Information</h2>
          
          <div className="mt-6 flex flex-col gap-4">
            {/* First Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700">Firstname name *</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <span className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input
                  type="text"
                  placeholder="First name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Middle Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700">Middle name *</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <span className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input
                  type="text"
                  placeholder="Middle name *"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700">Last name *</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <span className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input
                  type="text"
                  placeholder="Last name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Sex & Birthdate */}
            <div className="flex gap-4">
              <div className="flex w-1/2 flex-col">
                <label className="text-xs font-semibold text-gray-700">Sex *</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <span className="text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="">--</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              
              <div className="flex w-1/2 flex-col">
                <label className="text-xs font-semibold text-gray-700">Birth date *</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <span className="text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </span>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Grade Level & Section */}
            <div className="flex gap-4">
              <div className="flex w-1/2 flex-col">
                <label className="text-xs font-semibold text-gray-700">Grade Level *</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <input
                    type="text"
                    placeholder="Grade Level (e.g., Grade 10)"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
              
              <div className="flex w-1/2 flex-col">
                <label className="text-xs font-semibold text-gray-700">Section *</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <input
                    type="text"
                    placeholder="Section (e.g., Ruby)"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* School Name & School Address */}
            <div className="flex gap-4">
              <div className="flex w-1/2 flex-col">
                <label className="text-xs font-semibold text-gray-700">School Name *</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <input
                    type="text"
                    placeholder="School Name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
              
              <div className="flex w-1/2 flex-col">
                <label className="text-xs font-semibold text-gray-700">School Address *</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <input
                    type="text"
                    placeholder="School Address"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700">Email address *</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <span className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input
                  type="email"
                  placeholder="Email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700">Password *</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <span className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-500 hover:text-blue-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* DATA PRIVACY POLICY SECTION */}
            <div className="mt-4 rounded-lg border border-gray-300 p-4">
              <h3 className="text-lg font-bold text-blue-900">Data Privacy Policy</h3>
              <div className="mt-2 max-h-64 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="mb-2"><strong>PROJECT LIKHA</strong> recognizes the importance of protecting the privacy and confidentiality of personal information entrusted to the school through the system. This Data Privacy Policy establishes the principles and safeguards governing the collection, processing, storage, access, use, disclosure, retention, and disposal of personal information processed through PROJECT LIKHA.</p>
                <p className="mb-2">The system shall comply with <strong>Republic Act No. 10173</strong>, otherwise known as the <strong>Data Privacy Act of 2012</strong>, its Implementing Rules and Regulations, applicable issuances of the <strong>National Privacy Commission (NPC)</strong>, relevant DepEd policies, and other applicable laws and regulations.</p>
                <p className="mb-2">PROJECT LIKHA follows the fundamental principles of <strong>transparency, legitimate purpose, and proportionality</strong> in the processing of personal information.</p>
                <p className="mb-2"><strong>Personal Information Controller / Responsible Office:</strong> San Pablo National High School / DepEd Masbate</p>
                <p className="mb-2"><strong>Data Protection Officer:</strong> Argie R. Fenis, Teacher II, San Pablo National High School. Official Email: argie.fenis001@deped.gov.ph, Contact: 0960 552 4683, Address: San Pablo, Mandaon, Masbate.</p>
                <p className="mb-2">The system may collect and process learner name, learner identification information, grade level and section, school year, subject and class information, grades, assessment results, attendance information, school form information, teacher and authorized personnel information, and other information necessary for legitimate educational and administrative purposes.</p>
                <p className="mb-2">Personal information may be used for automated school form generation, organization and maintenance of learner records, recording and management of grades, supporting competency-based assessment, supporting competency-based instructional planning, reducing repetitive manual encoding, and complying with applicable DepEd policies and government requirements.</p>
                <p className="mb-2">Access to personal information shall be restricted to authorized users whose official duties require such information. Users shall keep usernames, passwords, and other credentials confidential; not share their accounts with unauthorized persons; not access records without a legitimate purpose; and not use learner information for unauthorized purposes.</p>
                <p className="mb-2">PROJECT LIKHA shall implement reasonable organizational, physical, and technical measures to protect personal information against unauthorized access, unauthorized disclosure, accidental destruction, alteration, loss, misuse, and other forms of unlawful processing.</p>
                <p className="mb-2">Personal information shall be retained only for as long as necessary to fulfill the legitimate purposes for which it was collected, or for the period required by applicable laws and DepEd policies. When no longer required, it shall be securely disposed of in accordance with applicable policies.</p>
                <p className="mb-2">Rights of data subjects include: Right to be informed, Right to access, Right to object, Right to dispute inaccurate information, Right to request correction, Right to request blocking/removal/destruction, Right to data portability, and Right to lodge a complaint.</p>
                <p className="mb-2">For questions, requests, or concerns, data subjects may contact the Personal Information Controller / Responsible Office or the Data Protection Officer using the contact information provided above.</p>
              </div>
              
              <div className="mt-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-700"
                />
                <p className="text-xs text-gray-600">
                  I have read and understood the PROJECT LIKHA Data Privacy Policy and acknowledge the processing of personal information in accordance with applicable data privacy laws, regulations, and policies.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleRegister}
              disabled={registerState}
              className="mt-4 w-full rounded-lg bg-blue-700 p-3 text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {registerState ? "Registering..." : "Submit"}
            </button>

            <div className="mt-2 flex flex-col items-center gap-2 text-sm">
              <p className="text-gray-600">
                Already registered? <a href="/login" className="font-semibold text-blue-700">Login here</a>
              </p>
              <p className="text-gray-600">
                Forgot your password? <a href="#" className="font-semibold text-blue-700">Click here</a>
              </p>
            </div>

            {message && (
              <p className="mt-2 text-center text-sm text-red-600">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}