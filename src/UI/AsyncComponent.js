import React, { Component } from "react";

export default function asyncComponent(importComponent) {
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);

      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        importComponent().then(c => {
          this.setState({ component: c.default });
        });
      }

      this.state = {
        component: null
      };
    }

    async componentDidMount() {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      } else {
        const { default: component } = await importComponent();
        this.setState({
          component: component
        });
      }
    }

    render() {
      const C = this.state.component;

      return C ? <C {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}
