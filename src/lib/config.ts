import { defineChain } from "viem";
import {createConfig, http} from "wagmi"
// import {mainnet, coreDao, sepolia} from "wagmi/chains"
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = 'df1b443fd552341b785dd2ba56fbae1e';

export const coreDaoTestnet =/*#__PURE__*/ defineChain({
  id: 1114,
  name: 'Core Blockchain Testnet2',
  nativeCurrency: {
    name: 'tCORE2',
    symbol: 'tCORE2',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test2.btcs.network'],
    },
    // public: {
    //   http: ['https://rpc.test2.btcs.network'],
    // },
  },
  blockExplorers: {
    default: {
      name: 'CoreDAO Testnet Explorer',
      url: 'https://scan.test2.btcs.network',
    },
  },
  // contracts: {
  //   multicall3: {
  //     address: "0xcA11bde05977b3631167028862bE2a173976CA11",
  //     blockCreated: 1847951,

  //   }
  // },
  testnet: true,
});

export const coreDaoTestnet1  =defineChain( {
  id: 1115,
  name: 'CoreDAO Testnet',
  nativeCurrency: {
    name: 'tCORE',
    symbol: 'tCORE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.btcs.network'],
    },
    public: {
      http: ['https://rpc.test.btcs.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CoreDAO Testnet Explorer',
      url: 'https://scan.test2.btcs.network',
    },
  },
  testnet: true,
});

export const config = createConfig({
    chains: [coreDaoTestnet],
    connectors: [
      injected(),
      walletConnect({ projectId }),
      metaMask(),
      safe(),
    ],
    transports: {
        [coreDaoTestnet.id]: http()
    }

})
