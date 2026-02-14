import * as core from '@actions/core';

import { unzipSync } from "fflate";
import { writeFileSync } from 'fs';
import { chmodSync, mkdirSync } from 'node:fs';

import { tmpdir } from "node:os";
import { join } from 'node:path';

export async function installAHQStoreCli() {
  core.info("⏲️ Downloading AHQ Store CLI");

  const targetData = calculateTargetTriple();

  const downloadPath = `https://github.com/ahqstore/cli/releases/latest/download/ahqstore_cli_rs-${targetData.triple}.zip`;
  const ahqstorecli = await fetch(downloadPath).then((r) => r.arrayBuffer());

  core.info("⏲️ Extracting AHQ Store CLI");

  const unzipped = unzipSync(new Uint8Array(ahqstorecli));

  const f = unzipped[targetData.file];


  const cacheDir = join(tmpdir(), `ahqstorecache_${Math.random() * 1000000}`);
  mkdirSync(cacheDir);

  const ahqstore = join(cacheDir, targetData.file);
  writeFileSync(ahqstore, f);

  if (process.platform !== 'win32') {
    chmodSync(ahqstore, 0o755);
  }

  core.addPath(cacheDir);

  core.info("✅ Installed AHQ Store CLI");
}

function calculateTargetTriple() {
  const os = process.platform;
  const arch = process.arch;

  let target = "";
  let file = "ahqstore";

  switch (arch) {
    case "arm64":
      target += "aarch64-";
      break;
    case "x64":
      target += "x86_64-";
      break;
    default:
      core.warning(`Unknown architecture : ${arch}`);
      throw new Error("Exited : ERR_UNSUPPORTED_ARCH");
  }

  switch (os) {
    case "win32":
      target += "pc-windows-msvc";
      file += ".exe";
      break;
    case "linux":
      target += "unknown-linux-gnu";
      break;
    case "darwin":
      target += "apple-macos";
      break;
    default:
      core.warning(`Unknown operating system : ${os}`);
      throw new Error("Exited : ERR_UNSUPPORTED_OS");
  }

  return {
    triple: target,
    file
  }
}