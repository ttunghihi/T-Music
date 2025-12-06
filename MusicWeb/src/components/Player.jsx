import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'

const pad = (n) => String(n).padStart(2, '0')

const Player = () => {
  const {
    track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong,
    isShuffle, setIsShuffle, isLoop, setIsLoop, volume, setVolume,

    // like-related from context
    likedSongIds, toggleLike, isLiked
  } = useContext(PlayerContext)

  if (!track) return null

  const liked = isLiked(track._id)

  const handleToggleLike = async () => {
    try {
      // optimistic UI is handled by context (toggleLike updates likedSongIds)
      await toggleLike(track._id)
    } catch (err) {
      // nếu cần show lỗi có thể xử lý ở đây
      console.error("Error toggling like:", err)
    }
  }

  return (
    <div className="h-[10%] bg-black text-white flex items-center px-6 py-3">

      {/* Left */}
      <div className="flex items-center gap-4 pr-6 w-[260px] flex-none">
        <img className="w-12 h-12 object-cover rounded" src={track.image || assets.fallback} alt={track.name} />
        <div className="flex flex-col overflow-hidden">
          <p className="text-sm font-semibold truncate max-w-[170px]">{track.name}</p>
          <p className="text-xs text-gray-300 truncate max-w-[170px]">{track.desc}</p>
        </div>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center">

        {/* Controls */}
        <div className="flex items-center gap-5 mb-2">
          <img 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`w-4 h-4 cursor-pointer ${isShuffle ? "opacity-100" : "opacity-50"}`}
            src={assets.shuffle_icon}
            alt="shuffle"
            title="Shuffle"
          />

          <img onClick={previous} className="w-4 h-4 cursor-pointer" src={assets.prev_icon} alt="previous" title="Previous" />

          {playStatus ? (
            <img onClick={pause} className="w-8 h-8 cursor-pointer" src={assets.pausebtn} alt="pause" title="Pause" />
          ) : (
            <img onClick={play} className="w-8 h-8 cursor-pointer" src={assets.playbtn} alt="play" title="Play" />
          )}

          <img onClick={next} className="w-4 h-4 cursor-pointer" src={assets.next_icon} alt="next" title="Next" />

          <img 
            onClick={() => setIsLoop(!isLoop)}
            className={`w-4 h-4 cursor-pointer ${isLoop ? "opacity-100" : "opacity-50"}`}
            src={assets.loop_icon}
            alt="loop"
            title="Loop"
          />
        </div>

        {/* Seekbar */}
        <div className="w-full flex items-center gap-4 px-4">
          <p className="text-xs w-12 text-right">{pad(time.currentTime.minute)}:{pad(time.currentTime.second)}</p>

          <div
            ref={seekBg}
            onClick={seekSong}
            className="flex-1 max-w-[760px] w-full bg-gray-700/40 rounded-full h-1 cursor-pointer"
          >
            <div ref={seekBar} className="h-1 w-0 bg-orange-500 rounded-full" />
          </div>

          <p className="text-xs w-12">{pad(time.totalTime.minute)}:{pad(time.totalTime.second)}</p>
        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4 pl-6 w-[260px] flex-none justify-end">
        
        {/* Like button: gọi toggleLike và hiển thị trạng thái */}
        <button
          onClick={handleToggleLike}
          className="p-1 rounded focus:outline-none"
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          title={liked ? "Unlike" : "Like"}
        >
          <img
            src={assets.like_icon}
            alt="like"
            className={`w-5 h-5 cursor-pointer transition-transform ${liked ? "scale-110" : ""} ${liked ? "opacity-100" : "opacity-60"}`}
            style={liked ? { filter: "invert(50%) sepia(100%) saturate(500%) hue-rotate(330deg) brightness(95%)" } : {}}
          />
        </button>

        <img className="w-5 h-5 cursor-pointer" src={assets.queue_icon} alt="queue" title="Queue" />

        <img className="w-5 h-5 cursor-pointer" src={assets.speaker_icon} alt="speaker" title="Speaker" />

        {/* Volume icon */}
        <img 
          className="w-5 h-5 cursor-pointer" 
          src={assets.volume_icon}
          onClick={() => setVolume(Math.max(0, volume - 0.1))}
          alt="volume"
          title="Decrease volume"
        />

        {/* Volume bar */}
        <div 
          className="w-24 h-1 bg-slate-50 rounded overflow-hidden cursor-pointer"
          onClick={(e) => {
            const percent = e.nativeEvent.offsetX / 96;
            setVolume(Math.min(1, Math.max(0, percent)));
          }}
          title="Set volume"
        >
          <div 
            className="h-full bg-orange-500" 
            style={{ width: `${volume * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default Player
