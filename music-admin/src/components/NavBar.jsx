import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin/login");
  };

  return (
    <div className="navbar w-full border-b-2 border-gray-800 px-5 sm:px-12 py-4 text-lg flex items-center justify-between">
      <p>Admin Panel</p>

      <button
        onClick={handleLogout}
        className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Navbar;
