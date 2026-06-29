import React, { useState, useEffect } from 'react';
import { socialApi } from '../../api';
import { Bookmark, FolderPlus, FolderOpen, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/Bookmarks.css';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    loadBookmarkData();
  }, []);

  const loadBookmarkData = async () => {
    setLoading(true);
    try {
      const resBookmarks = await socialApi.getBookmarks();
      if (resBookmarks.data) {
        setBookmarks(Array.isArray(resBookmarks.data) ? resBookmarks.data : []);
      }
      
      const resCollections = await socialApi.getBookmarkCollections();
      if (resCollections.data) {
        setCollections(Array.isArray(resCollections.data) ? resCollections.data : []);
      }
    } catch (err) {
      console.error('Error fetching bookmark logs', err);
      setBookmarks([]);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await socialApi.createBookmarkCollection({ bookmark_collection: { name: newCollectionName } });
      toast.success('Collection initialized');
      setNewCollectionName('');
      setShowCreateCollectionModal(false);
      loadBookmarkData();
    } catch (err) {
      toast.error('Failed to create collection');
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await socialApi.deleteBookmarkCollection(id);
      toast.success('Collection deleted');
      loadBookmarkData();
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="bookmarks-page-container">
      <div className="bookmarks-header-row">
        <div>
          <h1>Bookmarks</h1>
          <p>Retrieve and manage saved network packets.</p>
        </div>
        <button onClick={() => setShowCreateCollectionModal(true)} className="glow-btn collection-btn">
          <FolderPlus size={16} /> New Collection
        </button>
      </div>

      <div className="bookmarks-layout-grid">
        {/* Left Side: Collections */}
        <aside className="collections-sidebar glass">
          <div className="sidebar-header">
            <FolderOpen size={16} /> <h4>Collections</h4>
          </div>
          <div className="collections-list">
            {collections.length > 0 ? (
              collections.map(col => (
                <div key={col.id} className="collection-item">
                  <span>📁 {col.name}</span>
                  <button onClick={() => handleDeleteCollection(col.id)} className="delete-col-btn" title="Delete Collection">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            ) : (
              <p className="no-collections-txt">No collections created</p>
            )}
          </div>
        </aside>

        {/* Right Side: Saved Items List */}
        <main className="bookmarks-main-area">
          <div className="glass bookmarks-list-panel">
            {loading ? (
              <div className="bookmarks-loader">
                <div className="premium-spinner"></div>
                <p>Retrieving database index...</p>
              </div>
            ) : bookmarks.length > 0 ? (
              <div className="bookmarks-list">
                {bookmarks.map(b => (
                  <div key={b.id} className="bookmark-card">
                    <div className="bookmark-icon">
                      <Bookmark size={18} fill="var(--bookmark-color)" color="var(--bookmark-color)" />
                    </div>
                    <div className="bookmark-details">
                      <h4>Saved {b.bookmarkable_type} #{b.bookmarkable_id}</h4>
                      <span className="bookmark-date">Bookmarked on {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bookmarks-empty">
                <Bookmark size={48} />
                <p>No bookmarked links currently in this directory.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Collection Modal */}
      {showCreateCollectionModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCollectionModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Bookmark Collection</h3>
              <button onClick={() => setShowCreateCollectionModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="modal-form-scroll">
              <div className="form-group">
                <label>Collection Name</label>
                <input 
                  type="text" 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)} 
                  placeholder="e.g. Design Inspiration"
                  required 
                />
              </div>
              <button type="submit" className="glow-btn modal-submit-btn">Create Collection</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
