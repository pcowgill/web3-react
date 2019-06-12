import { Web3ProviderEngine, RPCSubprovider, TrezorSubprovider } from '@0x/subproviders'

import { Provider } from '../manager'
import Connector from './connector'

interface SupportedNetworkURLs {
  readonly [propName: string]: string
}

interface TrezorConnectorArguments {
  readonly api: any
  readonly supportedNetworkURLs: SupportedNetworkURLs
  readonly defaultNetwork: number
  readonly manifestEmail: string
  readonly manifestAppUrl: string
}

export default class TrezorConnector extends Connector {
  private TrezorConnect: any
  private supportedNetworkURLs: SupportedNetworkURLs
  private defaultNetwork: number
  private readonly manifestEmail: string
  private readonly manifestAppUrl: string
  private engine: any

  public constructor(kwargs: TrezorConnectorArguments) {
    const { api: TrezorConnect, supportedNetworkURLs, defaultNetwork, manifestEmail, manifestAppUrl } = kwargs
    const supportedNetworks = Object.keys(supportedNetworkURLs).map((supportedNetworkURL): number =>
      Number(supportedNetworkURL)
    )
    super({ supportedNetworks })

    this.TrezorConnect = TrezorConnect
    this.supportedNetworkURLs = supportedNetworkURLs
    this.defaultNetwork = defaultNetwork
    this.manifestEmail = manifestEmail
    this.manifestAppUrl = manifestAppUrl
  }

  public async onActivation(): Promise<void> {
    this.TrezorConnect.manifest({
      appUrl: this.manifestAppUrl,
      email: this.manifestEmail
    })
  }

  public async getProvider(networkId?: number): Promise<Provider> {
    // we have to validate here because networkId might not be a key of supportedNetworkURLs
    const networkIdToUse = networkId || this.defaultNetwork
    super._validateNetworkId(networkIdToUse)

    const trezorSubprovider = new TrezorSubprovider({
      accountFetchingConfigs: { numAddressesToReturn: 1 },
      networkId: networkIdToUse,
      trezorConnectClientApi: this.TrezorConnect
    })

    const engine = new Web3ProviderEngine()
    this.engine = engine
    engine.addProvider(trezorSubprovider)
    engine.addProvider(new RPCSubprovider(this.supportedNetworkURLs[networkIdToUse]))
    engine.start()

    return engine
  }

  public onDeactivation(): void {
    if (this.engine) {
      this.engine.stop()
    }
  }

  public changeNetwork(networkId: number): void {
    // proactively handle wrong network errors
    try {
      super._validateNetworkId(networkId)

      super._web3ReactUpdateHandler({ updateNetworkId: true, networkId })
    } catch (error) {
      super._web3ReactErrorHandler(error)
    }
  }
}
