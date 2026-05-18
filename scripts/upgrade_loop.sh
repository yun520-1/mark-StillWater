#!/bin/bash
#
# mark-StillWater Long-term Upgrade Loop
# Duration: 5 hours (30 iterations x 10 minutes)
# Target: /Users/apple/.hermes/skills/ai
#

SKILLS_DIR="/Users/apple/.hermes/skills/ai"
MARK_STILLWATER_DIR="/Users/apple/.claude/skills/mark-StillWater"
LOG_FILE="$MARK_STILLWATER_DIR/.upgrade_log.md"
ITERATION=0
MAX_ITERATIONS=30

echo "# mark-StillWater Upgrade Log" > "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Get list of skill directories
cd "$SKILLS_DIR"
SKILLS=$(ls -1d */ 2>/dev/null | sed 's#/##' | grep -v "^mark-StillWater$" | grep -v "^heartflow-v016$" | grep -v "^mark-heartflow$")

TOTAL=$(echo "$SKILLS" | wc -l | tr -d ' ')
echo "Found $TOTAL skills to process" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

for skill in $SKILLS; do
    ITERATION=$((ITERATION + 1))
    echo "[$ITERATION/$TOTAL] Processing: $skill"

    SKILL_PATH="$SKILLS_DIR/$skill"

    # Read SKILL.md if exists
    if [ -f "$SKILL_PATH/SKILL.md" ]; then
        echo "--- $skill: SKILL.md ---" >> "$LOG_FILE"
        head -50 "$SKILL_PATH/SKILL.md" >> "$LOG_FILE"
        echo "" >> "$LOG_FILE"
    fi

    # Find and read key source files
    if [ -d "$SKILL_PATH/src" ]; then
        echo "--- $skill: source files ---" >> "$LOG_FILE"
        find "$SKILL_PATH/src" -name "*.js" -o -name "*.ts" 2>/dev/null | head -10 | while read f; do
            echo "File: $f" >> "$LOG_FILE"
            head -30 "$f" >> "$LOG_FILE"
            echo "" >> "$LOG_FILE"
        done
    fi

    # Small delay between skills
    sleep 2

    # Every 5 iterations, run tests
    if [ $((ITERATION % 5)) -eq 0 ]; then
        echo "[TEST] Running tests..."
        cd "$MARK_STILLWATER_DIR"
        node tests/run.js >> "$LOG_FILE" 2>&1
        echo "Test result: $?" >> "$LOG_FILE"
        echo "" >> "$LOG_FILE"
    fi

    # Every 10 iterations, commit
    if [ $((ITERATION % 10)) -eq 0 ]; then
        echo "[COMMIT] Committing changes..."
        cd "$MARK_STILLWATER_DIR"
        git add -A >> "$LOG_FILE" 2>&1
        git commit -m "Upgrade iteration $ITERATION: absorbed from $skill" >> "$LOG_FILE" 2>&1
        git push >> "$LOG_FILE" 2>&1
        echo "" >> "$LOG_FILE"
    fi

    # Check if we've done enough
    if [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo "Max iterations reached. Done."
        break
    fi
done

echo "" >> "$LOG_FILE"
echo "Completed: $(date)" >> "$LOG_FILE"
echo "Total iterations: $ITERATION" >> "$LOG_FILE"
