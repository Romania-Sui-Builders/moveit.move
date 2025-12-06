import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './db';
import { setupListeners } from './indexer/event-indexer';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Event query endpoints
app.get('/events/moveit/board-migrated', async (req, res) => {
    try {
        const events = await prisma.boardMigrated.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch BoardMigrated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/board-created', async (req, res) => {
    try {
        const events = await prisma.boardCreated.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch BoardCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/status-added', async (req, res) => {
    try {
        const events = await prisma.statusAdded.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch StatusAdded:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/status-removed', async (req, res) => {
    try {
        const events = await prisma.statusRemoved.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch StatusRemoved:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/contributor-added', async (req, res) => {
    try {
        const events = await prisma.contributorAdded.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch ContributorAdded:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/task-created', async (req, res) => {
    try {
        const events = await prisma.taskCreated.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch TaskCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/task-updated', async (req, res) => {
    try {
        const events = await prisma.taskUpdated.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch TaskUpdated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/task-status-changed', async (req, res) => {
    try {
        const events = await prisma.taskStatusChanged.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch TaskStatusChanged:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/task-assigned', async (req, res) => {
    try {
        const events = await prisma.taskAssigned.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch TaskAssigned:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/subtask-created', async (req, res) => {
    try {
        const events = await prisma.subtaskCreated.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch SubtaskCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/moveit/comment-added', async (req, res) => {
    try {
        const events = await prisma.commentAdded.findMany();
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch CommentAdded:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

const PORT = process.env.PORT || 3000;

async function main() {
    // Start the Express API server
    app.listen(PORT, () => {
        console.log(`🚀 API server running on port ${PORT}`);
    });

    // Start the event indexer
    console.log('📡 Starting Sui event indexer...');
    await setupListeners();
}

main().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
