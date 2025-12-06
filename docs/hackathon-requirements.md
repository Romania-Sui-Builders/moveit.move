# Builder Forge Bucharest Sui Move Bootcamp

## 💼 The Challenge

### Build an On-Chain Coordination & Work Management System

### 💡 Core Functional Requirements

**🔹 Board Creation & Ownership**

- System must allow users to create **Boards,** representing a workspace.
- Boards need to contain metadata, such as name and optional description.

🔹 **Membership & Access Control**

- Boards must support **adding members**.
- At least **two access levels (that need to be managed on-chain)** are required:
  - **Contributor:** may create and update tasks.
  - **Administrator:** may manage members and workspace configuration.

🔹 **Task / Issue Management**

- Users with sufficient permissions must be able to create **Tasks**, storing information as title, description, due date / expiry, status, effort estimation)
- Each task can be assigned to one/multiple user(s)
- Tasks must be **mutable on-chain**, allowing authorised users to edit attributes, reassign work, or change status.

### ⭐ Bonus Functional Features (Optional / Extra Credit)

These are a couple of ideas on things that you could implement to turn your dapp into an advanced collaboration tool that can be used in the real world. Feel free to implement these ones or get creative and make your dapp unique in your own way.

✨ **Configurable Workflow**

The workflow in each board can be configured by administrators. For example, users with a specific access level could define valid statuses for the tasks of this board (e.g., Blocked, To-Do, In-Progress, Completed)

✨ **Hierarchical Tasks (Sub-Tasks)**

Boards may support creating subtasks, enabling parent/child relationships for more productive tracking of the workload.

✨ **Discussion / Collaboration Layer**

Tasks may support a comment or message stream stored on-chain.

✨ **Advanced Metadata Per Task**

Boards may support creating:

- milestones, so that tasks can be grouped based on their timeline / functionality.
- tags/labels, so that tasks can be marked based on their functionality (eg if a software engineering team is building a board for tracking the progress on their products, they could have a “Frontend” or a “Backend” label

✨ **Board Insights / Analytics Logic**

Boards may maintain or compute statistics, such as:

- count of tasks in each status,
- count of completed per user,
- overdue tasks.

## 🧠 Technical Requirements

Your submission should include:

✅ **Smart Contract (Move module)** demonstrating

- Deciding between using shared/party/owned objects for modelling the storage layer of the dapp
- Capability objects for access control on the corresponding functions
- **Working with data structures to build collections** e.g. `vector` , `Table`

✅ **Move Tests** verifying your smart contract logic

- Your functions and flows should be tested with move tests. The more scenarios that you cover in your tests (test coverage), the better.

✅ **Frontend (React / Typescript)** that allows users to

- Connect their wallet using dapp kit
- Reading and displaying **on-chain data**, such as Boards, Issues
- Submitting transactions to update the on-chain state

## 🏅 Bonus Points

Earn extra credit by using:

- **Dynamic fields**
  - https://docs.sui.io/concepts/dynamic-fields
- **Display Object**
  - https://docs.sui.io/standards/display
- **Contract Upgradeability**
  - Future-proof your contract by allowing controlled upgrades using a **versioned object** or admin capability.
- **Clock object**
  - Store important date-time information on your objects (created at, updated at)
    - [https://docs.sui.io/guides/developer/sui-101/ac](https://docs.sui.io/guides/developer/sui-101/access-time)
- **More components of the Sui stack**
  - You can utilise [SuiNS](https://docs.suins.io/developer) via [Enoki Indentity Subnames](https://docs.enoki.mystenlabs.com/subnames) to allow your users claim human readable names, and use these ones to refer to other users (eg when inviting them to the board) instead of their full address
  - You can utilise [zklogin](https://sui.io/zklogin) and gas sponsorship via [Enoki](https://docs.enoki.mystenlabs.com/) so that users do not need to pay for their interactions, or deal with wallet popups
- **Integration Tests with Jest**
  - Eg a basic end-to-end flow test (create a board → create a new issue) at the TypeScript level.

## Submission Guidelines

All participating teams must submit their projects through **DeepSurge,** the official hackathon submission platform.

[How to Register/Submit on DeepSurge](https://www.notion.so/How-to-Register-Submit-on-DeepSurge-2bf6d9dcb4e98124a192fa5be2dfde68?pvs=21)

Submit your project **before the deadline: Saturday December 6th, 2025 at 17:00 (EET)**

> ⚠️ Late submissions will not be accepted, so please ensure your project is finalized and submitted before the deadline.

## Judging Criteria

Here’s how your project will be evaluated by our judging panel. While scoring specifics may vary per judge, these are the core criteria they’ll be using to assess all submissions:

🛠️ **Technical Implementation (30%)**

The quality, functionality, and technical depth of the solution, especially how effectively it uses Sui Move.

🧠 **Creativity & Bonus Features (20%)**

Go the extra mille implementing advanced Move topics and adding extra functionality to your dapp.

🎤 **Pitch Quality/Presentation (10%)**

How clearly and convincingly the team presented their idea and solution.

📦 **Product Completeness (25%)**

Core functionality implementation and fully client integration with the Blockchain.

🌐 **User Experience & Design (15%)**

Visual quality, readability, responsive UI, etc.

## Pitching & Demo Guidelines

Each team will have the opportunity to present its project to the judging panel and audience.

This is your moment to **showcase your creativity, technical execution, and impact.** Make it count!

### Format

- **Pitch Duration:** Up to **5 minutes** per project demo
- **Q&A Session:** Optional **up to 4 minutes** of questions from the judges
- **Total Time per Team:** Maximum of **9 minutes**

### What to Include in Your Pitch

Your presentation should cover:

1. **Your Solution** - How your project tackles the problem and why it’s unique.
2. **Sui Integration** - Show how your app uses Sui and any related tools (e.g., Walrus, Seal).
3. **Demo** - Live demo preferred, or a 3-5 minute video if live presentation isn’t possible.
4. **Impact & Future Plans** - How your project could evolve beyond the hackathon.

### Tips for a Great Demo

- Focus on **clarity over quantity,** show the most important features clearly.
- Rehearse your presentation to stay within time limits.
- If using slides, keep them short and visual.
- Prepare a backup recording or screenshots in case of technical issues.

### Reminders

- Presentations will take place **on-site** at the event venue.
- A projector and HDMI cable will be provided, please bring your own adapters if needed.
- If you prefer, you may play a **pre-recorded demo video** (≤ 5 minutes).
- Teams should arrive **10 minutes before their slot** to ensure setup runs smoothly.

### Judging Flow

After each demo:

- Judges may ask brief follow-up questions (max 4 minutes).
- Scoring will be done **individually and asynchronously** to minimize bias.
