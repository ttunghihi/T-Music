// Sidebar.jsx
import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='bg-[#ff6600] min-h-screen pl-[4vw]'>

        <img src={assets.logo} className='mt-5 w-[max(10vw,100px)] hidden sm:block' alt='' />
        <img src={assets.logo_small} className='mt-5 w-[max(5vw,40px)] mr-5 sm:hidden block' alt='' />

            <div className='flex flex-col gap-5 mt-10'>

                <NavLink to='/add-song' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.add_song} className='w-5' alt="" />
                    <p className='hidden sm:block'>Thêm bài hát </p>
                </NavLink>
                

                <NavLink to='/list-song' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.song_icon} className='w-5' alt="" />
                    <p className='hidden sm:block'>Danh sách bài hát </p>
                </NavLink>

                <NavLink to='/add-podcast' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.add_song} className='w-5' alt="" />
                    <p className='hidden sm:block'>Thêm Podcast </p>
                </NavLink>

                <NavLink to='/list-podcast' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.song_icon} className='w-5' alt="" />
                    <p className='hidden sm:block'>Danh sách Podcast </p>
                </NavLink>

                <NavLink to='/add-album' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.add_album} className='w-5' alt="" />
                    <p className='hidden sm:block'>Tạo album </p>
                </NavLink>

                <NavLink to='/list-album' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.album_icon} className='w-5' alt="" />
                    <p className='hidden sm:block'>Danh sách album </p>
                </NavLink>

                {/* Danh sách tài khoản */}
                <NavLink to='/list-user' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.user_icon} className='w-5' alt="" />
                    <p className='hidden sm:block'>Danh sách tài khoản </p>
                </NavLink>

                {/* NEW: Yêu cầu Premium (Admin) */}
                <NavLink to='/list-premium-requests' className='flex items-center gap-2.5 text-gray-800 bg-white border border-black p-2 pr-[max(8vw,10px)] drop-shadow-[-4px_4px_#ffff33] text-sm font-medium'>
                    <img src={assets.premium_icon || assets.tmusic_logo} className='w-5' alt="" />
                    <p className='hidden sm:block'>Yêu cầu Premium</p>
                </NavLink>

            </div>

    </div>
  )
}

export default Sidebar
