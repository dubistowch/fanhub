#!/bin/bash
# 启动脚本：启动应用

# 首先检查环境变量是否已设置
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "警告: SUPABASE_DB_URL 环境变量未设置"
  echo "请在启动前设置 SUPABASE_DB_URL 环境变量，或使用 .env 文件"
fi

# 检查配置并启动应用
npm run dev