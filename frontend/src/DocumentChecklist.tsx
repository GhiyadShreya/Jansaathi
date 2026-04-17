import React from 'react';
import { UserProfile } from '../types';
import { CheckCircle, XCircle, Link, UploadCloud } from 'lucide-react';

interface DocumentChecklistProps {
  requiredDocs: string[];
  userDocs: string[];
}

/**
 * Identifies which required documents are missing from the user's documents.
 * A user document is considered a match if its name (case-insensitive) contains
 * the core name of the required document (e.g., "Aadhaar" matches "Aadhaar Card").
 */
function findMissingDocs(requiredDocs: string[], userDocs: string[]): string[] {
  const missing: string[] = [];
  const userDocNames = userDocs.map(d => d.toLowerCase());

  for (const reqDoc of requiredDocs) {
    const coreName = reqDoc.split(' ')[0].toLowerCase(); // e.g., "aadhaar" from "Aadhaar Card"
    const isFound = userDocNames.some(userDoc => userDoc.includes(coreName));
    if (!isFound) {
      missing.push(reqDoc);
    }
  }
  return missing;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ requiredDocs, userDocs }) => {
  const missingDocs = findMissingDocs(requiredDocs, userDocs);

  const hasDoc = (docName: string) => !missingDocs.includes(docName);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Documents Required</p>
        <div className="mt-2 space-y-2">
          {requiredDocs.map(doc => (
            <div key={doc} className="flex items-center gap-2">
              {hasDoc(doc) ? (
                <CheckCircle size={16} className="text-green-500 shrink-0" />
              ) : (
                <XCircle size={16} className="text-red-400 shrink-0" />
              )}
              <span className={`text-sm font-medium ${hasDoc(doc) ? 'text-gray-700' : 'text-red-600'}`}>
                {doc}
              </span>
              {hasDoc(doc) && <span className="text-xs text-green-600 font-bold">(Uploaded)</span>}
            </div>
          ))}
        </div>
      </div>

      {missingDocs.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
          <p className="text-xs font-bold text-amber-800">
            You are missing {missingDocs.length} document(s). You can upload them in your profile or connect DigiLocker.
          </p>
          <div className="flex gap-2">
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
              <UploadCloud size={14} />
              Upload Manually
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all text-white"
              style={{ background: '#3B82F6' }}>
              <Link size={14} />
              Connect DigiLocker
            </button>
          </div>
        </div>
      )}
    </div>
  );
};