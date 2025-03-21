import { Identity } from '@dfinity/agent';
import React from 'react';


interface Props {
  Identity:Identity | null,
  setIdentity:(id:Identity) =>void
}
export const Dashboard = ({}:Props) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}; 