#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}           Supabase Connection Tool          ${NC}"
echo -e "${BLUE}==============================================${NC}"

if [ -z "$SUPABASE_DB_URL" ]; then
  echo -e "${RED}Error: SUPABASE_DB_URL environment variable is not set${NC}"
  echo -e "${YELLOW}Please set it in the environment secrets with the Supabase PostgreSQL connection URL${NC}"
  exit 1
fi

echo -e "${GREEN}Checking Supabase database connection...${NC}"

# Run the check-supabase.ts script to verify connection
npx tsx server/check-supabase.ts

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Connection successful!${NC}"
  echo -e "${YELLOW}You can now migrate data to Supabase with:${NC}"
  echo -e "${BLUE}npx tsx server/migrate-to-supabase.ts${NC}"
else
  echo -e "\n${RED}Connection failed.${NC}"
  echo -e "${YELLOW}Please check your SUPABASE_DB_URL and network connectivity.${NC}"
  exit 1
fi