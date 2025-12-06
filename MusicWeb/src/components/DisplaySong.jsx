import React, { useContext } from "react";
import Navbar from "./Navbar";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import { PlayerContext } from "../context/PlayerContext";

const DisplayHome = () => {
  const { songsData } = useContext(PlayerContext);

  return (
    <>
      <Navbar />
      <div className="px-6 py-6 text-white">

        {/* SECTION: Popular songs */}
        <div className="mb-10">
          <h1 className="font-bold text-3xl mb-4">Bài hát</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {songsData.map((item, index) => (
              <div
                key={index}
                className=" p-3 rounded-xl transition-all hover:scale-[1.04] cursor-pointer shadow-md"
              >
                <SongItem
                  name={item.name}
                  desc={item.desc}
                  id={item._id}
                  image={item.image}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default DisplayHome;
