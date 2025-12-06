/// MoveIt - On-Chain Coordination & Work Management System
/// 
/// A decentralized task and project management system built on Sui.
/// Supports boards with configurable workflows, role-based access control, 
/// and full task lifecycle management.
/// 
/// This contract is upgradeable and uses versioned objects for future-proofing.
module moveit::moveit;

use std::string::String;
use sui::event;
use sui::table::{Self, Table};
use sui::clock::Clock;
use sui::package;
use sui::dynamic_field;

// ===== Version Constants =====
const VERSION: u64 = 1;

// ===== Error Codes =====
const EInvalidBoardId: u64 = 0;
const EInvalidStatus: u64 = 1;
const ETaskNotFound: u64 = 2;
const EStatusAlreadyExists: u64 = 3;
const EStatusNotFound: u64 = 4;
const ECannotRemoveLastStatus: u64 = 5;
const ENoStatusesDefined: u64 = 6;
const EWrongVersion: u64 = 7;
const ENotUpgraded: u64 = 8;

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
    /// All tasks in this board (task_id -> Task)
    tasks: Table<u64, Task>,
    /// Timestamp of board creation
    created_at: u64,
}

/// Task represents a unit of work within a board
public struct Task has store {
    /// Unique task ID within the board
    task_id: u64,
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

public struct ContributorRemoved has copy, drop {
    board_id: ID,
    contributor: address,
    removed_by: address,
}

public struct TaskCreated has copy, drop {
    board_id: ID,
    task_id: u64,
    title: String,
    creator: address,
}

public struct TaskUpdated has copy, drop {
    board_id: ID,
    task_id: u64,
    updated_by: address,
}

public struct TaskStatusChanged has copy, drop {
    board_id: ID,
    task_id: u64,
    old_status: String,
    new_status: String,
    changed_by: address,
}

public struct TaskAssigned has copy, drop {
    board_id: ID,
    task_id: u64,
    assignees: vector<address>,
    assigned_by: address,
}

public struct BoardMigrated has copy, drop {
    board_id: ID,
    old_version: u64,
    new_version: u64,
    migrated_by: address,
}

// ===== Init Function =====

/// Called once when the package is published.
/// Creates the AdminCap and transfers it to the publisher.
/// The UpgradeCap is automatically created by Sui and should be kept safe.
fun init(otw: MOVEIT, ctx: &mut TxContext) {
    // Claim publisher capability (useful for Display objects)
    let publisher = package::claim(otw, ctx);
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
    
    // Version 1 -> 2 migration logic would go here
    // Example: if (old_version == 1) { ... migrate to v2 ... }
    
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
        tasks: table::new<u64, Task>(ctx),
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
/// Returns a ContributorCap for the new contributor.
public fun add_contributor(
    _: &AdminCap,
    board: &Board,
    new_contributor: address,
    ctx: &mut TxContext,
): ContributorCap {
    assert_current_version(board);
    let sender = ctx.sender();
    
    event::emit(ContributorAdded {
        board_id: object::id(board),
        contributor: new_contributor,
        added_by: sender,
    });
    
    ContributorCap {
        id: object::new(ctx),
        board_id: object::id(board),
    }
}

/// Emit a removal event (admin only).
/// The actual ContributorCap must be burned separately by its holder.
public fun remove_contributor(
    _: &AdminCap,
    board: &Board,
    contributor_to_remove: address,
    ctx: &TxContext,
) {
    assert_current_version(board);
    let sender = ctx.sender();
    
    event::emit(ContributorRemoved {
        board_id: object::id(board),
        contributor: contributor_to_remove,
        removed_by: sender,
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

// ===== Task Functions (Admin) =====

/// Create a new task (admin). Task starts with the first status in the workflow.
public fun create_task_as_admin(
    _: &AdminCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
): u64 {
    assert_current_version(board);
    create_task_internal(board, title, description, due_date, effort, assignees, clock, ctx)
}

/// Update task details (admin)
public fun update_task_as_admin(
    _: &AdminCap,
    board: &mut Board,
    task_id: u64,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert_current_version(board);
    update_task_internal(board, task_id, title, description, due_date, effort, clock, ctx);
}

/// Update task status (admin)
public fun update_task_status_as_admin(
    _: &AdminCap,
    board: &mut Board,
    task_id: u64,
    new_status: String,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert_current_version(board);
    update_task_status_internal(board, task_id, new_status, clock, ctx);
}

/// Assign users to a task (admin)
public fun assign_task_as_admin(
    _: &AdminCap,
    board: &mut Board,
    task_id: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert_current_version(board);
    assign_task_internal(board, task_id, assignees, clock, ctx);
}

// ===== Task Functions (Contributor) =====

/// Create a new task (contributor). Task starts with the first status in the workflow.
public fun create_task_as_contributor(
    cap: &ContributorCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
): u64 {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert_current_version(board);
    create_task_internal(board, title, description, due_date, effort, assignees, clock, ctx)
}

/// Update task details (contributor)
public fun update_task_as_contributor(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert_current_version(board);
    update_task_internal(board, task_id, title, description, due_date, effort, clock, ctx);
}

/// Update task status (contributor)
public fun update_task_status_as_contributor(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    new_status: String,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert_current_version(board);
    update_task_status_internal(board, task_id, new_status, clock, ctx);
}

/// Assign users to a task (contributor)
public fun assign_task_as_contributor(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
    assert_current_version(board);
    assign_task_internal(board, task_id, assignees, clock, ctx);
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

/// Check if a status is valid for the board
public fun is_valid_status(board: &Board, status: &String): bool {
    vector_contains_string(&board.statuses, status)
}

/// Check if a task exists
public fun task_exists(board: &Board, task_id: u64): bool {
    board.tasks.contains(task_id)
}

/// Get task info
public fun get_task_info(board: &Board, task_id: u64): (String, String, u64, String, u64, vector<address>, address, u64, u64) {
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    let task = board.tasks.borrow(task_id);
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

// ===== Internal Helper Functions =====

/// Internal function to create a task
fun create_task_internal(
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
): u64 {
    let sender = ctx.sender();
    assert!(!board.statuses.is_empty(), ENoStatusesDefined);
    
    let task_id = board.task_counter;
    board.task_counter = task_id + 1;
    
    let now = clock.timestamp_ms();
    
    // New tasks start with the first status in the workflow
    let initial_status = *board.statuses.borrow(0);
    
    let task = Task {
        task_id,
        title,
        description,
        due_date,
        status: initial_status,
        effort,
        assignees,
        creator: sender,
        created_at: now,
        updated_at: now,
    };
    
    board.tasks.add(task_id, task);
    
    event::emit(TaskCreated {
        board_id: object::id(board),
        task_id,
        title: board.tasks.borrow(task_id).title,
        creator: sender,
    });
    
    task_id
}

/// Internal function to update task details
fun update_task_internal(
    board: &mut Board,
    task_id: u64,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    let sender = ctx.sender();
    let board_id = object::id(board);
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    
    let task = board.tasks.borrow_mut(task_id);
    task.title = title;
    task.description = description;
    task.due_date = due_date;
    task.effort = effort;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskUpdated {
        board_id,
        task_id,
        updated_by: sender,
    });
}

/// Internal function to update task status
fun update_task_status_internal(
    board: &mut Board,
    task_id: u64,
    new_status: String,
    clock: &Clock,
    ctx: &TxContext,
) {
    let sender = ctx.sender();
    let board_id = object::id(board);
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    assert!(vector_contains_string(&board.statuses, &new_status), EInvalidStatus);
    
    let task = board.tasks.borrow_mut(task_id);
    let old_status = task.status;
    task.status = new_status;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskStatusChanged {
        board_id,
        task_id,
        old_status,
        new_status: task.status,
        changed_by: sender,
    });
}

/// Internal function to assign task
fun assign_task_internal(
    board: &mut Board,
    task_id: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
) {
    let sender = ctx.sender();
    let board_id = object::id(board);
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    
    let task = board.tasks.borrow_mut(task_id);
    task.assignees = assignees;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskAssigned {
        board_id,
        task_id,
        assignees: task.assignees,
        assigned_by: sender,
    });
}

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
