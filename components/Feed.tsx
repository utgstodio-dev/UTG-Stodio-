import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ThumbsDown } from 'lucide-react';
import { Content, ContentType } from '../types';

interface FeedProps {
  content: Content[];
}

const Feed: React.FC<FeedProps> = ({ content }) => {
  return (
    <div className="pb-20 pt-16 bg-gray-50 min-h-screen">
      {content.map((item) => (
        item.type === ContentType.POST ? 
          <PostCard key={item.id} data={item} /> : 
          <VideoCard key={item.id} data={item} />
      ))}
    </div>
  );
};

const PostCard: React.FC<{ data: Content }> = ({ data }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(data.likes);

    const toggleLike = () => {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
    }

    return (
        <div className="bg-white mb-4 shadow-sm border-b border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    <img src={data.user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-sm">{data.user.username}</h3>
                        <p className="text-xs text-gray-500">@{data.user.handle}</p>
                    </div>
                </div>
                <button className="text-gray-500"><MoreHorizontal size={20} /></button>
            </div>

            {/* Description */}
            <div className="px-4 pb-2">
                <p className="text-sm text-gray-800">{data.description}</p>
            </div>

            {/* Image Content */}
            <div className="w-full bg-gray-100">
                <img src={data.url} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex space-x-6">
                    <div className="flex flex-col items-center">
                        <button onClick={toggleLike} className={`${liked ? 'text-green-600' : 'text-gray-600'}`}>
                            <Heart fill={liked ? 'currentColor' : 'none'} size={24} />
                        </button>
                        <span className="text-xs mt-1 text-gray-500">{likes}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button className="text-gray-600">
                            <ThumbsDown size={24} />
                        </button>
                         <span className="text-xs mt-1 text-gray-500">Dislike</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <button className="text-gray-600">
                            <MessageCircle size={24} />
                        </button>
                        <span className="text-xs mt-1 text-gray-500">{data.comments.length}</span>
                    </div>
                </div>
                <button className="text-gray-600">
                    <Share2 size={24} />
                </button>
            </div>
            
            {/* First Comment Mock */}
            {data.comments.length > 0 && (
                 <div className="px-4 pb-4 pt-0">
                    <p className="text-sm">
                        <span className="font-bold text-gray-900">{data.comments[0].username}</span> 
                        <span className="text-gray-700 ml-2">{data.comments[0].text}</span>
                    </p>
                </div>
            )}
        </div>
    )
}

const VideoCard: React.FC<{ data: Content }> = ({ data }) => {
    const [isFollowing, setIsFollowing] = useState(data.user.isFollowing);

    return (
        <div className="bg-white mb-4 shadow-sm pb-4">
             {/* Video Player */}
             <div className="w-full aspect-video bg-black relative">
                <video 
                    src={data.url} 
                    poster={data.thumbnail}
                    controls 
                    className="w-full h-full object-contain" 
                />
            </div>
            
            {/* Info */}
            <div className="p-4">
                <h2 className="text-lg font-bold leading-tight mb-2">{data.title || data.description}</h2>
                <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>{data.views ? data.views.toLocaleString() : 0} views</span>
                    <span className="mx-1">•</span>
                    <span>2 hours ago</span>
                </div>

                {/* Channel Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                         <img src={data.user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                         <div>
                            <h3 className="font-bold text-sm">{data.user.username}</h3>
                            <p className="text-xs text-gray-500">{data.user.followers} followers</p>
                         </div>
                    </div>
                    {!isFollowing && (
                        <button 
                            onClick={() => setIsFollowing(true)}
                            className="text-green-600 font-bold text-sm uppercase px-4 py-1 border border-green-600 rounded hover:bg-green-50"
                        >
                            Follow
                        </button>
                    )}
                </div>

                 {/* Actions */}
                 <div className="flex justify-around pt-4">
                    <button className="flex flex-col items-center space-y-1 text-gray-700">
                        <Heart size={22} />
                        <span className="text-xs">{data.likes}</span>
                    </button>
                     <button className="flex flex-col items-center space-y-1 text-gray-700">
                        <ThumbsDown size={22} />
                        <span className="text-xs">Dislike</span>
                    </button>
                     <button className="flex flex-col items-center space-y-1 text-gray-700">
                        <Share2 size={22} />
                        <span className="text-xs">Share</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1 text-gray-700">
                         <MessageCircle size={22} />
                         <span className="text-xs">Comment</span>
                    </button>
                 </div>
            </div>
        </div>
    )
}

export default Feed;