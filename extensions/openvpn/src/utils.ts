import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const isRunning = async () => {
  try {
    const { stdout, stderr } = await execAsync('ps u $(pgrep -vu root) | grep "OpenVPN" | grep -v "grep"');
    return stdout.length > 0 || !!stderr;
  } catch (e) {
    return false;
  }
};

export const startOpenVPN = async () => {
  try {
    await execAsync('"/Applications/OpenVPN Connect/OpenVPN Connect.app/contents/MacOS/OpenVPN Connect" --minimize');
  } catch (e) {
    console.error(e);
  }
};
