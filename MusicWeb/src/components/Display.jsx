// Display.jsx (sửa)
import React, { useEffect, useRef, useMemo } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import DisplayPlaylist from "./DisplayPlaylist"; // <- thêm import
import Premium from "./Premium";
import VocalCourseRegister from "./VocalCourseRegister";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import LoginRegister from "./Login";
import UserAddSong from "./UserAddSong";
import PremiumPayment from "./PremiumPayment";
import LikedSongs from "./LikedSongs";
import CreateAlbum from "./CreatePlayList";
import AlbumList from "./Playlist";
import CreatePlaylist from "./CreatePlayList";
import Playlist from "./Playlist";
import DisplayPodcast from "./DisplayPodcast";
import DisplaySong from "./DisplaySong";
const Display = () => {
  const { albumsData = [] } = useContext(PlayerContext);

  const dislayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("/album/");
  const albumId = isAlbum ? location.pathname.split("/").pop() : "";

  // tìm album (an toàn) — useMemo để tránh re-find quá nhiều
  const currentAlbum = useMemo(() => {
    if (!albumsData || albumsData.length === 0) return null;
    return albumsData.find((x) => String(x._id) === String(albumId)) || null;
  }, [albumsData, albumId]);

  // bgColor fallback nếu không có album
  const bgColor = (currentAlbum && currentAlbum.bgColour) || "#121212";

  useEffect(() => {
    // set background safely — dislayRef hiện tại luôn tồn tại sau render
    if (!dislayRef.current) return;
    if (isAlbum && currentAlbum) {
      dislayRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
    } else {
      // nếu route là album nhưng album chưa load -> dùng background mặc định
      dislayRef.current.style.background = `#121212`;
    }
    // chạy khi location hoặc albumsData thay đổi
  }, [isAlbum, currentAlbum, bgColor, location.pathname]);

  return (
    <div
      ref={dislayRef}
      className="flex-1 min-w-0 m-2 pt-4 rounded bg-[#121212] text-white overflow-auto"
    >
      {/* ALWAYS render Routes so routes like /createalbum vẫn hiển thị ngay cả khi albumsData rỗng */}
      <Routes>
        <Route path="/" element={<DisplayHome />} />
        <Route
          path="/album/:id"
          element={<DisplayAlbum album={currentAlbum} />}
        />
        <Route path="/playlist/:id" element={<DisplayPlaylist />} /> {/* <- route mới */}
        <Route path="/premium" element={<Premium />} />
        <Route path="/vocalcourse" element={<VocalCourseRegister />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/useraddsong" element={<UserAddSong />} />
        <Route path="/premiumrequest" element={<PremiumPayment />} />
        <Route path="/likedsongs" element={<LikedSongs />} />
        <Route path="/createplaylist" element={<CreatePlaylist />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/podcast" element={<DisplayPodcast />} />
        <Route path="/songs" element={<DisplaySong />} />
      </Routes>
    </div>
  );
};

export default Display;
