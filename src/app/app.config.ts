import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthConfig, OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';


export const authCodeFlowConfig: AuthConfig ={
  issuer: 'http://localhost:8080/realms/lenoox',
  tokenEndpoint: 'http://localhost:8080/realms/lenoox/protocol/openid-connect/token',
  redirectUri: window.location.origin,
  clientId: 'lenoox',
  responseType: 'code',
  scope: 'openid profile',
}

function initializeOAuth(oauthService: OAuthService): Promise<void> {
  return new Promise( (resole) => {
    oauthService.configure(authCodeFlowConfig);
    oauthService.setupAutomaticSilentRefresh();
    oauthService.loadDiscoveryDocumentAndLogin().then( () => resole() );
  })
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (oauthService: OAuthService) => {
        return () => {
          initializeOAuth(oauthService);
        }
      },
      multi: true,
      deps: [
        OAuthService
      ]
    }
  ]
};
