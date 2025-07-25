import { ChildProcess, execFileSync, spawn } from 'child_process';
import path from 'path';
import {
  CodeError,
  ERR_ANDROID_CANNOT_CLEAN_LOGCAT_BUFFER,
  ERR_ANDROID_CANNOT_START_LOGCAT,
} from '../errors';
import type { AndroidOptions } from './types';

export function run({ adbPath, deviceId }: AndroidOptions): ChildProcess {
  const execPath = getAdbPath(adbPath);
  return spawnLogcatProcess(execPath, deviceId);
}

export function getSdkRoot(): string | undefined {
  return process.env.ANDROID_SDK_ROOT ?? process.env.ANDROID_HOME;
}

export function getAdbPath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }
  const sdkRoot = getSdkRoot();
  return sdkRoot ? `${sdkRoot}/platform-tools/adb` : 'adb';
}

export function spawnLogcatProcess(
  adbPath: string,
  deviceId?: string
): ChildProcess {
  const baseArgs = deviceId ? ['-s', deviceId] : [];

  try {
    execFileSync(adbPath, [...baseArgs, 'logcat', '-c']);
  } catch (error) {
    throw new CodeError(
      ERR_ANDROID_CANNOT_CLEAN_LOGCAT_BUFFER,
      (error as Error).message
    );
  }

  try {
    return spawn(
      adbPath,
      [
        ...baseArgs,
        'logcat',
        '-v',
        'epoch,uid,threadtime,usec,printable,year,zone',
      ],
      {
        stdio: 'pipe',
      }
    );
  } catch (error) {
    throw new CodeError(
      ERR_ANDROID_CANNOT_START_LOGCAT,
      (error as Error).message
    );
  }
}
