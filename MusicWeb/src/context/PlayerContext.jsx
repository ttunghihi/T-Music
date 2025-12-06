// PlayerContext.jsx
import { useEffect, useRef, useState } from "react";
import { PlayerContext } from "./PlayerContext";
import axios from "axios";

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const url = "https://t-music.onrender.com";

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [podcastsData, setPodcastsData] = useState([]);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);

  // flags
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // current queue + ref
  const [currentQueue, setCurrentQueue] = useState([]); // array of track objects
  const currentQueueRef = useRef(currentQueue);
  useEffect(() => {
    currentQueueRef.current = currentQueue;
  }, [currentQueue]);

  // refs for flags to avoid stale closures in event handlers
  const isShuffleRef = useRef(isShuffle);
  const isLoopRef = useRef(isLoop);
  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);
  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);

  // keep refs to datasets to avoid stale closure
  const songsDataRef = useRef(songsData);
  useEffect(() => {
    songsDataRef.current = songsData;
  }, [songsData]);

  const podcastsDataRef = useRef(podcastsData);
  useEffect(() => {
    podcastsDataRef.current = podcastsData;
  }, [podcastsData]);

  // likes
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const raw = localStorage.getItem("tm_likedSongIds");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 },
  });

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => setPlayStatus(true))
      .catch(() => {
        /* ignore */
      });
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayStatus(false);
  };

  const getAuthHeader = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return {};
      return { Authorization: `Bearer ${token}` };
    } catch (err) {
      return {};
    }
  };

  // --- like APIs (unchanged) ---
  const fetchMyLikes = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        try {
          const raw = localStorage.getItem("tm_likedSongIds");
          if (raw) {
            const cached = JSON.parse(raw);
            setLikedSongIds(cached || []);
            setSongsData((prev) =>
              prev.map((s) => ({ ...s, liked: (cached || []).includes(String(s._id)) }))
            );
            return { success: true, likedSongIds: cached || [], fromCache: true };
          }
        } catch (e) {}
        setLikedSongIds([]);
        return { success: false, message: "No token" };
      }
      const res = await axios.get(`${url}/api/user/likes`, { headers });
      if (res?.data?.success) {
        const liked = (res.data.likedSongs || []).map((s) => String(s._id || s.id));
        setLikedSongIds(liked);
        setSongsData((prev) => prev.map((s) => ({ ...s, liked: liked.includes(String(s._id)) })));
        try {
          localStorage.setItem("tm_likedSongIds", JSON.stringify(liked));
        } catch (e) {}
        return { success: true, likedSongIds: liked };
      } else {
        setLikedSongIds([]);
        try {
          localStorage.removeItem("tm_likedSongIds");
        } catch (e) {}
        return { success: false, message: res?.data?.message || "Fetch failed" };
      }
    } catch (err) {
      console.error("fetchMyLikes error:", err);
      return { success: false, message: "Server error" };
    }
  };

  const toggleLike = async (songId) => {
    if (!songId) return { success: false, message: "No songId" };
    const prevLiked = likedSongIds.slice();
    const isCurrentlyLiked = prevLiked.includes(String(songId));
    const optimistic = isCurrentlyLiked
      ? prevLiked.filter((id) => id !== String(songId))
      : [...prevLiked, String(songId)];
    setLikedSongIds(optimistic);
    setSongsData((prev) => prev.map((s) => ({ ...s, liked: optimistic.includes(String(s._id)) })));
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        setLikedSongIds(prevLiked);
        setSongsData((prev) => prev.map((s) => ({ ...s, liked: prevLiked.includes(String(s._id)) })));
        return { success: false, message: "Not authenticated" };
      }
      const res = await axios.post(`${url}/api/user/like/${songId}`, {}, { headers });
      if (res?.data?.success) {
        const liked = (res.data.likedSongs || []).map((id) => String(id));
        setLikedSongIds(liked);
        setSongsData((prev) => prev.map((s) => ({ ...s, liked: liked.includes(String(s._id)) })));
        try {
          localStorage.setItem("tm_likedSongIds", JSON.stringify(liked));
        } catch (e) {}
        return { success: true, action: res.data.action, likedSongIds: liked };
      } else {
        setLikedSongIds(prevLiked);
        setSongsData((prev) => prev.map((s) => ({ ...s, liked: prevLiked.includes(String(s._id)) })));
        return { success: false, message: res?.data?.message || "Toggle failed" };
      }
    } catch (err) {
      console.error("toggleLike error:", err);
      setLikedSongIds(prevLiked);
      setSongsData((prev) => prev.map((s) => ({ ...s, liked: prevLiked.includes(String(s._id)) })));
      return { success: false, message: "Server error" };
    }
  };

  const isLiked = (songId) => {
    if (!songId) return false;
    return likedSongIds.includes(String(songId));
  };

  // --- Data fetchers ---
  const getSongsData = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list`);
      const songs = response.data.songs || [];
      const mapped = songs.map((s) => ({ ...s, liked: likedSongIds.includes(String(s._id)), type: "song" }));
      setSongsData(mapped);
      if (mapped.length && !track) {
        setTrack(mapped[0]);
      }
    } catch (error) {
      console.error("Error fetching songs data:", error);
    }
  };

  const getAlbumsData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      setAlbumsData(response.data.albums || []);
    } catch (error) {
      console.error("Error fetching albums data:", error);
    }
  };

  const getPodcastsData = async () => {
    try {
      const response = await axios.get(`${url}/api/podcast/list`);
      const podcasts = response.data.podcasts || [];
      const mapped = podcasts.map((p) => ({ ...p, type: "podcast" }));
      setPodcastsData(mapped);
    } catch (error) {
      console.error("Error fetching podcasts data:", error);
    }
  };

  // Helper: collection for a track (fallback)
  const getCollectionForTrack = (t) => {
    if (!t || !t.type) return songsDataRef.current || [];
    if (t.type === "podcast") return podcastsDataRef.current || [];
    return songsDataRef.current || [];
  };

  // Active collection: prefer currentQueue if present
  const getActiveCollection = () => {
    if (currentQueueRef.current && currentQueueRef.current.length) return currentQueueRef.current;
    return getCollectionForTrack(track);
  };

  // Helper to resolve a single item: try to find full data in songs/podcasts refs
  const resolveItemFull = (item) => {
    if (!item) return null;
    // if already has url or src or full fields, return as-is
    if (item.url || item.src || item.audioUrl || item.type === "podcast" || item.name) {
      // ensure _id is string
      return { ...item, _id: String(item._id || item.id) };
    }
    const idStr = String(item._id || item.id || item);
    // try find in songsDataRef
    const foundSong = (songsDataRef.current || []).find((s) => String(s._id || s.id) === idStr);
    if (foundSong) return foundSong;
    // try podcasts
    const foundPodcast = (podcastsDataRef.current || []).find((p) => String(p._id || p.id) === idStr);
    if (foundPodcast) return foundPodcast;
    // fallback minimal object
    return { _id: idStr, type: "song" };
  };

  // playWithId: supports optional queue; resolves queue items to full objects if possible
  // signature: playWithId(id, queue = null)
  const playWithId = async (id, queue = null) => {
    if (!id) return;

    // If queue provided, normalize/resolve it and set as currentQueue
    if (Array.isArray(queue) && queue.length) {
      const resolved = queue.map((q) => resolveItemFull(q)).filter(Boolean);
      setCurrentQueue(resolved);

      // try find the requested id inside resolved queue
      const foundInQueue = resolved.find((item) => String(item._id || item.id) === String(id));
      if (foundInQueue) {
        // ensure type field
        const final = { ...foundInQueue, type: foundInQueue.type || "song", _id: String(foundInQueue._id || foundInQueue.id) };
        setTrack(final);
        return;
      }
      // else continue fallback
    }

    // Try to find in songsDataRef (immediate)
    const foundSong = (songsDataRef.current || []).find((item) => String(item._id || item.id) === String(id));
    if (foundSong) {
      setCurrentQueue([]); // clear queue because playing from global list
      setTrack(foundSong);
      return;
    }

    // Try podcasts
    const foundPodcast = (podcastsDataRef.current || []).find((item) => String(item._id || item.id) === String(id));
    if (foundPodcast) {
      setCurrentQueue([]);
      setTrack(foundPodcast);
      return;
    }

    // Lastly try currentQueueRef (maybe it was set earlier but playWithId called without queue)
    if (currentQueueRef.current && currentQueueRef.current.length) {
      const foundInCurrent = currentQueueRef.current.find((item) => String(item._id || item.id) === String(id));
      if (foundInCurrent) {
        setTrack(foundInCurrent);
        return;
      }
    }

    // If not found anywhere, set a minimal track (will likely not play until more data arrives)
    setTrack({ _id: String(id), type: "song" });
  };

  // previous/next use active collection
  const previous = async () => {
    if (!track) return;
    const collection = getActiveCollection();
    if (!collection || !collection.length) return;

    const index = collection.findIndex((item) => String(item._id || item.id) === String(track._id || track.id));
    if (index > 0) {
      setTrack(collection[index - 1]);
    } else {
      setTrack(collection[collection.length - 1]);
    }
  };

  const next = () => {
    const collection = getActiveCollection();
    if (!collection || !collection.length || !track) return;

    if (isLoop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setPlayStatus(true)).catch(() => {});
      }
      return;
    }

    if (isShuffle) {
      if (collection.length === 1) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setPlayStatus(true)).catch(() => {});
        }
        return;
      }

      const currentIndex = collection.findIndex((item) => String(item._id || item.id) === String(track._id || track.id));
      let randomIndex = Math.floor(Math.random() * collection.length);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * collection.length);
      }

      setTrack(collection[randomIndex]);
      return;
    }

    const index = collection.findIndex((item) => String(item._id || item.id) === String(track._id || track.id));
    if (index === -1) return;

    const nextIndex = index < collection.length - 1 ? index + 1 : 0;
    setTrack(collection[nextIndex]);
  };

  const seekSong = async (e) => {
    if (!audioRef.current || !seekBg.current) return;
    const rect = seekBg.current.getBoundingClientRect();
    const offsetX =
      e.nativeEvent && typeof e.nativeEvent.offsetX === "number"
        ? e.nativeEvent.offsetX
        : e.clientX - rect.left;
    if (!audioRef.current.duration || !seekBg.current.clientWidth) return;
    audioRef.current.currentTime = (offsetX / seekBg.current.clientWidth) * audioRef.current.duration;
  };

  // Effect: when track changes, load audio and attach handlers
  useEffect(() => {
    if (!audioRef.current) return;

    if (!track) {
      try {
        audioRef.current.pause();
      } catch (e) {}
      setPlayStatus(false);
      return;
    }

    try {
      audioRef.current.pause();
    } catch (e) {}

    // load new source. Assumes your audio element's src is bound to track.url or similar in Player component.
    try {
      audioRef.current.load();
    } catch (e) {
      /* ignore */
    }

    const handleTimeUpdate = () => {
      if (!audioRef.current || !audioRef.current.duration) return;
      if (seekBar.current) {
        seekBar.current.style.width = `${Math.floor((audioRef.current.currentTime / audioRef.current.duration) * 100)}%`;
      }
      setTime({
        currentTime: {
          second: Math.floor(audioRef.current.currentTime % 60),
          minute: Math.floor(audioRef.current.currentTime / 60),
        },
        totalTime: {
          second: Math.floor(audioRef.current.duration % 60),
          minute: Math.floor(audioRef.current.duration / 60),
        },
      });
    };

    const handleEnded = () => {
      if (isLoopRef.current) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setPlayStatus(true)).catch(() => {});
        }
        return;
      }

      const snapshot = Array.isArray(getActiveCollection()) ? getActiveCollection() : [];

      if (isShuffleRef.current) {
        if (snapshot.length === 1) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => setPlayStatus(true)).catch(() => {});
          }
          return;
        }

        const currentIndex = snapshot.findIndex((item) => String(item._id || item.id) === String(track._id || track.id));
        let randomIndex = Math.floor(Math.random() * snapshot.length);
        while (randomIndex === currentIndex) {
          randomIndex = Math.floor(Math.random() * snapshot.length);
        }
        setTrack(snapshot[randomIndex]);
        return;
      }

      const index = snapshot.findIndex((item) => String(item._id || item.id) === String(track._id || track.id));
      if (index === -1) return;
      const nextIndex = index < snapshot.length - 1 ? index + 1 : 0;
      setTrack(snapshot[nextIndex]);
    };

    audioRef.current.ontimeupdate = handleTimeUpdate;
    audioRef.current.onended = handleEnded;

    audioRef.current
      .play()
      .then(() => setPlayStatus(true))
      .catch(() => {
        setPlayStatus(false);
      });

    return () => {
      if (!audioRef.current) return;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
    };
    // only depend on track
  }, [track]);

  // volume effect
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // initial load
  useEffect(() => {
    (async () => {
      await fetchMyLikes();
      await getSongsData();
      await getPodcastsData();
    })();
    getAlbumsData();
  }, []);

  const contextValue = {
    audioRef,
    seekBg,
    seekBar,
    track,
    playStatus,
    time,
    songsData,
    albumsData,
    podcastsData,

    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,

    isShuffle,
    setIsShuffle,
    isLoop,
    setIsLoop,
    volume,
    setVolume,

    currentQueue,
    setCurrentQueue,

    likedSongIds,
    fetchMyLikes,
    toggleLike,
    isLiked,
  };

  return <PlayerContext.Provider value={contextValue}>{props.children}</PlayerContext.Provider>;
};

export default PlayerContextProvider;
