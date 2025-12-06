import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import AddSong from "./pages/AddSong";
import AddAlbum from "./pages/addAlbum";
import ListSong from "./pages/ListSong";
import ListAlbum from "./pages/ListAlbum";
import Sidebar from "./components/SideBar";
import Navbar from "./components/NavBar";
import ListUsers from "./pages/ListUser";
import ListPremiumRequest from "./pages/ListPremiumRequest";
import ListPodcast from "./pages/ListPodcast";
import AddPodcast from "./pages/AddPostcast";


export const url = 'http://localhost:4000';
const App = () => {
  return (
    <div className="flex items-start min-h-screen">
      <ToastContainer />
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-scroll bg-[#F3FFF7]">
        <Navbar />
        <div className="pt-8 pl-5 sm:pt-12 sm:pl-12">
          <Routes>
            <Route path="/add-song" element={<AddSong />} />
            <Route path="/add-podcast" element={<AddPodcast />} />
            <Route path="/add-album" element={<AddAlbum />} />
            <Route path="/list-song" element={<ListSong />} />
            <Route path="/list-album" element={<ListAlbum />} />
            <Route path="/list-user" element={<ListUsers />} />
            <Route path="/list-premium-requests" element={<ListPremiumRequest />} />
            <Route path="/list-podcast" element={<ListPodcast />} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
