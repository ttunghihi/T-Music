// LikedSongs.jsx
import React, { useEffect, useContext, useMemo } from "react";
import Navbar from "./Navbar";
import SongItem from "./SongItem";
import { PlayerContext } from "../context/PlayerContext";

const LikedSongs = () => {
  const { songsData = [], likedSongIds = [], fetchMyLikes, toggleLike, isLiked, playWithId } = useContext(PlayerContext);

  useEffect(() => {
    // đảm bảo đã load thông tin liked từ server / cache khi component mount
    if (typeof fetchMyLikes === "function") {
      fetchMyLikes().catch(() => {});
    }
  }, [fetchMyLikes]);

  // Build likedSongs list in the order of songsData and normalize ids to string
  const likedIdsSet = useMemo(() => new Set((likedSongIds || []).map((id) => String(id))), [likedSongIds]);

  // Keep the order consistent with songsData and only include items present in songsData
  const likedSongs = useMemo(() => {
    if (!Array.isArray(songsData) || songsData.length === 0) return [];
    return songsData.filter((s) => s && likedIdsSet.has(String(s._id || s.id)));
  }, [songsData, likedIdsSet]);

  const handlePlayItem = (itemId) => {
    if (!playWithId) return;
    // find the full song object in songsData
    const fullSong = songsData.find((s) => String(s._id || s.id) === String(itemId));
    if (!fullSong) {
      // fallback: just call with id (PlayerContext may still handle it)
      try {
        playWithId(itemId);
      } catch (e) {
        // ignore
      }
      return;
    }

    // build full queue from likedSongs but map to full song objects from songsData
    const fullQueue = likedSongs
      .map((ls) => songsData.find((s) => String(s._id || s.id) === String(ls._id || ls.id || ls)))
      .filter(Boolean);

    // Finally call playWithId with fullSong id and the normalized queue
    try {
      playWithId(String(fullSong._id || fullSong.id), fullQueue);
    } catch (e) {
      // fallback: try playWithId with just id
      try {
        playWithId(String(fullSong._id || fullSong.id));
      } catch (e2) {
        // ignore
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 py-6 text-white">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">Bài hát đã thích</h1>
            <p className="text-sm text-gray-300 mt-1">{likedSongs.length} bài</p>
          </div>
        </div>

        {likedSongs.length === 0 ? (
          <div className="mt-10 bg-[#141414] p-8 rounded-xl text-center">
            <p className="text-gray-300 mb-4">Bạn chưa thích bài hát nào.</p>
            <p className="text-sm text-gray-400">Hãy khám phá và ấn ♥ ở trang bài hát để thêm vào danh sách.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {likedSongs.map((item, index) => (
              <div
                key={item._id || index}
                className="relative p-3 rounded-xl transition-all hover:scale-[1.03] cursor-pointer shadow-md bg-[#0f0f0f]"
              >
                {/* click vào khung sẽ play bài */}
                <div
                  onClick={() => handlePlayItem(item._id || item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePlayItem(item._id || item.id);
                    }
                  }}
                >
                  <SongItem
                    name={item.name}
                    desc={item.desc}
                    id={item._id}
                    image={item.image}
                  />
                </div>

                {/* nút unlike nhỏ góc trên phải */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // tránh kích hoạt play khi nhấn unlike
                    // toggleLike có thể trả Promise
                    try {
                      toggleLike(item._id).catch(() => {});
                    } catch (err) {
                      // ignore
                    }
                  }}
                  aria-pressed={isLiked ? !!isLiked(item._id) : false}
                  aria-label={isLiked ? (isLiked(item._id) ? "Unlike" : "Like") : "Like"}
                  title={isLiked ? (isLiked(item._id) ? "Bỏ thích" : "Thích") : "Thích"}
                  className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-1 rounded-full hover:scale-105 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-5 h-5 ${isLiked ? (isLiked(item._id) ? "text-orange-400" : "text-gray-300") : "text-gray-300"}`}
                    viewBox="0 0 24 24"
                    fill={isLiked && isLiked(item._id) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-4.877-9-8.5A5.5 5.5 0 0 1 6 4.5c1.657 0 2.5 1.5 3 2 .5-.5 1.343-2 3-2A5.5 5.5 0 0 1 21 12.5C19.5 16.123 12 21 12 21z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LikedSongs;
