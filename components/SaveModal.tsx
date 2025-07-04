import React from 'react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (overwrite: boolean) => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" 
      onClick={onClose}
      style={{ animationDuration: '150ms' }}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-white">Save Session Database</h2>
        <p className="text-gray-400 mb-6">Choose how you want to save your file. Saving as a new file is recommended to avoid accidentally overwriting a previous session.</p>
        <div className="space-y-4">
          <button
            onClick={() => { onSave(true); onClose(); }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-base"
          >
            Overwrite AdvancedMint.json
          </button>
          <button
            onClick={() => { onSave(false); onClose(); }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-base"
          >
            Save as New (Timestamped)
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 text-gray-400 hover:text-white transition-colors py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SaveModal;