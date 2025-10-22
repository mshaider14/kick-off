import { Card, Text, Box } from "@shopify/polaris";
import PropTypes from "prop-types";

export function AnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <Text as="p" tone="subdued">No data available for the selected date range</Text>
        </Box>
      </Card>
    );
  }

  // Find max value for scaling
  const maxViews = Math.max(...data.map(d => d.views));
  const chartHeight = 200;
  const barWidth = Math.min(50, 600 / data.length);

  return (
    <Card>
      <Box padding="400">
        <Text as="h3" variant="headingMd">Views Over Time</Text>
        <Box paddingBlockStart="400">
          <div style={{ paddingBlockEnd: '4px', height: '16px' }}>
            <Text as="span" variant="bodySm" tone="subdued">{maxViews.toLocaleString()} views</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            height: `${chartHeight}px`,
            gap: '4px',
            borderBottom: '1px solid #e1e3e5',
            paddingBottom: '8px'
          }}>
            {data.map((item, index) => {
              const barHeight = maxViews > 0 ? (item.views / maxViews) * (chartHeight - 40) : 0;
              return (
                <div key={index} style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1',
                  minWidth: `${barWidth}px`
                }}>
                  <div style={{
                    width: '100%',
                    height: `${barHeight}px`,
                    backgroundColor: '#005bd3',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '4px'
                  }}>
                    {barHeight > 20 && (
                      <Text as="span" variant="bodySm" tone="text-inverse">
                        {item.views}
                      </Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ 
            display: 'flex', 
            marginTop: '8px',
            gap: '4px'
          }}>
            {data.map((item, index) => (
              <div key={index} style={{ 
                flex: '1',
                minWidth: `${barWidth}px`,
                textAlign: 'center'
              }}>
                <Text as="span" variant="bodySm" tone="subdued">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </div>
            ))}
          </div>
        </Box>
      </Box>
    </Card>
  );
}

AnalyticsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
    })
  ),
};
