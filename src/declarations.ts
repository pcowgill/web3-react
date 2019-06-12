declare interface Error {
  code?: number | string
}

declare interface Window {
  ethereum?: Ethereum
  web3?: any
}

interface Ethereum {
  autoRefreshOnNetworkChange?: boolean
  isMetaMask?: boolean
  enable: () => Promise<void>
  on?: (eventName: string, listener: Function) => void
  removeListener?: (eventName: string, listener: Function) => void
}
