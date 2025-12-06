#[test_only]
module moveit::moveit_tests;

use moveit::moveit::{
    Self,
    Board,
    Task,
    AdminCap,
    ContributorCap,
    create_board,
    add_contributor,
    update_board,
    add_status,
    remove_status,
    create_task,
    create_subtask,
    update_task,
    update_task_status,
    assign_task,
    burn_contributor_cap,
    get_board_info,
    get_board_statuses,
    get_board_task_ids,
    get_task_info,
    get_task_count,
    get_task_board_id,
    get_task_number,
    get_contributor_cap_board_id,
    is_valid_contributor_cap,
    is_valid_status,
    get_parent_task_id,
    get_subtask_ids,
    is_subtask,
    has_subtasks,
    get_subtask_count,
    current_version,
    needs_migration,
    create_admin_cap_for_testing,
    create_contributor_cap_for_testing,
};
use sui::test_scenario::{Self as ts, Scenario};
use sui::clock::{Self, Clock};
use std::string::{Self, String};

// Test addresses
const ADMIN: address = @0xA;
const CONTRIBUTOR1: address = @0xB;
const CONTRIBUTOR2: address = @0xC;

// ===== Helper Functions =====

fun setup_test(): Scenario {
    ts::begin(ADMIN)
}

fun create_test_clock(scenario: &mut Scenario): Clock {
    ts::next_tx(scenario, ADMIN);
    clock::create_for_testing(ts::ctx(scenario))
}

fun default_statuses(): vector<String> {
    vector[
        string::utf8(b"To-Do"),
        string::utf8(b"In-Progress"),
        string::utf8(b"Done")
    ]
}

// ===== Board Creation Tests =====

#[test]
fun test_create_board() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        
        let _board_id = create_board(
            &admin_cap,
            string::utf8(b"Test Board"),
            string::utf8(b"A test board description"),
            default_statuses(),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        
        // Verify board info
        let (name, description, task_count, _created_at, version) = get_board_info(&board);
        assert!(name == string::utf8(b"Test Board"));
        assert!(description == string::utf8(b"A test board description"));
        assert!(task_count == 0);
        assert!(version == current_version());
        assert!(!needs_migration(&board));
        
        // Verify statuses
        let statuses = get_board_statuses(&board);
        assert!(statuses.length() == 3);
        assert!(is_valid_status(&board, &string::utf8(b"To-Do")));
        assert!(is_valid_status(&board, &string::utf8(b"In-Progress")));
        assert!(is_valid_status(&board, &string::utf8(b"Done")));
        
        // Verify no tasks yet
        let task_ids = get_board_task_ids(&board);
        assert!(task_ids.is_empty());
        
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_custom_workflow() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board with custom statuses
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        
        let custom_statuses = vector[
            string::utf8(b"Blocked"),
            string::utf8(b"Backlog"),
            string::utf8(b"In-Progress"),
            string::utf8(b"Review"),
            string::utf8(b"Completed")
        ];
        
        create_board(
            &admin_cap,
            string::utf8(b"Custom Workflow Board"),
            string::utf8(b""),
            custom_statuses,
            &clock,
            ts::ctx(&mut scenario)
        );
        
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        
        // Verify custom statuses
        let statuses = get_board_statuses(&board);
        assert!(statuses.length() == 5);
        assert!(is_valid_status(&board, &string::utf8(b"Blocked")));
        assert!(is_valid_status(&board, &string::utf8(b"Backlog")));
        assert!(is_valid_status(&board, &string::utf8(b"Review")));
        assert!(is_valid_status(&board, &string::utf8(b"Completed")));
        
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_add_status() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Add new status
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        add_status(&admin_cap, &mut board, string::utf8(b"Blocked"), ts::ctx(&mut scenario));
        
        let statuses = get_board_statuses(&board);
        assert!(statuses.length() == 4);
        assert!(is_valid_status(&board, &string::utf8(b"Blocked")));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_remove_status() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Remove status
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        remove_status(&admin_cap, &mut board, string::utf8(b"In-Progress"), ts::ctx(&mut scenario));
        
        let statuses = get_board_statuses(&board);
        assert!(statuses.length() == 2);
        assert!(!is_valid_status(&board, &string::utf8(b"In-Progress")));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test, expected_failure(abort_code = moveit::ECannotRemoveLastStatus)]
