import React, { useState, useEffect } from 'react';
import { Home, Film, PlusCircle, LayoutDashboard, User as UserIcon, Search, Menu } from 'lucide-react';
import Login from './components/Login';
import Feed from './components/Feed';
import ShortsPlayer from './components/ShortsPlayer';
import Upload from './components/Upload';
import { Content, ContentType, Tab, User } from './types';
import { searchContentWithAI } from './services/geminiService';

// --- Mock Data ---
const MOCK_USER: User = {
  id: 'u1',
  username: 'Demo User',
  handle: 'demouser',
  avatar: 'https://picsum.photos/100/100?random=user',
  followers: 120,
  isFollowing: false
};

const INITIAL_CONTENT: Content[] = [
  {
    id: 's1',
    type: ContentType.SHORT,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', // Vertical crop simul
    thumbnail: 'https://picsum.photos/400/800?random=1',
    description: 'Amazing sunset vibe! #nature #chill',
    user: { id: 'u2', username: 'NatureLover', handle: 'nature_1', avatar: 'https://picsum.photos/50/50?r=2', followers: 500 },
    likes: 1200,
    dislikes: 10,
    comments: [],
  },
  {
    id: 'p1',
    type: ContentType.POST,
    url: 'https://picsum.photos/800/600?random=3',
    description: 'Just finished my new setup! What do you think?',
    user: { id: 'u3', username: 'TechGuru', handle: 'techie', avatar: 'https://picsum.photos/50/50?r=4', followers: 2000 },
    likes: 450,
    dislikes: 2,
    comments: [{id: 'c1', username: 'fan1', text: 'Looks awesome!'}],
  },
  {
     id: 'v1',
     type: ContentType.VIDEO,
     url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
     title: 'Big Buck Bunny Official Trailer',
     description: 'The classic open movie project.',
     thumbnail: 'https://picsum.photos/800/450?random=5',
     user: { id: 'u4', username: 'MovieStudio', handle: 'studio', avatar: 'https://picsum.photos/50/50?r=6', followers: 10000 },
     likes: 5000,
     dislikes: 100,
     views: 25000,
     comments: []
  },
  {
    id: 's2',
    type: ContentType.SHORT,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/400/800?random=7',
    description: 'Funny cat moment 🐱',
    user: { id: 'u5', username: 'CatMemes', handle: 'meow', avatar: 'https://picsum.photos/50/50?r=8', followers: 300 },
    likes: 800,
    dislikes: 5,
    comments: [],
  }
];

