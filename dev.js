const { spawn } = require("child_process");

const devPackages = () =>
  spawn("pnpm run dev:packages", {
    shell: true,
    stdio: "inherit",
  });

const devApp = () =>
  spawn("pnpm run dev:ui", { shell: true, stdio: "inherit" });

const dev = () => {
  const packageProcess = devPackages();
  const appProcess = devApp();

  process.on("exit", () => {
    packageProcess.kill();
    appProcess.kill();
  });
};

dev();
