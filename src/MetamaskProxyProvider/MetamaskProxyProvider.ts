import {
  CrossWindowProvider,
  ICrossWindowWalletAccount
} from '@multiversx/sdk-web-wallet-cross-window-provider/out/CrossWindowProvider';
import { ErrProviderNotInitialized } from '@multiversx/sdk-web-wallet-cross-window-provider/out/errors';
import { MetamaskProxyManager } from '../MetamaskProxyManager/MetamaskProxyManager';

export class MetamaskProxyProvider extends CrossWindowProvider {
  public constructor() {
    super();
    this.windowManager = new MetamaskProxyManager();
  }

  public static getInstance(): MetamaskProxyProvider {
    if (!MetamaskProxyProvider._instance) {
      MetamaskProxyProvider._instance = new MetamaskProxyProvider();
      return MetamaskProxyProvider._instance;
    }

    return MetamaskProxyProvider._instance;
  }

  public override async init(): Promise<boolean> {
    const initialized = await super.init();
    await this.windowManager.setWalletWindow();

    return initialized;
  }

  public override async login(
    options: {
      token?: string;
    } = {}
  ): Promise<ICrossWindowWalletAccount> {
    const account = await super.login(options);
    await this.windowManager.setWalletWindow();

    return account;
  }

  public override async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    try {
      this.ensureConnected();
      await this.windowManager.closeConnection();
    } catch (e) {
      console.error(e);
    }

    this.initialized = false;
    this.disconnect();

    return true;
  }

  public override async openPopupConsent(): Promise<boolean> {
    return true;
  }
}
