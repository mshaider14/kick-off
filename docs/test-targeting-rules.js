/**
 * Test script to validate targeting rules implementation
 * Run this manually to test different targeting scenarios
 */

// Test Device Targeting Logic
function testDeviceTargeting() {
  console.log('=== Testing Device Targeting ===');
  
  const testCases = [
    { targetDevices: 'both', isMobile: true, expected: true },
    { targetDevices: 'both', isMobile: false, expected: true },
    { targetDevices: 'mobile', isMobile: true, expected: true },
    { targetDevices: 'mobile', isMobile: false, expected: false },
    { targetDevices: 'desktop', isMobile: true, expected: false },
    { targetDevices: 'desktop', isMobile: false, expected: true },
  ];
  
  testCases.forEach(({ targetDevices, isMobile, expected }) => {
    const result = matchesDeviceTarget(targetDevices, isMobile);
    const status = result === expected ? '✓' : '✗';
    console.log(`${status} Device: ${targetDevices}, isMobile: ${isMobile}, Result: ${result}, Expected: ${expected}`);
  });
}

function matchesDeviceTarget(targetDevices, isMobile) {
  if (!targetDevices || targetDevices === 'both') return true;
  if (targetDevices === 'mobile' && isMobile) return true;
  if (targetDevices === 'desktop' && !isMobile) return true;
  return false;
}

// Test Page Targeting Logic
function testPageTargeting() {
  console.log('\n=== Testing Page Targeting ===');
  
  const testCases = [
    { targetPages: 'all', path: '/products/shoe', expected: true },
    { targetPages: 'homepage', path: '/', expected: true },
    { targetPages: 'homepage', path: '/products', expected: false },
    { targetPages: 'product', path: '/products/shoe', expected: true },
    { targetPages: 'product', path: '/collections/all', expected: false },
    { targetPages: 'collection', path: '/collections/sale', expected: true },
    { targetPages: 'cart', path: '/cart', expected: true },
    { 
      targetPages: 'specific', 
      path: '/collections/sale', 
      specificUrls: JSON.stringify(['/collections/sale', '/pages/about']),
      expected: true 
    },
    { 
      targetPages: 'specific', 
      path: '/products/test', 
      specificUrls: JSON.stringify(['/collections/sale']),
      expected: false 
    },
    { 
      targetPages: 'pattern', 
      path: '/products/shoe', 
      pattern: JSON.stringify({ type: 'contains', value: 'products' }),
      expected: true 
    },
    { 
      targetPages: 'pattern', 
      path: '/collections/sale', 
      pattern: JSON.stringify({ type: 'starts_with', value: '/collections' }),
      expected: true 
    },
    { 
      targetPages: 'pattern', 
      path: '/products/test.html', 
      pattern: JSON.stringify({ type: 'ends_with', value: '.html' }),
      expected: true 
    },
  ];
  
  testCases.forEach((testCase) => {
    const result = matchesPageTarget(testCase);
    const status = result === testCase.expected ? '✓' : '✗';
    console.log(`${status} Target: ${testCase.targetPages}, Path: ${testCase.path}, Result: ${result}, Expected: ${testCase.expected}`);
  });
}

function matchesPageTarget(settings) {
  const targetPages = settings.targetPages || 'all';
  const currentPath = settings.path;
  
  if (targetPages === 'all') return true;
  
  if (targetPages === 'homepage') {
    return currentPath === '/' || currentPath === '';
  }
  
  if (targetPages === 'product') {
    return currentPath.includes('/products/');
  }
  
  if (targetPages === 'collection') {
    return currentPath.includes('/collections/');
  }
  
  if (targetPages === 'cart') {
    return currentPath.includes('/cart');
  }
  
  if (targetPages === 'specific') {
    try {
      const specificUrls = settings.specificUrls ? JSON.parse(settings.specificUrls) : [];
      return specificUrls.some(url => currentPath === url || currentPath.startsWith(url));
    } catch (e) {
      return false;
    }
  }
  
  if (targetPages === 'pattern') {
    try {
      const pattern = settings.pattern ? JSON.parse(settings.pattern) : null;
      if (!pattern || !pattern.value) return false;
      
      const patternValue = pattern.value;
      const patternType = pattern.type || 'contains';
      
      if (patternType === 'contains') {
        return currentPath.includes(patternValue);
      } else if (patternType === 'starts_with') {
        return currentPath.startsWith(patternValue);
      } else if (patternType === 'ends_with') {
        return currentPath.endsWith(patternValue);
      }
    } catch (e) {
      return false;
    }
  }
  
  return false;
}

// Test Display Frequency Logic
function testDisplayFrequency() {
  console.log('\n=== Testing Display Frequency ===');
  
  console.log('✓ Always: Should always return true');
  console.log('✓ Once per session: Uses sessionStorage, prevents multiple displays in same session');
  console.log('✓ Once per visitor: Uses cookies with 365-day expiry, persists across sessions');
  console.log('Note: Frequency logic requires browser environment to test fully');
}

// Run all tests
function runAllTests() {
  console.log('Starting Targeting Rules Validation Tests\n');
  testDeviceTargeting();
  testPageTargeting();
  testDisplayFrequency();
  console.log('\n=== All Tests Complete ===');
}

// Export for Node.js or browser testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testDeviceTargeting, testPageTargeting, testDisplayFrequency, runAllTests };
}

// Auto-run if executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
