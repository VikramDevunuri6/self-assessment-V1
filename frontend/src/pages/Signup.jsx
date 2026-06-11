import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    rollNumber: "",
    branch: "",
    passingYear: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Create Auth User
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

      console.log("AUTH DATA:", authData);
      console.log("AUTH ERROR:", authError);

      if (authError) {
        alert(authError.message);
        return;
      }

      const user = authData.user;

      if (!user) {
        alert("User not created");
        return;
      }

      console.log("USER ID:", user.id);

      // Insert Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            full_name: formData.fullName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            roll_number: formData.rollNumber,
            branch: formData.branch,
            passing_year: Number(formData.passingYear),
          },
        ])
        .select();

      console.log("PROFILE DATA:", profileData);
      console.log(
        "PROFILE ERROR:",
        JSON.stringify(profileError, null, 2)
      );

      if (profileError) {
        alert(
          `Profile Insert Error:\n${JSON.stringify(
            profileError,
            null,
            2
          )}`
        );
        return;
      }

      alert("Account created successfully!");

      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        rollNumber: "",
        branch: "",
        passingYear: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/");
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="text"
          name="rollNumber"
          placeholder="Roll Number"
          value={formData.rollNumber}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="text"
          name="branch"
          placeholder="Branch"
          value={formData.branch}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <select
          name="passingYear"
          value={formData.passingYear}
          onChange={handleChange}
          required
        >
          <option value="">Select Passing Year</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
          <option value="2029">2029</option>
        </select>

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <br />

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Signup;