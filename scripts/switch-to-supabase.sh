#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== FanHub Supabase 迁移工具 =====${NC}"
echo ""

# 检查环境变量
echo -e "${YELLOW}正在检查Supabase环境变量...${NC}"
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo -e "${RED}错误: VITE_SUPABASE_URL 未设置${NC}"
  exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}错误: VITE_SUPABASE_ANON_KEY 未设置${NC}"
  exit 1
fi

if [ -z "$SUPABASE_DB_URL" ]; then
  echo -e "${RED}错误: SUPABASE_DB_URL 未设置${NC}"
  exit 1
fi

# 修复SUPABASE_DB_URL中的格式问题(如果有@符号)
echo -e "${YELLOW}修复数据库URL格式...${NC}"
npx tsx server/fix-supabase.ts
if [ $? -ne 0 ]; then
  echo -e "${RED}修复数据库URL失败，请检查SUPABASE_DB_URL格式${NC}"
  exit 1
fi

echo -e "${GREEN}数据库URL修复成功${NC}"

# 创建备份
echo -e "${YELLOW}创建当前文件备份...${NC}"
cp -f server/index.ts server/index.ts.bak
cp -f server/routes.ts server/routes.ts.bak 
cp -f server/storage.ts server/storage.ts.bak
cp -f server/db.ts server/db.ts.bak

# 切换到Supabase版本
echo -e "${YELLOW}切换到Supabase版本...${NC}"
cp -f server/index-supabase.ts server/index.ts
cp -f server/routes-supabase.ts server/routes.ts
cp -f server/db-supabase.ts server/db.ts

echo -e "${GREEN}切换完成!${NC}"
echo -e "${BLUE}现在应用程序将使用Supabase作为数据库和认证服务${NC}"
echo ""
echo -e "${YELLOW}重启服务中...${NC}"

# 重启服务
npm run dev &
echo -e "${GREEN}服务已重启!${NC}"
echo ""
echo -e "${BLUE}===== 迁移完成 =====${NC}"