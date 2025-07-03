When working on task in the TODO section, once complete, move to the DONE section.





[] for configuration management, use the database:
use /Users/tylerhenry/Desktop/whttlr/electron-app/config as the default values
/Users/tylerhenry/Desktop/whttlr/electron-app/src/services/config/ConfigLoader.ts

check database for existing config, and use that.
when updating configs in the ui, update the database.
can store values in localStorage for quick access, but also update the database.

saving plugin settings to database.
giving plugins access to updating a specific table in the database for their own settings.

saving machine configurations to the database.
saving selected machine to database
adding limits min/max for each axis. speed limit. 
add a new table for feed/speeds for tools and materials and operations by machine.

when users click on 'download' or 'install' for a plugin, send an command to increment the value of a 'stats' table in the database for the plugin.  this could be a plugin_stats table, with downloads, likes, stars, installs.

[] TODO gcode run history.





[] Add hooks to claude
[] look for other claude features
[] git actions perform build and update download link?
[] add ducusaurces like did for plugign rgistry - or piggy back it


TODO:
- [] Update playwright tests to open the main application window
- [] Lets add to .gitignore a sqlite
- [] update readme to include npx prisma migrate dev --name init when updating the database schema
- [] using prisma to save the current state of the application
--- include
-- [] installed plugins
-- [] state of plugins / enabled / disabled / custom settings
-- [] history of commands

DONE: