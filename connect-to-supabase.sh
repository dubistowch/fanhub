#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== FanHub Supabase 连接检查工具 =====${NC}"
echo ""

# 检查环境变量
echo -e "${YELLOW}正在检查Supabase环境变量...${NC}"

if [ -z "$VITE_SUPABASE_URL" ]; then
  echo -e "${RED}错误: VITE_SUPABASE_URL 未设置${NC}"
  MISSING_ENV=1
else
  echo -e "${GREEN}VITE_SUPABASE_URL: 已设置${NC}"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}错误: VITE_SUPABASE_ANON_KEY 未设置${NC}"
  MISSING_ENV=1
else
  echo -e "${GREEN}VITE_SUPABASE_ANON_KEY: 已设置${NC}"
fi

if [ -z "$SUPABASE_DB_URL" ]; then
  echo -e "${RED}错误: SUPABASE_DB_URL 未设置${NC}"
  MISSING_ENV=1
else
  echo -e "${GREEN}SUPABASE_DB_URL: 已设置${NC}"
  
  # 尝试解析数据库URL
  echo -e "\n${YELLOW}解析数据库URL...${NC}"
  DB_HOST=$(echo $SUPABASE_DB_URL | grep -o 'host=[^ ]*' | cut -d= -f2)
  DB_PORT=$(echo $SUPABASE_DB_URL | grep -o 'port=[^ ]*' | cut -d= -f2)
  DB_USER=$(echo $SUPABASE_DB_URL | grep -o 'user=[^ ]*' | cut -d= -f2)
  DB_NAME=$(echo $SUPABASE_DB_URL | grep -o 'dbname=[^ ]*' | cut -d= -f2)
  
  echo "主机: $DB_HOST"
  echo "端口: $DB_PORT"
  echo "用户: $DB_USER"
  echo "数据库: $DB_NAME"
  
  # 检查DNS解析
  echo -e "\n${YELLOW}检查DNS解析...${NC}"
  if host $DB_HOST > /dev/null 2>&1; then
    echo -e "${GREEN}DNS解析成功: $DB_HOST 可以解析${NC}"
    host $DB_HOST
  else
    echo -e "${RED}DNS解析失败: 无法解析 $DB_HOST${NC}"
    
    # 尝试ping
    echo -e "\n${YELLOW}尝试Ping主机...${NC}"
    if ping -c 1 $DB_HOST > /dev/null 2>&1; then
      echo -e "${GREEN}Ping成功: $DB_HOST 可以到达${NC}"
    else
      echo -e "${RED}Ping失败: 无法到达 $DB_HOST${NC}"
    fi
  fi
  
  # 检查端口连接
  echo -e "\n${YELLOW}检查数据库端口连接...${NC}"
  if nc -z -w5 $DB_HOST $DB_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}端口连接成功: $DB_HOST:$DB_PORT 可以连接${NC}"
  else
    echo -e "${RED}端口连接失败: 无法连接到 $DB_HOST:$DB_PORT${NC}"
  fi
fi

echo ""
if [ "$MISSING_ENV" = "1" ]; then
  echo -e "${RED}请设置缺失的环境变量后再试${NC}"
  exit 1
fi

# 运行TypeScript检查脚本
echo -e "${YELLOW}运行Supabase连接检查脚本...${NC}"
npx tsx server/check-supabase.ts

echo ""
echo -e "${BLUE}===== 检查完成 =====${NC}"