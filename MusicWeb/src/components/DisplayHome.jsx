import React, { useContext } from "react";
import Navbar from "./Navbar";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import { PlayerContext } from "../context/PlayerContext";

const DisplayHome = () => {
  const { songsData, albumsData } = useContext(PlayerContext);

  return (
    <>
      <Navbar />
      <div className="px-6 py-6 text-white">

        {/* SECTION: Featured albums */}
        <div className="mb-10">
          <h1 className="font-bold text-3xl mb-4">Albums</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albumsData.map((item, index) => (
              <div
                key={index}
                className="bg-[#141414] p-4 rounded-xl transition-all hover:bg-[#1f1f1f] hover:scale-[1.03] cursor-pointer shadow-lg"
              >
                <AlbumItem
                  name={item.name}
                  desc={item.desc}
                  id={item._id}
                  image={item.image}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: Popular songs */}
        

      </div>
    </>
  );
};

export default DisplayHome;