fun test_cannot_remove_last_status() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board with single status
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Board"), string::utf8(b""), vector[string::utf8(b"Only-Status")], &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Try to remove the only status - should fail
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        remove_status(&admin_cap, &mut board, string::utf8(b"Only-Status"), ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

// ===== Membership Tests =====

#[test]
fun test_add_contributor() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Team Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Add contributor
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        add_contributor(
            &admin_cap,
            &board,
            CONTRIBUTOR1,
            ts::ctx(&mut scenario)
        );
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    // Verify contributor cap is valid for the board
    ts::next_tx(&mut scenario, CONTRIBUTOR1);
    {
        let board = ts::take_shared<Board>(&scenario);
        let contributor_cap = ts::take_from_sender<ContributorCap>(&scenario);
        
        assert!(is_valid_contributor_cap(&board, &contributor_cap));
        
        ts::return_to_sender(&scenario, contributor_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_burn_contributor_cap() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board and add contributor
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Team Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        add_contributor(&admin_cap, &board, CONTRIBUTOR1, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    // Contributor burns their own cap
    ts::next_tx(&mut scenario, CONTRIBUTOR1);
    {
        let contributor_cap = ts::take_from_sender<ContributorCap>(&scenario);
        burn_contributor_cap(contributor_cap);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

// ===== Task Creation Tests =====

#[test]
fun test_create_task() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create task with contributor cap
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        let task_id = create_task(
            &contributor_cap,
            &mut board,
            string::utf8(b"Implement feature X"),
            string::utf8(b"Detailed description of feature X"),
            1865756800000, // Future date
            5,
            vector[ADMIN],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        assert!(get_task_count(&board) == 1);
        
        // Verify task ID is in board
        let task_ids = get_board_task_ids(&board);
        assert!(task_ids.length() == 1);
        assert!(*task_ids.borrow(0) == task_id);
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Verify task object
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let task = ts::take_shared<Task>(&scenario);
        
        // Verify task info
        let (title, description, due_date, status, effort, assignees, creator, _created_at, _updated_at) = 
            get_task_info(&task);
        
        assert!(title == string::utf8(b"Implement feature X"));
        assert!(description == string::utf8(b"Detailed description of feature X"));
        assert!(due_date == 1865756800000);
        assert!(status == string::utf8(b"To-Do"));
        assert!(effort == 5);
        assert!(assignees == vector[ADMIN]);
        assert!(creator == ADMIN);
        
        // Verify task knows its board
        assert!(get_task_board_id(&task) == object::id(&board));
        assert!(get_task_number(&task) == 0);
        
        ts::return_shared(task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

// ===== Task Tests (with ContributorCap) =====

#[test]
fun test_contributor_create_task() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Add contributor
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        add_contributor(&admin_cap, &board, CONTRIBUTOR1, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    // Contributor creates task
    ts::next_tx(&mut scenario, CONTRIBUTOR1);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = ts::take_from_sender<ContributorCap>(&scenario);
        
        create_task(
            &contributor_cap,
            &mut board,
            string::utf8(b"Bug fix"),
            string::utf8(b"Fix the bug"),
            0,
            2,
            vector[CONTRIBUTOR1],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        ts::return_to_sender(&scenario, contributor_cap);
        ts::return_shared(board);
    };
    
    // Verify task
    ts::next_tx(&mut scenario, CONTRIBUTOR1);
    {
        let task = ts::take_shared<Task>(&scenario);
        
        let (_, _, _, status, _, _, _, _, _) = get_task_info(&task);
        assert!(status == string::utf8(b"To-Do"));
        
        ts::return_shared(task);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_update_task() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(
            &contributor_cap,
            &mut board,
            string::utf8(b"Original title"),
            string::utf8(b"Original description"),
            0,
            3,
            vector[],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Update task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let mut task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        update_task(
            &contributor_cap,
            &board,
            &mut task,
            string::utf8(b"Updated title"),
            string::utf8(b"Updated description"),
            1865756800000,
            8,
            &clock,
            ts::ctx(&mut scenario)
        );
        
        let (title, description, due_date, _, effort, _, _, _, _) = get_task_info(&task);
        
        assert!(title == string::utf8(b"Updated title"));
        assert!(description == string::utf8(b"Updated description"));
        assert!(due_date == 1865756800000);
        assert!(effort == 8);
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_update_task_status_flow() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(
            &contributor_cap,
            &mut board,
            string::utf8(b"Task"),
            string::utf8(b"Description"),
            0,
            1,
            vector[],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Update status through workflow
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let mut task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        let (_, _, _, status, _, _, _, _, _) = get_task_info(&task);
        assert!(status == string::utf8(b"To-Do"));
        
        // Update to In-Progress
        update_task_status(&contributor_cap, &board, &mut task, string::utf8(b"In-Progress"), &clock, ts::ctx(&mut scenario));
        let (_, _, _, new_status, _, _, _, _, _) = get_task_info(&task);
        assert!(new_status == string::utf8(b"In-Progress"));
        
        // Update to Done
        update_task_status(&contributor_cap, &board, &mut task, string::utf8(b"Done"), &clock, ts::ctx(&mut scenario));
        let (_, _, _, final_status, _, _, _, _, _) = get_task_info(&task);
        assert!(final_status == string::utf8(b"Done"));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_assign_task() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create task and assign
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(
            &contributor_cap,
            &mut board,
            string::utf8(b"Task"),
            string::utf8(b"Description"),
            0,
            1,
            vector[],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Assign task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let mut task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        assign_task(
            &contributor_cap,
            &board,
            &mut task,
            vector[CONTRIBUTOR1, CONTRIBUTOR2],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        let (_, _, _, _, _, assignees, _, _, _) = get_task_info(&task);
        assert!(assignees == vector[CONTRIBUTOR1, CONTRIBUTOR2]);
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_create_multiple_tasks() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create multiple tasks
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(&contributor_cap, &mut board, string::utf8(b"Task 1"), string::utf8(b"First task"), 0, 1, vector[], &clock, ts::ctx(&mut scenario));
        create_task(&contributor_cap, &mut board, string::utf8(b"Task 2"), string::utf8(b"Second task"), 0, 2, vector[], &clock, ts::ctx(&mut scenario));
        create_task(&contributor_cap, &mut board, string::utf8(b"Task 3"), string::utf8(b"Third task"), 0, 3, vector[], &clock, ts::ctx(&mut scenario));
        
        assert!(get_task_count(&board) == 3);
        let task_ids = get_board_task_ids(&board);
        assert!(task_ids.length() == 3);
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test, expected_failure(abort_code = moveit::EInvalidStatus)]
fun test_invalid_status_fails() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(&contributor_cap, &mut board, string::utf8(b"Task"), string::utf8(b"Description"), 0, 1, vector[], &clock, ts::ctx(&mut scenario));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Try invalid status
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let mut task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        // "Invalid-Status" is not in the board's workflow
        update_task_status(&contributor_cap, &board, &mut task, string::utf8(b"Invalid-Status"), &clock, ts::ctx(&mut scenario));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

// ===== Board Update Tests =====

#[test]
fun test_update_board() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Original Name"), string::utf8(b"Original Description"), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Update board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        update_board(
            &admin_cap,
            &mut board,
            string::utf8(b"New Name"),
            string::utf8(b"New Description"),
        );
        
        let (name, description, _, _, _) = get_board_info(&board);
        assert!(name == string::utf8(b"New Name"));
        assert!(description == string::utf8(b"New Description"));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

// ===== Capability Tests =====

#[test]
fun test_contributor_cap_board_id() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Add contributor
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        add_contributor(&admin_cap, &board, CONTRIBUTOR1, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    // Verify board ID matches
    ts::next_tx(&mut scenario, CONTRIBUTOR1);
    {
        let board = ts::take_shared<Board>(&scenario);
        let contributor_cap = ts::take_from_sender<ContributorCap>(&scenario);
        
        let contributor_board_id = get_contributor_cap_board_id(&contributor_cap);
        assert!(contributor_board_id == object::id(&board));
        
        ts::return_to_sender(&scenario, contributor_cap);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test, expected_failure(abort_code = moveit::EInvalidBoardId)]
fun test_contributor_wrong_board_fails() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create first board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Board 1"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Add contributor to first board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let board = ts::take_shared<Board>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        
        add_contributor(&admin_cap, &board, CONTRIBUTOR1, ts::ctx(&mut scenario));
        
        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(board);
    };
    
    // Create second board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
        create_board(&admin_cap, string::utf8(b"Board 2"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        ts::return_to_sender(&scenario, admin_cap);
    };
    
    // Try to use contributor cap from board 1 on board 2 - should fail
    ts::next_tx(&mut scenario, CONTRIBUTOR1);
    {
        // Take the second board (most recently created)
        let mut board2 = ts::take_shared<Board>(&scenario);
        let contributor_cap = ts::take_from_sender<ContributorCap>(&scenario);
        
        // This should fail because the cap is for board 1
        create_task(
            &contributor_cap,
            &mut board2,
            string::utf8(b"Task"),
            string::utf8(b"Description"),
            0,
            1,
            vector[],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        ts::return_to_sender(&scenario, contributor_cap);
        ts::return_shared(board2);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

// ===== Subtask Tests =====

#[test]
fun test_create_subtask() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create parent task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(
            &contributor_cap,
            &mut board,
            string::utf8(b"Parent Task"),
            string::utf8(b"Main task"),
            0,
            10,
            vector[],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Create subtask
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let mut parent_task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        assert!(!is_subtask(&parent_task));
        assert!(!has_subtasks(&parent_task));
        
        let subtask_id = create_subtask(
            &contributor_cap,
            &mut board,
            &mut parent_task,
            string::utf8(b"Subtask 1"),
            string::utf8(b"First subtask"),
            0,
            3,
            vector[],
            &clock,
            ts::ctx(&mut scenario)
        );
        
        assert!(has_subtasks(&parent_task));
        assert!(get_subtask_count(&parent_task) == 1);
        
        let subtask_ids = get_subtask_ids(&parent_task);
        assert!(subtask_ids.length() == 1);
        assert!(*subtask_ids.borrow(0) == subtask_id);
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(parent_task);
        ts::return_shared(board);
    };
    
    // Verify subtask
    ts::next_tx(&mut scenario, ADMIN);
    {
        // Take subtask (second shared Task object)
        let parent_task = ts::take_shared<Task>(&scenario);
        let subtask = ts::take_shared<Task>(&scenario);
        
        assert!(is_subtask(&subtask));
        let parent_id_opt = get_parent_task_id(&subtask);
        assert!(option::is_some(&parent_id_opt));
        assert!(*option::borrow(&parent_id_opt) == object::id(&parent_task));
        
        ts::return_shared(subtask);
        ts::return_shared(parent_task);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test]
fun test_multiple_subtasks() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Project Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create parent task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(&contributor_cap, &mut board, string::utf8(b"Epic"), string::utf8(b""), 0, 20, vector[], &clock, ts::ctx(&mut scenario));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Create 3 subtasks
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let mut parent_task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_subtask(&contributor_cap, &mut board, &mut parent_task, string::utf8(b"Subtask 1"), string::utf8(b""), 0, 5, vector[], &clock, ts::ctx(&mut scenario));
        create_subtask(&contributor_cap, &mut board, &mut parent_task, string::utf8(b"Subtask 2"), string::utf8(b""), 0, 5, vector[], &clock, ts::ctx(&mut scenario));
        create_subtask(&contributor_cap, &mut board, &mut parent_task, string::utf8(b"Subtask 3"), string::utf8(b""), 0, 5, vector[], &clock, ts::ctx(&mut scenario));
        
        assert!(get_subtask_count(&parent_task) == 3);
        assert!(get_task_count(&board) == 4); // 1 parent + 3 subtasks
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(parent_task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}

#[test, expected_failure(abort_code = moveit::ECannotNestSubtasks)]
fun test_cannot_nest_subtasks() {
    let mut scenario = setup_test();
    let clock = create_test_clock(&mut scenario);
    
    // Create board
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = create_admin_cap_for_testing(ts::ctx(&mut scenario));
        create_board(&admin_cap, string::utf8(b"Board"), string::utf8(b""), default_statuses(), &clock, ts::ctx(&mut scenario));
        transfer::public_transfer(admin_cap, ADMIN);
    };
    
    // Create parent task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_task(&contributor_cap, &mut board, string::utf8(b"Parent"), string::utf8(b""), 0, 10, vector[], &clock, ts::ctx(&mut scenario));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(board);
    };
    
    // Create subtask
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let mut parent_task = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        create_subtask(&contributor_cap, &mut board, &mut parent_task, string::utf8(b"Subtask"), string::utf8(b""), 0, 5, vector[], &clock, ts::ctx(&mut scenario));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(parent_task);
        ts::return_shared(board);
    };
    
    // Try to create subtask of subtask - should fail
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut board = ts::take_shared<Board>(&scenario);
        let _parent_task = ts::take_shared<Task>(&scenario);
        let mut subtask = ts::take_shared<Task>(&scenario);
        let contributor_cap = create_contributor_cap_for_testing(&board, ts::ctx(&mut scenario));
        
        // Try to make subtask a parent - should fail
        create_subtask(&contributor_cap, &mut board, &mut subtask, string::utf8(b"Nested"), string::utf8(b""), 0, 2, vector[], &clock, ts::ctx(&mut scenario));
        
        burn_contributor_cap(contributor_cap);
        ts::return_shared(subtask);
        ts::return_shared(_parent_task);
        ts::return_shared(board);
    };
    
    clock.destroy_for_testing();
    ts::end(scenario);
}
