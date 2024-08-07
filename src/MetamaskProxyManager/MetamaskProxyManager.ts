import { responseTypeMap } from '@multiversx/sdk-dapp-utils/out/constants/crossWindowProviderConstants';
import { CrossWindowProviderRequestEnums } from '@multiversx/sdk-dapp-utils/out/enums/crossWindowProviderEnums';
import {
  PostMessageParamsType,
  PostMessageReturnType
} from '@multiversx/sdk-dapp-utils/out/types/crossWindowProviderTypes';
import { WindowManager } from '@multiversx/sdk-web-wallet-cross-window-provider/out/WindowManager';
import { safeDocument } from '../constants';
import { MetamaskProxyProviderContentWindow } from './MetamaskProxyProviderContentWindow';

export class MetamaskProxyManager extends WindowManager {
  private metamaskProxyWalletComponent: MetamaskProxyProviderContentWindow | null = null;
  private readonly iframeId = 'metamask-proxy-wallet';

  public get metamaskProxyWallet() {
    return this.metamaskProxyWalletComponent;
  }

  public override async postMessage<T extends CrossWindowProviderRequestEnums>({
    type,
    payload
  }: PostMessageParamsType<T>): Promise<PostMessageReturnType<T>> {
    await this.handshake(type);

    this.walletWindow?.postMessage(
      {
        type,
        payload
      },
      this.walletUrl
    );

    const data = await this.listenOnce(responseTypeMap[type]);
    return data;
  }

  public override async closeConnection(): Promise<boolean> {
    const result = await super.closeConnection();
    this.metamaskProxyWalletComponent?.remove();
    this.walletWindow = null;
    return result;
  }

  public override isWalletOpened(): boolean {
    return Boolean(this.walletWindow);
  }

  public override closeWalletWindow(): void {
    if (!this.walletWindow) {
      return;
    }

    this.metamaskProxyWallet?.setWalletVisible(false);
  }

  public override async setWalletWindow(): Promise<void> {
    if (this.walletWindow) {
      this.metamaskProxyWallet?.setWalletVisible(true);
      return;
    }

    const anchor = safeDocument.getElementById?.('root');
    this.metamaskProxyWalletComponent = new MetamaskProxyProviderContentWindow({
      id: this.iframeId,
      anchor,
      url: this.walletUrl
    });
    this.metamaskProxyWalletComponent.walletAddress = this.walletUrl;

    const iframe = await new Promise(
      (resolve: (value?: HTMLIFrameElement) => void) => {
        this.metamaskProxyWalletComponent?.addEventListener(
          'metamaskProxyWindowReady',
          (event: Event & { detail?: HTMLIFrameElement }) => {
            resolve(event.detail);
          }
        );
      }
    );

    if (!iframe) {
      throw new Error('Cannot initialize iframe window');
    }

    this.walletWindow = iframe.contentWindow;
    this.setWalletVisible(true);
  }

  public setWalletVisible(visible: boolean): void {
    this.metamaskProxyWalletComponent?.setWalletVisible(visible);
  }
}
