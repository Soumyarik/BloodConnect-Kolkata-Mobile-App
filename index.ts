import React from 'react';
import { registerRootComponent } from 'expo';

import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// Keep this entry file as .ts (not .tsx) by creating the wrapper with
// React.createElement instead of JSX.
registerRootComponent(() =>
  React.createElement(
    AppErrorBoundary,
    null,
    React.createElement(App)
  )
);
