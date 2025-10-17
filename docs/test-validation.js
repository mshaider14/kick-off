#!/usr/bin/env node

/**
 * Manual Validation Test for Bar Creation
 * 
 * This script tests the validation logic used in the bar creation feature.
 * Run with: node docs/test-validation.js
 */

// Simulate the validation function from api.bars.jsx
function validateBarData(data) {
  const errors = {};

  // Required fields
  if (!data.message || typeof data.message !== "string" || data.message.trim() === "") {
    errors.message = "Message is required and must be a non-empty string";
  }

  // Type validation
  if (!data.type || !["announcement", "countdown", "shipping"].includes(data.type)) {
    errors.type = "Invalid bar type. Must be: announcement, countdown, or shipping";
  }

  // CTA validation
  if (data.ctaText && !data.ctaLink) {
    errors.ctaLink = "Link URL is required when button text is provided";
  }

  // Color validation
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (data.backgroundColor && !hexColorRegex.test(data.backgroundColor)) {
    errors.backgroundColor = "Background color must be a valid hex color (e.g., #288d40)";
  }
  if (data.textColor && !hexColorRegex.test(data.textColor)) {
    errors.textColor = "Text color must be a valid hex color (e.g., #ffffff)";
  }

  // Font size validation
  if (data.fontSize !== undefined) {
    const size = parseInt(data.fontSize, 10);
    if (isNaN(size) || size < 10 || size > 24) {
      errors.fontSize = "Font size must be a number between 10 and 24";
    }
  }

  // Position validation
  if (data.position && !["top", "bottom"].includes(data.position)) {
    errors.position = "Position must be either 'top' or 'bottom'";
  }

  // Date validation
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.startDate = "Invalid start date format";
    }
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.endDate = "Invalid end date format";
    }

    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (endDate <= startDate) {
        errors.endDate = "End date must be after start date";
      }
    }
  }

  return errors;
}

// Test cases
const tests = [
  {
    name: "Valid bar data",
    data: {
      type: "announcement",
      message: "Summer Sale!",
      ctaText: "Shop Now",
      ctaLink: "/collections/sale",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
      fontSize: 14,
      position: "top",
    },
    shouldPass: true,
  },
  {
    name: "Missing message",
    data: {
      type: "announcement",
      message: "",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
    },
    shouldPass: false,
  },
  {
    name: "Invalid bar type",
    data: {
      type: "invalid",
      message: "Test",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
    },
    shouldPass: false,
  },
  {
    name: "CTA text without link",
    data: {
      type: "announcement",
      message: "Test",
      ctaText: "Click me",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
    },
    shouldPass: false,
  },
  {
    name: "Invalid background color",
    data: {
      type: "announcement",
      message: "Test",
      backgroundColor: "red",
      textColor: "#ffffff",
    },
    shouldPass: false,
  },
  {
    name: "Invalid text color",
    data: {
      type: "announcement",
      message: "Test",
      backgroundColor: "#288d40",
      textColor: "white",
    },
    shouldPass: false,
  },
  {
    name: "Font size too small",
    data: {
      type: "announcement",
      message: "Test",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
      fontSize: 5,
    },
    shouldPass: false,
  },
  {
    name: "Font size too large",
    data: {
      type: "announcement",
      message: "Test",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
      fontSize: 30,
    },
    shouldPass: false,
  },
  {
    name: "Invalid position",
    data: {
      type: "announcement",
      message: "Test",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
      position: "middle",
    },
    shouldPass: false,
  },
  {
    name: "End date before start date",
    data: {
      type: "announcement",
      message: "Test",
      backgroundColor: "#288d40",
      textColor: "#ffffff",
      startDate: "2024-12-31T00:00:00Z",
      endDate: "2024-01-01T00:00:00Z",
    },
    shouldPass: false,
  },
];

// Run tests
console.log("🧪 Running Bar Validation Tests\n");

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const errors = validateBarData(test.data);
  const hasErrors = Object.keys(errors).length > 0;
  const testPassed = test.shouldPass ? !hasErrors : hasErrors;

  if (testPassed) {
    console.log(`✅ Test ${index + 1}: ${test.name}`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    if (!test.shouldPass && !hasErrors) {
      console.log("   Expected validation errors but got none");
    } else if (test.shouldPass && hasErrors) {
      console.log("   Unexpected validation errors:", errors);
    }
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed === 0) {
  console.log("✨ All tests passed!");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed!");
  process.exit(1);
}
