import { Identity } from '@dfinity/agent';
import React from 'react';

interface Props {
  Identity:Identity | null,
  setIdentity:(id:Identity) =>void
}


export const Support = ({}:Props) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Support</h1>
      {/* Add your support content here */}
    </div>
  );
}; 