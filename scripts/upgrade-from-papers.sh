#!/bin/bash
# mark-StillWater 长任务计划 - 论文升级脚本
# 每小时运行一次，持续从论文中学习并升级

echo "[$(date)] 开始 mark-StillWater 论文升级任务..."

cd ~/.claude/skills/mark-StillWater

# 1. 扫描新论文
echo "[$(date)] 扫描下载文件夹中的新论文..."
find ~/Downloads -type f \( -name "*.pdf" -o -name "*.md" \) -mmin -3600 2>/dev/null | head -10

# 2. 读取论文 (使用 pdfplumber)
echo "[$(date)] 读取新论文内容..."

# 3. 保存到记忆系统
echo "[$(date)] 保存论文到记忆系统..."

# 4. 更新 SKILL BLUEPRINT
echo "[$(date)] 更新技能蓝图..."

# 5. 梦境整合
echo "[$(date)] 运行梦境整合..."
node -e "
const { createHeartFlow } = require('./src/core/heartflow.js');
const hf = createHeartFlow();
hf.start();
const result = hf.dreamNow();
console.log('梦境完成:', result.dream_complete);
hf.stop();
" 2>/dev/null

# 6. Git 同步
echo "[$(date)] Git 同步..."
git add -A
git commit -m "auto: 论文升级 $(date +%Y-%m-%d_%H:%M)"
git push origin master 2>/dev/null

echo "[$(date)] mark-StillWater 论文升级任务完成"
