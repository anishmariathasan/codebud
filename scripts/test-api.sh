#!/bin/bash

# CodeBud API Test Script
# Tests all endpoints with colour-coded output

API_BASE="http://localhost:3001"

# Colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

# Counters
PASSED=0
FAILED=0

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     CodeBud API Test Suite          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "  ${BLUE}$method${NC} $endpoint"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo -e "  ${GREEN}✓ PASS${NC} (HTTP $http_code)"
        echo -e "  Response: ${body:0:100}..."
        ((PASSED++))
    else
        echo -e "  ${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo -e "  Response: $body"
        ((FAILED++))
    fi
    echo ""
}

# Check if server is running
echo -e "${YELLOW}Checking if extension is running...${NC}"
if ! curl -s "$API_BASE/api/status" > /dev/null 2>&1; then
    echo -e "${RED}✗ Cannot connect to $API_BASE${NC}"
    echo ""
    echo "Make sure the VS Code extension is running:"
    echo "  1. Open the 'extension' folder in VS Code"
    echo "  2. Press F5 to launch the Extension Development Host"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Extension is running${NC}"
echo ""

# Test 1: GET /api/status
test_endpoint "GET" "/api/status" "" "Extension Status"

# Test 2: GET /api/context
test_endpoint "GET" "/api/context" "" "Code Context"

# Test 3: GET /api/diagnostics
test_endpoint "GET" "/api/diagnostics" "" "Diagnostics"

# Test 4: POST /api/mode (switch to navigator)
test_endpoint "POST" "/api/mode" '{"mode":"navigator"}' "Switch to Navigator Mode"

# Test 5: POST /api/mode (switch to driver)
test_endpoint "POST" "/api/mode" '{"mode":"driver"}' "Switch to Driver Mode"

# Test 6: POST /api/insert (requires driver mode, open file)
echo -e "${YELLOW}Note:${NC} insert_code requires driver mode and an open file with content"
test_endpoint "POST" "/api/insert" '{"line":1,"code":"// Test comment from API"}' "Insert Code"

# Switch back to navigator for safety
curl -s -X POST -H "Content-Type: application/json" \
    -d '{"mode":"navigator"}' \
    "$API_BASE/api/mode" > /dev/null

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "Test Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! 🎉${NC}"
else
    echo -e "${YELLOW}Some tests failed. Tips:${NC}"
    echo "  - Make sure you have a file open in VS Code"
    echo "  - Check that you're in the Extension Development Host window"
    echo "  - Look at the extension's Debug Console for errors"
fi
echo ""
