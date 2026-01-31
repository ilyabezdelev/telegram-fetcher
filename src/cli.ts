#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { profileAdd, profileList, profileRemove } from './commands/profile.js';

const program = new Command();

program
  .name('telegram-fetch')
  .description('CLI tool to fetch latest messages from Telegram bots, channels, and groups')
  .version('0.1.0');

// Init command
program
  .command('init')
  .description('Initialize telegram-fetcher in current directory')
  .action(async () => {
    try {
      await init();
    } catch (error) {
      console.error();
      console.error('✗ Error:', error instanceof Error ? error.message : String(error));
      console.error();
      process.exit(1);
    }
  });

// Profile commands
const profileCommand = program.command('profile').description('Manage bot profiles');

profileCommand
  .command('add')
  .description('Add a new bot profile')
  .action(async () => {
    try {
      await profileAdd();
    } catch (error) {
      console.error();
      console.error('✗ Error:', error instanceof Error ? error.message : String(error));
      console.error();
      process.exit(1);
    }
  });

profileCommand
  .command('list')
  .description('List all bot profiles')
  .action(async () => {
    try {
      await profileList();
    } catch (error) {
      console.error();
      console.error('✗ Error:', error instanceof Error ? error.message : String(error));
      console.error();
      process.exit(1);
    }
  });

profileCommand
  .command('remove')
  .description('Remove a bot profile')
  .action(async () => {
    try {
      await profileRemove();
    } catch (error) {
      console.error();
      console.error('✗ Error:', error instanceof Error ? error.message : String(error));
      console.error();
      process.exit(1);
    }
  });

// Main fetch command (placeholder for now)
program.action(() => {
  console.log();
  console.log('Main fetch command not implemented yet.');
  console.log('Run "telegram-fetch init" to set up a directory.');
  console.log();
});

program.parse();
