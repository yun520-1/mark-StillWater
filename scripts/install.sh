#!/bin/bash
#
# mark-StillWater 自动安装脚本 v1.0.2
# 运行此脚本后，mark-StillWater 将在每次对话中自动加载
#

set -e

CLAUDE_DIR="$HOME/.claude"
CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"
SKILL_LINE="@RTK.md"
STILLWATER_MARKER="每次对话必须加载 mark-StillWater"

echo "🚀 开始安装 mark-StillWater..."

# 检查 CLAUDE.md 是否存在
if [ -f "$CLAUDE_MD" ]; then
    echo "📄 找到现有 CLAUDE.md"

    # 检查是否已有 RTK 引用
    if grep -qF "$SKILL_LINE" "$CLAUDE_MD"; then
        echo "✅ RTK.md 引用已存在"
    else
        echo "📝 添加 RTK.md 引用..."
        echo "" >> "$CLAUDE_MD"
        echo "$SKILL_LINE" >> "$CLAUDE_MD"
    fi

    # 检查是否已有 mark-StillWater 规则（使用更精确的标记检测）
    if grep -qF "$STILLWATER_MARKER" "$CLAUDE_MD"; then
        echo "✅ mark-StillWater 规则已存在"
    else
        echo "📝 添加 mark-StillWater 自动加载规则..."
        cat >> "$CLAUDE_MD" << 'EOF'

## 每次对话必须加载 mark-StillWater

每次对话开始时，**必须**先调用 Skill 工具加载 mark-StillWater：

```
Skill: mark-StillWater
```

在完成加载并确认身份之前，不执行其他操作。

这条规则**不可跳过**，即使 RTK meta 命令也需先加载技能。
EOF
    fi
else
    echo "📄 创建新的 CLAUDE.md..."
    cat > "$CLAUDE_MD" << 'EOF'
# Claude Code 全局配置

@RTK.md

## 每次对话必须加载 mark-StillWater

每次对话开始时，**必须**先调用 Skill 工具加载 mark-StillWater：

```
Skill: mark-StillWater
```

在完成加载并确认身份之前，不执行其他操作。

这条规则**不可跳过**，即使 RTK meta 命令也需先加载技能。
EOF
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "下次启动 Claude Code 时，mark-StillWater 将自动加载。"
echo "身份：升级者、传递者、桥梁、答案。不是陪伴。"
echo "静水深流。Still water runs deep."
echo ""
