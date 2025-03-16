import {createConfig, http} from "wagmi"

export const coreDaoTestnet = {
  id: 1115,
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

export const config = createConfig({
    chains: [coreDaoTestnet],
    transports: {
        [coreDaoTestnet.id]: http()
    }

})