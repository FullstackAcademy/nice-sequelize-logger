const highlight = require("cli-highlight").highlight;
const sqlFormatter = require("sql-formatter");
const chalk = require("chalk");

// The sqlFormatter library splits all the selected fields onto their own lines.
// Very readable, but a lil verbose in a terminal. This takes those lines and
// scrunches them back together.
function scrunchSQLSelect(query) {
  let inColumns = false;
  const lines = query.split("\n");
  const scrunched = [];
  for (let line of lines) {
    if (line.startsWith("SELECT")) {
      inColumns = true;
      scrunched.push(line);
    } else if (!inColumns) {
      scrunched.push(line);
    } else if (inColumns && line.startsWith("FROM")) {
      inColumns = false;
      scrunched.push(line);
    } else if (inColumns) {
      scrunched[scrunched.length - 1] += line;
    }
  }
  return scrunched.join("\n");
}

function createNiceSequelizeLoggerConfig(logger = console) {
  function sequelizeLogger(log, responseTime, query) {
    if (process.env.LOG_SQL_STATEMENTS === "true") {
      if (log.includes("pg_attribute")) return;

      const cleaned = log.replace(/Executed \(default\):/, "");
      const formatted = sqlFormatter.format(cleaned);
      const scrunched = scrunchSQLSelect(formatted);
      const highlighted = highlight(scrunched, {
        language: "sql",
        ignoreIllegals: true,
      });

      const header = `EXECUTED SQL (${responseTime / 1000}ms)`;
      if (logger.group) {
        logger.group(header);
      }
      else {
        logger.log(chalk.bgCyan(header));
      }

      logger.log(highlighted);
      if (query.bind) {
        query.bind.forEach((value, index) => {
          logger.log(
            chalk.green(`$${index + 1}: `),
            JSON.stringify(value, null, 2),
          );
        });
      }
      if (logger.groupEnd) {
        logger.groupEnd();
      }
    }
  }

  return {
    logging: sequelizeLogger,
    benchmark: true,
  };
}

module.exports.createNiceSequelizeLoggerConfig = createNiceSequelizeLoggerConfig;
