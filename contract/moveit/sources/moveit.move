/// MoveIt - On-Chain Coordination & Work Management System
/// 
/// A decentralized task and project management system built on Sui.
/// Supports boards with configurable workflows, role-based access control, 
/// and full task lifecycle management.
/// 
/// Tasks are now separate objects that can be looked up globally by their Object ID.
/// This contract is upgradeable and uses versioned objects for future-proofing.
module moveit::moveit;

use std::string::String;
use sui::event;
use sui::clock::Clock;
use sui::package;
use sui::dynamic_field;
use sui::display;

// ===== Version Constants =====
const VERSION: u64 = 1;

// ===== Error Codes =====
const EInvalidBoardId: u64 = 0;
const EInvalidStatus: u64 = 1;
const EStatusAlreadyExists: u64 = 3;
const EStatusNotFound: u64 = 4;
const ECannotRemoveLastStatus: u64 = 5;
const ENoStatusesDefined: u64 = 6;
const EWrongVersion: u64 = 7;
const ENotUpgraded: u64 = 8;
const EInvalidDueDate: u64 = 9;
const ECannotNestSubtasks: u64 = 11;
const ETaskBoardMismatch: u64 = 12;

// ===== One-Time Witness =====

/// One-time witness for package publishing and upgrades
public struct MOVEIT has drop {}

// ===== Core Structs =====

/// Admin capability - created once when the package is published.
/// Only the admin can create boards, manage the system, and authorize upgrades.
public struct AdminCap has key, store {
    id: UID,
}

/// Board represents a workspace for organizing tasks and team members.
/// Each board has its own configurable workflow (statuses).
/// Includes version field for upgrade compatibility.
public struct Board has key, store {
    id: UID,
    /// Version of the board object (for migration compatibility)
    version: u64,
    /// Board name
    name: String,
    /// Optional description of the board
    description: String,
    /// Configurable workflow statuses for this board (e.g., "To-Do", "In-Progress", "Done")
    statuses: vector<String>,
    /// Counter for generating unique task IDs within the board
    task_counter: u64,
    /// Object IDs of all tasks in this board
    task_ids: vector<ID>,
    /// Timestamp of board creation
    created_at: u64,
}

/// Task represents a unit of work within a board.
/// Tasks are now separate objects with global Object IDs.
/// Supports hierarchical structure with parent/child relationships.
public struct Task has key, store {
    id: UID,
    /// The board this task belongs to
    board_id: ID,
    /// Sequential task number within the board (for display purposes)
    task_number: u64,
    /// Task title
    title: String,
    /// Detailed description of the task
    description: String,
    /// Optional due date as Unix timestamp (milliseconds)
    due_date: u64,
    /// Current status of the task (must be one of the board's configured statuses)
    status: String,
    /// Effort estimation (e.g., story points or hours)
    effort: u64,
    /// List of assigned user addresses
    assignees: vector<address>,
    /// Address of the task creator
    creator: address,
    /// Timestamp of task creation
    created_at: u64,
    /// Timestamp of last update
    updated_at: u64,
    /// Optional parent task Object ID (for subtasks)
    parent_task_id: Option<ID>,
    /// Object IDs of subtasks
    subtask_ids: vector<ID>,
}

/// Contributor capability - given to team members for a specific board.
/// Contributors can create and manage tasks on their assigned board.
public struct ContributorCap has key, store {
    id: UID,
    /// The board this capability is for
    board_id: ID,
}

// ===== Events =====

public struct BoardCreated has copy, drop {
    board_id: ID,
    name: String,
    created_by: address,
    version: u64,
}

public struct StatusAdded has copy, drop {
    board_id: ID,
    status: String,
    added_by: address,
}

public struct StatusRemoved has copy, drop {
    board_id: ID,
    status: String,
    removed_by: address,
}

public struct ContributorAdded has copy, drop {
    board_id: ID,
    contributor: address,
    added_by: address,
}

public struct TaskCreated has copy, drop {
    board_id: ID,
    task_id: ID,
    task_number: u64,
    title: String,
    creator: address,
}

