
import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// Event query endpoints
app.get('/events/moveit/board-created', async (req, res) => {
      try {
        const events = await prisma.boardCreated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-BoardCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/moveit/contributor-added', async (req, res) => {
      try {
        const events = await prisma.contributorAdded.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-ContributorAdded:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/moveit/contributor-removed', async (req, res) => {
      try {
        const events = await prisma.contributorRemoved.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-ContributorRemoved:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/moveit/task-created', async (req, res) => {
      try {
        const events = await prisma.taskCreated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-TaskCreated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/moveit/task-updated', async (req, res) => {
      try {
        const events = await prisma.taskUpdated.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-TaskUpdated:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/moveit/task-status-changed', async (req, res) => {
      try {
        const events = await prisma.taskStatusChanged.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-TaskStatusChanged:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

app.get('/events/moveit/task-assigned', async (req, res) => {
      try {
        const events = await prisma.taskAssigned.findMany();
        res.json(events);
      } catch (error) {
        console.error('Failed to fetch moveit-TaskAssigned:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
