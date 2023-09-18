# Login

This document present the login component integration requirements. The component act as a standalone component based on clarity design UI elements. It also provides a pluggable strategy login component that allows it to easily be integrated into any project.

## Usage

To use the login component, developpers must include it module into their application root module as follow:

```ts
import { LoginModule } from "./path/to/login/package";
import { useLocalStrategy } from "./path/to/login/package";
import { HttpClient } from "@angular/common/http";
import { DOCUMENT_SESSION_STORAGE } from "@azlabsjs/ngx-storage";

@NgModule({
  // ...
  imports: [
    // ...
    LoginModule.forRoot({
      handleActions: (injector: Injector) => {
        return {
          success: () => {
            // TODO: Provide successful login implementation
          },
          failure: () => {
            // TODO: Provide failure login implementation
          },
          error: (err: unknown) => {
            // TODO: Provide login error handler
          },
          performingAction: () => {},
        };
      },

      // This section provide authentication drivers to be used by the application
      authConfigProvider: (injector: Injector) => {
        return {
          strategies: [
            {
              id: AuthStrategies.LOCAL,
              strategy: useLocalStrategy({
                client: injector.get(HttpClient),
                host: "http://127.0.0.1:3000",
                storage: injector.get(DOCUMENT_SESSION_STORAGE),
              }),
            },
          ],
          autoLogin: true,
        };
      },
    }),
  ],
})
export class AppModule {}
```
