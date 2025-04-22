#!/bin/bash
# 启动脚本：设置环境变量并启动应用

# 设置正确的Supabase数据库URL
export SUPABASE_DB_URL="postgresql://postgres.gdnmmwhgpxoiitcxegmh:egkpcDBZyUvo32Qz@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
export DATABASE_URL="$SUPABASE_DB_URL"

# 打印环境变量（掩码密码）
echo "使用数据库URL: $(echo $SUPABASE_DB_URL | sed 's/\(postgresql:\/\/[^:]\+:\)[^@]\+\(@.\+\)/\1*****\2/')"

# 启动应用
npm run dev