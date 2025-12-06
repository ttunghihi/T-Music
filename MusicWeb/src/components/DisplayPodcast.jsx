import React, { useContext } from "react";
import Navbar from "./Navbar";
import PodcastItem from "./PodcastItem";
import { PlayerContext } from "../context/PlayerContext";

const DisplayPodcast = () => {

  const { podcastsData } = useContext(PlayerContext);
  const data = Array.isArray(podcastsData) ? podcastsData : [];

  return (
    <>
      <Navbar />
      <div className="px-6 py-6 text-white">
        {/* SECTION: Featured / Popular podcasts */}
        <div className="mb-10">
          <h1 className="font-bold text-3xl mb-4">Podcast nổi bật</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {data.map((item, index) => (
              <div
                key={item?._id ?? index}
                className="p-3 rounded-xl transition-all hover:scale-[1.04] cursor-pointer shadow-md"
              >
                <PodcastItem
                  name={item?.name}
                  desc={item?.desc}
                  id={item?._id}
                  image={item?.image}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DisplayPodcast;
