import React from 'react';

/**
 * Generic error boundary. Renders `fallback` instead of crashing the tree
 * when a descendant throws during render/commit — the only React-native way
 * to contain a failure from a third-party component like <Spline />.
 */
export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
    if (this.props.onError) this.props.onError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}