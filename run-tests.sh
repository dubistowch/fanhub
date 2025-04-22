#!/bin/bash

# 設置環境變數
export NODE_ENV=test
export $(grep -v '^#' .env.test | xargs)

# 安裝必要的瀏覽器（如果需要）
npx playwright install --with-deps chromium

# 運行指定的測試或所有測試
if [ "$1" = "auth" ]; then
  echo "Running authentication tests..."
  npx playwright test tests/auth.spec.ts "${@:2}"
elif [ "$1" = "settings" ]; then
  echo "Running settings tests..."
  npx playwright test tests/settings.spec.ts "${@:2}"
elif [ "$1" = "stress" ]; then
  echo "Running logout stress tests..."
  npx playwright test tests/logout-stress.spec.ts "${@:2}"
elif [ "$1" = "ui" ]; then
  echo "Running tests with UI mode..."
  npx playwright test --ui
elif [ "$1" = "debug" ]; then
  echo "Running tests in debug mode..."
  npx playwright test --debug
elif [ "$1" = "report" ]; then
  echo "Showing test report..."
  npx playwright show-report
else
  echo "Running all tests..."
  npx playwright test
fi