# nice-sequelize-logger

## Install

Install with `npm`:

```bash
npm i github:FullstackAcademy/nice-sequelize-logger
```

Then, to add the logger to your app, add code that looks something like this wherever you initialize your `new Sequelize` instance.

```js
const Sequelize = require("sequelize");
const { createNiceSequelizeLoggerConfig } = require("nice-sequelize-logger");

const niceLoggerConfig = createNiceSequelizeLoggerConfig();

const db = new Sequelize("postgres://localhost:5432/database-name", {
  ...niceLoggerConfig,
});

module.exports = db;
```

## Actually Getting The Log Messages To Show Up

The logger checks an environment variable is set before logging: `if (process.env.LOG_SQL_STATEMENTS === "true")`.

This can be set at startup time:

```bash
LOG_SQL_STATEMENTS=true node my-server.js
```

It can also be used to hide certain log messages. Syncing a database spits out a lot of sql even if nothing actually changes. It's a common pattern to call sync when an application boots, so it can be nice to hide that output.


```js
app.listen(3000, async function() {
  console.log(`The server is listening closely on port ${PORT}`);
  try {
    process.env.LOG_SQL_STATEMENTS = false;
    await db.sync();
    process.env.LOG_SQL_STATEMENTS = true;
    console.log("Synchronized the database.");
  }
  catch (error) {
    console.error("Error while synchronizing the database.");
    console.error(error);
  }
});
```

## Update
In order to update we need to update the `package-lock.json` file to point to the latest commit on github.

npm will resolve this for us if we ask it to re-install.

```bash
npm i github:FullstackAcademy/nice-sequelize-logger
git add package.json
git add package-lock.json
```