public struct TaskUpdated has copy, drop {
    board_id: ID,
    task_id: ID,
    updated_by: address,
}

public struct TaskStatusChanged has copy, drop {
    board_id: ID,
    task_id: ID,
    old_status: String,
    new_status: String,
    changed_by: address,
}

public struct TaskAssigned has copy, drop {
    board_id: ID,
    task_id: ID,
    assignees: vector<address>,
    assigned_by: address,
}

public struct BoardMigrated has copy, drop {
    board_id: ID,
    old_version: u64,
    new_version: u64,
    migrated_by: address,
}

public struct SubtaskCreated has copy, drop {
    board_id: ID,
    parent_task_id: ID,
    subtask_id: ID,
    title: String,
    creator: address,
}

// ===== Init Function =====

/// Called once when the package is published.
/// Creates the AdminCap, Display objects, and transfers them to the publisher.
/// The UpgradeCap is automatically created by Sui and should be kept safe.
fun init(otw: MOVEIT, ctx: &mut TxContext) {
    // Claim publisher capability (needed for Display objects)
    let publisher = package::claim(otw, ctx);
    
    // Create Display for Board
    let mut board_display = display::new<Board>(&publisher, ctx);
    board_display.add(b"name".to_string(), b"{name}".to_string());
    board_display.add(b"description".to_string(), b"{description}".to_string());
    board_display.add(b"project_url".to_string(), b"https://moveit.sui".to_string());
    board_display.add(b"image_url".to_string(), b"https://moveit.sui/board.png".to_string());
    board_display.update_version();
    transfer::public_transfer(board_display, ctx.sender());
    
    // Create Display for Task
    let mut task_display = display::new<Task>(&publisher, ctx);
    task_display.add(b"name".to_string(), b"{title}".to_string());
    task_display.add(b"description".to_string(), b"{description}".to_string());
    task_display.add(b"status".to_string(), b"{status}".to_string());
    task_display.add(b"project_url".to_string(), b"https://moveit.sui".to_string());
    task_display.add(b"image_url".to_string(), b"https://moveit.sui/task.png".to_string());
    task_display.update_version();
    transfer::public_transfer(task_display, ctx.sender());
    
    // Create Display for ContributorCap
    let mut cap_display = display::new<ContributorCap>(&publisher, ctx);
    cap_display.add(b"name".to_string(), b"MoveIt Contributor".to_string());
    cap_display.add(b"description".to_string(), b"Contributor capability for a MoveIt board".to_string());
    cap_display.add(b"project_url".to_string(), b"https://moveit.sui".to_string());
    cap_display.update_version();
    transfer::public_transfer(cap_display, ctx.sender());
    
    // Transfer publisher to deployer
    transfer::public_transfer(publisher, ctx.sender());
    
    // Create admin capability
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(admin_cap, ctx.sender());
}

// ===== Version Functions =====

/// Get the current contract version
public fun current_version(): u64 {
    VERSION
}

/// Get a board's version
public fun get_board_version(board: &Board): u64 {
    board.version
}

/// Check if a board needs migration
public fun needs_migration(board: &Board): bool {
    board.version < VERSION
}

/// Migrate a board to the current version (admin only).
/// This function should be updated in future versions to handle migrations.
public fun migrate_board(
    _: &AdminCap,
    board: &mut Board,
    ctx: &TxContext,
) {
    let old_version = board.version;
    assert!(old_version < VERSION, ENotUpgraded);
    
    board.version = VERSION;
    
    event::emit(BoardMigrated {
        board_id: object::id(board),
        old_version,
        new_version: VERSION,
        migrated_by: ctx.sender(),
    });
}

/// Assert that a board is at the current version
fun assert_current_version(board: &Board) {
    assert!(board.version == VERSION, EWrongVersion);
}

// ===== Admin Functions (Board Management) =====

