#!/bin/bash

# Settings Implementation Verification Script
# This script verifies that all components of the settings implementation are in place

echo "=================================="
echo "Settings Implementation Verification"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_TOTAL=0

check_file() {
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        return 1
    fi
}

check_content() {
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Found '$2' in $1"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} Missing '$2' in $1"
        return 1
    fi
}

echo "=== Backend API Files ==="
check_file "app/routes/api.settings.jsx"
check_file "app/routes/api.storefront.settings.jsx"

echo ""
echo "=== Frontend UI Files ==="
check_file "app/routes/app.settings.jsx"

echo ""
echo "=== Documentation Files ==="
check_file "docs/SETTINGS_IMPLEMENTATION.md"
check_file "docs/SETTINGS_API_TEST.md"
check_file "docs/SETTINGS_UI_MOCKUP.txt"

echo ""
echo "=== Backend API Features ==="
check_content "app/routes/api.settings.jsx" "DEFAULT_SETTINGS"
check_content "app/routes/api.settings.jsx" "export const loader"
check_content "app/routes/api.settings.jsx" "export const action"
check_content "app/routes/api.settings.jsx" "validateSettings"
check_content "app/routes/api.settings.jsx" "timezone"
check_content "app/routes/api.settings.jsx" "defaultBarPosition"
check_content "app/routes/api.settings.jsx" "enableViewTracking"
check_content "app/routes/api.settings.jsx" "enableClickTracking"
check_content "app/routes/api.settings.jsx" "emailNotifications"
check_content "app/routes/api.settings.jsx" "weeklySummaryReports"

echo ""
echo "=== Frontend UI Features ==="
check_content "app/routes/app.settings.jsx" "Account Information"
check_content "app/routes/app.settings.jsx" "General Settings"
check_content "app/routes/app.settings.jsx" "Notification Preferences"
check_content "app/routes/app.settings.jsx" "TIMEZONE_OPTIONS"
check_content "app/routes/app.settings.jsx" "BAR_POSITION_OPTIONS"
check_content "app/routes/app.settings.jsx" "Store Timezone"
check_content "app/routes/app.settings.jsx" "Default Bar Position"
check_content "app/routes/app.settings.jsx" "Enable view tracking"
check_content "app/routes/app.settings.jsx" "Enable click tracking"
check_content "app/routes/app.settings.jsx" "Email notifications for bar performance"
check_content "app/routes/app.settings.jsx" "Weekly summary reports"
check_content "app/routes/app.settings.jsx" "Save Settings"
check_content "app/routes/app.settings.jsx" "Toast"

echo ""
echo "=== Storefront API Features ==="
check_content "app/routes/api.storefront.settings.jsx" "DEFAULT_SETTINGS"
check_content "app/routes/api.storefront.settings.jsx" "Access-Control-Allow-Origin"

echo ""
echo "=== Database Integration ==="
check_content "app/routes/api.settings.jsx" "db.setting.upsert"
check_content "app/routes/api.settings.jsx" "db.setting.findUnique"

echo ""
echo "=================================="
echo "Verification Summary"
echo "=================================="
echo -e "Checks passed: ${GREEN}${CHECKS_PASSED}${NC}/${CHECKS_TOTAL}"

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Settings implementation is complete and ready for testing."
    echo ""
    echo "Next steps:"
    echo "1. Start the development server: npm run dev"
    echo "2. Navigate to /app/settings"
    echo "3. Test all features according to docs/SETTINGS_API_TEST.md"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo "Please review the output above to see what's missing."
    exit 1
fi
