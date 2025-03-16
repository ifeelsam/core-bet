
import { cn } from '@/lib/utils';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 px-6 border-t border-white/5 bg-tcore-darker/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold font-montserrat mb-2">
              <span className="text-white">T</span>
              <span className="text-tcore-blue">Core</span>
              <span className="text-white">Bet</span>
            </div>
            <p className="text-sm text-gray-400">
              © {currentYear} TCoreBet. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-8">
            <div>
              <h4 className="font-medium mb-3 text-sm uppercase tracking-wider text-gray-400">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-tcore-blue transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-tcore-blue transition-colors">
                    Games
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-tcore-blue transition-colors">
                    Rewards
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-sm uppercase tracking-wider text-gray-400">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-tcore-blue transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-tcore-blue transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-tcore-blue transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