/// Create a new board with initial statuses (admin only).
/// The `initial_statuses` vector defines the workflow for this board.
public fun create_board(
    _: &AdminCap,
    name: String,
    description: String,
    initial_statuses: vector<String>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    let sender = ctx.sender();
    assert!(!initial_statuses.is_empty(), ENoStatusesDefined);
    
    let board = Board {
        id: object::new(ctx),
        version: VERSION,
        name,
        description,
        statuses: initial_statuses,
        task_counter: 0,
        task_ids: vector[],
        created_at: clock.timestamp_ms(),
    };
    
    let board_id = object::id(&board);
    
    event::emit(BoardCreated {
        board_id,
        name: board.name,
        created_by: sender,
        version: VERSION,
    });
    
    transfer::share_object(board);
    
    board_id
}

/// Update board metadata (admin only)
public fun update_board(
    _: &AdminCap,
    board: &mut Board,
    name: String,
    description: String,
) {
    assert_current_version(board);
    board.name = name;
    board.description = description;
}

/// Add a new status to the board's workflow (admin only)
public fun add_status(
    _: &AdminCap,
    board: &mut Board,
    status: String,
    ctx: &TxContext,
) {
    assert_current_version(board);
    let sender = ctx.sender();
    assert!(!vector_contains_string(&board.statuses, &status), EStatusAlreadyExists);
    
    board.statuses.push_back(status);
    
    event::emit(StatusAdded {
        board_id: object::id(board),
        status: *board.statuses.borrow(board.statuses.length() - 1),
        added_by: sender,
    });
}

/// Remove a status from the board's workflow (admin only)
/// Note: Tasks with this status will need to be updated manually
public fun remove_status(
    _: &AdminCap,
    board: &mut Board,
    status: String,
    ctx: &TxContext,
) {
    assert_current_version(board);
    let sender = ctx.sender();
    assert!(board.statuses.length() > 1, ECannotRemoveLastStatus);
    
    let (found, index) = vector_index_of_string(&board.statuses, &status);
    assert!(found, EStatusNotFound);
    
    board.statuses.remove(index);
    
    event::emit(StatusRemoved {
        board_id: object::id(board),
        status,
        removed_by: sender,
    });
}

/// Add a contributor to a board (admin only).
/// The ContributorCap is transferred directly to the contributor.
public fun add_contributor(
    _: &AdminCap,
    board: &Board,
    new_contributor: address,
    ctx: &mut TxContext,
) {
    assert_current_version(board);
    let sender = ctx.sender();
    
    let contributor_cap = ContributorCap {
        id: object::new(ctx),
        board_id: object::id(board),
    };
    
    transfer::transfer(contributor_cap, new_contributor);
    
    event::emit(ContributorAdded {
        board_id: object::id(board),
        contributor: new_contributor,
        added_by: sender,
    });
}

/// Burn a ContributorCap
public fun burn_contributor_cap(cap: ContributorCap) {
    let ContributorCap { id, board_id: _ } = cap;
    object::delete(id);
}

// ===== Dynamic Field Extensions =====
// These functions allow adding custom data to boards without contract upgrades

/// Add a custom field to a board (admin only)
public fun add_board_field<T: store>(
    _: &AdminCap,
    board: &mut Board,
    key: String,
    value: T,
) {
    dynamic_field::add(&mut board.id, key, value);
}

/// Get a custom field from a board
public fun get_board_field<T: store>(board: &Board, key: String): &T {
    dynamic_field::borrow(&board.id, key)
}

/// Get a mutable custom field from a board (admin only)
public fun get_board_field_mut<T: store>(
    _: &AdminCap,
    board: &mut Board,
    key: String,
): &mut T {
    dynamic_field::borrow_mut(&mut board.id, key)
}

/// Remove a custom field from a board (admin only)
public fun remove_board_field<T: store>(
    _: &AdminCap,
    board: &mut Board,
    key: String,
): T {
    dynamic_field::remove(&mut board.id, key)
}

/// Check if a board has a custom field
public fun has_board_field(board: &Board, key: String): bool {
    dynamic_field::exists_(&board.id, key)
}

// ===== Task Functions =====
// All task operations require a ContributorCap.
// Admin can create a ContributorCap for themselves to perform these operations.

