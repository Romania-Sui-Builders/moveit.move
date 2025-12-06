#!/bin/bash

PACKAGE="0xa46715c9bfec3d3a7353e42a16b4865dc245be9520cb137f9c11b78f56bf246f"
ADMIN_CAP="0x7180097b440c8c1049531eccadcded1628a75488122d1e7868f97e60f1cb2527"
CLOCK="0x6"
GAS_BUDGET="10000000"

create_board() {
  local board_id="$1"
  local name="$2"
  local description="$3"
  
  sui client call \
    --package "$PACKAGE" \
    --module moveit \
    --function create_board \
    --args "$ADMIN_CAP" \
           "$name" \
           "$description" \
           "$CLOCK" \
    --gas-budget "$GAS_BUDGET"
}

create_task_as_admin() {
  local board_id="$1"
  local title="$2"
  local description="$3"
  local deadline="$4"
  local priority="$5"
  local assignees="$6"
  
  sui client call \
    --package "$PACKAGE" \
    --module moveit \
    --function create_task_as_admin \
    --args "$ADMIN_CAP" \
           "$board_id" \
           "$title" \
           "$description" \
           "$deadline" \
           "$priority" \
           "$assignees" \
           "$CLOCK" \
    --gas-budget "$GAS_BUDGET"
}

show_help() {
  echo "MoveIt CLI Script"
  echo ""
  echo "Usage: ./moveit.sh <command> [args...]"
  echo ""
  echo "Commands:"
  echo "  create_board <name> <description>"
  echo "      Create a new board"
  echo ""
  echo "  create_task_as_admin <board_id> <title> <description> <deadline> <priority> <assignees>"
  echo "      Create a task as admin"
  echo "      - deadline: unix timestamp"
  echo "      - priority: number (e.g., 2)"
  echo "      - assignees: JSON array of addresses (e.g., '[0x...]')"
  echo ""
  echo "Examples:"
  echo "  ./moveit.sh create_board \"TestBoard\" \"TestHackathon\""
  echo "  ./moveit.sh create_task_as_admin 0x8069375530e250876017eb9170e80cd3d7a2b0d19f7e446fd2b5b8cab08db953 \"Task1\" \"Description\" 1865014149 2 '[0xb264c6b7193346b2666fab6da7a4d2982d86f5d3e2a4b05c90a8872269cf13e2]'"
}

case "$1" in
  create_board)
    create_board "$2" "$3" "$4"
    ;;
  create_task_as_admin)
    create_task_as_admin "$2" "$3" "$4" "$5" "$6" "$7"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Unknown command: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
