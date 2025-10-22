import { Card, Text, Box, BlockStack, InlineGrid } from "@shopify/polaris";
import PropTypes from "prop-types";

// Professional Line Chart with gradient
export function ViewsLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <Text as="p" tone="subdued">No data available for the selected date range</Text>
        </Box>
      </Card>
    );
  }

  // If only 1 data point, show a simple bar chart instead
  if (data.length === 1) {
    return (
      <Card>
        <Box padding="400">
          <BlockStack gap="400">
            <Text as="h3" variant="headingMd">Views Trend</Text>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '40px 20px',
              backgroundColor: '#f6f6f7',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#005bd3',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Text as="span" variant="headingLg" tone="text-inverse">
                  {data[0].views}
                </Text>
              </div>
              <Text as="p" variant="bodyMd" tone="subdued">
                {new Date(data[0].date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                Select a longer date range to see trends
              </Text>
            </div>
          </BlockStack>
        </Box>
      </Card>
    );
  }

  const maxViews = Math.max(...data.map(d => d.views), 1); // Ensure at least 1
  const chartHeight = 240;
  const chartWidth = 100;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const innerWidth = chartWidth - padding.left - padding.right;

  // Calculate points with safety checks
  const points = data.map((item, index) => {
    const x = data.length > 1 
      ? padding.left + (index / (data.length - 1)) * innerWidth 
      : padding.left + innerWidth / 2;
    const y = padding.top + innerHeight - ((item.views || 0) / maxViews) * innerHeight;
    return { x, y, value: item.views || 0 };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text as="h3" variant="headingMd">Views Trend</Text>
            <div style={{ 
              padding: '4px 12px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '6px',
              border: '1px solid #bfdbfe'
            }}>
              <Text as="span" variant="bodySm" fontWeight="semibold" tone="info">
                {data.length} {data.length === 1 ? 'day' : 'days'}
              </Text>
            </div>
          </div>
          
          <div style={{ position: 'relative', width: '100%', paddingBottom: '30%', minHeight: '240px' }}>
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#005bd3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#005bd3" stopOpacity="0.05" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                </filter>
              </defs>
              
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding.top + innerHeight * (1 - ratio);
                const labelValue = Math.round(maxViews * ratio);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#e1e3e5"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 10}
                      y={y}
                      textAnchor="end"
                      fontSize="10"
                      fill="#6d7175"
                      dominantBaseline="middle"
                    >
                      {labelValue.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#005bd3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#shadow)"
              />

              {/* Data points */}
              {points.map((point, i) => (
                <g key={i}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#005bd3"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                  />
                  <title>{`${new Date(data[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${point.value} views`}</title>
                </g>
              ))}

              {/* X-axis labels */}
              {data.map((item, index) => {
                const x = data.length > 1 
                  ? padding.left + (index / (data.length - 1)) * innerWidth 
                  : padding.left + innerWidth / 2;
                const showLabel = data.length <= 7 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1;
                if (!showLabel) return null;
                
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - padding.bottom + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6d7175"
                  >
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                );
              })}
            </svg>
          </div>
        </BlockStack>
      </Box>
    </Card>
  );
}

ViewsLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
    })
  ),
};

// Professional CTR Comparison Chart
export function CTRComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <Text as="p" tone="subdued">No bar performance data available</Text>
        </Box>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.ctr - a.ctr).slice(0, 5);
  const maxCTR = Math.max(...sortedData.map(d => d.ctr));
  const chartHeight = 300;

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Top Performing Bars (CTR)</Text>
          <div style={{ minHeight: `${chartHeight}px` }}>
            {sortedData.map((bar, index) => {
              const percentage = maxCTR > 0 ? (bar.ctr / maxCTR) * 100 : 0;
              const barColor = bar.ctr >= 5 ? '#1a7f37' : bar.ctr >= 2 ? '#0969da' : '#6e7781';
              
              return (
                <div key={bar.id} style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '6px',
                    alignItems: 'center'
                  }}>
                    <Text as="span" variant="bodyMd" truncate>
                      {bar.name.slice(0, 40)}
                    </Text>
                    <Text as="span" variant="bodyMd" fontWeight="semibold" tone={bar.ctr >= 5 ? 'success' : 'subdued'}>
                      {bar.ctr}%
                    </Text>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '32px', 
                    backgroundColor: '#f6f6f7',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: barColor,
                      borderRadius: '6px',
                      transition: 'width 0.6s ease-out',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '12px',
                      minWidth: bar.ctr > 0 ? '40px' : '0'
                    }}>
                      <Text as="span" variant="bodySm" tone="text-inverse">
                        {bar.views} views • {bar.clicks} clicks
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </BlockStack>
      </Box>
    </Card>
  );
}

CTRComparisonChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
      clicks: PropTypes.number.isRequired,
      ctr: PropTypes.number.isRequired,
    })
  ),
};

// Professional Engagement Metrics Chart
export function EngagementMetricsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <Text as="p" tone="subdued">No engagement data available</Text>
        </Box>
      </Card>
    );
  }

  const totalViews = data.reduce((sum, d) => sum + d.views, 0);
  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const activeCount = data.filter(d => d.isActive).length;
  const inactiveCount = data.length - activeCount;

  const metrics = [
    { label: 'Total Views', value: totalViews, color: '#0969da' },
    { label: 'Total Clicks', value: totalClicks, color: '#1a7f37' },
    { label: 'Active Bars', value: activeCount, color: '#8250df' },
    { label: 'Inactive Bars', value: inactiveCount, color: '#6e7781' }
  ];

  const maxValue = Math.max(...metrics.map(m => m.value));

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Engagement Overview</Text>
          <InlineGrid columns={2} gap="400">
            {metrics.map((metric, index) => (
              <div key={index} style={{
                padding: '16px',
                backgroundColor: '#f6f6f7',
                borderRadius: '12px',
                border: '1px solid #e1e3e5'
              }}>
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">{metric.label}</Text>
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    {metric.value.toLocaleString()}
                  </Text>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      width: `${maxValue > 0 ? (metric.value / maxValue) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: metric.color,
                      transition: 'width 0.6s ease-out'
                    }} />
                  </div>
                </BlockStack>
              </div>
            ))}
          </InlineGrid>
        </BlockStack>
      </Box>
    </Card>
  );
}

EngagementMetricsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      views: PropTypes.number.isRequired,
      clicks: PropTypes.number.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ),
};

// Professional Views vs Clicks Comparison
export function ViewsClicksComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <Text as="p" tone="subdued">No comparison data available</Text>
        </Box>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: item.date,
    views: item.views,
    clicks: item.clicks || 0
  }));

  const maxValue = Math.max(...chartData.flatMap(d => [d.views, d.clicks]));
  const chartHeight = 200;
  const barWidth = Math.min(40, 600 / (chartData.length * 2));

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text as="h3" variant="headingMd">Views vs Clicks Comparison</Text>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#0969da', borderRadius: '2px' }} />
                <Text as="span" variant="bodySm">Views</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#1a7f37', borderRadius: '2px' }} />
                <Text as="span" variant="bodySm">Clicks</Text>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            height: `${chartHeight}px`,
            gap: '12px',
            borderBottom: '2px solid #e1e3e5',
            paddingBottom: '8px',
            overflow: 'auto'
          }}>
            {chartData.map((item, index) => {
              const viewHeight = maxValue > 0 ? (item.views / maxValue) * (chartHeight - 40) : 0;
              const clickHeight = maxValue > 0 ? (item.clicks / maxValue) * (chartHeight - 40) : 0;
              
              return (
                <div key={index} style={{ 
                  display: 'flex',
                  gap: '4px',
                  minWidth: `${barWidth * 2 + 4}px`
                }}>
                  <div style={{ 
                    width: `${barWidth}px`,
                    height: `${viewHeight}px`,
                    backgroundColor: '#0969da',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    transition: 'height 0.4s ease-out'
                  }}>
                    {viewHeight > 20 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '4px', 
                        width: '100%', 
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {item.views}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    width: `${barWidth}px`,
                    height: `${clickHeight}px`,
                    backgroundColor: '#1a7f37',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    transition: 'height 0.4s ease-out'
                  }}>
                    {clickHeight > 20 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '4px', 
                        width: '100%', 
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {item.clicks}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            overflow: 'auto'
          }}>
            {chartData.map((item, index) => (
              <div key={index} style={{ 
                minWidth: `${barWidth * 2 + 4}px`,
                textAlign: 'center'
              }}>
                <Text as="span" variant="bodySm" tone="subdued">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </div>
            ))}
          </div>
        </BlockStack>
      </Box>
    </Card>
  );
}

ViewsClicksComparisonChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
      clicks: PropTypes.number,
    })
  ),
};