/// Create a new task. Task starts with the first status in the workflow.
/// Returns the Object ID of the created task.
public fun create_task(
    cap: &ContributorCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert_current_version(board);
    
    let sender = ctx.sender();
    assert!(!board.statuses.is_empty(), ENoStatusesDefined);
    
    let task_number = board.task_counter;
    board.task_counter = task_number + 1;
    
    let now = clock.timestamp_ms();
    
    // Validate due_date: must be 0 (no due date) or in the future
    assert!(due_date == 0 || due_date > now, EInvalidDueDate);
    
    // New tasks start with the first status in the workflow
    let initial_status = *board.statuses.borrow(0);
    let board_id = object::id(board);
    
    let task = Task {
        id: object::new(ctx),
        board_id,
        task_number,
        title,
        description,
        due_date,
        status: initial_status,
        effort,
        assignees,
        creator: sender,
        created_at: now,
        updated_at: now,
        parent_task_id: option::none(),
        subtask_ids: vector[],
    };
    
    let task_id = object::id(&task);
    board.task_ids.push_back(task_id);
    
    event::emit(TaskCreated {
        board_id,
        task_id,
        task_number,
        title: task.title,
        creator: sender,
    });
    
    transfer::share_object(task);
    
    task_id
}

/// Update task details
public fun update_task(
    cap: &ContributorCap,
    board: &Board,
    task: &mut Task,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert!(task.board_id == object::id(board), ETaskBoardMismatch);
    assert_current_version(board);
    
    let sender = ctx.sender();
    let now = clock.timestamp_ms();
    
    // Validate due_date: must be 0 (no due date) or in the future
    assert!(due_date == 0 || due_date > now, EInvalidDueDate);
    
    task.title = title;
    task.description = description;
    task.due_date = due_date;
    task.effort = effort;
    task.updated_at = now;
    
    event::emit(TaskUpdated {
        board_id: task.board_id,
        task_id: object::id(task),
        updated_by: sender,
    });
}

/// Update task status
public fun update_task_status(
    cap: &ContributorCap,
    board: &Board,
    task: &mut Task,
    new_status: String,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert!(task.board_id == object::id(board), ETaskBoardMismatch);
    assert_current_version(board);
    assert!(vector_contains_string(&board.statuses, &new_status), EInvalidStatus);
    
    let sender = ctx.sender();
    let old_status = task.status;
    task.status = new_status;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskStatusChanged {
        board_id: task.board_id,
        task_id: object::id(task),
        old_status,
        new_status: task.status,
        changed_by: sender,
    });
}

/// Assign users to a task
public fun assign_task(
    cap: &ContributorCap,
    board: &Board,
    task: &mut Task,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert!(task.board_id == object::id(board), ETaskBoardMismatch);
    assert_current_version(board);
    
    let sender = ctx.sender();
    task.assignees = assignees;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskAssigned {
        board_id: task.board_id,
        task_id: object::id(task),
        assignees: task.assignees,
        assigned_by: sender,
    });
}

/// Create a subtask under a parent task
public fun create_subtask(
    cap: &ContributorCap,
    board: &mut Board,
    parent_task: &mut Task,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert!(parent_task.board_id == object::id(board), ETaskBoardMismatch);
    assert_current_version(board);
    
    // Check that parent is not itself a subtask (only one level of nesting allowed)
    assert!(option::is_none(&parent_task.parent_task_id), ECannotNestSubtasks);
    
    let sender = ctx.sender();
    assert!(!board.statuses.is_empty(), ENoStatusesDefined);
    
    let task_number = board.task_counter;
    board.task_counter = task_number + 1;
    
    let now = clock.timestamp_ms();
    
    // Validate due_date: must be 0 (no due date) or in the future
    assert!(due_date == 0 || due_date > now, EInvalidDueDate);
    
    // Subtasks start with the first status in the workflow
    let initial_status = *board.statuses.borrow(0);
    let board_id = object::id(board);
    let parent_task_oid = object::id(parent_task);
    
    let subtask = Task {
        id: object::new(ctx),
        board_id,
        task_number,
        title,
        description,
        due_date,
        status: initial_status,
        effort,
        assignees,
        creator: sender,
        created_at: now,
        updated_at: now,
        parent_task_id: option::some(parent_task_oid),
        subtask_ids: vector[],
    };
    
    let subtask_id = object::id(&subtask);
    board.task_ids.push_back(subtask_id);
    parent_task.subtask_ids.push_back(subtask_id);
    
    event::emit(SubtaskCreated {
        board_id,
        parent_task_id: parent_task_oid,
        subtask_id,
        title: subtask.title,
        creator: sender,
    });
    
    transfer::share_object(subtask);
    
    subtask_id
}

