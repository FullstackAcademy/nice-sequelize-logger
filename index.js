const highlight = require("cli-highlight").highlight
const sqlFormatter = require("sql-formatter");
const chalk = require("chalk")

// The sqlFormatter library splits all the selected fields onto their own lines.
// Very readable, but a lil verbose in a terminal. This takes those lines and
// scrunches them back together.
function scrunchSQLSelect (query) {
  let inColumns = false;
  const lines = query.split("\n");
  const scrunched = [];
  for (let line of lines) {
    if (line.startsWith("SELECT")) {
      inColumns = true;
      scrunched.push(line)
    }
    else if (!inColumns) {
      scrunched.push(line);
    }
    else if (inColumns && line.startsWith("FROM")) {
      inColumns = false
      scrunched.push(line);
    }
    else if (inColumns) {
      scrunched[scrunched.length - 1] += line;
    }
  }
  return scrunched.join("\n");
}

function createNiceSequelizeLoggerConfig (logger = console) {
  function sequelizeLogger (log, responseTime, query) {
    if (process.env.LOG_SQL_STATEMENTS === "true") {
      const cleaned = log.replace(/Executed \(default\):/, "");
      const formatted = sqlFormatter.format(cleaned);
      const scrunched = scrunchSQLSelect(formatted);
      const highlighted = highlight(scrunched, {
        language: "sql",
        ignoreIllegals: true
      });

      logger.log(chalk.bgCyan(`EXECUTED SQL (${responseTime/1000}ms)`));
      logger.log(highlighted);
      logger.log();
    }
  }

  return {
    logging: sequelizeLogger,
    benchmark: true
  }
}

module.exports.createNiceSequelizeLoggerConfig = createNiceSequelizeLoggerConfig;
