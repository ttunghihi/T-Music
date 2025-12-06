import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { url } from '../App';
import { toast } from 'react-toastify';

const ListSong = () => {

    const [data,setData] = useState([]);

    const fetchSongs = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            console.log(response.data);
            if (response.data.success && Array.isArray(response.data.songs)) {
                setData(response.data.songs);
            } else {
                setData([]);
                toast.error("Không thể tải danh sách bài hát.");
            }
        } catch (error) {
            console.error("fetchSongs error:", error);
            toast.error("Đã xảy ra lỗi khi kết nối đến server.");
        }
    }

    const removeSong = async (id) => {
        try {
            const response = await axios.post(`${url}/api/song/remove`, {id});

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchSongs();
            } else {
                toast.error("Không thể gỡ bài hát.");
            }

        } catch (error) {
            console.error("removeSong error:", error);
            toast.error("Đã xảy ra lỗi");
        }
    }

    useEffect(() => {
        fetchSongs();
    }, []);

  return (
    <div>
        <p>Danh sách tất cả bài hát</p>
        <br />
        <div>
            {/* Header: thêm cột Tác giả */}
            <div className='sm:grid hidden grid-cols-[0.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100'>
                <b>Ảnh</b>
                <b>Tên</b>
                <b>Tác giả</b>
                <b>Album</b>
                <b>Thời lượng</b>
                <b>Hành động</b>
            </div>

            {data.length === 0 && (
              <p className="mt-4 text-gray-500">Không có bài hát nào.</p>
            )}

            {data.map((item, index) => {
                // safe values
                const image = item?.image || "";
                const name = item?.name || "Không có tên";
                const album = item?.album || "Không có album";
                const duration = item?.duration || "-";
                const author = item?.author || "Không rõ";

                return (
                    <div key={index}
                         className='grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5'>
                        <img className='w-12' src={image} alt={name} />
                        <p>{name}</p>
                        <p className='hidden sm:block'>{author}</p>
                        <p>{album}</p>
                        <p>{duration}</p>
                        <p className='cursor-pointer' onClick={()=>removeSong(item._id)}>x</p>
                    </div>)
            })}
        </div>
    </div>
  )
}

export default ListSong
