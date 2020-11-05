import { execSync } from 'child_process'

const command = 'git rev-parse HEAD'

export function gitCommitHash() {
    return execSync(command).toString().trim()
}