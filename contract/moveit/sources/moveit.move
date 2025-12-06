/// MoveIt - On-Chain Coordination & Work Management System
/// 
/// A decentralized task and project management system built on Sui.
/// Supports boards with role-based access control and full task lifecycle management.
module moveit::moveit;

use std::string::String;
use sui::event;
use sui::table::{Self, Table};
use sui::clock::Clock;

// ===== Error Codes =====
const EInvalidBoardId: u64 = 0;
const EInvalidStatus: u64 = 1;
const ETaskNotFound: u64 = 2;

// ===== Task Status Constants =====
const STATUS_OPEN: u8 = 0;
const STATUS_IN_PROGRESS: u8 = 1;
const STATUS_IN_REVIEW: u8 = 2;
const STATUS_DONE: u8 = 3;
const STATUS_CANCELLED: u8 = 4;

// ===== Core Structs =====

/// Admin capability - created once when the package is published.
/// Only the admin can create boards and manage the system.
public struct AdminCap has key, store {
    id: UID,
}

/// Board represents a workspace for organizing tasks and team members.
public struct Board has key, store {
    id: UID,
    /// Board name
    name: String,
    /// Optional description of the board
    description: String,
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
    /// Current status of the task
    status: u8,
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
    old_status: u8,
    new_status: u8,
    changed_by: address,
}

public struct TaskAssigned has copy, drop {
    board_id: ID,
    task_id: u64,
    assignees: vector<address>,
    assigned_by: address,
}

// ===== Init Function =====

/// Called once when the package is published.
/// Creates the AdminCap and transfers it to the publisher.
fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(admin_cap, ctx.sender());
}

// ===== Admin Functions (Board Management) =====

/// Create a new board (admin only).
public fun create_board(
    _: &AdminCap,
    name: String,
    description: String,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    let sender = ctx.sender();
    
    let board = Board {
        id: object::new(ctx),
        name,
        description,
        task_counter: 0,
        tasks: table::new<u64, Task>(ctx),
        created_at: clock.timestamp_ms(),
    };
    
    let board_id = object::id(&board);
    
    event::emit(BoardCreated {
        board_id,
        name: board.name,
        created_by: sender,
    });
    
    transfer::share_object(board);
    
    board_id
}

/// Entry function to create a board (admin only)
entry fun create_board_entry(
    admin_cap: &AdminCap,
    name: String,
    description: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    create_board(admin_cap, name, description, clock, ctx);
}

/// Update board metadata (admin only)
public fun update_board(
    _: &AdminCap,
    board: &mut Board,
    name: String,
    description: String,
) {
    board.name = name;
    board.description = description;
}

/// Add a contributor to a board (admin only).
/// Returns a ContributorCap for the new contributor.
public fun add_contributor(
    _: &AdminCap,
    board: &Board,
    new_contributor: address,
    ctx: &mut TxContext,
): ContributorCap {
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

/// Entry function to add a contributor and transfer the ContributorCap to them
entry fun add_contributor_entry(
    admin_cap: &AdminCap,
    board: &Board,
    new_contributor: address,
    ctx: &mut TxContext,
) {
    let contributor_cap = add_contributor(admin_cap, board, new_contributor, ctx);
    transfer::transfer(contributor_cap, new_contributor);
}

/// Emit a removal event (admin only).
/// The actual ContributorCap must be burned separately by its holder.
public fun remove_contributor(
    _: &AdminCap,
    board: &Board,
    contributor_to_remove: address,
    ctx: &TxContext,
) {
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

// ===== Task Functions (Admin) =====

/// Create a new task (admin)
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
    update_task_internal(board, task_id, title, description, due_date, effort, clock, ctx);
}

/// Update task status (admin)
public fun update_task_status_as_admin(
    _: &AdminCap,
    board: &mut Board,
    task_id: u64,
    new_status: u8,
    clock: &Clock,
    ctx: &TxContext,
) {
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
    assign_task_internal(board, task_id, assignees, clock, ctx);
}

// ===== Task Functions (Contributor) =====

/// Create a new task (contributor)
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
    update_task_internal(board, task_id, title, description, due_date, effort, clock, ctx);
}

/// Update task status (contributor)
public fun update_task_status_as_contributor(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    new_status: u8,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(cap.board_id == object::id(board), EInvalidBoardId);
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
    assign_task_internal(board, task_id, assignees, clock, ctx);
}

// ===== Entry Functions for Tasks =====

entry fun create_task_admin_entry(
    admin_cap: &AdminCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
) {
    create_task_as_admin(admin_cap, board, title, description, due_date, effort, assignees, clock, ctx);
}

entry fun create_task_contributor_entry(
    cap: &ContributorCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
) {
    create_task_as_contributor(cap, board, title, description, due_date, effort, assignees, clock, ctx);
}

// ===== View Functions =====

/// Get board info
public fun get_board_info(board: &Board): (String, String, u64, u64) {
    (board.name, board.description, board.task_counter, board.created_at)
}

/// Check if a task exists
public fun task_exists(board: &Board, task_id: u64): bool {
    board.tasks.contains(task_id)
}

/// Get task info
public fun get_task_info(board: &Board, task_id: u64): (String, String, u64, u8, u64, vector<address>, address, u64, u64) {
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

// ===== Status Constants Accessors =====

public fun status_open(): u8 { STATUS_OPEN }
public fun status_in_progress(): u8 { STATUS_IN_PROGRESS }
public fun status_in_review(): u8 { STATUS_IN_REVIEW }
public fun status_done(): u8 { STATUS_DONE }
public fun status_cancelled(): u8 { STATUS_CANCELLED }

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
    
    let task_id = board.task_counter;
    board.task_counter = task_id + 1;
    
    let now = clock.timestamp_ms();
    
    let task = Task {
        task_id,
        title,
        description,
        due_date,
        status: STATUS_OPEN,
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
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    
    let task = board.tasks.borrow_mut(task_id);
    task.title = title;
    task.description = description;
    task.due_date = due_date;
    task.effort = effort;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskUpdated {
        board_id: object::id(board),
        task_id,
        updated_by: sender,
    });
}

/// Internal function to update task status
fun update_task_status_internal(
    board: &mut Board,
    task_id: u64,
    new_status: u8,
    clock: &Clock,
    ctx: &TxContext,
) {
    let sender = ctx.sender();
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    assert!(is_valid_status(new_status), EInvalidStatus);
    
    let task = board.tasks.borrow_mut(task_id);
    let old_status = task.status;
    task.status = new_status;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskStatusChanged {
        board_id: object::id(board),
        task_id,
        old_status,
        new_status,
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
    assert!(board.tasks.contains(task_id), ETaskNotFound);
    
    let task = board.tasks.borrow_mut(task_id);
    task.assignees = assignees;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskAssigned {
        board_id: object::id(board),
        task_id,
        assignees,
        assigned_by: sender,
    });
}

/// Validate task status
fun is_valid_status(status: u8): bool {
    status == STATUS_OPEN || 
    status == STATUS_IN_PROGRESS || 
    status == STATUS_IN_REVIEW || 
    status == STATUS_DONE || 
    status == STATUS_CANCELLED
}

// ===== Test-only Functions =====

#[test_only]
public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
    AdminCap {
        id: object::new(ctx),
    }
}
