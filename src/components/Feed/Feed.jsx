import React, { useState, useEffect } from 'react';
import CreatePost from '../CreatePost/CreatePost';
import PostCard from '../PostCard/PostCard';
import { postsApi, socialApi } from '../../api';
import { Compass, Users, Calendar, Bookmark, History, TrendingUp, HeartHandshake } from 'lucide-react';
import '../../assets/css/Feed.css';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedData() {
      try {
        const postsRes = await postsApi.getPosts();
        const storiesRes = await socialApi.getActiveStories();
        
        if (postsRes.data?.posts && postsRes.data.posts.length > 0) {
          setPosts(postsRes.data.posts);
        } else {
          setPosts(getSamplePosts());
        }

        if (storiesRes.data?.stories && storiesRes.data.stories.length > 0) {
          setStories(storiesRes.data.stories);
        } else {
          setStories(getSampleStories());
        }
      } catch (err) {
        console.warn('API call failed, using mock data for feed components');
        setPosts(getSamplePosts());
        setStories(getSampleStories());
      } finally {
        setLoading(false);
      }
    }
    loadFeedData();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        <p>Loading your premium feed...</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* LEFT COLUMN: Profile and Shortcuts */}
      <aside className="feed-left-col">
        {/* Profile Card */}
        <div className="glass feed-profile-card">
          <div className="feed-profile-avatar-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" 
              alt="Ananya Sharma"
              className="feed-profile-avatar"
            />
          </div>
          <div>
            <h4 className="feed-profile-name">Ananya Sharma</h4>
            <span className="feed-profile-title">Product Designer</span>
          </div>
          
          <div className="feed-profile-stats">
            <div className="feed-profile-stat-box">
              <p className="feed-profile-stat-val">14.2k</p>
              <p className="feed-profile-stat-lbl">Followers</p>
            </div>
            <div className="feed-profile-stat-divider" />
            <div className="feed-profile-stat-box">
              <p className="feed-profile-stat-val">643</p>
              <p className="feed-profile-stat-lbl">Following</p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="glass feed-shortcuts">
          <button className="feed-shortcut-btn">
            <Compass size={18} color="var(--accent-color)" /> Explore
          </button>
          <button className="feed-shortcut-btn">
            <Users size={18} color="#10b981" /> Groups
          </button>
          <button className="feed-shortcut-btn">
            <Calendar size={18} color="#3b82f6" /> Events
          </button>
          <button className="feed-shortcut-btn">
            <Bookmark size={18} color="#eab308" /> Bookmarks
          </button>
          <button className="feed-shortcut-btn">
            <History size={18} color="#f43f5e" /> Memories
          </button>
        </div>
      </aside>

      {/* CENTER COLUMN: Stories, Post Box, Post Cards */}
      <main className="feed-center-col">
        {/* Stories Horizontal Tray */}
        <div className="feed-stories-tray">
          {/* Add story bubble */}
          <div className="feed-story-item">
            <div className="feed-story-add-bubble">
              <span className="feed-story-add-plus">+</span>
            </div>
            <span className="feed-story-label">Your Story</span>
          </div>

          {/* List of active stories */}
          {stories.map(story => (
            <div key={story.id} className="feed-story-item">
              <div className="pulse-border feed-story-bubble">
                <div className="feed-story-avatar-wrapper">
                  <img 
                    src={story.user?.avatar} 
                    alt={story.user?.name} 
                    className="feed-story-avatar"
                  />
                </div>
              </div>
              <span className="feed-story-name">
                {story.user?.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Create Post Form */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Posts Feed list */}
        <div className="feed-posts-list">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
          ))}
        </div>
      </main>

      {/* RIGHT COLUMN: Trending and Fundraisers widget */}
      <aside className="feed-right-col">
        {/* Trending Tags Widget */}
        <div className="glass feed-sidebar-card">
          <div className="feed-sidebar-header">
            <TrendingUp size={18} color="var(--accent-color)" />
            <h4 className="feed-sidebar-title">Trending Hashtags</h4>
          </div>
          <div className="feed-sidebar-list">
            {getSampleTrends().map(trend => (
              <div key={trend.tag} className="feed-trend-item">
                <div>
                  <p className="feed-trend-tag">#{trend.tag}</p>
                  <p className="feed-trend-count">{trend.posts_count} posts</p>
                </div>
                <span className="feed-trend-badge">
                  Hot
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Active Fundraisers */}
        <div className="glass feed-sidebar-card">
          <div className="feed-sidebar-header">
            <HeartHandshake size={18} color="#ec4899" />
            <h4 className="feed-sidebar-title">Active Fundraisers</h4>
          </div>
          <div className="feed-sidebar-list">
            <div className="feed-fundraiser-card">
              <h5 className="feed-fundraiser-title">Clean Water Initiative</h5>
              <p className="feed-fundraiser-desc">Providing filtration systems to rural schools.</p>
              <div className="feed-fundraiser-status">
                <div className="feed-fundraiser-stats">
                  <span>$4,200 raised</span>
                  <span>Goal $5,000</span>
                </div>
                <div className="feed-fundraiser-bar-bg">
                  <div className="feed-fundraiser-bar-fill" style={{ width: '84%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function getSamplePosts() {
  return [
    {
      id: 101,
      content: "Just finalized the design specifications for the Sangam Social Mobile app. Moving onto interactive prototype stages tomorrow! 📱✨ Let me know what you guys think about the glassmorphic card layouts.",
      created_at: "2 hours ago",
      visibility: "public",
      user: {
        name: "Abhinav Singh",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
      },
      image_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600",
      liked_by_current_user: true,
      likes_count: 42,
      comments: [
        { id: 1, user: { name: 'Priya Sen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' }, body: 'Looking incredibly clean! The gradients match perfectly.', created_at: '1 hour ago' }
      ]
    },
    {
      id: 102,
      content: "Quick poll: Which primary theme accent feels more premium for our next dashboard version?",
      created_at: "5 hours ago",
      visibility: "public",
      user: {
        name: "Sangam AI Systems",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150"
      },
      poll: {
        question: "Best Dashboard Theme Accent?",
        ends_at: "Ends in 2 days",
        poll_options: [
          { id: 1, body: "Royal Purple Glow (#8a2be2)", votes_count: 145 },
          { id: 2, body: "Deep Space Indigo (#6366f1)", votes_count: 98 },
          { id: 3, body: "Hot Cyber Pink (#ec4899)", votes_count: 57 }
        ]
      },
      liked_by_current_user: false,
      likes_count: 18,
      comments: []
    },
    {
      id: 103,
      content: "We are starting a fundraiser to deliver warm meals to families affected by the heavy rains this week. Every donation counts towards creating a change in the local shelters! 🙏",
      created_at: "1 day ago",
      visibility: "public",
      user: {
        name: "Community Aid",
        avatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=150&h=150"
      },
      fundraiser: {
        title: "Rain Rescue Meals Relief Campaign",
        description: "Delivering cooked meals and fresh water to affected shelters.",
        goal_amount: 5000,
        raised_amount: 1450
      },
      liked_by_current_user: false,
      likes_count: 110,
      comments: []
    }
  ];
}

function getSampleStories() {
  return [
    { id: 1, user: { name: "Riya Sen", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" } },
    { id: 2, user: { name: "Kabir Mehta", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100" } },
    { id: 3, user: { name: "Meera Bose", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" } },
    { id: 4, user: { name: "Dev Goel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" } }
  ];
}

function getSampleTrends() {
  return [
    { tag: "SangamPremium", posts_count: "12.4k" },
    { tag: "ViteReactApp", posts_count: "8.1k" },
    { tag: "GlassmorphismUI", posts_count: "4.9k" },
    { tag: "SocialAppDevelopment", posts_count: "3.2k" }
  ];
}
