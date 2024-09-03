// components/Avatar.js
import React from 'react';
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';

const Avatar = ({ userId, name, imageUrl, width, height }) => {
    const onlineUser = useSelector(state => state?.user?.onlineUser);

    // Get the initials from the name
    let avatarName = "";
    if (name) {
        const splitName = name.split(" ");
        avatarName = splitName.length > 1 ? splitName[0][0] + splitName[1][0] : splitName[0][0];
    }

    // Define background colors for the avatar
    const bgColor = [
        'bg-slate-200',
        'bg-teal-200',
        'bg-red-200',
        'bg-green-200',
        'bg-yellow-200',
        'bg-gray-200',
        'bg-cyan-200',
        'bg-sky-200',
        'bg-blue-200'
    ];

    // Randomly select a background color
    const randomNumber = Math.floor(Math.random() * bgColor.length);
    const isOnline = onlineUser.includes(userId);

    return (
        <div 
            className='relative rounded-full overflow-hidden' 
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    width={width}
                    height={height}
                    alt={name}
                    className='object-cover rounded-full'
                />
            ) : name ? (
                <div 
                    className={`flex items-center justify-center text-lg font-bold rounded-full ${bgColor[randomNumber]}`}
                    style={{ width: `${width}px`, height: `${height}px` }}
                >
                    {avatarName}
                </div>
            ) : (
                <div 
                    className={`flex items-center justify-center text-lg font-bold rounded-full ${bgColor[randomNumber]}`}
                    style={{ width: `${width}px`, height: `${height}px` }}
                >
                    <PiUserCircle size={width / 2} />
                </div>
            )}

            {isOnline && (
                <div 
                    className='bg-green-600 w-3 h-3 rounded-full absolute bottom-1 right-1 border-2 border-white'
                    style={{ width: '12px', height: '12px' }}
                />
            )}
        </div>
    );
}

export default Avatar;
