import { Provider } from '../manager'
import Connector, { ErrorCodeMixin, ConnectorArguments } from './connector'

interface FortmaticConnectorArguments extends ConnectorArguments {
  readonly api: any
  readonly apiKey: string
  readonly testNetwork?: string
  readonly logoutOnDeactivation?: boolean
}

const FortmaticConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED']
export default class FortmaticConnector extends ErrorCodeMixin(Connector, FortmaticConnectorErrorCodes) {
  public readonly fortmatic: any
  private logoutOnDeactivation: boolean

  public constructor(kwargs: FortmaticConnectorArguments) {
    const { api: Fortmatic, apiKey, testNetwork, logoutOnDeactivation = false, ...rest } = kwargs
    super(rest)

    this.fortmatic = new Fortmatic(apiKey, testNetwork)
    this.logoutOnDeactivation = logoutOnDeactivation
  }

  public async onActivation(): Promise<void> {
    await this.fortmatic.user.login().catch((error: any): void => {
      const deniedAccessError: Error = Error(`Access Denied: ${error.toString()}.`)
      deniedAccessError.code = FortmaticConnector.errorCodes.ETHEREUM_ACCESS_DENIED
      throw deniedAccessError
    })
  }

  public async getProvider(): Promise<Provider> {
    return this.fortmatic.getProvider()
  }

  public async getAccount(provider: Provider): Promise<string | null> {
    return provider.account
  }

  public onDeactivation(): void {
    if (this.logoutOnDeactivation) {
      this.fortmatic.user.logout()
    }
  }
}
