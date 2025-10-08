import { Card, SkeletonPage, Layout, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";
import PropTypes from "prop-types";

export default function LoadingState({ pageTitle = "Loading..." }) {
  return (
    <SkeletonPage primaryAction title={pageTitle}>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <SkeletonBodyText />
          </Card>
          <Card sectioned>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card sectioned>
            <SkeletonBodyText lines={3} />
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

LoadingState.propTypes = {
  pageTitle: PropTypes.string,
};