// ===== View Functions =====

/// Get board info (includes version)
public fun get_board_info(board: &Board): (String, String, u64, u64, u64) {
    (board.name, board.description, board.task_counter, board.created_at, board.version)
}

/// Get the board's configured statuses (workflow)
public fun get_board_statuses(board: &Board): vector<String> {
    board.statuses
}

/// Get all task Object IDs in a board
public fun get_board_task_ids(board: &Board): vector<ID> {
    board.task_ids
}

/// Check if a status is valid for the board
public fun is_valid_status(board: &Board, status: &String): bool {
    vector_contains_string(&board.statuses, status)
}

/// Get total task count
public fun get_task_count(board: &Board): u64 {
    board.task_counter
}

/// Get ContributorCap board_id
public fun get_contributor_cap_board_id(cap: &ContributorCap): ID {
    cap.board_id
}

/// Check if ContributorCap is valid for a board
public fun is_valid_contributor_cap(board: &Board, cap: &ContributorCap): bool {
    cap.board_id == object::id(board)
}

// ===== Task View Functions =====

/// Get the board ID that a task belongs to
public fun get_task_board_id(task: &Task): ID {
    task.board_id
}

/// Get task info
public fun get_task_info(task: &Task): (String, String, u64, String, u64, vector<address>, address, u64, u64) {
    (
        task.title,
        task.description,
        task.due_date,
        task.status,
        task.effort,
        task.assignees,
        task.creator,
        task.created_at,
        task.updated_at
    )
}

/// Get task number (sequential within board)
public fun get_task_number(task: &Task): u64 {
    task.task_number
}

/// Get parent task Object ID (returns none if this is a root task)
public fun get_parent_task_id(task: &Task): Option<ID> {
    task.parent_task_id
}

/// Get subtask Object IDs for a task
public fun get_subtask_ids(task: &Task): vector<ID> {
    task.subtask_ids
}

/// Check if a task is a subtask
public fun is_subtask(task: &Task): bool {
    option::is_some(&task.parent_task_id)
}

/// Check if a task has subtasks
public fun has_subtasks(task: &Task): bool {
    !task.subtask_ids.is_empty()
}

/// Get subtask count for a task
public fun get_subtask_count(task: &Task): u64 {
    (task.subtask_ids.length() as u64)
}

// ===== Internal Helper Functions =====

/// Check if a vector contains a string
fun vector_contains_string(vec: &vector<String>, value: &String): bool {
    let len = vec.length();
    let mut i = 0;
    while (i < len) {
        if (vec.borrow(i) == value) {
            return true
        };
        i = i + 1;
    };
    false
}

/// Find the index of a string in a vector
fun vector_index_of_string(vec: &vector<String>, value: &String): (bool, u64) {
    let len = vec.length();
    let mut i = 0;
    while (i < len) {
        if (vec.borrow(i) == value) {
            return (true, i)
        };
        i = i + 1;
    };
    (false, 0)
}

// ===== Test-only Functions =====

#[test_only]
public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
    AdminCap {
        id: object::new(ctx),
    }
}

#[test_only]
public fun create_contributor_cap_for_testing(board: &Board, ctx: &mut TxContext): ContributorCap {
    ContributorCap {
        id: object::new(ctx),
        board_id: object::id(board),
    }
}
