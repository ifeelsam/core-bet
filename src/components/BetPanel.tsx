
import { useState } from 'react';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { ArrowRight, SignalHigh, SignalMedium, SignalLow } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const BetPanel = () => {
  const [betAmount, setBetAmount] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { wallet } = useWallet();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input with decimal point
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };
  
  const handleSubmit = () => {
    if (!wallet.isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    
    if (parseFloat(betAmount) > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Bet placed successfully!', {
        description: `You've placed a ${difficulty} difficulty bet of ${betAmount} TCORE`
      });
      setBetAmount('');
      setIsSubmitting(false);
    }, 1500);
  };
  
  // Calculate potential return (based on difficulty level)
  const multipliers = {
    easy: 1.5,
    medium: 2,
    hard: 3
  };
  
  const selectedMultiplier = multipliers[difficulty as keyof typeof multipliers] || 2;
  const potentialReturn = betAmount ? parseFloat(betAmount) * selectedMultiplier : 0;

  return (
    <div className="glass-card rounded-xl p-6 md:p-8 w-full animate-slide-up h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6 font-montserrat tracking-tight text-center">
        Place Your Bet
      </h2>
      
      <div className="space-y-6">
        {/* Difficulty selection */}
        <div>
          <label 
            htmlFor="difficulty" 
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Difficulty Level
          </label>
          <Select 
            value={difficulty} 
            onValueChange={setDifficulty}
          >
            <SelectTrigger id="difficulty" className="w-full bg-black/30 border-white/10">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy" className="flex items-center gap-2">
                <SignalLow className="h-4 w-4 text-green-400" />
                <span>Easy (1.5x)</span>
              </SelectItem>
              <SelectItem value="medium" className="flex items-center gap-2">
                <SignalMedium className="h-4 w-4 text-yellow-400" />
                <span>Medium (2x)</span>
              </SelectItem>
              <SelectItem value="hard" className="flex items-center gap-2">
                <SignalHigh className="h-4 w-4 text-red-400" />
                <span>Hard (3x)</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label 
            htmlFor="betAmount" 
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Bet Amount (TCORE)
          </label>
          <div className="relative">
            <Input
              id="betAmount"
              type="text"
              value={betAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="input-primary w-full neon-border"
              disabled={!wallet.isConnected || isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="text-tcore-blue font-medium">TCORE</span>
            </div>
          </div>
        </div>
        
        {betAmount && parseFloat(betAmount) > 0 && (
          <div className="flex justify-between items-center px-4 py-3 bg-tcore-blue/5 rounded-lg border border-tcore-blue/20">
            <span className="text-sm text-gray-300">Potential Return:</span>
            <span className="font-medium text-tcore-blue">
              {potentialReturn.toFixed(4)} TCORE
            </span>
          </div>
        )}
        
        <Button
          onClick={handleSubmit}
          disabled={!wallet.isConnected || isSubmitting || !betAmount || parseFloat(betAmount) <= 0}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-tcore-dark-text"></div>
          ) : (
            <>
              Place Bet
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
        
        {!wallet.isConnected && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Please connect your wallet to place a bet
          </p>
        )}
      </div>
    </div>
  );
};

export default BetPanel;
