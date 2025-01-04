import fs from "node:fs/promises";
import { exec } from "node:child_process";
import path from "node:path";

const scriptDir = new URL(".", import.meta.url).pathname;

let newTag = process.argv[2];
if (!newTag) {
  newTag = await cmd("git rev-parse HEAD", scriptDir);
  newTag = newTag.trim();

  const answer = await new Promise((resolve) => {
    process.stdout.write(`\ntag was not provided, use git hash as tag? (${newTag}) [y/n]: `);
    process.stdin.on("data", (data) => resolve(data.toString().trim()));
  })

  if (answer !== "y") {
    console.log("alright, exiting...");
    process.exit(0);
  }

  console.log("ok! using git hash as tag...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const filename = "tasks.yml"
const image = "veetik/tasks-backend"
const remote = "user@servu"

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const tempDir = path.join(scriptDir, timestamp);
const remoteFilePath = `${remote}:~/${filename}`;
const localFilePath = path.join(tempDir, filename);

console.log("\nbuilding image...");
await cmd(`docker build -t ${image}:${newTag} .`, scriptDir);

console.log("\npushing image...");
await cmd(`docker push ${image}:${newTag}`, scriptDir);

console.log("\ncreating temp directory...");
await fs.mkdir(tempDir, { recursive: true });

console.log(`\ngetting ${filename} from remote...`)
await cmd(`scp ${remoteFilePath} .`);

console.log(`\nupdating ${filename} with new tag: ${newTag}...`);
const fileContent = await fs.readFile(localFilePath, "utf8")
const newFileContent = fileContent.replace(/(image: )(.+)(\/)(.+)/, `$1${image}:${newTag}`);
await fs.writeFile(localFilePath, newFileContent, "utf8");

console.log("\ncopying updated file to remote...");
await cmd(`scp ${localFilePath} ${remoteFilePath}`);

console.log("\nupdating deployment...");
await cmd(`ssh ${remote} "docker stack deploy -c ${filename} tasks"`);

console.log("\ncleaning up...");
await cmd(`rm -r ${tempDir}`);

console.log("\ndone");

function cmd(command, dir = tempDir) {
  console.log(`exec: ${command}`);

  return new Promise((resolve, reject) => {
    const p = exec(command, { cwd: dir }, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });

    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
  });
}
