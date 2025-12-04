import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Plus } from 'lucide-react';
import { Content } from '../types';

interface ShortsPlayerProps {
  shorts: Content[];
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ shorts }) => {
  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {shorts.map((short) => (
        <SingleShort key={short.id} data={short} />
      ))}
    </div>
  );
};

const SingleShort: React.FC<{ data: Content }> = ({ data }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(data.likes);
  const [followed, setFollowed] = useState(data.user.isFollowing);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleFollow = () => {
    setFollowed(true);
  };

  return (
    <div className="relative h-[calc(100vh-56px)] w-full snap-start flex justify-center bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={data.url}
        className="h-full w-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
        poster={data.thumbnail}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none"></div>

      {/* Right Side Interaction Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-6 z-10 text-white">
        <div className="flex flex-col items-center">
            <button onClick={handleLike} className="bg-black/20 p-3 rounded-full backdrop-blur-sm transition active:scale-90">
                <Heart fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : 'white'} size={30} />
            </button>
            <span className="text-xs font-bold mt-1">{likesCount}</span>
        </div>

        <div className="flex flex-col items-center">
            <button className="bg-black/20 p-3 rounded-full backdrop-blur-sm transition active:scale-90">
                <MessageCircle size={30} />
            </button>
            <span className="text-xs font-bold mt-1">{data.comments.length}</span>
        </div>

        <button className="bg-black/20 p-3 rounded-full backdrop-blur-sm transition active:scale-90">
            <Share2 size={30} />
        </button>
        
        <button className="bg-black/20 p-3 rounded-full backdrop-blur-sm">
            <MoreVertical size={24} />
        </button>

         <div className="h-12 w-12 rounded-lg border-2 border-white overflow-hidden mt-4">
             <img src={data.thumbnail || data.url} className="w-full h-full object-cover animate-spin-slow" style={{animationDuration: '5s'}} />
         </div>
      </div>

      {/* Bottom Left Info */}
      <div className="absolute bottom-6 left-4 right-16 z-10 text-white text-left">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
             <img 
                src={data.user.avatar} 
                alt={data.user.username} 
                className="w-10 h-10 rounded-full border border-white"
            />
            {!followed && (
                <button 
                    onClick={handleFollow}
                    className="absolute -bottom-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center border border-white"
                >
                    <Plus size={12} strokeWidth={4} />
                </button>
            )}
          </div>
          <span className="font-bold text-shadow cursor-pointer">@{data.user.handle}</span>
          {!followed && (
             <button 
                onClick={handleFollow}
                className="text-xs border border-white px-2 py-1 rounded-full backdrop-blur-md"
             >
                Follow
             </button>
          )}
        </div>
        <p className="text-sm line-clamp-2 mb-2">{data.description}</p>
        <div className="flex items-center space-x-2 text-xs opacity-80">
           <span>♫ Original Sound - {data.user.username}</span>
        </div>
      </div>
    </div>
  );
};

export default ShortsPlayer;