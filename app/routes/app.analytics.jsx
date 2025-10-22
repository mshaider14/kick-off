import { 
  Page, 
  Layout, 
  Card, 
  Text, 
  BlockStack,
  InlineGrid,
  Button,
  DatePicker,
  Popover,
  DataTable,
  Badge,
  Box
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CalendarIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useEffect } from "react";
import { AnalyticsChart } from "../components/analytics/AnalyticsChart";

function json(data, init) {
  return Response.json(data, init);
}

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function AnalyticsPage() {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleDatePicker = useCallback(() => {
    setDatePickerOpen(prev => !prev);
  }, []);

  const handleMonthChange = useCallback((month, year) => {
    setMonth(month);
    setYear(year);
  }, []);

  const formatDateRange = () => {
    const start = selectedDates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = selectedDates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startDate = selectedDates.start.toISOString();
      const endDate = selectedDates.end.toISOString();
      const response = await fetch(`/api/analytics/data?startDate=${startDate}&endDate=${endDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDates]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const exportToCSV = () => {
    if (!analyticsData || !analyticsData.barMetrics) return;

    const headers = ['Bar Name', 'Type', 'Status', 'Views', 'Clicks', 'CTR (%)'];
    const rows = analyticsData.barMetrics.map(bar => [
      bar.name,
      bar.type,
      bar.isActive ? 'Active' : 'Inactive',
      bar.views,
      bar.clicks,
      bar.ctr
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${formatDateRange()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const datePickerActivator = (
    <Button onClick={toggleDatePicker} icon={CalendarIcon}>
      {formatDateRange()}
    </Button>
  );

  if (loading && !analyticsData) {
    return (
      <Page>
        <TitleBar title="Analytics" />
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p">Loading analytics data...</Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <TitleBar title="Analytics" />
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p" tone="critical">Error: {error}</Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const overview = analyticsData?.overview || { totalViews: 0, totalClicks: 0, ctr: 0, conversionRate: 0 };
  const barMetrics = analyticsData?.barMetrics || [];
  const chartData = analyticsData?.chartData || [];

  const tableRows = barMetrics.map(bar => [
    bar.name,
    bar.type,
    bar.views,
    bar.clicks,
    `${bar.ctr}%`,
    bar.isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>
  ]);

  return (
    <Page
      title="Analytics"
      primaryAction={{
        content: 'Export CSV',
        onAction: exportToCSV,
        disabled: barMetrics.length === 0
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <Box padding="400">
                <Popover
                  active={datePickerOpen}
                  activator={datePickerActivator}
                  onClose={toggleDatePicker}
                  autofocusTarget="none"
                >
                  <Card>
                    <DatePicker
                      month={month}
                      year={year}
                      onChange={setSelectedDates}
                      onMonthChange={handleMonthChange}
                      selected={selectedDates}
                      allowRange
                    />
                  </Card>
                </Popover>
              </Box>
            </Card>

            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Total Views</Text>
                    <Text as="p" variant="heading2xl">{overview.totalViews.toLocaleString()}</Text>
                  </BlockStack>
                </Box>
              </Card>
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Total Clicks</Text>
                    <Text as="p" variant="heading2xl">{overview.totalClicks.toLocaleString()}</Text>
                  </BlockStack>
                </Box>
              </Card>
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Click-through Rate</Text>
                    <Text as="p" variant="heading2xl">{overview.ctr}%</Text>
                  </BlockStack>
                </Box>
              </Card>
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">Conversion Rate</Text>
                    <Text as="p" variant="heading2xl">{overview.conversionRate}%</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Coming soon</Text>
                  </BlockStack>
                </Box>
              </Card>
            </InlineGrid>

            <AnalyticsChart data={chartData} />

            <Card>
              <Box padding="400">
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">Bar Performance</Text>
                  {barMetrics.length > 0 ? (
                    <DataTable
                      columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'text']}
                      headings={['Bar Name', 'Type', 'Views', 'Clicks', 'CTR', 'Status']}
                      rows={tableRows}
                    />
                  ) : (
                    <Text as="p" tone="subdued">No bars found for the selected date range</Text>
                  )}
                </BlockStack>
              </Box>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
