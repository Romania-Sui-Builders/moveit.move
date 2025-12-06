
import { SuiEvent } from '@mysten/sui/client';
import { prisma, Prisma } from '../db';

export const handleMoveitEvents = async (events: SuiEvent[], type: string) => {
  const eventsByType = new Map<string, any[]>();
  
  for (const event of events) {
    if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
    const eventData = eventsByType.get(event.type) || [];
    eventData.push(event.parsedJson);
    eventsByType.set(event.type, eventData);
  }

  await Promise.all(
    Array.from(eventsByType.entries()).map(async ([eventType, events]) => {
      const eventName = eventType.split('::').pop() || eventType;
      switch (eventName) {
        case 'BoardMigrated':
          // TODO: handle BoardMigrated
          await prisma.boardMigrated.createMany({
            data: events as Prisma.BoardMigratedCreateManyInput[],
          });
          console.log('Created BoardMigrated events');
          break;
        case 'BoardCreated':
          // TODO: handle BoardCreated
          await prisma.boardCreated.createMany({
            data: events as Prisma.BoardCreatedCreateManyInput[],
          });
          console.log('Created BoardCreated events');
          break;
        case 'StatusAdded':
          // TODO: handle StatusAdded
          await prisma.statusAdded.createMany({
            data: events as Prisma.StatusAddedCreateManyInput[],
          });
          console.log('Created StatusAdded events');
          break;
        case 'StatusRemoved':
          // TODO: handle StatusRemoved
          await prisma.statusRemoved.createMany({
            data: events as Prisma.StatusRemovedCreateManyInput[],
          });
          console.log('Created StatusRemoved events');
          break;
        case 'ContributorAdded':
          // TODO: handle ContributorAdded
          await prisma.contributorAdded.createMany({
            data: events as Prisma.ContributorAddedCreateManyInput[],
          });
          console.log('Created ContributorAdded events');
          break;
        case 'TaskCreated':
          // TODO: handle TaskCreated
          await prisma.taskCreated.createMany({
            data: events as Prisma.TaskCreatedCreateManyInput[],
          });
          console.log('Created TaskCreated events');
          break;
        case 'TaskUpdated':
          // TODO: handle TaskUpdated
          await prisma.taskUpdated.createMany({
            data: events as Prisma.TaskUpdatedCreateManyInput[],
          });
          console.log('Created TaskUpdated events');
          break;
        case 'TaskStatusChanged':
          // TODO: handle TaskStatusChanged
          await prisma.taskStatusChanged.createMany({
            data: events as Prisma.TaskStatusChangedCreateManyInput[],
          });
          console.log('Created TaskStatusChanged events');
          break;
        case 'TaskAssigned':
          // TODO: handle TaskAssigned
          await prisma.taskAssigned.createMany({
            data: events as Prisma.TaskAssignedCreateManyInput[],
          });
          console.log('Created TaskAssigned events');
          break;
        default:
          console.log('Unknown event type:', eventName);
      }
    }),
  );
};
