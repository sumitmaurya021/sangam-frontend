import React, { useState, useEffect } from 'react';
import { socialApi, chatApi, miscApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, Tag, Info, ShoppingBag, X, MessageSquare, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/Marketplace.css';

export default function Marketplace({ setCurrentTab, setSelectedUserId }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my_listings'

  // Create Listing form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'electronics',
    condition: 'new',
    price: '',
    price_negotiable: false,
    location_name: '',
  });
  const [aiFilling, setAiFilling] = useState(false);

  const categories = [
    'electronics', 'furniture', 'clothing', 'vehicles', 'property',
    'sports', 'books', 'toys', 'garden', 'other'
  ];

  const conditions = [
    { label: 'New', value: 'new' },
    { label: 'Like New', value: 'like_new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' }
  ];

  useEffect(() => {
    loadListings();
  }, [selectedCategory, activeTab]);

  const loadListings = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'my_listings') {
        res = await socialApi.getMyMarketplaceListings();
      } else {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.q = searchQuery;
        if (priceRange.min) params.min_price = priceRange.min;
        if (priceRange.max) params.max_price = priceRange.max;
        res = await socialApi.getMarketplaceListings(params);
      }
      if (res.data) {
        setListings(res.data);
      }
    } catch (err) {
      console.error('Error fetching marketplace listings', err);
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadListings();
  };

  const handleContactSeller = async (listing) => {
    try {
      const res = await chatApi.createConversation({ user_id: listing.user?.id || listing.user_id });
      if (res.data) {
        // Send a quick initial system message or jump to chat tab
        toast.success('Conversation started with seller');
        setCurrentTab('chat');
      }
    } catch (err) {
      toast.error('Error starting conversation');
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await socialApi.markMarketplaceListingSold(id);
      toast.success('Listing marked as sold!');
      loadListings();
      if (selectedListing?.id === id) {
        setSelectedListing(prev => ({ ...prev, status: 'sold' }));
      }
    } catch (err) {
      toast.error('Failed to update listing status');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await socialApi.deleteMarketplaceListing(id);
      toast.success('Listing removed successfully');
      loadListings();
      setSelectedListing(null);
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  const handleAiAutoFill = async () => {
    if (!form.description) {
      toast.error('Please enter a description for the AI to analyze.');
      return;
    }
    setAiFilling(true);
    try {
      const res = await miscApi.autoFillListing({ description: form.description });
      if (res.data) {
        setForm(prev => ({
          ...prev,
          title: res.data.title || prev.title,
          category: res.data.category || prev.category,
          condition: res.data.condition || prev.condition,
          price: res.data.price || prev.price,
          price_negotiable: !!res.data.price_negotiable
        }));
        toast.success('Listing fields optimized by Sangam AI!');
      }
    } catch (err) {
      console.warn('AI autocomplete failed, using heuristics');
      toast.error('AI features temporarily offline');
    } finally {
      setAiFilling(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await socialApi.createMarketplaceListing({ marketplace_listing: form });
      if (res.data) {
        toast.success('Listing published successfully!');
        setShowCreateModal(false);
        setForm({
          title: '',
          description: '',
          category: 'electronics',
          condition: 'new',
          price: '',
          price_negotiable: false,
          location_name: '',
        });
        loadListings();
      }
    } catch (err) {
      toast.error('Failed to create listing');
    }
  };

  return (
    <div className="marketplace-container">
      {/* Search Header Banner */}
      <div className="marketplace-hero glass">
        <div className="hero-text-content">
          <h1>Marketplace</h1>
          <p>Discover & list premium artifacts on the futuristic decentralized ledger.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="marketplace-search-form">
          <div className="search-input-wrapper">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search listings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="glow-btn">Search</button>
        </form>
      </div>

      {/* Primary Navigation & Control Row */}
      <div className="marketplace-controls-row">
        <div className="nav-tabs glass">
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => { setActiveTab('all'); setSelectedCategory(''); }}>
            Explore All
          </button>
          <button className={activeTab === 'my_listings' ? 'active' : ''} onClick={() => setActiveTab('my_listings')}>
            My Storefront
          </button>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="glow-btn add-listing-btn">
          <Plus size={16} /> List An Item
        </button>
      </div>

      {/* Sidebar Filters + Cards Grid Layout */}
      <div className="marketplace-layout-grid">
        
        {/* Filters Sidebar */}
        <aside className="filters-sidebar glass">
          <div className="sidebar-section-header">
            <Filter size={16} /> <h4>Filters</h4>
          </div>

          {/* Category Dropdown */}
          <div className="filter-group">
            <label>Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Price Filters */}
          <div className="filter-group">
            <label>Price Range ($)</label>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
              <span>to</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>
            <button onClick={loadListings} className="filter-apply-btn">Apply price</button>
          </div>
        </aside>

        {/* Listings Cards Grid */}
        <main className="listings-main-area">
          {loading ? (
            <div className="marketplace-loader">
              <div className="premium-spinner"></div>
              <p>Scanning index listings...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="listings-cards-grid">
              {listings.map(item => (
                <div 
                  key={item.id} 
                  className={`glass listing-card ${item.status === 'sold' ? 'sold-status' : ''}`}
                  onClick={() => setSelectedListing(item)}
                >
                  <div className="listing-card-img-wrapper">
                    {item.status === 'sold' && <div className="sold-card-badge">SOLD</div>}
                    <img 
                      src={item.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=300"} 
                      alt={item.title} 
                    />
                    <span className="listing-card-price">
                      {item.price ? `$${parseFloat(item.price).toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <div className="listing-card-info">
                    <span className="listing-card-cat">{item.category}</span>
                    <h4 className="listing-card-title">{item.title}</h4>
                    <p className="listing-card-loc">📍 {item.location_name || 'Global'}</p>
                    <div className="listing-card-footer">
                      <span className="listing-card-cond">{item.condition?.replace('_', ' ')}</span>
                      {item.user?.name && <span className="listing-card-owner">@{item.user.name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="marketplace-empty">
              <ShoppingBag size={48} />
              <p>No listings match your filter parameters.</p>
            </div>
          )}
        </main>
      </div>

      {/* Listing Details Drawer/Modal */}
      {selectedListing && (
        <div className="drawer-overlay" onClick={() => setSelectedListing(null)}>
          <div className="drawer-panel glass" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setSelectedListing(null)}>
              <X size={20} />
            </button>

            <div className="drawer-content-scroll">
              <div className="drawer-media-wrapper">
                <img 
                  src={selectedListing.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=400"} 
                  alt={selectedListing.title} 
                  className="drawer-media"
                />
              </div>

              <div className="drawer-header-info">
                <span className="drawer-category-tag">{selectedListing.category}</span>
                <h2>{selectedListing.title}</h2>
                <div className="drawer-price-tag">
                  {selectedListing.price ? `$${parseFloat(selectedListing.price).toFixed(2)}` : 'Free'}
                  {selectedListing.price_negotiable && <span className="negotiable-lbl">OBO</span>}
                </div>
              </div>

              <div className="drawer-meta-grid">
                <div>
                  <span className="meta-lbl">Condition</span>
                  <span className="meta-val">{selectedListing.condition?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="meta-lbl">Location</span>
                  <span className="meta-val">📍 {selectedListing.location_name || 'Global'}</span>
                </div>
                <div>
                  <span className="meta-lbl">Status</span>
                  <span className="meta-val highlight-status">{selectedListing.status}</span>
                </div>
              </div>

              <div className="drawer-description">
                <h4>Description</h4>
                <p>{selectedListing.description || "No description provided."}</p>
              </div>

              <div className="drawer-owner-info">
                <h4>Seller Profile</h4>
                <div className="owner-profile-row">
                  <div className="owner-avatar-wrapper">
                    <img 
                      src={selectedListing.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"} 
                      alt="Owner Avatar" 
                      onClick={() => {
                        setSelectedUserId(selectedListing.user_id || selectedListing.user?.id);
                        setCurrentTab('profile');
                        setSelectedListing(null);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div>
                    <h5 
                      onClick={() => {
                        setSelectedUserId(selectedListing.user_id || selectedListing.user?.id);
                        setCurrentTab('profile');
                        setSelectedListing(null);
                      }}
                      style={{ cursor: 'pointer', hover: { textDecoration: 'underline' } }}
                    >
                      {selectedListing.user?.name || 'Artifact Creator'}
                    </h5>
                    <p>{selectedListing.user?.email || '@creator'}</p>
                  </div>
                </div>
              </div>

              {/* Action Panels */}
              <div className="drawer-action-panel">
                {selectedListing.user_id === user.id || selectedListing.user?.id === user.id ? (
                  <div className="owner-action-buttons">
                    {selectedListing.status !== 'sold' && (
                      <button onClick={() => handleMarkSold(selectedListing.id)} className="glow-btn mark-sold-btn">
                        <Check size={16} /> Mark as Sold
                      </button>
                    )}
                    <button onClick={() => handleDeleteListing(selectedListing.id)} className="delete-btn">
                      Delete Listing
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleContactSeller(selectedListing)} className="glow-btn message-seller-btn">
                    <MessageSquare size={16} /> Message Seller
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Marketplace Listing</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form-scroll">
              <div className="form-group">
                <label>Item Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                  placeholder="e.g. Vintage Leather Jacket"
                />
              </div>

              <div className="form-group">
                <div className="ai-label-row">
                  <label>Description</label>
                  <button type="button" onClick={handleAiAutoFill} disabled={aiFilling} className="ai-autofill-btn">
                    <Sparkles size={12} /> {aiFilling ? 'Analyzing...' : 'AI Autofill'}
                  </button>
                </div>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows="4" 
                  placeholder="Describe your item. Enter description and click AI Autofill to fill parameters!"
                  required
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                    {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input 
                    type="number" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    placeholder="0.00 (leave blank if free)"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    value={form.location_name} 
                    onChange={(e) => setForm({ ...form, location_name: e.target.value })} 
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div className="form-checkbox-group">
                <input 
                  type="checkbox" 
                  id="negotiable" 
                  checked={form.price_negotiable} 
                  onChange={(e) => setForm({ ...form, price_negotiable: e.target.checked })}
                />
                <label htmlFor="negotiable">Price Negotiable (OBO)</label>
              </div>

              <button type="submit" className="glow-btn modal-submit-btn">Publish Listing</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
