import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddItemPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Dress');
    const [files, setFiles] = useState([]); // Changed to array for multiple files
    const [previewUrls, setPreviewUrls] = useState([]); // Changed to array for multiple previews
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);


    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));

        if (files.length + imageFiles.length > 5) {
            alert('Maximum 5 images allowed!');
            return;
        }

        const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
        setFiles(prev => [...prev, ...imageFiles]);
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) return alert('Please upload at least one image!');

        setLoading(true);

        try {
            // 1. Upload all images to Firebase Storage
            const uploadPromises = files.map(async (file) => {
                const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                return await getDownloadURL(snapshot.ref);
            });

            const downloadURLs = await Promise.all(uploadPromises);

            // 2. Save Item to Backend
            const response = await fetch('http://localhost:5000/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    images: downloadURLs, // Now sending all image URLs
                    price: Number(price),
                    ownerId: user._id
                }),
            });

            if (response.ok) {
                alert('Item listed successfully!');
                navigate('/dashboard');
            } else {
                alert('Failed to list item');
            }
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto animate-slide-up">
                <div className="text-center mb-12">
                    <h1 className="font-display text-5xl font-black text-white mb-4 uppercase tracking-tighter">List Your Piece</h1>
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Add something fabulous to the vault</p>
                </div>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-12">
                    {/* Left Side: Upload */}
                    <div className="space-y-8">
                        {/* Image Previews Grid */}
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="glass rounded-2xl p-2 border-white/5 relative group">
                                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-900">
                                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                        <div className="absolute bottom-4 left-4 glass px-2 py-1 rounded-full border-white/10">
                                            <span className="font-black text-[8px] tracking-wider">{index + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Zone */}
                        {previewUrls.length < 5 && (
                            <div className="glass rounded-[3rem] p-4 border-white/5 shadow-2xl overflow-hidden group">
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative aspect-square rounded-[2.5rem] bg-slate-900 border-4 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-cosmos/50 hover:bg-cosmos/5 transition-all overflow-hidden"
                                >
                                    <div className="text-center p-8">
                                        <div className="text-[12px] font-black text-slate-700 uppercase tracking-widest mb-6 border-2 border-white/5 px-6 py-2 rounded-full">
                                            {previewUrls.length > 0 ? `${previewUrls.length}/5` : 'UPLOAD LOGIC'}
                                        </div>
                                        <p className="text-slate-300 font-black text-xl mb-2 uppercase tracking-tighter">
                                            {previewUrls.length > 0 ? 'Add More' : 'Transfer Media'}
                                        </p>
                                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                            DRAG ASSET OR BROWSE
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Side: Details */}
                    <div className="space-y-8">
                        <div className="glass rounded-[3rem] p-10 border-white/10 space-y-8">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Item Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-700 focus:border-cherry/50 outline-none transition-all font-bold text-lg"
                                    placeholder="e.g. Vintage Silk Dress"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-700 focus:border-cherry/50 outline-none transition-all font-medium h-32 resize-none"
                                    placeholder="Tell its story... size, condition, vibe."
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-cherry/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option className="bg-slate-900">Dress</option>
                                        <option className="bg-slate-900">Top</option>
                                        <option className="bg-slate-900">Skirt</option>
                                        <option className="bg-slate-900">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Fair Value (CR)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-700 focus:border-cherry/50 outline-none transition-all font-bold text-center"
                                        placeholder="50"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full btn-primary py-6 rounded-2xl font-black text-xl text-white shadow-2xl shadow-cherry/20 disabled:grayscale transition-all hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                        Curating...
                                    </span>
                                ) : 'Release to Marketplace'}
                            </button>
                        </div>

                        <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center gap-6">
                            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">SAFE</div>
                            <div>
                                <h4 className="font-black text-white text-sm uppercase mb-1">Secure Listing</h4>
                                <p className="text-xs text-slate-500 font-medium">All items are vetted for fair value and authenticated by the community.</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemPage;
