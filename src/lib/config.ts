import {createConfig, http} from "wagmi"
import {mainnet, coreDao} from "wagmi/chains"
export const coreDaoTestnet = {
  id: 1114,
  name: 'CoreDAO Testnet',
  nativeCurrency: {
    name: 'CORE',
    symbol: 'CORE',
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
};
export const coreDaoTestnet1  = {
  id: 1115,
  name: 'CoreDAO Testnet',
  nativeCurrency: {
    name: 'CORE',
    symbol: 'CORE',
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
      url: 'https://scan.test.btcs.network',
    },
  },
  testnet: true,
};

export const config = createConfig({
    chains: [coreDaoTestnet, mainnet, coreDao],
    transports: {
        [mainnet.id]: http(),
        [coreDao.id] : http(),
        [coreDaoTestnet1.id]: http(),
        [coreDaoTestnet.id]: http()
    }

})