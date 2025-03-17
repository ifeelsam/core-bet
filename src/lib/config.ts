import { defineChain } from "viem";
import {createConfig, http} from "wagmi"
import {mainnet, coreDao} from "wagmi/chains"
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = 'df1b443fd552341b785dd2ba56fbae1e';

export const coreDaoTestnet = defineChain({
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
    public: {
      http: ['https://rpc.test2.btcs.network'],
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

// export const config = createConfig({
//     chains: [coreDaoTestnet, mainnet, coreDao],
//     transports: {
//         [mainnet.id]: http(),
//         [coreDao.id] : http(),
//         [coreDaoTestnet.id]: http(),
//         [coreDaoTestnet.id]: http()
//     }

// })