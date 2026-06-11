import { Component, type ErrorInfo, type ReactNode } from "react";

export class ThreeSceneBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    resetKey?: string | number;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previousProps: {
    children: ReactNode;
    fallback: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    resetKey?: string | number;
  }) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
