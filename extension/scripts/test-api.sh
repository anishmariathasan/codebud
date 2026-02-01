#!/bin/bash

BASE_URL="http://localhost:3001"

echo "Testing CodeBud API at $BASE_URL..."

echo -e "\n1. Testing /api/status"
STATUS_RES=$(curl -s "$BASE_URL/api/status")
echo $STATUS_RES
echo $STATUS_RES | grep "active" && echo "✅ Status OK" || echo "❌ Status Failed"

echo -e "\n2. Testing /api/context (Requires open editor)"
CONTEXT_RES=$(curl -s "$BASE_URL/api/context")
# Print first 200 chars to verify content
echo "${CONTEXT_RES:0:200}..." 
echo $CONTEXT_RES | grep "mode" && echo "✅ Context OK" || echo "❌ Context Failed (Make sure VS Code has a file open)"

echo -e "\n3. Testing /api/highlight (Mock request)"
# We can't easily verify the visual highlight via curl, but we can check if it accepts the request
HIGHLIGHT_RES=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"line": 1}' \
    "$BASE_URL/api/highlight")
echo "$HIGHLIGHT_RES"
echo "$HIGHLIGHT_RES" | grep "success" && echo "✅ Highlight Request OK" || echo "❌ Highlight Request Failed"

echo -e "\nNote: File API tests removed (Feature disabled)."
echo "Done."
