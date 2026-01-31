import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';

const ChatPage = () => {
    const { swapId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body py-10">
            <div className="max-w-5xl mx-auto h-[85vh] px-6">
                <ChatInterface
                    swapId={swapId}
                    onBack={() => navigate('/dashboard?tab=swaps')}
                />
            </div>
        </div>
    );
};

export default ChatPage;
