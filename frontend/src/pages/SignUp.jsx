import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
  
    try {
      await signup({
        username: formData.name,  // ✅ Ensure correct field name
        email: formData.email,
        password: formData.password,
      });
  
      setSuccess('Signup successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Signup Error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 text-white p-6">
      {error && <div className="bg-red-500 text-white p-4 mb-6 rounded-lg w-full max-w-md">{error}</div>}
      {success && <div className="bg-green-500 text-white p-4 mb-6 rounded-lg w-full max-w-md">{success}</div>}
      <AuthForm type="signup" onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default Signup;