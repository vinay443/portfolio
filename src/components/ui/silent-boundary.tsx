"use client";

import { Component, type ReactNode } from "react";

/**
 * Renders nothing if its children throw. For decorative components whose failure
 * should leave the page exactly as it would be without them.
 */
export class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
