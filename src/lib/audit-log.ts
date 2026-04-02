/**
 * SimieBot Security Kernel: Audit Log
 * 
 * Provides an immutable (in-memory/persistence-ready) ledger of all agent actions,
 * tool calls, and intent classifications.
 */

export interface AuditEntry {
  timestamp: string;
  node: string;
  tool?: string;
  input: string;
  status: 'success' | 'failure' | 'skipped' | 'pending_approval';
  risk: 'low' | 'medium' | 'high';
}

class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditEntry[] = [];

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public log(entry: Omit<AuditEntry, 'timestamp'>) {
    const fullEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(fullEntry);
    console.log(`[SIMIE_AUDIT] ${fullEntry.timestamp} | ${fullEntry.node} | ${fullEntry.status} | RISK: ${fullEntry.risk}`);
    
    // In production, this would append to a secure database or file
    return fullEntry;
  }

  public getLogs(): AuditEntry[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
  }
}

export const auditLogger = AuditLogger.getInstance();
