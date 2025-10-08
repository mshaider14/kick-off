import { Component } from "react";
import PropTypes from "prop-types";
import { Banner, Page, Layout, Card, Text } from "@shopify/polaris";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Page title="Something went wrong">
          <Layout>
            <Layout.Section>
              <Banner
                title="An error occurred"
                tone="critical"
                onDismiss={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                <p>
                  We encountered an unexpected error. Please try refreshing the page.
                  If the problem persists, contact support.
                </p>
              </Banner>
              {this.state.error && (
                <Card sectioned>
                  <Text variant="headingMd" as="h2">
                    Error Details
                  </Text>
                  <div style={{ marginTop: "1rem" }}>
                    <Text as="p" tone="critical">
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <details style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
                        <summary>Stack trace</summary>
                        {this.state.errorInfo.componentStack}
                      </details>
                    )}
                  </div>
                </Card>
              )}
            </Layout.Section>
          </Layout>
        </Page>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};
