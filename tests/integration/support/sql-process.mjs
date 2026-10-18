import { spawn } from "node:child_process";

const container = "supabase_db_CS3227-2610-MP3";

export function startSql(sql, appName = "") {
  const child = spawn("docker", dockerSqlArgs(appName), {
    windowsHide: true,
  });
  child.stdin.end(sql);
  return watchSqlProcess(child);
}

function dockerSqlArgs(appName) {
  const args = ["exec"];
  if (appName) args.push("-e", `PGAPPNAME=${appName}`);
  args.push(
    "-i",
    container,
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-X",
    "-q",
    "-A",
    "-t",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "-",
  );
  return args;
}

function watchSqlProcess(child) {
  let output = "";
  let errors = "";
  let finished = false;
  let exitCode;
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    errors += chunk.toString();
  });
  const done = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      finished = true;
      exitCode = code;
      resolve({ code, output, errors });
    });
  });
  return {
    done,
    get output() {
      return output;
    },
    get errors() {
      return errors;
    },
    get finished() {
      return finished;
    },
    get exitCode() {
      return exitCode;
    },
  };
}

export async function runSql(sql, expectedExit = 0) {
  const result = await startSql(sql).done;
  if (result.code !== expectedExit) {
    throw new Error(
      `SQL exit ${result.code}, expected ${expectedExit}: ${result.errors.trim()}`,
    );
  }
  return result;
}
