// DisplayAlbum.jsx
import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const DisplayAlbum = () => {
  const { id } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const { playWithId, albumsData, songsData } = useContext(PlayerContext);

  useEffect(() => {
    if (!albumsData || !id) return;
    const found = albumsData.find((item) => String(item._id) === String(id));
    setAlbumData(found || null);
  }, [albumsData, id]);

  if (!albumData) return null;

  // danh sách bài hát trong album (lấy từ songsData)
  const rawAlbumSongs = songsData?.filter((s) => s.album === albumData.name) || [];

  // chuẩn hoá: đảm bảo mỗi item có trường _id và type (giúp PlayerContext hoạt động trơn tru)
  const albumSongs = rawAlbumSongs.map((s) => {
    if (!s) return s;
    return { ...s, _id: String(s._id), type: s.type || "song" };
  });

  // handler: khi click 1 bài, truyền cả albumSongs làm queue để next/prev theo album
  const handlePlaySong = (songId) => {
    if (!songId) return;
    if (typeof playWithId === "function") {
      playWithId(String(songId), albumSongs);
    }
  };

  return (
    <>
      <Navbar />

      {/* Header Album */}
      <div className="mt-10 px-6 flex flex-col md:flex-row gap-10 md:items-end">
        <img
          className="w-48 h-48 rounded-lg object-cover shadow-xl"
          src={albumData.image}
          alt={albumData.name}
        />

        <div className="flex flex-col min-w-0">
          <p className="uppercase text-sm text-gray-400 tracking-wider">Album</p>

          <h2 className="text-5xl md:text-6xl font-extrabold text-white mt-2 mb-3 truncate">
            {albumData.name}
          </h2>

          <h4 className="text-gray-300 text-lg max-w-2xl">{albumData.desc}</h4>

          <p className="mt-3 text-gray-400 flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center gap-2">
              <img className="inline-block w-5" src={assets.tmusic_logo} alt="logo" />
              <b>T-Music</b>
            </span>
            • {albumSongs.length.toLocaleString()} lượt thích
            • <b>{albumSongs.length} bài hát</b>, 2h30m
          </p>
        </div>
      </div>

      {/* Tracklist Header */}
      <div className="px-6 mt-12">
        <div className="grid grid-cols-12 text-[#a7a7a7] text-sm pb-3">
          <div className="col-span-6 flex items-center gap-3">
            <span className="w-8 text-center">#</span>
            <span>Tiêu đề</span>
          </div>

          <div className="hidden md:block md:col-span-3">Album</div>
          <div className="hidden lg:block lg:col-span-2">Tác giả</div>

          <div className="col-span-2 text-right">
            <img className="w-4 inline-block" src={assets.clock_icon} alt="" />
          </div>
        </div>

        <hr className="border-white/10" />
      </div>

      {/* Tracklist Items */}
      <div className="px-6 mt-4">
        {albumSongs.map((item, index) => (
          <div
            key={item._id || index}
            onClick={() => handlePlaySong(item._id)}
            className="grid grid-cols-12 gap-4 py-3 px-2 rounded-lg cursor-pointer hover:bg-white/5 transition"
          >
            {/* Song index + image + name */}
            <div className="col-span-6 flex items-center gap-4 min-w-0">
              <span className="w-8 text-center text-sm text-[#a7a7a7]">{index + 1}</span>

              <img className="w-12 h-12 rounded object-cover" src={item.image} alt={item.name} />

              <div className="min-w-0">
                <p className="text-white font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-400 truncate">{albumData.name}</p>
              </div>
            </div>

            {/* Album */}
            <div className="hidden md:flex md:col-span-3 items-center text-sm text-gray-300 truncate">
              {albumData.name}
            </div>

            {/* Author */}
            <div className="hidden lg:flex lg:col-span-2 items-center text-sm text-gray-300 truncate">
              {item.author || "Unknown"}
            </div>

            {/* Duration */}
            <div className="col-span-2 flex items-center justify-end text-sm text-gray-300">
              {item.duration || "—"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DisplayAlbum;
