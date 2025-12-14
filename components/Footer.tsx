import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800 text-gray-400 py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
          <Link to="/" className="hover:text-brand-red">Home</Link>
          <Link to="/category/Bollywood" className="hover:text-brand-red">Movies</Link>
          <Link to="/request" className="hover:text-brand-red">Request</Link>
          <Link to="/dmca" className="hover:text-brand-red">DMCA</Link>
          <Link to="/contact" className="hover:text-brand-red">Contact Us</Link>
        </div>
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Cinezuva. All rights reserved. <br/>
          Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.
        </p>
      </div>
    </footer>
  );
};