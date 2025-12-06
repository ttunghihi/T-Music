import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";

const SongItem = ({ name, image, desc, id }) => {
  const { playWithId } = useContext(PlayerContext);

  const fallback = "/mnt/data/32ef3f54-c569-4e6a-995d-eeeeb50492d2.png";

  return (
    <div
      onClick={() => playWithId(id)}
      className="min-w-[180px] p-2 px-3 rounded cursor-pointer group "
    >
      {/* --- Image wrapper: same as AlbumItem --- */}
      <div className="relative w-full pb-[100%] rounded-lg overflow-hidden bg-[#101010]">
        <img
          src={image || fallback}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
        />

        {/* Hover dark overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="ml-1 w-0 h-0 border-l-[12px] border-l-white border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent" />
          </div>
        </div>
      </div>

      {/* --- Text --- */}
      <div className="mt-3">
        <p className="font-bold text-sm text-white line-clamp-2">{name}</p>
        <p className="text-slate-300 text-xs mt-1 line-clamp-2">{desc}</p>
      </div>
    </div>
  );
};

export default SongItem;
