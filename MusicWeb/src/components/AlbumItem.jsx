import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * AlbumItem: kept behavior (navigate), improved hover UX.
 * Fallback image uses the uploaded file path so you can test locally.
 */
const AlbumItem = ({ image, name, desc, id }) => {
  const navigate = useNavigate();
  const fallback = "/mnt/data/32ef3f54-c569-4e6a-995d-eeeeb50492d2.png";

  return (
    <div
      onClick={() => navigate(`/album/${id}`)}
      className="min-w-[180px] p-2 px-3 rounded cursor-pointer group "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(`/album/${id}`); }}
    >
      {/* image wrapper: overflow-hidden to clip any inner effect */}
      <div className="relative w-full rounded overflow-hidden bg-[#101010]">
        <img
          src={image || fallback}
          alt={name || "album"}
          className="w-full h-48 object-cover select-none block"
          draggable={false}
        />

        {/* subtle overlay on hover (no transform) */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
      </div>

      {/* meta */}
      <div className="mt-3">
        <p className="font-bold text-sm text-white line-clamp-2">{name}</p>
        <p className="text-slate-300 text-xs mt-1 line-clamp-2">{desc}</p>
      </div>
    </div>
  );
};

export default AlbumItem;
