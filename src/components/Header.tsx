
import { useState, useEffect } from 'react';
import WalletAdapter from './WalletAdapter';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 transition-all duration-300",
        "bg-tcore-darker/50 backdrop-blur-md border-b border-white/5",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
        <Link to="/">
          <div className="text-2xl font-extrabold font-montserrat tracking-tight">
            <span className="text-tcore-blue">Core</span>
            <span className="text-white">Bet</span>
          </div>
          </Link>
        </div>
        
        <WalletAdapter />
      </div>
    </header>
  );
};

export default Header;
