#!/bin/bash
# Check Vercel deployment status

echo "🔍 Checking Git status..."
git status

echo ""
echo "📦 Latest commits:"
git log --oneline -5

echo ""
echo "🔗 Remote repository:"
git remote -v

echo ""
echo "✅ If everything looks good, try:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select project: studioinsightdark"
echo "3. Go to Settings → Git"
echo "4. Check if repository is connected"
echo "5. If not connected, click 'Connect Git Repository'"
echo "6. Select: studioinsight25-web/studioinsightdark"
echo ""
echo "Or manually trigger deployment:"
echo "- Go to Deployments tab"
echo "- Click 'Deploy' or 'Redeploy'"

