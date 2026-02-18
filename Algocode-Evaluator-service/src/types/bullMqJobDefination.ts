
import type { Job } from "bullmq"

export interface IJob {
    name: string
    payload?: Record<string, unknown>
    handle: (_job?: Job) => void
    failed: (_job?: Job) => void
}