import type { SignableMessage } from '@multiversx/sdk-core/out';
import type { Transaction } from '@multiversx/sdk-core/out/transaction';
import {
  CrossWindowProviderResponseEnums,
  ReplyWithPostMessagePayloadType
} from '@multiversx/sdk-dapp-utils/out';
import {
  CrossWindowProvider,
  ICrossWindowWalletAccount
} from '@multiversx/sdk-web-wallet-cross-window-provider/out/CrossWindowProvider';
import { ErrProviderNotInitialized } from '@multiversx/sdk-web-wallet-cross-window-provider/out/errors';
import { MetamaskProxyManager } from '../MetamaskProxyManager/MetamaskProxyManager';

export type MetamaskProxyProviderEventDataType<
  T extends CrossWindowProviderResponseEnums
> = {
  type: T;
  payload: ReplyWithPostMessagePayloadType<T>;
};

export class MetamaskProxyProvider extends CrossWindowProvider {
  public constructor() {
    super();
    this.windowManager = new MetamaskProxyManager({
      onDisconnect: this.logout.bind(this)
    });
  }

  public static getInstance(): MetamaskProxyProvider {
    if (!MetamaskProxyProvider._instance) {
      MetamaskProxyProvider._instance = new MetamaskProxyProvider();
      return <MetamaskProxyProvider>MetamaskProxyProvider._instance;
    }

    return <MetamaskProxyProvider>MetamaskProxyProvider._instance;
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
    await this.windowManager.setWalletWindow();
    return await super.login(options);
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

  public override async signTransaction(
    transaction: Transaction
  ): Promise<Transaction> {
    await this.windowManager.setWalletWindow();
    return super.signTransaction(transaction);
  }

  public override async signTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    await this.windowManager.setWalletWindow();
    return super.signTransactions(transactions);
  }

  public override async guardTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    await this.windowManager.setWalletWindow();
    return super.guardTransactions(transactions);
  }

  public override async signMessage(
    message: SignableMessage
  ): Promise<SignableMessage> {
    await this.windowManager.setWalletWindow();
    return super.signMessage(message);
  }

  public override async openPopupConsent(): Promise<boolean> {
    return true;
  }
}