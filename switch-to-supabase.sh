#!/bin/bash

echo "切换到 Supabase 数据库..."

# 确保我们有必需的环境变量
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "错误: 缺少 SUPABASE_DB_URL 环境变量"
    exit 1
fi

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "错误: 缺少 VITE_SUPABASE_URL 环境变量"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "错误: 缺少 VITE_SUPABASE_ANON_KEY 环境变量"
    exit 1
fi

# 备份原始文件
echo "备份原始文件..."
cp server/index.ts server/index.ts.bak
cp server/routes.ts server/routes.ts.bak
cp server/storage.ts server/storage.ts.bak

# 复制新文件
echo "复制 Supabase 配置文件..."
cp server/index-supabase.ts server/index.ts
cp server/routes-supabase.ts server/routes.ts
cp server/storage-supabase.ts server/storage.ts

# 检查 db-supabase.ts 文件是否存在
if [ -f server/db-supabase.ts ]; then
    cp server/db-supabase.ts server/db.ts
else
    echo "警告: server/db-supabase.ts 不存在"
fi

echo "迁移完成！请重启服务器以应用更改。"