// --- Main Component ---
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [content, setContent] = useState<Content[]>(INITIAL_CONTENT);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Content[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filter content based on active tab requirements
  const shortsContent = content.filter(c => c.type === ContentType.SHORT);
  const homeContent = content.filter(c => c.type !== ContentType.SHORT);
  
  // Display logic
  const displayContent = searchResults ? searchResults : homeContent;

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleUploadComplete = (type: ContentType, url: string, description: string) => {
    const newContent: Content = {
      id: Date.now().toString(),
      type,
      url,
      description,
      user: MOCK_USER,
      likes: 0,
      dislikes: 0,
      comments: [],
      views: 0,
      title: type === ContentType.VIDEO ? 'New Video' : undefined
    };
    setContent([newContent, ...content]);
    
    // Redirect to appropriate tab
    if (type === ContentType.SHORT) setActiveTab('SHORTS');
    else setActiveTab('HOME');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
        setSearchResults(null);
        return;
    }
    
    setIsSearching(true);
    
    // Client-side exact match
    const directMatches = content.filter(c => 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // AI Semantic Search
    const titles = content.map(c => c.description || c.title || '');
    const aiMatches = await searchContentWithAI(searchQuery, titles);
    
    // Combine results
    const combined = content.filter(c => {
        const text = c.description || c.title || '';
        return directMatches.includes(c) || aiMatches.includes(text);
    });

    setSearchResults(combined.length > 0 ? combined : null);
    setIsSearching(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-black relative">
      
      {/* Top Navbar (Hidden on Shorts to minimize distraction) */}
      {activeTab !== 'SHORTS' && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white z-40 flex items-center justify-between px-4 shadow-sm">
          <h1 className="text-xl font-extrabold text-green-600 tracking-tighter">UTG Medeia</h1>
          
          <div className="flex-1 mx-4 max-w-md relative">
            <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
            >
                <Search size={18} />
            </button>
          </div>
          
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
             <UserIcon size={18} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full">
        {activeTab === 'HOME' && (
            <div className="pt-0">
               {isSearching && <div className="pt-20 text-center text-gray-500">Searching...</div>}
               {!isSearching && searchResults && searchResults.length === 0 && (
                   <div className="pt-20 text-center text-gray-500">No results found.</div>
               )}
               <Feed content={displayContent} />
            </div>
        )}
        
        {activeTab === 'SHORTS' && (
            <ShortsPlayer shorts={shortsContent} />
        )}
        
        {activeTab === 'UPLOAD' && (
            <Upload onUploadComplete={handleUploadComplete} />
        )}

        {activeTab === 'DASHBOARD' && (
            <div className="pt-20 px-6">
                <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-gray-500 text-sm">Total Views</h3>
                        <p className="text-3xl font-bold text-green-600">12.5K</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-gray-500 text-sm">Followers</h3>
                        <p className="text-3xl font-bold text-green-600">120</p>
                    </div>
                </div>
                <div className="mt-8 bg-white shadow rounded-xl p-4">
                    <h3 className="font-bold mb-4">Offline Mode</h3>
                    <p className="text-sm text-gray-600 mb-2">Saved videos are available without internet.</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-400">1.2GB Used</p>
                </div>
            </div>
        )}

        {activeTab === 'PROFILE' && (
            <div className="pt-20 px-4">
                 <div className="flex flex-col items-center mb-8">
                     <img src={MOCK_USER.avatar} className="w-24 h-24 rounded-full border-4 border-green-100 mb-4" />
                     <h2 className="text-2xl font-bold">{MOCK_USER.username}</h2>
                     <p className="text-gray-500">@{MOCK_USER.handle}</p>
                     <div className="flex space-x-8 mt-4">
                         <div className="text-center">
                             <span className="block font-bold text-lg">4</span>
                             <span className="text-xs text-gray-500">Posts</span>
                         </div>
                         <div className="text-center">
                             <span className="block font-bold text-lg">{MOCK_USER.followers}</span>
                             <span className="text-xs text-gray-500">Followers</span>
                         </div>
                         <div className="text-center">
                             <span className="block font-bold text-lg">56</span>
                             <span className="text-xs text-gray-500">Following</span>
                         </div>
                     </div>
                 </div>
                 <hr className="border-gray-100 mb-4" />
                 <div className="grid grid-cols-3 gap-1">
                     {content.filter(c => c.user.id === MOCK_USER.id).map(c => (
                         <div key={c.id} className="aspect-square bg-gray-100 overflow-hidden relative">
                             {c.type === ContentType.POST ? 
                                <img src={c.url} className="w-full h-full object-cover" /> :
                                <video src={c.url} className="w-full h-full object-cover" />
                             }
                             <div className="absolute bottom-1 left-1 text-white shadow-black text-xs">
                                {c.likes} ❤
                             </div>
                         </div>
                     ))}
                     {/* Placeholders */}
                     <div className="aspect-square bg-gray-100"></div>
                     <div className="aspect-square bg-gray-100"></div>
                 </div>
            </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50">
        <NavButton 
            icon={<Home size={24} />} 
            label="Home" 
            isActive={activeTab === 'HOME'} 
            onClick={() => { setActiveTab('HOME'); setSearchResults(null); setSearchQuery(''); }} 
        />
        <NavButton 
            icon={<Film size={24} />} 
            label="Shorts" 
            isActive={activeTab === 'SHORTS'} 
            onClick={() => setActiveTab('SHORTS')} 
        />
        
        {/* Special Upload Button */}
        <button 
            onClick={() => setActiveTab('UPLOAD')}
            className="flex flex-col items-center justify-center -mt-6"
        >
            <div className="bg-green-600 rounded-full p-3 shadow-lg shadow-green-200 hover:scale-105 transition-transform">
                <PlusCircle size={32} color="white" />
            </div>
            <span className="text-[10px] mt-1 font-medium text-gray-500">Upload</span>
        </button>

        <NavButton 
            icon={<LayoutDashboard size={24} />} 
            label="Dashboard" 
            isActive={activeTab === 'DASHBOARD'} 
            onClick={() => setActiveTab('DASHBOARD')} 
        />
        <NavButton 
            icon={<UserIcon size={24} />} 
            label="Profile" 
            isActive={activeTab === 'PROFILE'} 
            onClick={() => setActiveTab('PROFILE')} 
        />
      </div>
    </div>
  );
};

interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
    >
        {icon}
        <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
);

export default App;