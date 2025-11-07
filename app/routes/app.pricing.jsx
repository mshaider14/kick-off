import {
  Page,
  Layout,
  Text,
  Banner,
  LegacyStack,
  Grid,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { authenticate } from "../shopify.server";
import { 
  UsageMeter, 
  CurrentPlanCard, 
  PricingCard, 
  BillingHistoryCard 
} from "../components/billing";
import { LoadingState } from "../components";
import { PLANS } from "../utils/plans";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check for URL params (success/error messages)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");

    if (errorParam) {
      if (errorParam === "charge_declined") {
        setError("The billing charge was declined. Please try again.");
      } else if (errorParam === "missing_charge_id") {
        setError("Invalid billing confirmation. Please try again.");
      } else {
        setError("An error occurred during billing. Please try again.");
      }
    }

    if (successParam === "true") {
      setSuccess("Your plan has been successfully upgraded!");
    }
  }, [searchParams]);

  // Fetch plan status and billing history
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [statusRes, historyRes] = await Promise.all([
        fetch("/api/billing/status"),
        fetch("/api/billing/history")
      ]);

      const statusData = await statusRes.json();
      const historyData = await historyRes.json();

      if (statusData.success) {
        setPlanData(statusData);
      }

      if (historyData.success) {
        setHistory(historyData.history || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlanSelect = async (planKey) => {
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("planName", planKey);

      const response = await fetch("/api/billing/create", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create billing charge");
      }

      if (data.confirmationUrl) {
        // Redirect to Shopify billing confirmation
        window.open(data.confirmationUrl, "_top");
      } else if (data.plan === 'free') {
        // Downgraded to free - refresh data
        setSuccess("Successfully downgraded to Free plan");
        await fetchData();
      }
    } catch (err) {
      console.error("Plan selection error:", err);
      setError(err.message || "Failed to upgrade plan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!planData) {
    return (
      <Page>
        <Banner tone="critical">
          Failed to load billing information. Please refresh the page.
        </Banner>
      </Page>
    );
  }

  const { merchant, plan, usage } = planData;
  const currentPlanKey = merchant.planName;

  return (
    <Page
      title="Pricing & Plans"
      subtitle="Choose the plan that fits your business needs"
    >
      <TitleBar title="Pricing & Plans" />
      
      <Layout>
        {error && (
          <Layout.Section>
            <Banner
              tone="critical"
              onDismiss={() => setError(null)}
            >
              {error}
            </Banner>
          </Layout.Section>
        )}

        {success && (
          <Layout.Section>
            <Banner
              tone="success"
              onDismiss={() => setSuccess(null)}
            >
              {success}
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section variant="oneThird">
          <LegacyStack vertical spacing="loose">
            <CurrentPlanCard
              merchant={merchant}
              plan={plan}
              onUpgrade={() => {
                document.getElementById('pricing-plans')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            />
            
            <UsageMeter usage={usage} />
          </LegacyStack>
        </Layout.Section>

        <Layout.Section>
          <LegacyStack vertical spacing="loose">
            <div id="pricing-plans">
              <div style={{ marginBottom: "24px" }}>
                <Text variant="headingLg" as="h2">
                  Available Plans
                </Text>
                <Text variant="bodyMd" as="p" color="subdued">
                  All plans include full access to features. Upgrade anytime.
                </Text>
              </div>

              <Grid>
                {Object.entries(PLANS).map(([key, planInfo]) => (
                  <Grid.Cell key={key} columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                    <PricingCard
                      planKey={key}
                      planName={planInfo.name}
                      price={planInfo.price}
                      viewLimit={planInfo.viewLimit}
                      features={planInfo.features}
                      isCurrentPlan={currentPlanKey === key}
                      isPopular={key === 'pro'}
                      onSelect={handlePlanSelect}
                      loading={submitting}
                    />
                  </Grid.Cell>
                ))}
              </Grid>
            </div>

            {history.length > 0 && (
              <div style={{ marginTop: "32px" }}>
                <BillingHistoryCard history={history} />
              </div>
            )}
          </LegacyStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
